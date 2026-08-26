import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { moduleSchema } from "@/schemas";

// Modules belong to courses; verify ownership via the course.
async function ownsCourse(courseId: string, userId: string): Promise<boolean> {
  const course = await db.course.findUnique({ where: { id: courseId }, select: { instructorId: true } });
  if (!course) return false;
  if (course.instructorId === userId) return true;
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === "ADMIN";
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.id || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const body = await request.json();
  const result = moduleSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Invalid module." }, { status: 400 });

  const courseId = body.courseId as string;
  if (!courseId || !(await ownsCourse(courseId, session.id))) {
    return NextResponse.json({ error: "Not authorized for this course." }, { status: 403 });
  }
  const count = await db.module.count({ where: { courseId } });
  const mod = await db.module.create({
    data: {
      courseId,
      title: result.data.title,
      description: result.data.description,
      orderIndex: body.orderIndex ?? count,
    },
  });
  return NextResponse.json({ success: true, module: mod });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json();
  const { id, title, description, orderIndex } = body;
  const mod = await db.module.findUnique({ where: { id } });
  if (!mod || !(await ownsCourse(mod.courseId, session.id))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const updated = await db.module.update({ where: { id }, data: { title, description, orderIndex } });
  return NextResponse.json({ success: true, module: updated });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json();
  const mod = await db.module.findUnique({ where: { id: body.id } });
  if (!mod || !(await ownsCourse(mod.courseId, session.id))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  await db.module.delete({ where: { id: mod.id } });
  return NextResponse.json({ success: true });
}
