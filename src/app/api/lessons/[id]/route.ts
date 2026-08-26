import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.id || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  const lesson = await db.lesson.findUnique({ where: { id } });
  if (!lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  return NextResponse.json({ success: true, lesson });
}
