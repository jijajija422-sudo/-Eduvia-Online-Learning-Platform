"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { UserPlus, Send, Copy, Check } from "lucide-react";

interface Invite {
  id: string;
  email: string;
  message: string | null;
  status: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  invitedBy: { firstName: string; lastName: string };
}

export default function InstructorInvitesClient() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/instructor-invites");
    const d = await res.json();
    if (d.success) setInvites(d.invites);
  };
  useEffect(() => { load(); }, []);

  const inviteLink = (token: string) =>
    `${window.location.origin.replace(/\/$/, "")}/accept-invite?token=${token}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/instructor-invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, message: message || undefined }),
    });
    const d = await res.json();
    setLoading(false);
    if (d.success) {
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
      setMessage("");
      load();
    } else {
      toast.error(d.error);
    }
  };

  const copy = (token: string) => {
    navigator.clipboard.writeText(inviteLink(token));
    setCopied(token);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold">Invite an instructor</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="instructor@example.com"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional personal message"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <Send className="h-4 w-4" /> {loading ? "Sending…" : "Send invitation"}
        </button>
      </form>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-semibold mb-3">Sent invitations ({invites.length})</h2>
        {invites.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invitations sent yet.</p>
        ) : (
          <div className="space-y-3">
            {invites.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between gap-3 border-t border-border pt-3 first:border-0 first:pt-0">
                <div>
                  <p className="text-sm font-medium">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {inv.status} · by {inv.invitedBy.firstName} {inv.invitedBy.lastName} · expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => copy(inv.token)}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  title="Copy invite link"
                >
                  {copied === inv.token ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy link
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
