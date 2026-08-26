import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import AdminCoursesTable from "./AdminCoursesTable";

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const where: any = status ? { status } : {};

  const courses = await db.course.findMany({
    where,
    include: {
      instructor: { select: { firstName: true, lastName: true } },
      category: { select: { name: true } },
      _count: { select: { modules: true, enrollments: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 300,
  });

  const initial = courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    status: c.status,
    isFeatured: c.isFeatured,
    enrollmentCount: c.enrollmentCount,
    rating: c.rating,
    instructor: c.instructor,
    category: c.category,
    _count: c._count,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Courses" description="Review, approve, publish, and manage all courses." />
      <AdminCoursesTable initial={initial} />
    </div>
  );
}
