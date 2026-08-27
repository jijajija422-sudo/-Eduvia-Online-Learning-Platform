import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { FileText, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function AssignmentsPage() {
  const session = await getSession();
  if (!session?.id) redirect("/login");

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.id },
    include: {
      course: {
        select: {
          id: true,
          slug: true,
          title: true,
          modules: { select: { quizzes: { select: { id: true, title: true } } } },
          quizzes: { where: { moduleId: null }, select: { id: true, title: true } },
        },
      },
    },
  });

  const quizzes = enrollments.flatMap((e) =>
    [...e.course.modules.flatMap((m) => m.quizzes), ...e.course.quizzes].map((q) => ({
      ...q,
      courseTitle: e.course.title,
      courseSlug: e.course.slug,
    }))
  );

  const attempts = await db.quizAttempt.findMany({ where: { userId: session.id }, select: { quizId: true, passed: true } });
  const done = new Set(attempts.map((a) => a.quizId));

  return (
    <div className="space-y-6">
      <PageHeader title="Assignments" description="Assessments and graded work across your courses." />

      {quizzes.length === 0 ? (
        <p className="text-muted-foreground text-sm">No assignments yet.</p>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => {
            const isDone = done.has(q.id);
            return (
              <div key={q.id} className="flex items-center justify-between gap-3 bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  {isDone ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-amber-500" />}
                  <div>
                    <p className="font-medium">{q.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{q.courseTitle}</p>
                  </div>
                </div>
                <a
                  href={`/courses/${q.courseSlug}/learn/quiz/${q.id}`}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {isDone ? "Review" : "Start"} <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg p-3">
        <FileText className="h-4 w-4" /> Quizzes count as your graded assignments. Pass them to earn your certificate.
      </div>
    </div>
  );
}
