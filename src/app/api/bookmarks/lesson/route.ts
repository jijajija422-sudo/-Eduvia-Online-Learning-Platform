import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { toggleLessonBookmark } from "@/lib/services/bookmarks";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { lessonId, checkOnly } = body;
  if (!lessonId) return NextResponse.json({ error: "lessonId required" }, { status: 400 });

  if (checkOnly) {
    const existing = await db.lessonBookmark.findUnique({ where: { userId_lessonId: { userId: session.id, lessonId } } });
    return NextResponse.json({ success: true, saved: !!existing });
  }

  const state = await toggleLessonBookmark(session.id, lessonId);
  return NextResponse.json({ success: true, state, action: state === "added" ? "added" : "removed" });
}
