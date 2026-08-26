"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { timeAgo } from "@/lib/format";

interface N {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsClient({ initial }: { initial: N[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState(false);

  const markRead = async (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isRead: true } : i)));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const markAll = async () => {
    setBusy(true);
    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setBusy(false);
  };

  const remove = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  };

  const unread = items.filter((i) => !i.isRead).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread` : "You're all caught up"}
        action={
          <button onClick={markAll} disabled={busy || unread === 0} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        }
      />

      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">No notifications yet</h3>
          <p className="text-sm text-muted-foreground">We'll let you know about enrollments, completions, and more.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div key={n.id} className={`flex items-start gap-3 p-4 rounded-xl border ${n.isRead ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}>
              <div className="mt-1">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bell className="h-4 w-4" />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{n.title}</p>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                {n.link && (
                  <Link href={n.link} onClick={() => markRead(n.id)} className="inline-block mt-2 text-sm font-medium text-primary hover:underline">
                    View →
                  </Link>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {!n.isRead && (
                  <button onClick={() => markRead(n.id)} title="Mark read" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                    <Check className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => remove(n.id)} title="Delete" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
