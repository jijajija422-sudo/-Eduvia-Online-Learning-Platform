import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { adminUpdateUser, suspendUser, deleteUser, setRole } from "@/lib/services/users";
import { recordAudit } from "@/lib/services/audit";
import { createNotification } from "@/lib/services/notifications";
import type { NotificationType, UserRole } from "@/types";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const search = request.nextUrl.searchParams.get("q") || "";
  const role = request.nextUrl.searchParams.get("role") || "";
  const where: any = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (role) where.role = role;

  const users = await db.user.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      _count: { select: { enrollments: true, courses: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  return NextResponse.json({ success: true, users });
}
