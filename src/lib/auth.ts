import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { SessionUser } from "@/types";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "fallback-secret-change-in-production"
);

const COOKIE_NAME = "eduvia_session";
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds
const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60; // 30 days

// ─── Password utilities ────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── JWT / Token ──────────────────────────────────────────────────────────

export async function createToken(
  payload: SessionUser,
  rememberMe = false
): Promise<string> {
  const duration = rememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION;
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${duration}s`)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

// ─── Session (cookie) ─────────────────────────────────────────────────────

export async function setSession(
  user: SessionUser,
  rememberMe = false
): Promise<void> {
  const token = await createToken(user, rememberMe);
  const duration = rememberMe ? REMEMBER_ME_DURATION : SESSION_DURATION;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: duration,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

// ─── Proxy-compatible token extraction ───────────────────────────────────
// Used inside proxy.ts where we can't use next/headers

export async function getSessionFromCookieString(
  cookieHeader: string | null
): Promise<SessionUser | null> {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const token = match.slice(COOKIE_NAME.length + 1);
  return verifyToken(token);
}

export { COOKIE_NAME };
