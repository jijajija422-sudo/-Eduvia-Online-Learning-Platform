import { requireAdmin } from "@/lib/auth-guard";
import { getPlatformAnalytics } from "@/lib/services/analytics";
import { PageHeader } from "@/components/layout/PageHeader";
import { Sparkline, BarList } from "@/components/charts/BarList";

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const data = await getPlatformAnalytics();

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Platform-wide metrics and trends." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">User growth (30 days)</h2>
          <Sparkline data={data.userGrowth} />
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Enrollment growth (30 days)</h2>
          <Sparkline data={data.enrollmentGrowth} color="#10b981" />
        </div>
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
