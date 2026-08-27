import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import type { UserRole } from "@/types";

const INVITE_TTL_HOURS = 72;

export async function createInvite(adminId: string, email: string, message?: string) {
  const token = randomBytes(24).toString("hex");
  const invite = await db.instructorInvite.create({
    data: {
      email: email.toLowerCase().trim(),
      token,
      message: message || null,
      invitedById: adminId,
      expiresAt: new Date(Date.now() + INVITE_TTL_HOURS * 3600 * 1000),
      status: "PENDING",
    },
  });
  return invite;
}

export async function getInviteByToken(token: string) {
  return db.instructorInvite.findUnique({ where: { token } });
}

export async function acceptInviteAsNewUser(
  token: string,
  data: { firstName: string; lastName: string; password: string }
) {
  const invite = await db.instructorInvite.findUnique({ where: { token } });
  if (!invite) throw new Error("Invitation not found.");
  if (invite.status !== "PENDING") throw new Error("This invitation has already been used.");
  if (invite.expiresAt < new Date()) {
    await db.instructorInvite.update({ where: { id: invite.id }, data: { status: "EXPIRED" } });
    throw new Error("This invitation has expired.");
  }

  const passwordHash = await hashPassword(data.password);
  const user = await db.user.create({
    data: {
      email: invite.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: "INSTRUCTOR" as UserRole,
      isVerified: true,
    },
  });

  await db.instructorInvite.update({
    where: { id: invite.id },
    data: { status: "ACCEPTED", usedAt: new Date() },
  });

  return user;
}

export async function acceptInviteAsExistingUser(token: string, userId: string) {
  const invite = await db.instructorInvite.findUnique({ where: { token } });
  if (!invite) throw new Error("Invitation not found.");
  if (invite.status !== "PENDING") throw new Error("This invitation has already been used.");
  if (invite.expiresAt < new Date()) {
    await db.instructorInvite.update({ where: { id: invite.id }, data: { status: "EXPIRED" } });
    throw new Error("This invitation has expired.");
  }

  await db.user.update({ where: { id: userId }, data: { role: "INSTRUCTOR" as UserRole } });

  await db.instructorInvite.update({
    where: { id: invite.id },
    data: { status: "ACCEPTED", usedAt: new Date() },
  });

  return invite;
}
