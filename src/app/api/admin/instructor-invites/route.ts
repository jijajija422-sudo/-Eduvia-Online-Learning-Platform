import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createInvite } from "@/lib/services/invites";
import { emailTemplates } from "@/lib/mailer";
import { recordAudit } from "@/lib/services/audit";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const body = await req.json();
  const email = String(body.email || "").toLowerCase().trim();
  const message = body.message ? String(body.message) : undefined;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const invite = await createInvite(session.id, email, message);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const link = `${baseUrl}/accept-invite?token=${invite.token}`;
  const inviterName = `${session.firstName} ${session.lastName}`.trim() || "The Eduvia team";
  emailTemplates.instructorInvite(email.split("@")[0], inviterName, link, message);

  await recordAudit({
    action: "INSTRUCTOR_INVITED",
    targetType: "InstructorInvite",
    targetId: invite.id,
    userId: session.id,
    metadata: { email },
  });

  return NextResponse.json({ success: true, invite: { id: invite.id, email: invite.email, token: invite.token, expiresAt: invite.expiresAt } });
}

export async function GET() {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const invites = await (await import("@/lib/db")).db.instructorInvite.findMany({
    orderBy: { createdAt: "desc" },
    include: { invitedBy: { select: { firstName: true, lastName: true } } },
  });
  return NextResponse.json({ success: true, invites });
}
