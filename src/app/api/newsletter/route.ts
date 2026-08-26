import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSchema } from "@/schemas";
import { emailTemplates } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = newsletterSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }
  const { email } = result.data;
  const name = (body.name as string) || "";
  const existing = await db.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    if (!existing.isActive) {
      await db.newsletterSubscriber.update({
        where: { email },
        data: { isActive: true, unsubscribedAt: null },
      });
    }
  } else {
    await db.newsletterSubscriber.create({ data: { email } });
  }
  emailTemplates.newsletter(name);
  return NextResponse.json({ success: true, message: "Subscribed!" });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { email } = body;
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
  await db.newsletterSubscriber.updateMany({
    where: { email },
    data: { isActive: false, unsubscribedAt: new Date() },
  });
  return NextResponse.json({ success: true });
}
