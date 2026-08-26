import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import type { UserRole } from "@/types";

export async function updateProfile(
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    country?: string;
    timezone?: string;
    language?: string;
    avatar?: string;
    expertise?: string[];
  }
) {
  return db.user.update({ where: { id: userId }, data });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found.");
  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) throw new Error("Current password is incorrect.");
  const passwordHash = await hashPassword(newPassword);
  await db.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function adminUpdateUser(
  adminId: string,
  targetId: string,
  data: {
    role?: UserRole;
    isActive?: boolean;
    isVerified?: boolean;
    firstName?: string;
    lastName?: string;
    email?: string;
  }
) {
  // Prevent an admin from demoting/suspending themselves.
  if (targetId === adminId && (data.role || data.isActive === false)) {
    throw new Error("You cannot change your own role or deactivate your account.");
  }
  return db.user.update({ where: { id: targetId }, data });
}

export async function suspendUser(targetId: string, suspended: boolean) {
  return db.user.update({
    where: { id: targetId },
    data: { isActive: !suspended },
  });
}

export async function deleteUser(targetId: string) {
  // Cascades handle related records (onDelete: Cascade) except restricted FKs.
  await db.user.delete({ where: { id: targetId } });
}

export async function setRole(targetId: string, role: UserRole) {
  return db.user.update({ where: { id: targetId }, data: { role } });
}
