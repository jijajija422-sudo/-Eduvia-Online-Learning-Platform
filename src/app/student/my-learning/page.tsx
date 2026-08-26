import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Award, Clock, CheckCircle2, PlayCircle, Search } from "lucide-react";
import { ProgressCourseCard } from "@/components/courses/ProgressCourseCard";
import { formatDuration } from "@/lib/format";

export default async function MyLearningPage() {
  const session = await getSession();
  if (!session?.id) redirect("/login");

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.id },
    include: { course: true },
    orderBy: { lastAccessedAt: "desc" },
  });

  const active = enrollments.filter((e) => e.status !== "COMPLETED");
  const completed = enrollments.filter((e) => e.status === "COMPLETED");
  const hours = Math.round(
    enrollments.reduce((acc, e) => acc + (e.course as any).estimatedDuration * (e.progress / 100), 0) / 60
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
        <p className="text-muted-foreground mt-1">Track your progress across all enrolled courses.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={<BookOpen className="h-5 w-5" />} label="Enrolled" value={enrollments.length} />
        <Stat icon={<PlayCircle className="h-5 w-5 text-blue-500" />} label="In progress" value={active.length} />
        <Stat icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} label="Completed" value={completed.length} />
        <Stat icon={<Clock className="h-5 w-5 text-amber-500" />} label="Hours learned" value={hours} />
      </div>

      <section>
        <h2 className="text-xl font-bold mb-4">In Progress</h2>
        {active.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {active.map((e) => (
              <ProgressCourseCard key={e.id} course={e.course as any} progress={e.progress} lastLessonId={e.lastLessonId} status={e.status as any} />
            ))}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Completed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {completed.map((e) => (
              <ProgressCourseCard key={e.id} course={e.course as any} progress={e.progress} lastLessonId={e.lastLessonId} status={e.status as any} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
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

function EmptyState() {
  return (
    <div className="bg-card border border-border rounded-2xl p-12 text-center">
      <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
      <h3 className="font-semibold mb-1">No courses in progress</h3>
      <p className="text-sm text-muted-foreground mb-6">Find a topic you're passionate about and start learning today.</p>
      <Link href="/courses" className="inline-flex justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Browse Catalog</Link>
    </div>
  );
}
