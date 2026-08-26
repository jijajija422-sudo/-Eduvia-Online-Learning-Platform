import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Award, Download, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/format";
import CopyVerifyButton from "@/components/courses/CopyVerifyButton";

export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const session = await getSession();
  if (!session?.id) redirect("/login");

  const { certificateId } = await params;
  const cert = await db.certificate.findUnique({
    where: { certificateId },
    include: { course: { select: { slug: true, title: true } } },
  });

  if (!cert || cert.userId !== session.id) notFound();

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || ""}/verify/${cert.certificateId}`;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground rounded-3xl p-10 text-center shadow-lg">
        <Award className="h-16 w-16 mx-auto mb-4" />
        <p className="text-sm uppercase tracking-widest opacity-80">Certificate of Completion</p>
        <h1 className="text-3xl font-bold mt-2">{cert.course.title}</h1>
        <p className="mt-4 text-lg">Awarded to</p>
        <p className="text-2xl font-bold">{cert.studentName}</p>
        <p className="mt-4 text-sm opacity-90">Instructor: {cert.instructorName}</p>
        <p className="text-sm opacity-90">Issued: {formatDate(cert.issuedAt)}</p>
        <p className="mt-4 inline-block font-mono text-xs bg-white/20 px-3 py-1 rounded-full">{cert.certificateId}</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 flex flex-wrap items-center gap-3">
        <Link href={`/api/certificates/${cert.certificateId}/pdf`} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Download className="h-4 w-4" /> Download PDF
        </Link>
        <Link href={`/verify/${cert.certificateId}`} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted">
          <CheckCircle2 className="h-4 w-4" /> Verify
        </Link>
        <CopyVerifyButton url={verifyUrl} />
      </div>
    </div>
  );
}
