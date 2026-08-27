"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Search, ShieldAlert, ShieldCheck, Trash2, UserCog } from "lucide-react";
import { formatDate } from "@/lib/format";
import { InviteInstructorModal } from "./InviteInstructorModal";

interface U {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  _count: { enrollments: number; courses: number };
}

export default function UsersTable({ initial }: { initial: U[] }) {
  const [rows, setRows] = useState(initial);
  const [query, setQuery] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const refresh = async (q: string) => {
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`);
    const d = await res.json();
    if (d.success) setRows(d.users);
  };

  const suspend = async (id: string, suspend: boolean) => {
    if (!confirm(suspend ? "Suspend this user?" : "Activate this user?")) return;
    const res = await fetch(`/api/admin/users/${id}/suspend`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ suspended: suspend }) });
    const d = await res.json();
    if (d.success) { toast.success(suspend ? "User suspended" : "User activated"); setRows(rows.map((r) => r.id === id ? { ...r, isActive: !suspend } : r)); }
    else toast.error(d.error);
  };

  const setRole = async (id: string, role: string) => {
    const res = await fetch(`/api/admin/users/${id}/suspend`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
    const d = await res.json();
    if (d.success) { toast.success(`Role set to ${role}`); setRows(rows.map((r) => r.id === id ? { ...r, role } : r)); }
    else toast.error(d.error);
  };

  const del = async (id: string) => {
    if (!confirm("Permanently delete this user? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.success) { toast.success("User deleted"); setRows(rows.filter((r) => r.id !== id)); }
    else toast.error(d.error);
  };

  const filtered = rows.filter((r) => `${r.firstName} ${r.lastName} ${r.email}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search users…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); refresh(e.target.value); }}
            className="w-full rounded-md border-0 py-2 pl-9 pr-3 ring-1 ring-inset ring-border bg-background text-foreground text-sm"
          />
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors shadow-sm"
        >
          <UserCog className="h-4 w-4" />
          Invite Instructor
        </button>
      </div>

      <InviteInstructorModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        onSuccess={() => refresh(query)} 
      />

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">User</th>
              <th className="text-left font-medium px-4 py-3">Role</th>
              <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Status</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Joined</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.firstName} {u.lastName}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <select value={u.role} onChange={(e) => setRole(u.id, e.target.value)} className="rounded-md border-0 py-1 px-2 ring-1 ring-inset ring-border bg-background text-foreground text-xs">
                    <option value="STUDENT">Student</option>
                    <option value="INSTRUCTOR">Instructor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${u.isActive ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-red-500/15 text-red-600 dark:text-red-400"}`}>
                    {u.isActive ? "Active" : "Suspended"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => suspend(u.id, u.isActive)} title={u.isActive ? "Suspend" : "Activate"} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                      {u.isActive ? <ShieldAlert className="h-4 w-4 text-amber-500" /> : <ShieldCheck className="h-4 w-4 text-green-500" />}
                    </button>
                    <button onClick={() => del(u.id)} title="Delete" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Trash2 className="h-4 w-4 text-destructive" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">No users found.</p>}
      </div>
    </div>
  );
}
