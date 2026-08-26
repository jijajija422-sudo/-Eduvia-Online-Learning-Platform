import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { recordAudit } from "@/lib/services/audit";
import { createNotification } from "@/lib/services/notifications";
import { emailTemplates } from "@/lib/mailer";
import type { NotificationType, CourseStatus } from "@/types";

const VALID: CourseStatus[] = ["DRAFT", "PENDING_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  const { status, rejectionReason, featured } = body as {
    status?: CourseStatus;
    rejectionReason?: string;
    featured?: boolean;
  };

  const course = await db.course.findUnique({
    where: { id },
    include: { instructor: { select: { id: true, firstName: true, lastName: true } } },
  });
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });

  const data: any = {};
  if (status) {
    if (!VALID.includes(status)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    data.status = status;
    if (status === "PUBLISHED" && !course.publishedAt) data.publishedAt = new Date();
  }
  if (typeof featured === "boolean") data.isFeatured = featured;
  if (status === "REJECTED") data.rejectionReason = rejectionReason || null;

  const updated = await db.course.update({ where: { id }, data });
  await recordAudit({
    action: "COURSE_STATUS_CHANGED",
    targetType: "Course",
    targetId: id,
    userId: session.id,
    metadata: { status: status ?? course.status },
  });

  // Notify instructor
  if (status === "APPROVED" || status === "PUBLISHED") {
    await createNotification({
      userId: course.instructor.id,
      type: "COURSE_APPROVED" as NotificationType,
      title: "Course approved",
      message: `Your course "${course.title}" was approved.`,
      link: `/instructor/courses`,
    });
    emailTemplates.courseApproved(`${course.instructor.firstName} ${course.instructor.lastName}`, course.title, `${process.env.NEXT_PUBLIC_APP_URL || ""}/courses/${course.slug}`);
  }
  if (status === "REJECTED") {
    await createNotification({
      userId: course.instructor.id,
      type: "COURSE_REJECTED" as NotificationType,
      title: "Changes requested",
      message: `Your course "${course.title}" needs changes.`,
      link: `/instructor/courses`,
    });
    emailTemplates.courseRejected(`${course.instructor.firstName} ${course.instructor.lastName}`, course.title, rejectionReason);
  }

  return NextResponse.json({ success: true, course: updated });
}
