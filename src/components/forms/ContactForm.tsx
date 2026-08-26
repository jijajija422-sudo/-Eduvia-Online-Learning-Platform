"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, subject, message }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed to send");
      toast.success("Message sent! We'll get back to you soon.");
      setName(""); setEmail(""); setSubject(""); setMessage("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full rounded-md border-0 py-2.5 px-3 ring-1 ring-inset ring-border bg-background text-foreground";
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Name</label><input className={field} value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
      </div>
      <div><label className="block text-sm font-medium mb-1">Subject</label><input className={field} value={subject} onChange={(e) => setSubject(e.target.value)} required /></div>
      <div><label className="block text-sm font-medium mb-1">Message</label><textarea className={field} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required /></div>
      <button disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send message
      </button>
    </form>
  );
}
