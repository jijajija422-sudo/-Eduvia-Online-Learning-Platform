import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, setSession } from "@/lib/auth";
import { loginSchema } from "@/schemas";
import type { SessionUser } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = result.data;

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      // Return a generic error for security
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: "Your account has been deactivated. Please contact support." },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session user object
    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
      avatar: user.avatar || null,
    };

    // Set session cookie
    await setSession(sessionUser, rememberMe);

    // Determine redirect URL based on role
    let redirectUrl = "/student";
    if (user.role === "ADMIN") redirectUrl = "/admin";
    if (user.role === "INSTRUCTOR") redirectUrl = "/instructor";

    return NextResponse.json({ 
      success: true, 
      user: sessionUser,
      redirectUrl
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
