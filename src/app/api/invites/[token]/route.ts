import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, setSession } from "@/lib/auth";
import { getInviteByToken, acceptInviteAsNewUser, acceptInviteAsExistingUser } from "@/lib/services/invites";
import type { SessionUser } from "@/types";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await getInviteByToken(token);
  if (!invite) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  if (invite.status !== "PENDING") {
    return NextResponse.json({ error: "This invitation has already been used." }, { status: 410 });
  }
  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "This invitation has expired." }, { status: 410 });
  }
  const existing = await db.user.findUnique({ where: { email: invite.email } });
  return NextResponse.json({
    success: true,
    invite: { email: invite.email, message: invite.message, expiresAt: invite.expiresAt },
    hasAccount: !!existing,
  });
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await getInviteByToken(token);
  if (!invite) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  if (invite.status !== "PENDING") return NextResponse.json({ error: "This invitation has already been used." }, { status: 410 });
  if (invite.expiresAt < new Date()) {
    await db.instructorInvite.update({ where: { id: invite.id }, data: { status: "EXPIRED" } });
    return NextResponse.json({ error: "This invitation has expired." }, { status: 410 });
  }

  const session = await getSession();

  // If already logged in (and matches the invited email, or just promote current), accept as existing user.
  if (session?.id) {
    if (session.email.toLowerCase() !== invite.email.toLowerCase()) {
      return NextResponse.json(
        { error: `This invitation was sent to ${invite.email}. Log in with that account, or sign up with it, to accept.` },
        { status: 403 }
      );
    }
    const updated = await acceptInviteAsExistingUser(token, session.id);
    const user = await db.user.findUnique({ where: { id: session.id } });
    if (user) {
      const su: SessionUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        avatar: user.avatar || null,
      };
      await setSession(su);
    }
    return NextResponse.json({ success: true, redirectUrl: "/instructor" });
  }

  // Not logged in → must register.
  const body = await _req.json();
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const password = String(body.password || "");

  if (!firstName || !lastName || password.length < 8) {
    return NextResponse.json(
      { error: "First name, last name, and a password of at least 8 characters are required." },
      { status: 400 }
    );
  }

  const already = await db.user.findUnique({ where: { email: invite.email } });
  if (already) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please log in to accept the invitation.", needsLogin: true },
      { status: 409 }
    );
  }

  const user = await acceptInviteAsNewUser(token, { firstName, lastName, password });
  const su: SessionUser = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    isVerified: user.isVerified,
    avatar: user.avatar || null,
  };
  await setSession(su);
  return NextResponse.json({ success: true, redirectUrl: "/instructor" });
}
