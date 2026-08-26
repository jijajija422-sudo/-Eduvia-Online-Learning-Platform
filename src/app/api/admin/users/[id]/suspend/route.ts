import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { suspendUser, setRole } from "@/lib/services/users";
import { recordAudit } from "@/lib/services/audit";
import type { UserRole } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const { id } = await params;
  if (id === session.id) {
    return NextResponse.json({ error: "You cannot suspend your own account." }, { status: 400 });
  }
  const body = await request.json();
  if (typeof body.suspended === "boolean") {
    await suspendUser(id, body.suspended);
    await recordAudit({ action: body.suspended ? "USER_SUSPENDED" : "USER_ACTIVATED", targetType: "User", targetId: id, userId: session.id });
    return NextResponse.json({ success: true });
  }
  if (body.role) {
    await setRole(id, body.role as UserRole);
    await recordAudit({ action: "USER_ROLE_CHANGED", targetType: "User", targetId: id, userId: session.id, metadata: { role: body.role } });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
