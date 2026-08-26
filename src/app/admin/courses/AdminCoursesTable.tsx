"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Search, CheckCircle2, XCircle, Star, Trash2, Eye, Send } from "lucide-react";
import { formatDate } from "@/lib/format";

interface C {
  id: string;
  title: string;
  slug: string;
  status: string;
  isFeatured: boolean;
  enrollmentCount: number;
  rating: number;
  instructor: { firstName: string; lastName: string };
  category: { name: string };
  _count: { modules: number; enrollments: number };
}

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_REVIEW: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  APPROVED: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  PUBLISHED: "bg-green-500/15 text-green-600 dark:text-green-400",
  REJECTED: "bg-red-500/15 text-red-600 dark:text-red-400",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export default function AdminCoursesTable({ initial }: { initial: C[] }) {
  const [rows, setRows] = useState(initial);
  const [query, setQuery] = useState("");

  const setStatus = async (id: string, status: string, reason?: string) => {
    const res = await fetch(`/api/admin/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reason ? { status, rejectionReason: reason } : { status }),
    });
    const d = await res.json();
    if (d.success) { toast.success(`Course ${status.toLowerCase()}`); setRows(rows.map((r) => r.id === id ? { ...r, status } : r)); }
    else toast.error(d.error);
  };

  const toggleFeature = async (id: string, featured: boolean) => {
    const res = await fetch(`/api/admin/courses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featured }) });
    const d = await res.json();
    if (d.success) { toast.success(featured ? "Featured" : "Unfeatured"); setRows(rows.map((r) => r.id === id ? { ...r, isFeatured: featured } : r)); }
    else toast.error(d.error);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this course permanently?")) return;
    const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.success) { toast.success("Course deleted"); setRows(rows.filter((r) => r.id !== id)); }
    else toast.error(d.error);
  };

  const reject = (id: string) => {
    const reason = prompt("Reason for rejection (shared with instructor):");
    if (reason !== null) setStatus(id, "REJECTED", reason);
  };

  const filtered = rows.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input placeholder="Search courses…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full rounded-md border-0 py-2 pl-9 pr-3 ring-1 ring-inset ring-border bg-background text-foreground text-sm" />
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Course</th>
              <th className="text-left font-medium px-4 py-3">Instructor</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-right font-medium px-4 py-3 hidden sm:table-cell">Students</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.category.name}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.instructor.firstName} {c.instructor.lastName}</td>
                <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles[c.status]}`}>{c.status.replace("_", " ")}</span></td>
                <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">{c.enrollmentCount}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setStatus(c.id, "APPROVED")} title="Approve" className="p-1.5 rounded-md hover:bg-muted text-green-600"><CheckCircle2 className="h-4 w-4" /></button>
                    <button onClick={() => reject(c.id)} title="Reject" className="p-1.5 rounded-md hover:bg-muted text-red-600"><XCircle className="h-4 w-4" /></button>
                    <button onClick={() => setStatus(c.id, "PUBLISHED")} title="Publish" className="p-1.5 rounded-md hover:bg-muted text-blue-600"><Send className="h-4 w-4" /></button>
                    <button onClick={() => toggleFeature(c.id, !c.isFeatured)} title={c.isFeatured ? "Unfeature" : "Feature"} className="p-1.5 rounded-md hover:bg-muted text-amber-500"><Star className={`h-4 w-4 ${c.isFeatured ? "fill-amber-400" : ""}`} /></button>
                    <a href={`/courses/${c.slug}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Eye className="h-4 w-4" /></a>
                    <button onClick={() => del(c.id)} title="Delete" className="p-1.5 rounded-md hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">No courses found.</p>}
      </div>
    </div>
  );
}
