"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      toast.success("Subscribed! Check your inbox.");
      setEmail("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-primary-foreground/70" />
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border-0 py-2.5 pl-9 pr-3 bg-white/10 text-primary-foreground placeholder:text-primary-foreground/60 ring-1 ring-inset ring-white/30 focus:ring-2 focus:ring-white"
        />
      </div>
      <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-md bg-background px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Subscribe
      </button>
    </form>
  );
}
