import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { recordAudit } from "@/lib/services/audit";
import { emailTemplates } from "@/lib/mailer";

// GET: list pending applications. PATCH: approve/reject (body: { id, status }).
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const applications = await db.instructorApplication.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, applications });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const body = await request.json();
  const { id, status } = body as { id: string; status: "APPROVED" | "REJECTED" };
  const application = await db.instructorApplication.findUnique({
    where: { id },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });
  if (!application) return NextResponse.json({ error: "Application not found." }, { status: 404 });

  if (status === "APPROVED") {
    await db.$transaction([
      db.instructorApplication.update({ where: { id }, data: { status: "APPROVED" } }),
      db.user.update({ where: { id: application.userId }, data: { role: "INSTRUCTOR", expertise: (application.expertise ?? undefined) as any } }),
    ]);
    await emailTemplates.instructorApproved(`${application.user.firstName} ${application.user.lastName}`);
    await recordAudit({ action: "INSTRUCTOR_APPROVED", targetType: "User", targetId: application.userId, userId: session.id });
  } else {
    await db.instructorApplication.update({ where: { id }, data: { status: "REJECTED" } });
    await recordAudit({ action: "INSTRUCTOR_REJECTED", targetType: "User", targetId: application.userId, userId: session.id });
  }
  return NextResponse.json({ success: true });
}
