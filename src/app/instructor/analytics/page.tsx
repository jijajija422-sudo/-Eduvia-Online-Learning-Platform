import { requireInstructor } from "@/lib/auth-guard";
import { getInstructorAnalytics } from "@/lib/services/analytics";
import { PageHeader } from "@/components/layout/PageHeader";
import { BarList, Sparkline } from "@/components/charts/BarList";
import { BookOpen, Users, Trophy, Star } from "lucide-react";

export default async function InstructorAnalyticsPage() {
  const user = await requireInstructor();
  const data = await getInstructorAnalytics(user.id);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Performance across all your courses." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<BookOpen className="h-5 w-5" />} label="Courses" value={data.totalCourses} />
        <Stat icon={<Users className="h-5 w-5 text-blue-500" />} label="Students" value={data.students} />
        <Stat icon={<Trophy className="h-5 w-5 text-green-500" />} label="Completion rate" value={`${data.completionRate}%`} />
        <Stat icon={<Star className="h-5 w-5 text-amber-500" />} label="Avg rating" value={data.avgRating} />
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Course performance</h2>
        <div className="space-y-3">
          {data.coursePerformance.map((c) => (
            <div key={c.id} className="grid grid-cols-12 gap-3 items-center text-sm">
              <div className="col-span-4 font-medium truncate">{c.title}</div>
              <div className="col-span-2 text-muted-foreground">{c.enrollments} enrolled</div>
              <div className="col-span-3">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${c.completionRate}%` }} />
                </div>
              </div>
              <div className="col-span-1 text-xs text-muted-foreground">{c.completionRate}%</div>
              <div className="col-span-2 text-right text-amber-500">{c.rating.toFixed(1)} ★</div>
            </div>
          ))}
          {data.coursePerformance.length === 0 && <p className="text-sm text-muted-foreground">No course data yet.</p>}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
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
