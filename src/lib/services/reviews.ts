import { db } from "@/lib/db";

// Recomputes a course's average rating + review count from approved reviews.
export async function recomputeCourseRating(courseId: string): Promise<void> {
  const agg = await db.review.aggregate({
    where: { courseId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  await db.course.update({
    where: { id: courseId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewCount: agg._count._all,
    },
  });
}
