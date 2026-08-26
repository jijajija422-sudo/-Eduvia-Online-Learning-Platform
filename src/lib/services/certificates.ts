import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/services/notifications";
import { emailTemplates } from "@/lib/mailer";
import type { NotificationType } from "@/types";

// Generates a unique, hard-to-guess certificate id (e.g. EDU-7f3a9c...)
export function generateCertificateId(): string {
  return "EDU-" + randomBytes(8).toString("hex").toUpperCase();
}

export interface CertificateResult {
  id: string;
  certificateId: string;
  studentName: string;
  courseName: string;
  instructorName: string;
  issuedAt: Date;
}

// Issues (or returns existing) a completion certificate for a user/course.
// Always runs inside a workflow that has already verified completion requirements.
export async function issueCertificate(
  userId: string,
  courseId: string
): Promise<CertificateResult | null> {
  const existing = await db.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) return existing;

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { instructor: { select: { firstName: true, lastName: true } } },
  });
  if (!course) return null;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true },
  });
  if (!user) return null;

  const certificate = await db.certificate.create({
    data: {
      userId,
      courseId,
      certificateId: generateCertificateId(),
      studentName: `${user.firstName} ${user.lastName}`,
      courseName: course.title,
      instructorName: `${course.instructor.firstName} ${course.instructor.lastName}`,
    },
  });

  // Notify + email (non-blocking)
  await createNotification({
    userId,
    type: "CERTIFICATE_ISSUED" as NotificationType,
    title: "Certificate issued",
    message: `Your certificate for "${course.title}" is ready.`,
    link: `/student/certificates/${certificate.certificateId}`,
  });
  emailTemplates.certificateIssued(
    `${user.firstName} ${user.lastName}`,
    course.title,
    `${process.env.NEXT_PUBLIC_APP_URL || ""}/student/certificates/${certificate.certificateId}`
  );

  return certificate;
}
