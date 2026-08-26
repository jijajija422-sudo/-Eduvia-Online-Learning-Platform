"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GraduationCap, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default function BecomeInstructorPage() {
  const router = useRouter();
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [motivation, setMotivation] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/instructor-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, experience, motivation, expertise }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Application submitted! We'll review it shortly.");
      router.push("/student");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Become an Instructor" description="Share your knowledge with learners around the world." />
      <form onSubmit={submit} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Teaching experience</label>
          <textarea className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" rows={3} value={experience} onChange={(e) => setExperience(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Why do you want to teach?</label>
          <textarea className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" rows={3} value={motivation} onChange={(e) => setMotivation(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Areas of expertise</label>
          <div className="flex gap-2">
            <input className="flex-1 rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={expertiseInput} onChange={(e) => setExpertiseInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (expertiseInput.trim()) { setExpertise([...expertise, expertiseInput.trim()]); setExpertiseInput(""); } } }} placeholder="e.g. React, Machine Learning" />
            <button type="button" onClick={() => { if (expertiseInput.trim()) { setExpertise([...expertise, expertiseInput.trim()]); setExpertiseInput(""); } }} className="rounded-md border border-border px-3 text-sm hover:bg-muted">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {expertise.map((x, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full text-xs">{x}<button type="button" onClick={() => setExpertise(expertise.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">×</button></span>
            ))}
          </div>
        </div>
        <button disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <GraduationCap className="h-4 w-4" />} Submit application
        </button>
      </form>
    </div>
  );
}
