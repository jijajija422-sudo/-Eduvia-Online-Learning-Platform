import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/schemas";
import { emailTemplates } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    const { email } = result.data;
    const user = await db.user.findUnique({ where: { email } });
    // Always return success to avoid leaking which emails exist.
    if (user) {
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await db.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      });
      const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
      emailTemplates.passwordReset(`${user.firstName} ${user.lastName}`, url);
    }

    return NextResponse.json({ success: true, message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
