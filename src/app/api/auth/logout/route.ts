import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await clearSession();
    
    // Redirect to home page
    const url = new URL("/", req.url);
    return NextResponse.redirect(url, { status: 302 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
