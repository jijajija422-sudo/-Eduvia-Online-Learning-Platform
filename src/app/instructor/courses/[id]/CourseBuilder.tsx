"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, BookOpen, HelpCircle, Send, Loader2, FileText, X } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  orderIndex: number;
  estimatedMinutes: number;
  isPreview: boolean;
  isRequired: boolean;
}
interface QuizItem {
  id: string;
  title: string;
  isFinalAssessment: boolean;
  _count?: { questions: number };
}
interface Module {
  id: string;
  title: string;
  description: string | null;
  orderIndex: number;
  lessons: Lesson[];
  quizzes: QuizItem[];
}
interface BuilderCourse {
  id: string;
  title: string;
  status: string;
  modules: Module[];
}

export default function CourseBuilder({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [course, setCourse] = useState<BuilderCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [activeModal, setActiveModal] = useState<null | { type: "module" | "lesson" | "quiz"; moduleId?: string }>(null);

  const load = async () => {
    const res = await fetch(`/api/courses/${courseId}`);
    const data = await res.json();
    if (data.success) setCourse(data.course);
    setLoading(false);
  };

  useEffect(() => { load(); }, [courseId]);

  const submitForReview = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "PENDING_REVIEW" }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      toast.success("Submitted for review!");
      router.refresh();
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  };

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground py-10"><Loader2 className="h-5 w-5 animate-spin" /> Loading…</div>;
  if (!course) return <div className="text-muted-foreground py-10">Course not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">Status: <span className="font-semibold">{course.status.replace("_", " ")}</span></p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveModal({ type: "module" })} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
            <Plus className="h-4 w-4" /> Add Module
          </button>
          <button onClick={submitForReview} disabled={busy || course.status === "PENDING_REVIEW"} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <Send className="h-4 w-4" /> Submit for review
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {course.modules.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
            No modules yet. Add your first module to start building the curriculum.
          </div>
        )}
        {course.modules.map((mod, i) => (
          <div key={mod.id} className="bg-card border border-border rounded-xl shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-muted-foreground">Module {i + 1}</span>
                <span className="font-semibold">{mod.title}</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setActiveModal({ type: "lesson", moduleId: mod.id })} className="inline-flex items-center gap-1 text-xs rounded-md border border-border px-2 py-1.5 hover:bg-muted">
                  <FileText className="h-3.5 w-3.5" /> Lesson
                </button>
                <button onClick={() => setActiveModal({ type: "quiz", moduleId: mod.id })} className="inline-flex items-center gap-1 text-xs rounded-md border border-border px-2 py-1.5 hover:bg-muted">
                  <HelpCircle className="h-3.5 w-3.5" /> Quiz
                </button>
                <button onClick={async () => { if (confirm("Delete module and its content?")) { await fetch("/api/modules", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: mod.id }) }); toast.success("Module deleted"); load(); } }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {mod.lessons.map((l) => (
                <div key={l.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="font-medium">{l.title}</span>
                    <span className="text-xs text-muted-foreground">{l.estimatedMinutes} min</span>
                    {l.isPreview && <span className="text-xs bg-green-500/15 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">Preview</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <LinkEdit lessonId={l.id} courseId={courseId} onDone={load} />
                    <button onClick={async () => { if (confirm("Delete lesson?")) { await fetch("/api/lessons", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: l.id }) }); toast.success("Lesson deleted"); load(); } }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              {mod.quizzes.map((q) => (
                <div key={q.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm bg-amber-500/5">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">{q.title}</span>
                    {q.isFinalAssessment && <span className="text-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">Final</span>}
                    <span className="text-xs text-muted-foreground">{q._count?.questions || 0} questions</span>
                  </div>
                  <QuizEdit quizId={q.id} onDone={load} />
                </div>
              ))}
              {mod.lessons.length === 0 && mod.quizzes.length === 0 && (
                <p className="text-xs text-muted-foreground py-2">No lessons or quizzes yet.</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {activeModal?.type === "module" && (
        <ModuleModal courseId={courseId} onClose={() => setActiveModal(null)} onDone={() => { setActiveModal(null); load(); }} />
      )}
      {activeModal?.type === "lesson" && activeModal.moduleId && (
        <LessonModal courseId={courseId} moduleId={activeModal.moduleId} onClose={() => setActiveModal(null)} onDone={() => { setActiveModal(null); load(); }} />
      )}
      {activeModal?.type === "quiz" && activeModal.moduleId && (
        <QuizModal courseId={courseId} moduleId={activeModal.moduleId} onClose={() => setActiveModal(null)} onDone={() => { setActiveModal(null); load(); }} />
      )}
    </div>
  );
}

function LinkEdit({ lessonId, courseId, onDone }: { lessonId: string; courseId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Pencil className="h-4 w-4" /></button>
      {open && <LessonModal courseId={courseId} moduleId="" lessonId={lessonId} onClose={() => setOpen(false)} onDone={() => { setOpen(false); onDone(); }} />}
    </>
  );
}

function QuizEdit({ quizId, onDone }: { quizId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Pencil className="h-4 w-4" /></button>
      {open && <QuizModal courseId="" quizId={quizId} onClose={() => setOpen(false)} onDone={() => { setOpen(false); onDone(); }} />}
    </>
  );
}

function ModuleModal({ courseId, onClose, onDone }: { courseId: string; onClose: () => void; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/modules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId, title, description }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      toast.success("Module added");
      onDone();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <Modal onClose={onClose} title="Add Module">
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" placeholder="Module title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" placeholder="Description (optional)" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        <button disabled={busy} className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{busy ? "Saving…" : "Add Module"}</button>
      </form>
    </Modal>
  );
}

function LessonModal({ courseId, moduleId, lessonId, onClose, onDone }: { courseId: string; moduleId?: string; lessonId?: string; onClose: () => void; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [minutes, setMinutes] = useState(5);
  const [isPreview, setIsPreview] = useState(false);
  const [isRequired, setIsRequired] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(!lessonId);

  useEffect(() => {
    if (lessonId && !loaded) {
      fetch(`/api/lessons/${lessonId}`).then((r) => r.json()).then((d) => {
        if (d.success) {
          setTitle(d.lesson.title); setContent(d.lesson.content); setMinutes(d.lesson.estimatedMinutes); setIsPreview(d.lesson.isPreview); setIsRequired(d.lesson.isRequired);
        }
        setLoaded(true);
      });
    }
  }, [lessonId, loaded]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { title, content, estimatedMinutes: Number(minutes), isPreview, isRequired, moduleId: moduleId || undefined };
      const url = lessonId ? `/api/lessons` : "/api/lessons";
      const method = lessonId ? "PUT" : "POST";
      const body = lessonId ? { ...payload, id: lessonId } : payload;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      toast.success(lessonId ? "Lesson updated" : "Lesson added");
      onDone();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };
  return (
    <Modal onClose={onClose} title={lessonId ? "Edit Lesson" : "Add Lesson"}>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" placeholder="Lesson title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground font-mono text-xs" placeholder="Lesson content (HTML allowed)" rows={8} value={content} onChange={(e) => setContent(e.target.value)} required />
        <div className="grid grid-cols-2 gap-3">
          <input type="number" min={1} className="rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isPreview} onChange={(e) => setIsPreview(e.target.checked)} /> Preview</label>
          <label className="flex items-center gap-2 text-sm col-span-2"><input type="checkbox" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} /> Required to complete course</label>
        </div>
        <button disabled={busy} className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{busy ? "Saving…" : lessonId ? "Save Lesson" : "Add Lesson"}</button>
      </form>
    </Modal>
  );
}

function QuizModal({ courseId, moduleId, quizId, onClose, onDone }: { courseId?: string; moduleId?: string; quizId?: string; onClose: () => void; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [isFinal, setIsFinal] = useState(false);
  const [questions, setQuestions] = useState<{ text: string; type: string; options: { text: string; isCorrect: boolean }[] }[]>([]);
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState("MULTIPLE_CHOICE");
  const [optText, setOptText] = useState("");
  const [opts, setOpts] = useState<{ text: string; isCorrect: boolean }[]>([]);
  const [busy, setBusy] = useState(false);

  const addOption = () => {
    const t = optText.trim();
    if (!t) return;
    setOpts([...opts, { text: t, isCorrect: false }]);
    setOptText("");
  };
  const addQuestion = () => {
    if (!qText.trim()) return;
    setQuestions([...questions, { text: qText, type: qType, options: opts }]);
    setQText(""); setOpts([]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        title, passingScore: Number(passingScore), maxAttempts: Number(maxAttempts),
        isFinalAssessment: isFinal, moduleId: moduleId || undefined, courseId: courseId || undefined,
        questions,
      };
      const url = quizId ? `/api/quizzes` : "/api/quizzes";
      const method = quizId ? "PUT" : "POST";
      const body = quizId ? { ...payload, id: quizId } : payload;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      toast.success(quizId ? "Quiz updated" : "Quiz added");
      onDone();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <Modal onClose={onClose} title={quizId ? "Edit Quiz" : "Add Quiz"}>
      <form onSubmit={submit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        <input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" placeholder="Quiz title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Passing %<input type="number" min={1} max={100} className="mt-1 w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} /></label>
          <label className="text-sm">Attempts<input type="number" min={1} max={10} className="mt-1 w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={maxAttempts} onChange={(e) => setMaxAttempts(Number(e.target.value))} /></label>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isFinal} onChange={(e) => setIsFinal(e.target.checked)} /> Final assessment</label>

        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-sm font-semibold">Questions</p>
          <input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" placeholder="Question text" value={qText} onChange={(e) => setQText(e.target.value)} />
          <select className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={qType} onChange={(e) => setQType(e.target.value)}>
            <option value="MULTIPLE_CHOICE">Multiple choice</option>
            <option value="MULTIPLE_ANSWER">Multiple answer</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="SHORT_ANSWER">Short answer</option>
          </select>
          {qType !== "SHORT_ANSWER" && (
            <div className="space-y-1">
              <div className="flex gap-2">
                <input className="flex-1 rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" placeholder="Option text" value={optText} onChange={(e) => setOptText(e.target.value)} />
                <button type="button" onClick={addOption} className="rounded-md border border-border px-3 text-sm hover:bg-muted">Add</button>
              </div>
              {opts.map((o, i) => (
                <label key={i} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={o.isCorrect} onChange={(e) => setOpts(opts.map((x, j) => j === i ? { ...x, isCorrect: e.target.checked } : x))} />
                  {o.text}
                </label>
              ))}
            </div>
          )}
          <button type="button" onClick={addQuestion} className="text-sm rounded-md border border-border px-3 py-1.5 hover:bg-muted">Add question</button>
          <ul className="text-xs text-muted-foreground list-disc list-inside">
            {questions.map((q, i) => <li key={i}>{q.text} ({q.options.length} options)</li>)}
          </ul>
        </div>

        <button disabled={busy} className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{busy ? "Saving…" : quizId ? "Save Quiz" : "Add Quiz"}</button>
      </form>
    </Modal>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

