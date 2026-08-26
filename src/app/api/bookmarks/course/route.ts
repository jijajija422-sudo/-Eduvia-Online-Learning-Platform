import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { toggleCourseBookmark } from "@/lib/services/bookmarks";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { courseId } = await request.json();
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });
  const state = await toggleCourseBookmark(session.id, courseId);
  return NextResponse.json({ success: true, state });
}
