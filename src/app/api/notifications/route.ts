import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/lib/services/notifications";

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (body.all) {
    await markAllNotificationsRead(session.id);
    return NextResponse.json({ success: true });
  }
  if (body.id) {
    await markNotificationRead(body.id, session.id);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid request." }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  await deleteNotification(body.id, session.id);
  return NextResponse.json({ success: true });
}
