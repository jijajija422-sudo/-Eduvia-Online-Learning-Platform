import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/format";
import { Search } from "lucide-react";

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; targetType?: string }>;
}) {
  await requireAdmin();
  const { action, targetType } = await searchParams;
  const where: any = {};
  if (action) where.action = { contains: action };
  if (targetType) where.targetType = targetType;

  const logs = await db.auditLog.findMany({
    where,
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Record of important administrative actions." />
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Action</th>
              <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Target</th>
              <th className="text-left font-medium px-4 py-3">User</th>
              <th className="text-left font-medium px-4 py-3 hidden md:table-cell">When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3"><span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{l.action}</span></td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{l.targetType}{l.targetId ? `:${l.targetId.slice(0, 8)}` : ""}</td>
                <td className="px-4 py-3">{l.user ? `${l.user.firstName} ${l.user.lastName}` : "system"}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">No audit logs found.</p>}
      </div>
    </div>
  );
}
