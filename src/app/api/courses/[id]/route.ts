import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { courseUpdateSchema } from "@/schemas";
import { recordAudit } from "@/lib/services/audit";
import { emailTemplates } from "@/lib/mailer";

// Returns a single course with full module/lesson/quiz structure for the builder.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.id || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  const course = await db.course.findUnique({
    where: { id },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: { orderBy: { orderIndex: "asc" }, select: { id: true, title: true, orderIndex: true, estimatedMinutes: true, isPreview: true, isRequired: true } },
          quizzes: { orderBy: { orderIndex: "asc" }, select: { id: true, title: true, isFinalAssessment: true, _count: { select: { questions: true } } } },
        },
      },
      quizzes: { where: { moduleId: null }, orderBy: { orderIndex: "asc" }, select: { id: true, title: true, isFinalAssessment: true, _count: { select: { questions: true } } } },
    },
  });
  if (!course) return NextResponse.json({ error: "Course not found." }, { status: 404 });
  if (course.instructorId !== session.id && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  return NextResponse.json({ success: true, course });
}

// Update a course (owner instructor or admin).
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await db.course.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Course not found." }, { status: 404 });

  const isOwner = existing.instructorId === session.id;
  const isAdmin = session.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Not authorized for this course." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = courseUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input.", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...parsed.data };

  // Normalize a convenience `isPublished` flag to a status transition.
  if (typeof body.isPublished === "boolean") {
    if (body.isPublished) {
      data.status = "PUBLISHED";
    } else if (data.status === undefined) {
      data.status = "DRAFT";
    }
  }

  // Instructors may submit for review or unpublish; only admins may approve directly.
  if (!isAdmin && (data.status === "APPROVED" || data.status === "REJECTED")) {
    return NextResponse.json({ error: "Only admins can approve or reject courses." }, { status: 403 });
  }

  const course = await db.course.update({ where: { id }, data });

  await recordAudit({ userId: session.id, action: "COURSE_UPDATE", targetType: "Course", targetId: id });

  // Notify instructor on admin approval/rejection.
  if (isAdmin && body.status === "APPROVED" && existing.instructorId) {
    const inst = await db.user.findUnique({ where: { id: existing.instructorId }, select: { firstName: true, lastName: true, email: true } });
    if (inst) emailTemplates.courseApproved(`${inst.firstName} ${inst.lastName}`, course.title, `${process.env.NEXT_PUBLIC_APP_URL || ""}/instructor/courses`);
  }

  return NextResponse.json({ success: true, course });
}
