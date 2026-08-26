"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck, Plus, Trash2, StickyNote } from "lucide-react";

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function LessonTools({ lessonId, courseSlug }: { lessonId: string; courseSlug: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    fetch("/api/notes?lessonId=" + lessonId).then((r) => r.json()).then((d) => { if (d.success) setNotes(d.notes); });
    fetch("/api/bookmarks/lesson", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId, checkOnly: true }) })
      .then((r) => r.json()).then((d) => setBookmarked(!!d.saved)).catch(() => {});
  }, [lessonId]);

  const toggleBookmark = async () => {
    const res = await fetch("/api/bookmarks/lesson", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId }) });
    const d = await res.json();
    setBookmarked(d.action === "added");
    toast.success(d.action === "added" ? "Bookmarked" : "Removed bookmark");
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    const res = await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId, content: noteText }) });
    const d = await res.json();
    if (d.success) { setNotes([d.note, ...notes]); setNoteText(""); toast.success("Note saved"); }
  };

  const removeNote = async (id: string) => {
    await fetch("/api/notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={toggleBookmark} className={`inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted ${bookmarked ? "text-primary" : ""}`}>
          {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {bookmarked ? "Bookmarked" : "Bookmark"}
        </button>
        <button onClick={() => setShowNotes((s) => !s)} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
          <StickyNote className="h-4 w-4" /> Notes ({notes.length})
        </button>
      </div>

      {showNotes && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <div className="flex gap-2 mb-3">
            <textarea
              className="flex-1 rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground text-sm"
              rows={2}
              placeholder="Add a private note for this lesson…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <button onClick={addNote} className="inline-flex items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {notes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet.</p>}
            {notes.map((n) => (
              <div key={n.id} className="group flex items-start gap-2 rounded-lg bg-muted/40 p-2">
                <p className="flex-1 text-sm whitespace-pre-wrap">{n.content}</p>
                <button onClick={() => removeNote(n.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
