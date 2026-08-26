import { requireInstructor } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { BarList } from "@/components/charts/BarList";
import Link from "next/link";
import { BookOpen, Users, Award, Star, PlusCircle, Eye } from "lucide-react";

export default async function InstructorDashboardPage() {
  const user = await requireInstructor();

  const courses = await db.course.findMany({
    where: { instructorId: user.id },
    include: {
      _count: { select: { enrollments: true, modules: true } },
      enrollments: { select: { status: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const totalCourses = courses.length;
  const published = courses.filter((c) => c.status === "PUBLISHED").length;
  const pending = courses.filter((c) => c.status === "PENDING_REVIEW").length;
  const students = courses.reduce((acc, c) => acc + c._count.enrollments, 0);
  const avgRating =
    totalCourses ? Math.round((courses.reduce((a, c) => a + c.rating, 0) / totalCourses) * 10) / 10 : 0;

  const topCourses = [...courses]
    .sort((a, b) => b._count.enrollments - a._count.enrollments)
    .slice(0, 5)
    .map((c) => ({ label: c.title, value: c._count.enrollments }));

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${user.firstName}`}
        description="Manage your courses, track students, and review performance."
        action={
          <Link
            href="/instructor/courses/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <PlusCircle className="h-4 w-4" /> New Course
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<BookOpen className="h-5 w-5" />} label="Total Courses" value={totalCourses} />
        <Stat icon={<Users className="h-5 w-5 text-blue-500" />} label="Total Students" value={students} />
        <Stat icon={<Award className="h-5 w-5 text-green-500" />} label="Published" value={published} />
        <Stat icon={<Star className="h-5 w-5 text-amber-500" />} label="Avg Rating" value={avgRating} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Your Courses</h2>
          {courses.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="mb-4">You haven't created any courses yet.</p>
              <Link href="/instructor/courses/new" className="text-primary font-medium hover:underline">Create your first course →</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {courses.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/40">
                  <div>
                    <p className="font-medium text-sm">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c._count.enrollments} students • {statusBadge(c.status)}</p>
                  </div>
                  <Link href={`/instructor/courses/${c.id}`} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    <Eye className="h-4 w-4" /> Manage
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Enrollments by course</h2>
          {topCourses.length > 0 ? (
            <BarList items={topCourses} />
          ) : (
            <p className="text-sm text-muted-foreground">No enrollments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    DRAFT: "Draft",
    PENDING_REVIEW: "Pending review",
    APPROVED: "Approved",
    PUBLISHED: "Published",
    REJECTED: "Rejected",
    ARCHIVED: "Archived",
  };
  return map[status] || status;
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
