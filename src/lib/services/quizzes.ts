import { db } from "@/lib/db";
import { createNotification } from "@/lib/services/notifications";
import { emailTemplates } from "@/lib/mailer";
import { evaluateCourseProgress } from "@/lib/services/courses";
import type { NotificationType } from "@/types";

export interface AnswerSubmission {
  questionId: string;
  selectedOptionIds?: string[];
  shortAnswer?: string;
}

export interface GradedResult {
  attemptId: string;
  score: number;
  passed: boolean;
  passedCount: number;
  totalPoints: number;
  earnedPoints: number;
  correct: boolean[]; // per-answer
  attemptNumber: number;
}

// Shuffle helper (Fisher–Yates) — used only when randomize is requested.
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Fetches a quiz with questions + options, optionally randomized for an attempt.
export async function getQuizForAttempt(quizId: string, randomize = false) {
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: {
          options: { orderBy: { orderIndex: "asc" } },
        },
      },
    },
  });
  if (!quiz) return null;

  let questions = quiz.questions.map((q) => ({
    ...q,
    options:
      randomize ? shuffle(q.options).map((o, i) => ({ ...o, orderIndex: i })) : q.options,
  }));
  if (randomize) questions = shuffle(questions);

  return { ...quiz, questions };
}

// Grades a submission and persists the attempt + answers.
export async function gradeQuizAttempt(
  userId: string,
  quizId: string,
  answers: AnswerSubmission[],
  timeSpent = 0
): Promise<GradedResult> {
  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: { include: { options: true } },
      course: { select: { id: true, title: true, slug: true } },
    },
  });
  if (!quiz) throw new Error("Quiz not found.");

  const prevAttempts = await db.quizAttempt.count({ where: { userId, quizId } });
  const attemptNumber = prevAttempts + 1;

  const questionMap = new Map(quiz.questions.map((q) => [q.id, q]));
  let totalPoints = 0;
  let earnedPoints = 0;
  const correct: boolean[] = [];

  const attemptAnswers = answers.map((ans) => {
    const q = questionMap.get(ans.questionId);
    if (!q) throw new Error("Unknown question in submission.");
    totalPoints += q.points;
    let isCorrect = false;
    let pointsEarned = 0;

    if (q.type === "SHORT_ANSWER") {
      // Short answers are stored for manual review; auto-mark as submitted.
      isCorrect = false;
      pointsEarned = 0;
    } else {
      const correctOptionIds = new Set(
        q.options.filter((o) => o.isCorrect).map((o) => o.id)
      );
      const selected = new Set(ans.selectedOptionIds || []);
      if (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") {
        isCorrect = selected.size === correctOptionIds.size && [...selected].every((s) => correctOptionIds.has(s));
      } else if (q.type === "MULTIPLE_ANSWER") {
        isCorrect = selected.size === correctOptionIds.size && [...selected].every((s) => correctOptionIds.has(s));
      }
      if (isCorrect) {
        pointsEarned = q.points;
        earnedPoints += q.points;
      }
    }
    correct.push(isCorrect);
    return {
      questionId: q.id,
      selectedOptionIds: JSON.stringify(ans.selectedOptionIds || []),
      shortAnswer: ans.shortAnswer ?? null,
      isCorrect,
      pointsEarned,
    };
  });

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = score >= quiz.passingScore;

  const attempt = await db.quizAttempt.create({
    data: {
      quizId,
      userId,
      attemptNumber,
      score,
      passed,
      timeSpent,
      completedAt: new Date(),
      answers: { create: attemptAnswers },
    },
  });

  // Notify + email on result
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });
  if (user) {
    await createNotification({
      userId,
      type: "QUIZ_RESULT" as NotificationType,
      title: passed ? "Quiz passed" : "Quiz result",
      message: `You scored ${score}% on "${quiz.title}".`,
      link: quiz.course?.slug ? `/courses/${quiz.course.slug}/learn` : undefined,
    });
    emailTemplates.quizResult(
      `${user.firstName} ${user.lastName}`,
      quiz.title,
      passed,
      score
    );
  }

  // Re-evaluate course completion (final assessment may unlock certificate).
  if (quiz.course?.id) {
    await evaluateCourseProgress(userId, quiz.course.id);
  }

  return {
    attemptId: attempt.id,
    score,
    passed,
    passedCount: passed ? attemptNumber : attemptNumber - 1,
    totalPoints,
    earnedPoints,
    correct,
    attemptNumber,
  };
}

export async function getBestAttempt(userId: string, quizId: string) {
  const attempts = await db.quizAttempt.findMany({
    where: { userId, quizId },
    orderBy: { score: "desc" },
    take: 1,
  });
  return attempts[0] ?? null;
}
