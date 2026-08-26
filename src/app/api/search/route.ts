import { NextRequest, NextResponse } from "next/server";
import { globalSearch } from "@/lib/services/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const results = await globalSearch(q);
  return NextResponse.json({ success: true, results });
}
