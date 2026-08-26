"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Loader2, X } from "lucide-react";

export default function InstructorSettingsClient({
  initial,
}: {
  initial: {
    firstName: string;
    lastName: string;
    bio: string;
    country: string;
    timezone: string;
    language: string;
    expertise: string[];
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Profile updated");
      router.refresh();
    } catch {
      toast.error("Failed to save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">First name</label><input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
        <div><label className="block text-sm font-medium mb-1">Last name</label><input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium mb-1">Country</label><input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
        <div><label className="block text-sm font-medium mb-1">Timezone</label><input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></div>
        <div><label className="block text-sm font-medium mb-1">Language</label><input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} /></div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Expertise</label>
        <div className="flex gap-2">
          <input className="flex-1 rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={expertiseInput} onChange={(e) => setExpertiseInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (expertiseInput.trim()) { setForm({ ...form, expertise: [...form.expertise, expertiseInput.trim()] }); setExpertiseInput(""); } } }} placeholder="Add area of expertise…" />
          <button type="button" onClick={() => { if (expertiseInput.trim()) { setForm({ ...form, expertise: [...form.expertise, expertiseInput.trim()] }); setExpertiseInput(""); } }} className="rounded-md border border-border px-3 text-sm hover:bg-muted">Add</button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {form.expertise.map((x, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full text-xs">
              {x}
              <button type="button" onClick={() => setForm({ ...form, expertise: form.expertise.filter((_, j) => j !== i) })} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
      </div>
      <button disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
      </button>
    </form>
  );
}
