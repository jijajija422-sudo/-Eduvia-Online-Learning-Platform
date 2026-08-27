import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, PlayCircle, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function CalendarPage() {
  const session = await getSession();
  if (!session?.id) redirect("/login");

  const [enrollments, completedRows] = await Promise.all([
    db.enrollment.findMany({
      where: { userId: session.id },
      select: {
        course: {
          select: {
            slug: true,
            title: true,
            modules: {
              orderBy: { orderIndex: "asc" },
              select: {
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

  const items: { slug: string; courseTitle: string; lessonId: string; lessonTitle: string }[] = [];
  for (const e of enrollments) {
    const course = e.course;
    outer: for (const m of course.modules) {
      for (const l of m.lessons) {
        if (!completed.has(l.id)) {
          items.push({ slug: course.slug, courseTitle: course.title, lessonId: l.id, lessonTitle: l.title });
          break outer;
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Calendar" description="Your learning schedule — pick up where you left off." />

      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nothing scheduled. You're all caught up!</p>
      ) : (
        <div className="space-y-3">
          {items.map((it, i) => (
            <Link
              key={it.lessonId}
              href={`/courses/${it.slug}/learn/${it.lessonId}`}
              className="flex items-center justify-between gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-muted-foreground">Day</p>
                  <p className="font-semibold">{i + 1}</p>
                </div>
                <PlayCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{it.lessonTitle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{it.courseTitle}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg p-3">
        <CalendarDays className="h-4 w-4" /> Set a daily study goal to build a consistent learning habit.
      </div>
    </div>
  );
}
