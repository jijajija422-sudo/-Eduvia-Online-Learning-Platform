import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { recordAudit } from "@/lib/services/audit";

const KEYS = [
  "appName", "appDescription", "contactEmail", "supportEmail",
  "allowRegistration", "requireEmailVerification", "instructorApproval", "courseApproval",
];

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const body = await request.json();
  try {
    for (const key of KEYS) {
      if (body[key] !== undefined) {
        await db.platformSetting.upsert({
          where: { key },
          update: { value: String(body[key]) },
          create: { key, value: String(body[key]) },
        });
      }
    }
    await recordAudit({ action: "SETTINGS_UPDATED", targetType: "PlatformSettings", targetId: "global", userId: session.id });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save settings." }, { status: 500 });
  }
}
