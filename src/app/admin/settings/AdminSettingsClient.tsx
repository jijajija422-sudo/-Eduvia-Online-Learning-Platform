"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

interface Settings {
  appName: string;
  appDescription: string;
  contactEmail: string;
  supportEmail: string;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  instructorApproval: boolean;
  courseApproval: boolean;
}

export default function AdminSettingsClient({ initial }: { initial: Settings }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      toast.success("Settings saved");
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  const Toggle = ({ field, label }: { field: keyof Settings; label: string }) => (
    <label className="flex items-center justify-between py-2">
      <span className="text-sm font-medium">{label}</span>
      <input type="checkbox" checked={form[field] as boolean} onChange={(e) => setForm({ ...form, [field]: e.target.checked })} className="h-5 w-5 accent-primary" />
    </label>
  );

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="font-semibold">General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1">Platform name</label><input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={form.appName} onChange={(e) => setForm({ ...form, appName: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={form.appDescription} onChange={(e) => setForm({ ...form, appDescription: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Contact email</label><input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} /></div>
          <div><label className="block text-sm font-medium mb-1">Support email</label><input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} /></div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold mb-2">Registration & Approvals</h2>
        <Toggle field="allowRegistration" label="Allow new registrations" />
        <Toggle field="requireEmailVerification" label="Require email verification" />
        <Toggle field="instructorApproval" label="Require admin approval for instructors" />
        <Toggle field="courseApproval" label="Require admin approval for courses" />
      </div>

      <button disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings
      </button>
    </form>
  );
}
