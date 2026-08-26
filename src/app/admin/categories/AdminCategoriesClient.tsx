"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, BookOpen } from "lucide-react";

interface Cat {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  _count: { subcategories: number; courses: number };
}

export default function AdminCategoriesClient({ initial }: { initial: Cat[] }) {
  const [cats, setCats] = useState(initial);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, description: desc }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      toast.success("Category created");
      setCats([...cats, { ...d.category, isActive: true, _count: { subcategories: 0, courses: 0 } }]);
      setName(""); setDesc("");
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const res = await fetch("/api/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const d = await res.json();
    if (d.success) { toast.success("Deleted"); setCats(cats.filter((c) => c.id !== id)); }
    else toast.error(d.error);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <form onSubmit={add} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="font-semibold">Add Category</h2>
          <input className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <textarea className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-border bg-background text-foreground" placeholder="Description" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
          <button disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <Plus className="h-4 w-4" /> Add Category
          </button>
        </form>
      </div>

      <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Name</th>
              <th className="text-right font-medium px-4 py-3 hidden sm:table-cell">Courses</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> {c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.description || c.slug}</div>
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">{c._count.courses}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => del(c.id)} className="p-1.5 rounded-md hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
