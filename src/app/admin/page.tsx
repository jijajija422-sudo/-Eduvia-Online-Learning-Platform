import { requireAdmin } from "@/lib/auth-guard";
import { getPlatformAnalytics } from "@/lib/services/analytics";
import { PageHeader } from "@/components/layout/PageHeader";
import { Sparkline, BarList } from "@/components/charts/BarList";
import Link from "next/link";
import { Users, GraduationCap, BookOpen, Award, CheckCircle2, Clock, Settings, UserCheck } from "lucide-react";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const data = await getPlatformAnalytics();
  const t = data.totals;

  const cards = [
    { label: "Total Users", value: t.totalUsers, icon: <Users className="h-5 w-5" />, href: "/admin/users" },
    { label: "Instructors", value: t.totalInstructors, icon: <GraduationCap className="h-5 w-5" />, href: "/admin/users?role=INSTRUCTOR" },
    { label: "Courses", value: t.totalCourses, icon: <BookOpen className="h-5 w-5" />, href: "/admin/courses" },
    { label: "Published", value: t.publishedCourses, icon: <CheckCircle2 className="h-5 w-5" />, href: "/admin/courses?status=PUBLISHED" },
    { label: "Pending Review", value: t.pendingCourses, icon: <Clock className="h-5 w-5" />, href: "/admin/courses?status=PENDING_REVIEW" },
    { label: "Enrollments", value: t.totalEnrollments, icon: <UserCheck className="h-5 w-5" />, href: "/admin/courses" },
    { label: "Completions", value: t.totalCompletions, icon: <CheckCircle2 className="h-5 w-5" />, href: "/admin/courses" },
    { label: "Certificates", value: t.totalCertificates, icon: <Award className="h-5 w-5" />, href: "/admin/certificates" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Admin Dashboard" description="Platform-wide overview and management." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{c.icon}</div>
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold">{c.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">User growth (30d)</h2>
          <Sparkline data={data.userGrowth} />
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Enrollment growth (30d)</h2>
          <Sparkline data={data.enrollmentGrowth} color="#10b981" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Popular categories</h2>
          <BarList items={data.popularCategories.map((c) => ({ label: c.name, value: c.count }))} color="#8b5cf6" />
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Top courses</h2>
          <div className="space-y-3">
            {data.popularCourses.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="font-medium truncate pr-2">{c.title}</span>
                <span className="text-muted-foreground">{c.enrollments} enrolled • {c.rating.toFixed(1)}★</span>
              </div>
            ))}
            {data.popularCourses.length === 0 && <p className="text-sm text-muted-foreground">No courses yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
