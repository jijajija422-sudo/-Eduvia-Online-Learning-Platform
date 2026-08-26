import { db } from "@/lib/db";
import { createNotification } from "@/lib/services/notifications";
import { emailTemplates } from "@/lib/mailer";
import { issueCertificate } from "@/lib/services/certificates";
import type { NotificationType } from "@/types";

// ─── Enrollment ───────────────────────────────────────────────────────────

export async function enrollUser(userId: string, courseId: string) {
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course || course.status !== "PUBLISHED") {
    throw new Error("Course not found or not available for enrollment.");
  }

  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) throw new Error("You are already enrolled in this course.");

  const [enrollment] = await db.$transaction([
    db.enrollment.create({
      data: { userId, courseId, status: "ACTIVE", progress: 0 },
    }),
    db.course.update({
      where: { id: courseId },
      data: { enrollmentCount: { increment: 1 } },
    }),
  ]);

  // Notify + email
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true, email: true },
  });
  if (user) {
    await createNotification({
      userId,
      type: "ENROLLMENT" as NotificationType,
      title: "Enrolled successfully",
      message: `You've enrolled in "${course.title}".`,
      link: `/courses/${course.slug}/learn`,
    });
    emailTemplates.enrollment(
      `${user.firstName} ${user.lastName}`,
      course.title,
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/courses/${course.slug}/learn`
    );
  }

  return enrollment;
}

export async function unenrollUser(userId: string, courseId: string) {
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment) throw new Error("You are not enrolled in this course.");
  if (enrollment.status === "COMPLETED") {
    throw new Error("You cannot unenroll from a completed course.");
  }
  await db.$transaction([
    db.enrollment.delete({ where: { userId_courseId: { userId, courseId } } }),
    db.course.update({
      where: { id: courseId },
      data: { enrollmentCount: { decrement: 1 } },
    }),
  ]);
}

// ─── Progress + Completion evaluation ───────────────────────────────────────

interface CourseStructure {
  id: string;
  modules: { lessons: { id: string; isRequired: boolean }[] }[];
  quizzes: { id: string; isFinalAssessment: boolean }[];
}

function collectLessonIds(course: CourseStructure): string[] {
  return course.modules.flatMap((m) => m.lessons.map((l) => l.id));
}
function collectRequiredLessonIds(course: CourseStructure): string[] {
  return course.modules.flatMap((m) => m.lessons.filter((l) => l.isRequired).map((l) => l.id));
}

// Recomputes percentage progress (lessons + required quizzes) and, if all
// requirements are satisfied, marks the course complete and issues a certificate.
export async function evaluateCourseProgress(userId: string, courseId: string) {
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      modules: { include: { lessons: { select: { id: true, isRequired: true } } } },
      quizzes: { select: { id: true, isFinalAssessment: true } },
    },
  });
  if (!course) return null;

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment) return null;

  const requiredLessonIds = collectRequiredLessonIds(course);
  const allLessonIds = collectLessonIds(course);
  const quizIds = course.quizzes.map((q) => q.id);

  const [completedRequired, passedQuizzes] = await Promise.all([
    db.lessonProgress.count({
      where: { userId, lessonId: { in: requiredLessonIds }, status: "COMPLETED" },
    }),
    quizIds.length
      ? db.quizAttempt.findMany({
          where: { userId, quizId: { in: quizIds }, passed: true },
          select: { quizId: true },
        })
      : Promise.resolve([] as { quizId: string }[]),
  ]);

  const passedQuizSet = new Set(passedQuizzes.map((q) => q.quizId));
  const allQuizzesPassed = course.quizzes.every((q) => passedQuizSet.has(q.id));

  const requiredLessonCount = requiredLessonIds.length;
  const quizCount = quizIds.length;

  // Progress = completed required lessons + passed quizzes over total items.
  const totalItems = requiredLessonCount + quizCount;
  const completedItems = completedRequired + passedQuizSet.size;
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 100;

  const lessonsSatisfied = requiredLessonCount === 0 || completedRequired === requiredLessonCount;
  const isComplete = lessonsSatisfied && allQuizzesPassed;

  const wasCompleted = enrollment.status === "COMPLETED";

  await db.enrollment.update({
    where: { id: enrollment.id },
    data: {
      progress: progressPct,
      status: isComplete ? "COMPLETED" : "ACTIVE",
      completedAt: isComplete && !wasCompleted ? new Date() : enrollment.completedAt,
      lastAccessedAt: new Date(),
    },
  });

  if (isComplete && !wasCompleted) {
    // Issue certificate + notify
    const cert = await issueCertificate(userId, courseId);
    if (cert) {
      await createNotification({
        userId,
        type: "COURSE_COMPLETION" as NotificationType,
        title: "Course completed!",
        message: `Congratulations, you completed "${course.title}".`,
        link: `/student/certificates/${cert.certificateId}`,
      });
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });
      if (user) {
        emailTemplates.courseCompletion(
          `${user.firstName} ${user.lastName}`,
          course.title,
          `${process.env.NEXT_PUBLIC_APP_URL || ""}/student/certificates/${cert.certificateId}`
        );
      }
    }
  }

  return { progress: progressPct, completed: isComplete };
}
