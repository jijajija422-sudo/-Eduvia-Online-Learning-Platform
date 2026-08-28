import { redirect } from "next/navigation";
import { getSession } from "./auth";
import type { SessionUser, UserRole } from "@/types";

// ─── Get current user (server component safe) ─────────────────────────────

export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSession();
}

// ─── Require authenticated user ───────────────────────────────────────────

export async function requireAuth(redirectTo = "/login"): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(redirectTo);
  if (!user.isActive) redirect("/unauthorized");
  return user;
}

// ─── Require specific role(s) ─────────────────────────────────────────────

export async function requireRole(
  roles: UserRole | UserRole[],
  redirectTo = "/unauthorized"
): Promise<SessionUser> {
  const user = await requireAuth();
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(user.role)) redirect(redirectTo);
  return user;
}

// ─── Convenience guards ───────────────────────────────────────────────────

export const requireAdmin = () => requireRole("ADMIN");
export const requireInstructor = () => requireRole("INSTRUCTOR");
export const requireStudent = () => requireRole("STUDENT");
