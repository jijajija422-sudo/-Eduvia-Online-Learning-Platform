import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setSession } from "@/lib/auth";
import { registerSchema } from "@/schemas";
import type { SessionUser } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Check if role is provided (for instructors signing up)
    const url = new URL(req.url);
    const requestedRole = url.searchParams.get("role") === "instructor" ? "INSTRUCTOR" : "STUDENT";

    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName } = result.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: requestedRole,
        // In a real app, isVerified would be false and we'd send an email
        isVerified: true, 
      },
    });

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
    await setSession(sessionUser);

    // Determine redirect URL based on role
    const redirectUrl = user.role === "INSTRUCTOR" ? "/instructor" : "/student";

    return NextResponse.json(
      { 
        success: true, 
        user: sessionUser,
        redirectUrl
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
