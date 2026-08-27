import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckSquare, CheckCircle2, Circle, ArrowRight, Trophy } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function QuizzesPage() {
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
          modules: {
            select: {
              quizzes: {
                select: {
                  id: true,
                  title: true,
                  passingScore: true,
                  _count: { select: { questions: true } },
                },
              },
            },
          },
          quizzes: {
            where: { moduleId: null },
            select: { id: true, title: true, passingScore: true, _count: { select: { questions: true } } },
          },
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

  // Best attempt per quiz
  const attempts = await db.quizAttempt.findMany({
    where: { userId: session.id },
    orderBy: { score: "desc" },
  });
  const bestByQuiz = new Map<string, { score: number; passed: boolean }>();
  for (const a of attempts) {
    if (!bestByQuiz.has(a.quizId) || a.score > bestByQuiz.get(a.quizId)!.score) {
      bestByQuiz.set(a.quizId, { score: a.score, passed: a.passed });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Quizzes" description="Practice and assessment quizzes from your enrolled courses." />

      {quizzes.length === 0 ? (
        <p className="text-muted-foreground text-sm">You haven't enrolled in any courses with quizzes yet.</p>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q) => {
            const best = bestByQuiz.get(q.id);
            return (
              <Link
                key={q.id}
                href={`/courses/${q.courseSlug}/learn/quiz/${q.id}`}
                className="flex items-center justify-between gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {best?.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : best ? (
                    <Circle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <CheckSquare className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{q.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{q.courseTitle} · {q._count.questions} questions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  {best ? (
                    <span className={best.passed ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
                      {best.score}% {best.passed ? "(passed)" : "(retake)"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not attempted</span>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg p-3">
        <Trophy className="h-4 w-4" /> Pass all quizzes in a course to unlock your certificate.
      </div>
    </div>
  );
}
