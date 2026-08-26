"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";

interface SafeQuestion {
  id: string;
  text: string;
  type: string;
  explanation: string | null;
  points: number;
  options: { id: string; text: string }[];
}

interface SafeQuiz {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  timeLimit: number | null;
  maxAttempts: number;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  isFinalAssessment: boolean;
  course: { slug: string } | null;
  questions: SafeQuestion[];
}

export default function QuizClient({ quizId, courseSlug }: { quizId: string; courseSlug: string }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<SafeQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [shortAnswers, setShortAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [attemptsUsed, setAttemptsUsed] = useState(0);

  useEffect(() => {
    fetch(`/api/quizzes/${quizId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setQuiz(d.quiz);
          setAttemptsUsed(d.attemptNumber || 0);
        } else {
          toast.error(d.error || "Failed to load quiz");
        }
      })
      .finally(() => setLoading(false));
  }, [quizId]);

  const selectOption = (qId: string, optId: string, multiple: boolean) => {
    setAnswers((prev) => {
      const cur = prev[qId] || [];
      if (multiple) {
        return { ...prev, [qId]: cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId] };
      }
      return { ...prev, [qId]: [optId] };
    });
  };

  const submit = async () => {
    setSubmitting(true);
    const payload = (quiz!.questions).map((q) => ({
      questionId: q.id,
      selectedOptionIds: answers[q.id] || [],
      shortAnswer: shortAnswers[q.id] || undefined,
    }));
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload, timeSpent: 0 }),
      });
      const d = await res.json();
      if (!res.ok) {
        toast.error(d.error || "Submission failed");
        return;
      }
      setResult(d.result);
      toast.success(d.result.passed ? "Passed!" : "Submitted");
    } catch {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading quiz…
      </div>
    );
  }

  if (!quiz) {
    return <div className="text-center py-24 text-muted-foreground">Quiz not available.</div>;
  }

  if (attemptsUsed >= quiz.maxAttempts && !result) {
    return (
      <div className="bg-card border border-border rounded-2xl p-10 text-center">
        <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
        <h2 className="text-xl font-bold">No attempts remaining</h2>
        <p className="text-sm text-muted-foreground mt-2">You've used all {quiz.maxAttempts} attempts for this quiz.</p>
        <Link href={`/courses/${courseSlug}/learn`} className="inline-block mt-6 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Back to course</Link>
      </div>
    );
  }

  if (result) {
    const passed = result.passed;
    return (
      <div className="space-y-6">
        <div className={`bg-card border rounded-2xl p-8 text-center ${passed ? "border-green-500/40" : "border-amber-500/40"}`}>
          {passed ? <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-3" /> : <XCircle className="h-14 w-14 text-amber-500 mx-auto mb-3" />}
          <h2 className="text-2xl font-bold">{passed ? "Congratulations!" : "Not quite there"}</h2>
          <p className="text-4xl font-extrabold mt-2">{result.score}%</p>
          <p className="text-sm text-muted-foreground mt-1">Passing score: {quiz.passingScore}%</p>
        </div>

        {quiz.showExplanations && (
          <div className="space-y-4">
            {quiz.questions.map((q, i) => (
              <div key={q.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-2">
                  <span className={result.correct[i] ? "text-green-500" : "text-destructive"}>
                    {result.correct[i] ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{i + 1}. {q.text}</p>
                    {q.explanation && <p className="text-sm text-muted-foreground mt-2"><strong>Explanation:</strong> {q.explanation}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          {!passed && attemptsUsed < quiz.maxAttempts && (
            <button onClick={() => { setResult(null); setAnswers({}); setShortAnswers({}); }} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
          )}
          <Link href={`/courses/${courseSlug}/learn`} className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted">
            Back to course <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        {quiz.description && <p className="text-muted-foreground mt-1">{quiz.description}</p>}
        <p className="text-sm text-muted-foreground mt-2">Passing score: {quiz.passingScore}% • Attempts used: {attemptsUsed}/{quiz.maxAttempts}</p>
      </div>

      <div className="space-y-5">
        {quiz.questions.map((q, i) => (
          <div key={q.id} className="bg-card border border-border rounded-xl p-5">
            <p className="font-semibold mb-3">{i + 1}. {q.text}</p>
            {q.type === "SHORT_ANSWER" ? (
              <textarea
                className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground text-sm"
                rows={3}
                value={shortAnswers[q.id] || ""}
                onChange={(e) => setShortAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                placeholder="Type your answer…"
              />
            ) : (
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const selected = (answers[q.id] || []).includes(opt.id);
                  const multiple = q.type === "MULTIPLE_ANSWER";
                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectOption(q.id, opt.id, multiple)}
                      className={`w-full text-left rounded-md border px-4 py-2.5 text-sm transition-colors ${selected ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={submit}
        disabled={submitting}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Submit answers
      </button>
    </div>
  );
}
