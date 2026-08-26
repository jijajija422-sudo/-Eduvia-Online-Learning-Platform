import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { quizSchema, questionSchema } from "@/schemas";

async function canManageQuiz(quizId: string | null, courseId: string | null, moduleId: string | null, userId: string) {
  let courseIdToCheck: string | null = courseId ?? null;
  if (moduleId && !courseIdToCheck) {
    const mod = await db.module.findUnique({ where: { id: moduleId }, select: { courseId: true } });
    courseIdToCheck = mod?.courseId ?? null;
  }
  if (quizId) {
    const quiz = await db.quiz.findUnique({ where: { id: quizId }, select: { courseId: true, moduleId: true } });
    courseIdToCheck = quiz?.courseId ?? (quiz?.moduleId ? (await db.module.findUnique({ where: { id: quiz.moduleId }, select: { courseId: true } }))?.courseId ?? null : null);
  }
  if (!courseIdToCheck) return false;
  const course = await db.course.findUnique({ where: { id: courseIdToCheck }, select: { instructorId: true } });
  if (!course) return false;
  if (course.instructorId === userId) return true;
  const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === "ADMIN";
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.id || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const body = await request.json();
  const result = quizSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Invalid quiz." }, { status: 400 });

  if (!(await canManageQuiz(null, body.courseId, body.moduleId, session.id))) {
    return NextResponse.json({ error: "Not authorized for this course." }, { status: 403 });
  }

  const quiz = await db.quiz.create({
    data: {
      title: result.data.title,
      description: result.data.description,
      passingScore: result.data.passingScore,
      maxAttempts: result.data.maxAttempts,
      timeLimit: result.data.timeLimit,
      randomizeQuestions: result.data.randomizeQuestions,
      randomizeAnswers: result.data.randomizeAnswers,
      showCorrectAnswers: result.data.showCorrectAnswers,
      showExplanations: result.data.showExplanations,
      isFinalAssessment: result.data.isFinalAssessment,
      moduleId: body.moduleId || null,
      courseId: body.courseId || null,
      orderIndex: body.orderIndex ?? 0,
    },
  });

  // Create questions + options if provided
  const questions = body.questions as any[] | undefined;
  if (Array.isArray(questions)) {
    for (const q of questions) {
      const qr = questionSchema.safeParse(q);
      if (!qr.success) continue;
      const created = await db.question.create({
        data: {
          quizId: quiz.id,
          text: qr.data.text,
          type: qr.data.type,
          explanation: qr.data.explanation,
          points: qr.data.points,
          orderIndex: 0,
        },
      });
      if (Array.isArray(qr.data.options)) {
        await db.questionOption.createMany({
          data: qr.data.options.map((o, i) => ({
            questionId: created.id,
            text: o.text,
            isCorrect: o.isCorrect,
            orderIndex: i,
          })),
        });
      }
    }
  }

  return NextResponse.json({ success: true, quiz });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json();
  const { id } = body;
  if (!(await canManageQuiz(id, null, null, session.id))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const result = quizSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Invalid quiz." }, { status: 400 });
  const updated = await db.quiz.update({
    where: { id },
    data: {
      title: result.data.title,
      description: result.data.description,
      passingScore: result.data.passingScore,
      maxAttempts: result.data.maxAttempts,
      timeLimit: result.data.timeLimit,
      randomizeQuestions: result.data.randomizeQuestions,
      randomizeAnswers: result.data.randomizeAnswers,
      showCorrectAnswers: result.data.showCorrectAnswers,
      showExplanations: result.data.showExplanations,
      isFinalAssessment: result.data.isFinalAssessment,
    },
  });
  return NextResponse.json({ success: true, quiz: updated });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json();
  if (!(await canManageQuiz(body.id, null, null, session.id))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  await db.quiz.delete({ where: { id: body.id } });
  return NextResponse.json({ success: true });
}
