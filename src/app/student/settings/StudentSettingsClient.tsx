"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Loader2, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

interface SettingsUser {
  firstName: string;
  lastName: string;
  bio: string | null;
  country: string | null;
  timezone: string | null;
  language: string | null;
}

export default function StudentSettingsClient({ user }: { user: SettingsUser }) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio || "",
    country: user.country || "",
    timezone: user.timezone || "UTC",
    language: user.language || "en",
  });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Profile updated");
      router.refresh();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pw),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Password changed");
      setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Account Settings" description="Manage your profile and password." />

      <form onSubmit={saveProfile} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First name</label>
            <input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last name</label>
            <input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" rows={3} value={form.bio} onChange={(e) => update("bio", e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={form.country} onChange={(e) => update("country", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Timezone</label>
            <input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={form.timezone} onChange={(e) => update("timezone", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Language</label>
            <input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={form.language} onChange={(e) => update("language", e.target.value)} />
          </div>
        </div>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save profile
        </button>
      </form>

      <form onSubmit={savePassword} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Change password</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Current password</label>
          <input type="password" required className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">New password</label>
            <input type="password" required minLength={8} className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm new password</label>
            <input type="password" required minLength={8} className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" value={pw.confirmPassword} onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })} />
          </div>
        </div>
        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update password
        </button>
      </form>
    </div>
  );
}
