import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { FileText, CheckCircle2, XCircle, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function InstructorAssignmentsPage() {
  const session = await getSession();
  if (!session?.id) redirect("/login");
  if (session.role !== "INSTRUCTOR" && session.role !== "ADMIN") redirect("/unauthorized");

  const courses = await db.course.findMany({
    where: { instructorId: session.id },
    select: { id: true, title: true, quizzes: { select: { id: true } } },
  });
  const quizIds = courses.flatMap((c) => c.quizzes.map((q) => q.id));

  const attempts = quizIds.length
    ? await db.quizAttempt.findMany({
        where: { quizId: { in: quizIds } },
        include: { user: { select: { firstName: true, lastName: true, email: true } }, quiz: { select: { title: true, course: { select: { title: true } } } } },
        orderBy: { completedAt: "desc" },
        take: 100,
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Assignments" description="Student submissions and quiz attempts across your courses." />

      {attempts.length === 0 ? (
        <p className="text-muted-foreground text-sm">No submissions yet. Add quizzes to your courses to see student attempts here.</p>
      ) : (
        <div className="space-y-2">
          {attempts.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                {a.passed ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : a.completedAt ? <XCircle className="h-5 w-5 text-red-500" /> : <Clock className="h-5 w-5 text-amber-500" />}
                <div>
                  <p className="font-medium text-sm">
                    {a.user.firstName} {a.user.lastName} <span className="text-muted-foreground">· {a.quiz.title}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.quiz.course?.title}</p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium">{a.score}%</p>
                <p className="text-xs text-muted-foreground">{a.completedAt ? new Date(a.completedAt).toLocaleDateString() : "in progress"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg p-3">
        <FileText className="h-4 w-4" /> Each quiz attempt is recorded with score and pass/fail status.
      </div>
    </div>
  );
}
