import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { enrollUser, unenrollUser } from "@/lib/services/courses";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized. Please log in to enroll." }, { status: 401 });
    }
    const { id: courseId } = await params;
    try {
      await enrollUser(session.id, courseId);
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: "Successfully enrolled in the course" });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json({ error: "Failed to enroll in the course." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const { id: courseId } = await params;
    try {
      await unenrollUser(session.id, courseId);
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unenroll error:", error);
    return NextResponse.json({ error: "Failed to unenroll." }, { status: 500 });
  }
}
