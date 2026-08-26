"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Heart, Star, Loader2 } from "lucide-react";

export function WishlistButton({
  courseId,
  initialSaved,
  variant = "icon",
}: {
  courseId: string;
  initialSaved: boolean;
  variant?: "icon" | "full";
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/bookmarks/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(data.state === "added");
        toast.success(data.state === "added" ? "Saved to wishlist" : "Removed from wishlist");
      }
    } finally {
      setBusy(false);
    }
  };

  if (variant === "full") {
    return (
      <button
        onClick={toggle}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : ""}`} />}
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={saved ? "Remove from wishlist" : "Save to wishlist"}
      className="p-2 rounded-md hover:bg-muted text-muted-foreground"
    >
      <Heart className={`h-5 w-5 ${saved ? "fill-red-500 text-red-500" : ""}`} />
    </button>
  );
}
