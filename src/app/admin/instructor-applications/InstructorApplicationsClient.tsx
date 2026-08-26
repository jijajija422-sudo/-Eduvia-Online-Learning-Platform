"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import { formatDate } from "@/lib/format";

interface App {
  id: string;
  status: string;
  createdAt: string;
  bio: string | null;
  experience: string | null;
  motivation: string | null;
  expertise: string[];
  user: { firstName: string; lastName: string; email: string };
}

export default function InstructorApplicationsClient({ initial }: { initial: App[] }) {
  const [rows, setRows] = useState(initial);

  const decide = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/instructor-applications`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    const d = await res.json();
    if (d.success) { toast.success(`Application ${status.toLowerCase()}`); setRows(rows.map((r) => r.id === id ? { ...r, status } : r)); }
    else toast.error(d.error);
  };

  return (
    <div className="space-y-4">
      {rows.length === 0 && <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">No instructor applications.</div>}
      {rows.map((a) => (
        <div key={a.id} className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-semibold">{a.user.firstName} {a.user.lastName}</h3>
              <a href={`mailto:${a.user.email}`} className="text-sm text-primary hover:underline flex items-center gap-1"><Mail className="h-3 w-3" /> {a.user.email}</a>
            </div>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${a.status === "PENDING" ? "bg-amber-500/15 text-amber-600" : a.status === "APPROVED" ? "bg-green-500/15 text-green-600" : "bg-red-500/15 text-red-600"}`}>{a.status}</span>
          </div>
          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
            {a.bio && <p><span className="font-medium text-foreground">Bio:</span> {a.bio}</p>}
            {a.experience && <p><span className="font-medium text-foreground">Experience:</span> {a.experience}</p>}
            {a.motivation && <p><span className="font-medium text-foreground">Motivation:</span> {a.motivation}</p>}
            {a.expertise?.length > 0 && <p><span className="font-medium text-foreground">Expertise:</span> {a.expertise.join(", ")}</p>}
          </div>
          {a.status === "PENDING" && (
            <div className="flex gap-2 mt-4">
              <button onClick={() => decide(a.id, "APPROVED")} className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"><CheckCircle2 className="h-4 w-4" /> Approve</button>
              <button onClick={() => decide(a.id, "REJECTED")} className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"><XCircle className="h-4 w-4" /> Reject</button>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">Applied {formatDate(a.createdAt)}</p>
        </div>
      ))}
    </div>
  );
}
