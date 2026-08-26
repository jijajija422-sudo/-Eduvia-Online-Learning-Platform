import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { evaluateCourseProgress } from "@/lib/services/courses";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { lessonId, courseId, status } = body;
    if (!lessonId || !courseId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId: session.id, courseId } },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "You are not enrolled in this course." }, { status: 403 });
    }

    await db.lessonProgress.upsert({
      where: { userId_lessonId: { userId: session.id, lessonId } },
      update: { status, completedAt: status === "COMPLETED" ? new Date() : null },
      create: {
        userId: session.id,
        lessonId,
        status,
        completedAt: status === "COMPLETED" ? new Date() : null,
      },
    });

    const result = await evaluateCourseProgress(session.id, courseId);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Progress update error:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
