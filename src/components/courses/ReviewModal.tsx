"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Star, Send, X } from "lucide-react";

export function ReviewModal({
  courseId,
  courseTitle,
  existing,
  onClose,
  onSubmitted,
}: {
  courseId: string;
  courseTitle: string;
  existing?: { rating: number; content: string | null } | null;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState(existing?.content || "");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setBusy(true);
    try {
      const method = existing ? "PUT" : "POST";
      const body: any = { courseId, rating, content };
      if (existing) body.id = (existing as any).id;
      const res = await fetch("/api/reviews", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Review submitted! It will appear after moderation.");
      onSubmitted();
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Review: {courseTitle}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="p-1"
            >
              <Star className={`h-7 w-7 ${(hover || rating) >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Share your experience (optional)…"
          className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground text-sm"
        />
        <button
          onClick={submit}
          disabled={busy}
          className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? <Send className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />} Submit review
        </button>
      </div>
    </div>
  );
}
