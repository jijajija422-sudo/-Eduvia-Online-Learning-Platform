import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { Award, Download } from "lucide-react";

export default async function AdminCertificatesPage() {
  await requireAdmin();
  const certs = await db.certificate.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      course: { select: { title: true, slug: true } },
    },
    orderBy: { issuedAt: "desc" },
    take: 300,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Certificates" description="All certificates issued on the platform." />
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-3">Student</th>
              <th className="text-left font-medium px-4 py-3">Course</th>
              <th className="text-left font-medium px-4 py-3 hidden sm:table-cell">Issued</th>
              <th className="text-left font-medium px-4 py-3">Certificate ID</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {certs.map((c) => (
              <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="font-medium">{c.user.firstName} {c.user.lastName}</div>
                  <div className="text-xs text-muted-foreground">{c.user.email}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{c.course.title}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{formatDate(c.issuedAt)}</td>
                <td className="px-4 py-3 font-mono text-xs">{c.certificateId}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/certificates/${c.certificateId}`} className="inline-flex items-center gap-1 text-primary hover:underline text-xs">View</Link>
                    <a href={`/api/certificates/${c.certificateId}/pdf`} target="_blank" rel="noreferrer" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="Download PDF"><Download className="h-4 w-4" /></a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {certs.length === 0 && <p className="text-center text-sm text-muted-foreground py-10">No certificates issued yet.</p>}
      </div>
    </div>
  );
}
