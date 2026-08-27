"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { MailCheck, UserPlus, CheckCircle2 } from "lucide-react";

export default function AcceptInvitePage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<{
    error?: string;
    email?: string;
    message?: string;
    hasAccount?: boolean;
    used?: boolean;
    expired?: boolean;
  }>({});

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!token) {
      setState({ error: "Missing invitation token." });
      setLoading(false);
      return;
    }
    fetch(`/api/invites/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) {
          setState({ error: d.error, used: d.error?.includes("used"), expired: d.error?.includes("expired") });
        } else {
          setState({ email: d.invite.email, message: d.invite.message, hasAccount: d.hasAccount });
        }
      })
      .catch(() => setState({ error: "Could not load invitation." }))
      .finally(() => setLoading(false));
  }, [token]);

  const acceptExisting = async () => {
    setSubmitting(true);
    const res = await fetch(`/api/invites/${token}`, { method: "POST" });
    const d = await res.json();
    setSubmitting(false);
    if (d.success) {
      toast.success("You're now an instructor!");
      router.push(d.redirectUrl || "/instructor");
    } else {
      toast.error(d.error);
    }
  };

  const acceptNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch(`/api/invites/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, password }),
    });
    const d = await res.json();
    setSubmitting(false);
    if (d.success) {
      toast.success("Welcome! Your instructor account is ready.");
      router.push(d.redirectUrl || "/instructor");
    } else if (d.needsLogin) {
      setState({ error: d.error });
    } else {
      toast.error(d.error);
    }
  };

  if (loading) {
    return <p className="text-center text-muted-foreground py-20">Loading invitation…</p>;
  }

  if (state.error) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <MailCheck className="h-10 w-10 text-amber-500 mx-auto" />
        <h1 className="text-xl font-semibold">Invitation unavailable</h1>
        <p className="text-muted-foreground">{state.error}</p>
        <Link href="/" className="text-primary hover:underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4 space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">You're invited to teach on Eduvia</h1>
        <p className="text-muted-foreground mt-2">
          Invitation for <strong>{state.email}</strong>
        </p>
        {state.message && (
          <p className="text-sm bg-muted rounded-lg p-3 mt-3 text-left italic">“{state.message}”</p>
        )}
      </div>

      {state.hasAccount ? (
        <button
          onClick={acceptExisting}
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <CheckCircle2 className="h-4 w-4" /> {submitting ? "Accepting…" : "Accept invitation & become an instructor"}
        </button>
      ) : (
        <form onSubmit={acceptNew} className="space-y-3">
          <input
            required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name"
            className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <input
            required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name"
            className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <input
            required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password (min 8 chars)"
            className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit" disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" /> {submitting ? "Creating account…" : "Create instructor account"}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Already have an account with a different email? <Link href="/login" className="text-primary hover:underline">Log in</Link> first.
      </p>
    </div>
  );
}
