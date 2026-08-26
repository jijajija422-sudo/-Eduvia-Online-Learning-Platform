import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { adminUpdateUser, suspendUser, deleteUser, setRole } from "@/lib/services/users";
import { recordAudit } from "@/lib/services/audit";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  try {
    const user = await adminUpdateUser(session.id, id, body);
    await recordAudit({ action: "USER_UPDATED", targetType: "User", targetId: id, userId: session.id, metadata: { fields: Object.keys(body) } });
    return NextResponse.json({ success: true, user });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  if (id === session.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }
  await deleteUser(id);
  await recordAudit({ action: "USER_DELETED", targetType: "User", targetId: id, userId: session.id });
  return NextResponse.json({ success: true });
}
