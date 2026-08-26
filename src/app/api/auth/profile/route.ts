import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { profileUpdateSchema } from "@/schemas";
import { updateProfile } from "@/lib/services/users";

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const body = await req.json();
    const result = profileUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input.", details: result.error.flatten().fieldErrors }, { status: 400 });
    }
    await updateProfile(session.id, result.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}
