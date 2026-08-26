"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FileText, Trash2, Search } from "lucide-react";
import { timeAgo } from "@/lib/format";

interface Note {
  id: string;
  content: string;
  updatedAt: string;
  lesson: { id: string; title: string; courseSlug: string };
}

export default function NotesClient({ initial }: { initial: Note[] }) {
  const [notes, setNotes] = useState(initial);
  const [query, setQuery] = useState("");

  const remove = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    toast.success("Note deleted");
  };

  const filtered = notes.filter((n) => n.content.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md border-0 py-2 pl-9 pr-3 ring-1 ring-inset ring-border bg-background text-foreground text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">No notes yet</h3>
          <p className="text-sm text-muted-foreground">Open a lesson and write notes as you learn.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((n) => (
            <div key={n.id} className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/courses/${n.lesson.courseSlug}/learn/${n.lesson.id}`} className="text-sm font-medium text-primary hover:underline">
                  {n.lesson.title}
                </Link>
                <button onClick={() => remove(n.id)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap line-clamp-6">{n.content}</p>
              <p className="text-xs text-muted-foreground mt-3">{timeAgo(n.updatedAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
