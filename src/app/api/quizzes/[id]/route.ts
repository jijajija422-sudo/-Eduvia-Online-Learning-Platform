import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { gradeQuizAttempt, getQuizForAttempt } from "@/lib/services/quizzes";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const quiz = await db.quiz.findUnique({
    where: { id },
    include: { course: { select: { id: true, slug: true } } },
  });
  if (!quiz) return NextResponse.json({ error: "Quiz not found." }, { status: 404 });

  // Only enrolled users may attempt (admins always allowed).
  if (session.role !== "ADMIN" && quiz.courseId) {
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId: session.id, courseId: quiz.courseId } },
    });
    if (!enrollment) return NextResponse.json({ error: "Enroll to take this quiz." }, { status: 403 });
  }

  const data = await getQuizForAttempt(id, quiz.randomizeQuestions ? true : false);
  // Strip correct answers until after submission (unless showCorrectAnswers is false by config — we never reveal pre-submit).
  const safe = data
    ? {
        ...data,
        questions: data.questions.map((q) => ({
          ...q,
          options: q.options.map((o) => ({ id: o.id, text: o.text })),
        })),
      }
    : null;
  return NextResponse.json({ success: true, quiz: safe });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const quiz = await db.quiz.findUnique({ where: { id } });
  if (!quiz) return NextResponse.json({ error: "Quiz not found." }, { status: 404 });

  // Check attempts remaining
  const attemptCount = await db.quizAttempt.count({ where: { userId: session.id, quizId: id } });
  if (attemptCount >= quiz.maxAttempts) {
    return NextResponse.json({ error: "No attempts remaining." }, { status: 403 });
  }
  // Enrollment check
  if (session.role !== "ADMIN" && quiz.courseId) {
    const enrollment = await db.enrollment.findUnique({
      where: { userId_courseId: { userId: session.id, courseId: quiz.courseId } },
    });
    if (!enrollment) return NextResponse.json({ error: "Enroll to take this quiz." }, { status: 403 });
  }

  const body = await request.json();
  const answers = body.answers as any[];
  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: "No answers provided." }, { status: 400 });
  }

  try {
    const result = await gradeQuizAttempt(session.id, id, answers, body.timeSpent || 0);
    return NextResponse.json({ success: true, result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
