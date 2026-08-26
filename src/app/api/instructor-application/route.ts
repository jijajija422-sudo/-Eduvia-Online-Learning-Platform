import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { emailTemplates } from "@/lib/mailer";
import { createNotification } from "@/lib/services/notifications";
import type { NotificationType } from "@/types";

const applicationSchema = z.object({
  bio: z.string().min(20, "Tell us more about yourself (min 20 chars)."),
  experience: z.string().min(20, "Describe your experience (min 20 chars)."),
  motivation: z.string().min(20, "Describe your motivation (min 20 chars)."),
  expertise: z.array(z.string()).default([]),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role === "INSTRUCTOR" || session.role === "ADMIN") {
    return NextResponse.json({ error: "You already have instructor access." }, { status: 400 });
  }

  // Prevent duplicate pending application
  const existing = await db.instructorApplication.findFirst({
    where: { userId: session.id, status: "PENDING" },
  });
  if (existing) return NextResponse.json({ error: "You already have a pending application." }, { status: 400 });

  const body = await request.json();
  const result = applicationSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input.", details: result.error.flatten().fieldErrors }, { status: 400 });
  }

  await db.instructorApplication.create({
    data: {
      userId: session.id,
      bio: result.data.bio,
      experience: result.data.experience,
      motivation: result.data.motivation,
      expertise: JSON.stringify(result.data.expertise),
      status: "PENDING",
    },
  });

  emailTemplates.instructorApplication(`${session.firstName} ${session.lastName}`);
  return NextResponse.json({ success: true, message: "Application submitted for review." });
}
