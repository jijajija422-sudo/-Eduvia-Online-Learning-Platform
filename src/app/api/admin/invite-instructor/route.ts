import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }

    const body = await request.json();
    const { email, firstName, lastName } = body;

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields (email, firstName, lastName)" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Generate a secure temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + "A1!";
    const passwordHash = await hashPassword(tempPassword);

    const user = await db.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash,
        role: "INSTRUCTOR",
        isVerified: true, // Auto-verify invited instructors
      },
    });

    return NextResponse.json({
      success: true,
      message: "Instructor invited successfully",
      tempPassword,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }
    });

  } catch (error) {
    console.error("Invite Instructor Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
