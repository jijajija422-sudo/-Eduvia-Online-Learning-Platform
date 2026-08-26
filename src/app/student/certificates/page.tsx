import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Award, Download, Share2, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/format";

export default async function CertificatesPage() {
  const session = await getSession();
  if (!session?.id) redirect("/login");

  const certificates = await db.certificate.findMany({
    where: { userId: session.id },
    include: { course: { select: { slug: true, title: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
        <p className="text-muted-foreground mt-1">Certificates you've earned by completing courses.</p>
      </div>

      {certificates.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Award className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">No certificates yet</h3>
          <p className="text-sm text-muted-foreground mb-6">Complete a course to earn your first certificate.</p>
          <Link href="/courses" className="inline-flex justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Find a course</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground p-6">
                <Award className="h-10 w-10 mb-3" />
                <p className="text-xs uppercase tracking-wide opacity-80">Certificate of Completion</p>
                <p className="text-lg font-bold leading-tight mt-1">{c.course.title}</p>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Issued to</span>
                  <span className="font-medium">{c.studentName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Issued on</span>
                  <span className="font-medium">{formatDate(c.issuedAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-xs">{c.certificateId}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Link href={`/student/certificates/${c.certificateId}`} className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                    <ExternalLink className="h-4 w-4" /> View
                  </Link>
                  <Link href={`/api/certificates/${c.certificateId}/pdf`} className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
                    <Download className="h-4 w-4" /> PDF
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
