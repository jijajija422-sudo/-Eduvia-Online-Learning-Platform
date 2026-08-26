import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  const { certificateId } = await params;
  const cert = await db.certificate.findUnique({ where: { certificateId } });
  if (!cert) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  // Border
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke("#3b82f6").lineWidth(3);

  doc.fontSize(16).fillColor("#64748b").text("EDUVIA", { align: "center" }).moveDown(0.5);
  doc.fontSize(28).fillColor("#0f172a").text("Certificate of Completion", { align: "center" }).moveDown(1);
  doc.fontSize(14).fillColor("#64748b").text("This certifies that", { align: "center" }).moveDown(0.3);
  doc.fontSize(26).fillColor("#3b82f6").text(cert.studentName, { align: "center" }).moveDown(0.4);
  doc.fontSize(14).fillColor("#64748b").text("has successfully completed the course", { align: "center" }).moveDown(0.3);
  doc.fontSize(22).fillColor("#0f172a").text(cert.courseName, { align: "center" }).moveDown(0.4);
  doc.fontSize(12).fillColor("#64748b").text(`Instructor: ${cert.instructorName}`, { align: "center" }).moveDown(1.5);

  doc.fontSize(12).fillColor("#0f172a");
  doc.text(`Issued: ${formatDate(cert.issuedAt)}`, 60, doc.page.height - 110);
  doc.text(`Certificate ID: ${cert.certificateId}`, 60, doc.page.height - 92);
  doc.text(`Verified at ${process.env.NEXT_PUBLIC_APP_URL || "https://eduvia.example"}/verify/${cert.certificateId}`, 60, doc.page.height - 74);

  doc.end();
  const pdf = await done;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certificate-${cert.certificateId}.pdf"`,
    },
  });
}
