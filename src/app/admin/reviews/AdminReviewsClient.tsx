"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Trash2, Star } from "lucide-react";
import { formatDate } from "@/lib/format";

interface R {
  id: string;
  rating: number;
  content: string | null;
  status: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
  course: { title: string };
}

export default function AdminReviewsClient({ initial }: { initial: R[] }) {
  const [rows, setRows] = useState(initial);

  const moderate = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const d = await res.json();
    if (d.success) { toast.success(`Review ${status.toLowerCase()}`); setRows(rows.map((r) => r.id === id ? { ...r, status } : r)); }
    else toast.error(d.error);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.success) { toast.success("Deleted"); setRows(rows.filter((r) => r.id !== id)); }
    else toast.error(d.error);
  };

  const statusStyle: Record<string, string> = {
    PENDING: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    APPROVED: "bg-green-500/15 text-green-600 dark:text-green-400",
    HIDDEN: "bg-red-500/15 text-red-600 dark:text-red-400",
    FLAGGED: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead className="bg-muted/40 text-muted-foreground">
          <tr>
            <th className="text-left font-medium px-4 py-3">Review</th>
            <th className="text-left font-medium px-4 py-3">Course</th>
            <th className="text-left font-medium px-4 py-3">Status</th>
            <th className="text-right font-medium px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border hover:bg-muted/30">
              <td className="px-4 py-3">
                <div className="font-medium">{r.user.firstName} {r.user.lastName}</div>
                <div className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</div>
                <div className="flex items-center gap-1 text-amber-500 text-xs my-1">{r.rating} <Star className="h-3 w-3 fill-amber-400" /></div>
                {r.content && <p className="text-sm text-muted-foreground">{r.content}</p>}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{r.course.title}</td>
              <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle[r.status] || ""}`}>{r.status}</span></td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => moderate(r.id, "APPROVED")} title="Approve" className="p-1.5 rounded-md hover:bg-muted text-green-600"><CheckCircle2 className="h-4 w-4" /></button>
                  <button onClick={() => moderate(r.id, "HIDDEN")} title="Hide" className="p-1.5 rounded-md hover:bg-muted text-red-600"><XCircle className="h-4 w-4" /></button>
                  <button onClick={() => del(r.id)} title="Delete" className="p-1.5 rounded-md hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">No reviews to moderate.</p>}
    </div>
  );
}
