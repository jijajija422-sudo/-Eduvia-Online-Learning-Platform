import { db } from "@/lib/db";

// Platform-wide analytics used by the admin dashboard.
export async function getPlatformAnalytics() {
  const [
    totalUsers,
    totalStudents,
    totalInstructors,
    totalCourses,
    publishedCourses,
    pendingCourses,
    totalEnrollments,
    totalCompletions,
    totalCertificates,
    totalReviews,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { role: "STUDENT" } }),
    db.user.count({ where: { role: "INSTRUCTOR" } }),
    db.course.count(),
    db.course.count({ where: { status: "PUBLISHED" } }),
    db.course.count({ where: { status: "PENDING_REVIEW" } }),
    db.enrollment.count(),
    db.enrollment.count({ where: { status: "COMPLETED" } }),
    db.certificate.count(),
    db.review.count({ where: { status: "APPROVED" } }),
  ]);

  // User growth over last 30 days (by day)
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const recentUsers = await db.user.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });
  const userGrowth = buildDailyBuckets(recentUsers.map((u) => u.createdAt), 30);

  // Enrollment growth over last 30 days
  const recentEnrollments = await db.enrollment.findMany({
    where: { enrolledAt: { gte: since } },
    select: { enrolledAt: true },
  });
  const enrollmentGrowth = buildDailyBuckets(recentEnrollments.map((e) => e.enrolledAt), 30);

  // Popular categories
  const popularCategories = await db.course.groupBy({
    by: ["categoryId"],
    where: { status: "PUBLISHED" },
    _count: { _all: true },
    orderBy: { _count: { categoryId: "desc" } },
    take: 6,
  });
  const categoryDetails = await db.category.findMany({
    where: { id: { in: popularCategories.map((p) => p.categoryId) } },
    select: { id: true, name: true },
  });
  const catMap = new Map(categoryDetails.map((c) => [c.id, c.name]));

  // Popular courses
  const popularCourses = await db.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { enrollmentCount: "desc" },
    take: 5,
    select: { id: true, title: true, enrollmentCount: true, rating: true },
  });

  return {
    totals: {
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      pendingCourses,
      totalEnrollments,
      totalCompletions,
      totalCertificates,
      totalReviews,
    },
    userGrowth,
    enrollmentGrowth,
    popularCategories: popularCategories.map((p) => ({
      name: catMap.get(p.categoryId) || "Unknown",
      count: p._count._all,
    })),
    popularCourses: popularCourses.map((c) => ({
      title: c.title,
      enrollments: c.enrollmentCount,
      rating: c.rating,
    })),
  };
}

// Instructor-specific analytics.
export async function getInstructorAnalytics(instructorId: string) {
  const courses = await db.course.findMany({
    where: { instructorId },
    include: {
      _count: { select: { enrollments: true } },
      enrollments: { select: { status: true, progress: true } },
    },
  });

  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED").length;
  const students = courses.reduce((acc, c) => acc + c._count.enrollments, 0);
  const completions = courses.reduce(
    (acc, c) => acc + c.enrollments.filter((e) => e.status === "COMPLETED").length,
    0
  );
  const avgRating =
    courses.reduce((acc, c) => acc + c.rating, 0) / (totalCourses || 1);

  // Course views proxy: enrollment count per course
  const coursePerformance = courses.map((c) => ({
    id: c.id,
    title: c.title,
    status: c.status,
    enrollments: c._count.enrollments,
    rating: c.rating,
    completionRate: c._count.enrollments
      ? Math.round((c.enrollments.filter((e) => e.status === "COMPLETED").length / c._count.enrollments) * 100)
      : 0,
  }));

  return {
    totalCourses,
    publishedCourses,
    students,
    completions,
    avgRating: Math.round(avgRating * 10) / 10,
    completionRate: students ? Math.round((completions / students) * 100) : 0,
    coursePerformance,
  };
}

function buildDailyBuckets(dates: Date[], days: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const buckets: { date: string; count: number }[] = [];
  const counts = new Map<string, number>();
  for (const d of dates) {
    const key = d.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    buckets.push({ date: key, count: counts.get(key) || 0 });
  }
  return buckets;
}
