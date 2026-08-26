import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { supportTicketSchema } from "@/schemas";
import { emailTemplates } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  const session = await getSession();
  const body = await request.json();
  const result = supportTicketSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input.", details: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const contactName = result.data.name || (session ? `${session.firstName} ${session.lastName}` : "Guest");
  const contactEmail = result.data.email || (session?.email ?? "unknown@example.com");

  await db.supportTicket.create({
    data: {
      userId: session?.id,
      guestName: session?.id ? null : result.data.name,
      guestEmail: session?.id ? null : result.data.email,
      subject: result.data.subject,
      category: result.data.category || "GENERAL",
      message: result.data.message,
      status: "OPEN",
    },
  });

  emailTemplates.contact(contactName, result.data.subject, result.data.message);
  return NextResponse.json({ success: true, message: "Your message has been sent." });
}
