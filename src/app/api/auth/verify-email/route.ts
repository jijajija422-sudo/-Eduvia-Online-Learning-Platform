import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET verifies an email token; POST resends a verification email.
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Missing token." }, { status: 400 });
    }
    const record = await db.emailVerificationToken.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid or expired verification link." }, { status: 400 });
    }
    await db.$transaction([
      db.user.update({ where: { id: record.userId }, data: { isVerified: true } }),
      db.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email as string | undefined;
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    const user = await db.user.findUnique({ where: { email } });
    if (user && !user.isVerified) {
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64url");
      await db.emailVerificationToken.create({
        data: { token, userId: user.id, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      });
      const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}`;
      const { emailTemplates } = await import("@/lib/mailer");
      emailTemplates.verifyEmail(`${user.firstName} ${user.lastName}`, url);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
