import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarClock, PlayCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function StudyPlanPage() {
  const session = await getSession();
  if (!session?.id) redirect("/login");

  const [enrollments, completedRows] = await Promise.all([
    db.enrollment.findMany({
      where: { userId: session.id },
      select: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
            modules: {
              orderBy: { orderIndex: "asc" },
              select: {
                title: true,
                lessons: {
                  orderBy: { orderIndex: "asc" },
                  select: { id: true, title: true },
                },
              },
            },
          },
        },
      },
    }),
    db.lessonProgress.findMany({
      where: { userId: session.id, status: "COMPLETED" },
      select: { lessonId: true },
    }),
  ]);

  const completed = new Set(completedRows.map((r) => r.lessonId));

  return (
    <div className="space-y-6">
      <PageHeader title="Study Plan" description="Your personalized learning roadmap across all enrolled courses." />

      {enrollments.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No active plan yet. <Link href="/courses" className="text-primary hover:underline">Enroll in a course</Link> to start.
        </p>
      ) : (
        <div className="space-y-6">
          {enrollments.map((e, idx) => {
            const course = e.course;
            const allLessons = course.modules.flatMap((m) => m.lessons);
            const total = allLessons.length;
            const done = allLessons.filter((l) => completed.has(l.id)).length;
            const pct = total ? Math.round((done / total) * 100) : 0;

            let next: { id: string; title: string; moduleTitle: string } | null = null;
            for (const m of course.modules) {
              for (const l of m.lessons) {
                if (!completed.has(l.id)) {
                  next = { id: l.id, title: l.title, moduleTitle: m.title };
                  break;
                }
              }
              if (next) break;
            }

            return (
              <div key={idx} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <Link href={`/courses/${course.slug}`} className="font-semibold hover:text-primary">{course.title}</Link>
                  <span className="text-sm text-muted-foreground">{pct}% complete</span>
                </div>
                {next ? (
                  <Link
                    href={`/courses/${course.slug}/learn/${next.id}`}
                    className="flex items-center justify-between gap-3 bg-muted/40 rounded-lg p-3 hover:border-primary/50 border border-transparent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <PlayCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Up next: {next.title}</p>
                        <p className="text-xs text-muted-foreground">{next.moduleTitle}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ) : (
                  <p className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" /> Course complete — view your certificate in My Learning.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg p-3">
        <CalendarClock className="h-4 w-4" /> Tip: complete one lesson a day to keep your streak alive.
      </div>
    </div>
  );
}
