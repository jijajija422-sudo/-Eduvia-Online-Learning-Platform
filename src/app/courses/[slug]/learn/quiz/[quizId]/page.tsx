import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import QuizClient from "./QuizClient";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ slug: string; quizId: string }>;
}) {
  const session = await getSession();
  if (!session?.id) redirect("/login");

  const { slug, quizId } = await params;
  const course = await db.course.findUnique({ where: { slug } });
  if (!course) notFound();

  // Verify enrollment (admins bypass). The quiz must belong to this course.
  if (session.role !== "ADMIN") {
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId: session.id, courseId: course.id } },
    });
    if (!enrollment) redirect(`/courses/${slug}`);
  }

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: { module: { select: { courseId: true } } },
  });
  if (!quiz) notFound();
  if (quiz.courseId !== course.id && quiz.module?.courseId !== course.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
        <QuizClient quizId={quizId} courseSlug={slug} />
      </div>
    </div>
  );
}
