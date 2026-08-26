import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createNote as svcCreate, updateNote as svcUpdate, deleteNote as svcDelete, listNotes } from "@/lib/services/notes";
import { noteSchema } from "@/schemas";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const lessonId = request.nextUrl.searchParams.get("lessonId");
  if (!lessonId) return NextResponse.json({ error: "lessonId required" }, { status: 400 });
  const notes = await listNotes(session.id, lessonId);
  return NextResponse.json({ success: true, notes });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const result = noteSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Invalid note." }, { status: 400 });
  const note = await svcCreate(session.id, result.data.lessonId, result.data.content);
  return NextResponse.json({ success: true, note });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { id, content } = body;
  if (!id || typeof content !== "string") return NextResponse.json({ error: "Invalid." }, { status: 400 });
  await svcUpdate(session.id, id, content);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  await svcDelete(session.id, body.id);
  return NextResponse.json({ success: true });
}
