import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { categorySchema, subcategorySchema } from "@/schemas";
import slugify from "slugify";
import { recordAudit } from "@/lib/services/audit";

// ── Categories ────────────────────────────────────────────────────────────────

export async function GET() {
  const categories = await db.category.findMany({
    include: { _count: { select: { subcategories: true, courses: true } } },
    orderBy: { orderIndex: "asc" },
  });
  return NextResponse.json({ success: true, categories });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const body = await request.json();
  const result = categorySchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  const slug = slugify(result.data.name, { lower: true, strict: true });
  const count = await db.category.count({ where: { slug } });
  if (count > 0) return NextResponse.json({ error: "Category name already exists." }, { status: 400 });
  const category = await db.category.create({
    data: {
      name: result.data.name,
      slug,
      description: result.data.description,
      icon: result.data.icon,
      image: result.data.image,
    },
  });
  await recordAudit({ action: "CATEGORY_CREATED", targetType: "Category", targetId: category.id, userId: session.id });
  return NextResponse.json({ success: true, category });
}

// ── Subcategories ─────────────────────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const body = await request.json();
  const result = categorySchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  const slug = slugify(result.data.name, { lower: true, strict: true });
  const category = await db.category.update({
    where: { id: body.id },
    data: {
      name: result.data.name,
      description: result.data.description,
      icon: result.data.icon,
      image: result.data.image,
    },
  });
  return NextResponse.json({ success: true, category });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.id || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const body = await request.json();
  await db.category.delete({ where: { id: body.id } });
  await recordAudit({ action: "CATEGORY_DELETED", targetType: "Category", targetId: body.id, userId: session.id });
  return NextResponse.json({ success: true });
}
