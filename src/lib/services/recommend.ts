import { db } from "@/lib/db";

// Rule-based recommendations: blends the user's enrolled/category history,
// wishlist and global popularity. Designed to be swapped for ML later.
export async function getRecommendationsForUser(userId: string, limit = 6) {
  const [enrollments, wishlist] = await Promise.all([
    db.enrollment.findMany({
      where: { userId },
      include: { course: { select: { categoryId: true } } },
    }),
    db.wishlistItem.findMany({
      where: { userId },
      include: { course: { select: { categoryId: true } } },
    }),
  ]);

  const categoryIds = [
    ...enrollments.map((e) => e.course.categoryId),
    ...wishlist.map((w) => w.course.categoryId),
  ];

  const recommended = await db.course.findMany({
    where: {
      status: "PUBLISHED",
      // Exclude already-enrolled
      NOT: { enrollments: { some: { userId } } },
      ...(categoryIds.length ? { categoryId: { in: categoryIds } } : {}),
    },
    include: {
      instructor: { select: { firstName: true, lastName: true, avatar: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { enrollmentCount: "desc" }],
    take: limit,
  });

  // Fall back to popular courses if not enough personalized results.
  if (recommended.length < limit) {
    const extras = await db.course.findMany({
      where: {
        status: "PUBLISHED",
        NOT: { enrollments: { some: { userId } } },
        id: { notIn: recommended.map((r) => r.id) },
      },
      include: {
        instructor: { select: { firstName: true, lastName: true, avatar: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { enrollmentCount: "desc" },
      take: limit - recommended.length,
    });
    return [...recommended, ...extras];
  }

  return recommended;
}

export async function getPopularCourses(limit = 8) {
  return db.course.findMany({
    where: { status: "PUBLISHED" },
    include: {
      instructor: { select: { firstName: true, lastName: true, avatar: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { enrollmentCount: "desc" },
    take: limit,
  });
}

export async function getFeaturedCourses(limit = 6) {
  return db.course.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    include: {
      instructor: { select: { firstName: true, lastName: true, avatar: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getTrendingCourses(limit = 6) {
  // Trending = recently published with high enrollment.
  return db.course.findMany({
    where: { status: "PUBLISHED" },
    include: {
      instructor: { select: { firstName: true, lastName: true, avatar: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: [{ publishedAt: "desc" }, { enrollmentCount: "desc" }],
    take: limit,
  });
}
