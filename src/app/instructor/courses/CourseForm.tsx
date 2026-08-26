"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
}

interface Props {
  categories: Category[];
  course?: {
    id: string;
    title: string;
    shortDescription: string;
    fullDescription: string;
    categoryId: string;
    subcategoryId: string | null;
    difficulty: string;
    estimatedDuration: number;
    language: string;
    learningObjectives: string[];
    prerequisites: string[];
    skillsGained: string[];
  } | null;
}

export default function CourseForm({ categories, course }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(course?.title || "");
  const [shortDescription, setShortDescription] = useState(course?.shortDescription || "");
  const [fullDescription, setFullDescription] = useState(course?.fullDescription || "");
  const [categoryId, setCategoryId] = useState(course?.categoryId || "");
  const [subcategoryId, setSubcategoryId] = useState(course?.subcategoryId || "");
  const [difficulty, setDifficulty] = useState(course?.difficulty || "BEGINNER");
  const [estimatedDuration, setEstimatedDuration] = useState(course?.estimatedDuration || 60);
  const [language, setLanguage] = useState(course?.language || "en");
  const [objectives, setObjectives] = useState<string[]>(course?.learningObjectives || []);
  const [prereqs, setPrereqs] = useState<string[]>(course?.prerequisites || []);
  const [skills, setSkills] = useState<string[]>(course?.skillsGained || []);
  const [busy, setBusy] = useState(false);

  const [objInput, setObjInput] = useState("");
  const [preInput, setPreInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const addItem = (setter: (v: string[]) => void, list: string[], value: string, clear: () => void) => {
    const v = value.trim();
    if (!v) return;
    setter([...list, v]);
    clear();
  };
  const removeItem = (setter: (v: string[]) => void, list: string[], idx: number) => {
    setter(list.filter((_, i) => i !== idx));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        title,
        shortDescription,
        fullDescription,
        categoryId,
        subcategoryId: subcategoryId || undefined,
        difficulty,
        estimatedDuration: Number(estimatedDuration),
        language,
        learningObjectives: objectives,
        prerequisites: prereqs,
        skillsGained: skills,
      };
      const url = course ? `/api/courses/${course.id}` : "/api/courses";
      const method = course ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast.success(course ? "Course updated" : "Course created");
      router.push(course ? `/instructor/courses/${course.id}` : `/instructor/courses`);
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const selectedCat = categories.find((c) => c.id === categoryId);

  return (
    <form onSubmit={submit} className="space-y-6 bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Short description</label>
          <input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Full description</label>
          <textarea className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" rows={4} value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubcategoryId(""); }} required>
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subcategory</label>
          <select className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)}>
            <option value="">None</option>
            {selectedCat?.subcategories.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Estimated duration (minutes)</label>
          <input type="number" min={1} className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={estimatedDuration} onChange={(e) => setEstimatedDuration(Number(e.target.value))} />
        </div>
      </div>

      <TagInput label="Learning objectives" items={objectives} input={objInput} setInput={setObjInput} onAdd={() => addItem(setObjectives, objectives, objInput, () => setObjInput(""))} onRemove={(i) => removeItem(setObjectives, objectives, i)} />
      <TagInput label="Prerequisites" items={prereqs} input={preInput} setInput={setPreInput} onAdd={() => addItem(setPrereqs, prereqs, preInput, () => setPreInput(""))} onRemove={(i) => removeItem(setPrereqs, prereqs, i)} />
      <TagInput label="Skills gained" items={skills} input={skillInput} setInput={setSkillInput} onAdd={() => addItem(setSkills, skills, skillInput, () => setSkillInput(""))} onRemove={(i) => removeItem(setSkills, skills, i)} />

      <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {course ? "Save changes" : "Create course"}
      </button>
    </form>
  );
}

function TagInput({
  label, items, input, setInput, onAdd, onRemove,
}: {
  label: string;
  items: string[];
  input: string;
  setInput: (v: string) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
          placeholder={`Add ${label.toLowerCase()}…`}
        />
        <button type="button" onClick={onAdd} className="rounded-md border border-border px-3 text-sm hover:bg-muted">Add</button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full text-xs">
            {item}
            <button type="button" onClick={() => onRemove(i)} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
}
