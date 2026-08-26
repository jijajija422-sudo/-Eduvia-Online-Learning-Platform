import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default async function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();

  if (!session || !session.id) {
    redirect(`/login?returnUrl=/courses/${(await params).slug}`);
  }

  const resolvedParams = await params;

  const course = await db.course.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
            select: { id: true, title: true, slug: true, estimatedMinutes: true },
          },
          quizzes: {
            orderBy: { orderIndex: "asc" },
            select: { id: true, title: true, isFinalAssessment: true },
          },
        },
      },
      quizzes: {
        where: { moduleId: null },
        orderBy: { orderIndex: "asc" },
        select: { id: true, title: true, isFinalAssessment: true },
      },
      enrollments: {
        where: { userId: session.id },
        select: { progress: true },
      },
    },
  });

  if (!course) {
    redirect("/courses");
  }

  if (course.enrollments.length === 0 && session.role !== "ADMIN") {
    redirect(`/courses/${course.slug}`);
  }

  const progress = course.enrollments[0]?.progress || 0;

  const lessonProgress = await db.lessonProgress.findMany({
    where: {
      userId: session.id,
      lesson: { module: { courseId: course.id } },
    },
    select: { lessonId: true, status: true },
  });

  const completedLessonIds = new Set(
    lessonProgress.filter((p: any) => p.status === "COMPLETED").map((p: any) => p.lessonId)
  );

  const allQuizIds = [
    ...course.modules.flatMap((m: any) => m.quizzes.map((q: any) => q.id)),
    ...course.quizzes.map((q: any) => q.id),
  ];
  const passedQuizAttempts = allQuizIds.length
    ? await db.quizAttempt.findMany({
        where: { userId: session.id, quizId: { in: allQuizIds }, passed: true },
        select: { quizId: true },
      })
    : [];
  const passedQuizIds = new Set(passedQuizAttempts.map((a: any) => a.quizId));

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-80 h-full border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-4 border-b border-border space-y-4">
          <Link
            href={`/courses/${course.slug}`}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Link>

          <h1 className="font-bold text-lg leading-tight line-clamp-2">{course.title}</h1>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span>{Math.round(progress)}% Completed</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Curriculum List */}
        <div className="flex-1 overflow-y-auto">
          {course.modules.map((module: any, i: number) => (
            <div key={module.id} className="border-b border-border last:border-b-0">
              <div className="px-4 py-3 bg-muted/30">
                <h2 className="text-sm font-bold text-foreground">Module {i + 1}: {module.title}</h2>
              </div>
              <div className="flex flex-col">
                {module.lessons.map((lesson: any) => {
                  const isCompleted = completedLessonIds.has(lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      href={`/courses/${course.slug}/learn/${lesson.id}`}
                      className="px-4 py-3 text-sm flex items-start gap-3 hover:bg-muted/50 transition-colors border-l-2 border-transparent relative"
                    >
                      <div className="shrink-0 mt-0.5">
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-muted-foreground hover:text-foreground">
                        <span className="line-clamp-2">{lesson.title}</span>
                        <span className="block text-xs mt-1">{lesson.estimatedMinutes} min</span>
                      </div>
                    </Link>
                  );
                })}
                {module.quizzes.map((quiz: any) => {
                  const isPassed = passedQuizIds.has(quiz.id);
                  return (
                    <Link
                      key={quiz.id}
                      href={`/courses/${course.slug}/learn/quiz/${quiz.id}`}
                      className="px-4 py-3 text-sm flex items-start gap-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="shrink-0 mt-0.5">
                        {isPassed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-amber-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-muted-foreground hover:text-foreground">
                        <span className="line-clamp-2 flex items-center gap-1">
                          <span className="text-xs font-semibold uppercase tracking-wide text-amber-500">Quiz</span>
                          {quiz.title}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {course.quizzes.length > 0 && (
            <div className="border-b border-border">
              <div className="px-4 py-3 bg-muted/30">
                <h2 className="text-sm font-bold text-foreground">Assessments</h2>
              </div>
              <div className="flex flex-col">
                {course.quizzes.map((quiz: any) => {
                  const isPassed = passedQuizIds.has(quiz.id);
                  return (
                    <Link
                      key={quiz.id}
                      href={`/courses/${course.slug}/learn/quiz/${quiz.id}`}
                      className="px-4 py-3 text-sm flex items-start gap-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="shrink-0 mt-0.5">
                        {isPassed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-amber-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-muted-foreground hover:text-foreground">
                        <span className="line-clamp-2 flex items-center gap-1">
                          <span className="text-xs font-semibold uppercase tracking-wide text-amber-500">Final</span>
                          {quiz.title}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
        <header className="h-14 border-b border-border flex items-center justify-between px-4 sm:px-8 bg-card shrink-0">
          <div className="flex items-center" />
          <div className="flex items-center gap-4" />
        </header>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
