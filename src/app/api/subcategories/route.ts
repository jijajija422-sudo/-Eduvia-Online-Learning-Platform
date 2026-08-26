import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { subcategorySchema } from "@/schemas";
import slugify from "slugify";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const body = await request.json();
  const result = subcategorySchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Invalid subcategory." }, { status: 400 });
  const slug = slugify(result.data.name, { lower: true, strict: true });
  const sub = await db.subcategory.create({
    data: {
      name: result.data.name,
      slug,
      description: result.data.description,
      categoryId: result.data.categoryId,
    },
  });
  return NextResponse.json({ success: true, subcategory: sub });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const body = await request.json();
  await db.subcategory.delete({ where: { id: body.id } });
  return NextResponse.json({ success: true });
}
