import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { recordAudit } from "@/lib/services/audit";
import { recomputeCourseRating } from "@/lib/services/reviews";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  const review = await db.review.update({ where: { id }, data: { status: body.status } });
  if (body.status === "APPROVED" || body.status === "HIDDEN") {
    await recomputeCourseRating(review.courseId);
  }
  await recordAudit({ action: "REVIEW_MODERATED", targetType: "Review", targetId: id, userId: session.id, metadata: { status: body.status } });
  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  const review = await db.review.findUnique({ where: { id } });
  if (review) {
    await db.review.delete({ where: { id } });
    await recomputeCourseRating(review.courseId);
  }
  return NextResponse.json({ success: true });
}
