import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { changePassword } from "@/lib/services/users";
import { changePasswordSchema } from "@/schemas";
import { emailTemplates } from "@/lib/mailer";

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const body = await req.json();
    const result = changePasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input.", details: result.error.flatten().fieldErrors }, { status: 400 });
    }
    const { currentPassword, newPassword } = result.data;
    try {
      await changePassword(session.id, currentPassword, newPassword);
    } catch (e) {
      return NextResponse.json({ error: (e as Error).message }, { status: 400 });
    }
    const user = await dbUser(session.id);
    if (user) {
      emailTemplates.passwordChanged(`${user.firstName} ${user.lastName}`);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}

// small helper to avoid importing db twice
import { db } from "@/lib/db";
async function dbUser(id: string) {
  return db.user.findUnique({ where: { id }, select: { firstName: true, lastName: true } });
}
