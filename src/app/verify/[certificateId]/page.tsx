import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { formatDate } from "@/lib/format";

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ certificateId: string }>;
}) {
  const { certificateId } = await params;
  const cert = await db.certificate.findUnique({
    where: { certificateId },
    include: { course: { select: { slug: true, title: true } } },
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-16 px-6 bg-background">
        {!cert ? (
          <div className="bg-card border border-border rounded-2xl p-10 max-w-md w-full text-center">
            <ShieldCheck className="h-14 w-14 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Certificate Not Found</h1>
            <p className="text-muted-foreground mt-2">This certificate ID could not be verified.</p>
            <Link href="/" className="inline-block mt-6 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Go home</Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-10 max-w-lg w-full text-center shadow-sm">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-sm uppercase tracking-widest text-green-600 dark:text-green-400 font-semibold">Certificate Verified</p>
            <h1 className="text-2xl font-bold mt-2">{cert.course.title}</h1>
            <div className="mt-6 space-y-3 text-left">
              <Row label="Student" value={cert.studentName} />
              <Row label="Course" value={cert.course.title} />
              <Row label="Instructor" value={cert.instructorName} />
              <Row label="Issued" value={formatDate(cert.issuedAt)} />
              <Row label="Certificate ID" value={<span className="font-mono text-xs">{cert.certificateId}</span>} />
            </div>
            <Link href={`/courses/${cert.course.slug}`} className="inline-block mt-6 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">View course</Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-border pb-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-medium text-sm text-right">{value}</span>
    </div>
  );
}
