import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { reviewSchema } from "@/schemas";
import { recomputeCourseRating } from "@/lib/services/reviews";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const result = reviewSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Invalid review." }, { status: 400 });

  const { courseId, rating, content } = body as { courseId: string; rating: number; content?: string };
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  // Must be enrolled + course published
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: session.id, courseId } },
  });
  if (!enrollment) return NextResponse.json({ error: "You must be enrolled to review." }, { status: 403 });

  // One review per user per course
  const existing = await db.review.findFirst({ where: { userId: session.id, courseId } });
  if (existing) {
    const updated = await db.review.update({
      where: { id: existing.id },
      data: { rating, content, status: "PENDING" },
    });
    await recomputeCourseRating(courseId);
    return NextResponse.json({ success: true, review: updated });
  }

  const review = await db.review.create({
    data: { userId: session.id, courseId, rating, content, status: "PENDING" },
  });
  await recomputeCourseRating(courseId);
  return NextResponse.json({ success: true, review });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const result = reviewSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Invalid review." }, { status: 400 });
  const { id, rating, content } = body as { id: string; rating: number; content?: string };

  const review = await db.review.findUnique({ where: { id } });
  if (!review || review.userId !== session.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const updated = await db.review.update({
    where: { id },
    data: { rating, content, status: "PENDING" },
  });
  await recomputeCourseRating(review.courseId);
  return NextResponse.json({ success: true, review: updated });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const review = await db.review.findUnique({ where: { id: body.id } });
  if (!review || review.userId !== session.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await db.review.delete({ where: { id: review.id } });
  await recomputeCourseRating(review.courseId);
  return NextResponse.json({ success: true });
}
