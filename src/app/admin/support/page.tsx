import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/format";
import Link from "next/link";

const statusStyle: Record<string, string> = {
  OPEN: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  IN_PROGRESS: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  RESOLVED: "bg-green-500/15 text-green-600 dark:text-green-400",
  CLOSED: "bg-muted text-muted-foreground",
};

export default async function AdminSupportPage() {
  await requireAdmin();
  const tickets = await db.supportTicket.findMany({
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Support Tickets" description="Student and guest inquiries." />
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Subject</th>
              <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">From</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Received</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{t.subject}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">{t.message}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                  {t.user ? `${t.user.firstName} ${t.user.lastName}` : t.guestName || t.guestEmail || "Guest"}
                </td>
                <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle[t.status] || ""}`}>{t.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">No support tickets.</p>}
      </div>
    </div>
  );
}
