import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { lessonSchema } from "@/schemas";
import slugify from "slugify";

async function ownsModule(moduleId: string, userId: string): Promise<boolean> {
  const mod = await db.module.findUnique({ where: { id: moduleId }, include: { course: { select: { instructorId: true } } } });
  if (!mod) return false;
  if (mod.course.instructorId === userId) return true;
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === "ADMIN";
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.id || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const body = await request.json();
  const result = lessonSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Invalid lesson.", details: result.error.flatten().fieldErrors }, { status: 400 });

  const moduleId = body.moduleId as string;
  if (!moduleId || !(await ownsModule(moduleId, session.id))) {
    return NextResponse.json({ error: "Not authorized for this module." }, { status: 403 });
  }
  const count = await db.lesson.count({ where: { moduleId } });
  const slug = slugify(result.data.title, { lower: true, strict: true }) + "-" + Date.now().toString(36);
  const lesson = await db.lesson.create({
    data: {
      moduleId,
      title: result.data.title,
      slug,
      content: result.data.content,
      estimatedMinutes: result.data.estimatedMinutes,
      isPreview: result.data.isPreview ?? false,
      isRequired: result.data.isRequired ?? true,
      orderIndex: body.orderIndex ?? count,
    },
  });
  return NextResponse.json({ success: true, lesson });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json();
  const { id } = body;
  const lesson = await db.lesson.findUnique({ where: { id }, include: { module: { include: { course: { select: { instructorId: true } } } } } });
  if (!lesson || !(lesson.module.course.instructorId === session.id || session.role === "ADMIN")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const updated = await db.lesson.update({
    where: { id },
    data: {
      title: body.title,
      content: body.content,
      estimatedMinutes: body.estimatedMinutes,
      isPreview: body.isPreview,
      isRequired: body.isRequired,
      orderIndex: body.orderIndex,
    },
  });
  return NextResponse.json({ success: true, lesson: updated });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json();
  const lesson = await db.lesson.findUnique({ where: { id: body.id }, include: { module: { include: { course: { select: { instructorId: true } } } } } });
  if (!lesson || !(lesson.module.course.instructorId === session.id || session.role === "ADMIN")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  await db.lesson.delete({ where: { id: lesson.id } });
  return NextResponse.json({ success: true });
}
