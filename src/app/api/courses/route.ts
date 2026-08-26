import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { courseCreateSchema } from "@/schemas";
import slugify from "slugify";

// List courses (role-aware): guests/students see published, instructors see own, admins see all.
export async function GET(request: NextRequest) {
  const session = await getSession();

  const status = request.nextUrl.searchParams.get("status");
  const where: any = {};
  if (!session?.id || session.role === "STUDENT") {
    where.status = "PUBLISHED";
  } else if (session.role === "INSTRUCTOR") {
    where.instructorId = session.id;
    if (status) where.status = status;
  } else if (session.role === "ADMIN") {
    if (status) where.status = status;
  }

  const courses = await db.course.findMany({
    where,
    include: {
      instructor: { select: { firstName: true, lastName: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { modules: true, enrollments: true, reviews: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ success: true, courses });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.id || (session.role !== "INSTRUCTOR" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Not authorized to create courses." }, { status: 403 });
  }
  const body = await request.json();
  const result = courseCreateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input.", details: result.error.flatten().fieldErrors }, { status: 400 });
  }
  const data = result.data;

  let slug = slugify(data.title, { lower: true, strict: true });
  // ensure unique slug
  const clashes = await db.course.count({ where: { slug } });
  if (clashes > 0) slug = `${slug}-${Date.now().toString(36)}`;

  const category = await db.category.findUnique({ where: { id: data.categoryId } });
  if (!category) return NextResponse.json({ error: "Category not found." }, { status: 400 });

  const course = await db.course.create({
    data: {
      title: data.title,
      slug,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId || null,
      difficulty: data.difficulty,
      estimatedDuration: data.estimatedDuration,
      language: data.language,
      thumbnail: data.thumbnail,
      instructorId: session.id,
      learningObjectives: JSON.stringify(data.learningObjectives || []),
      prerequisites: JSON.stringify(data.prerequisites || []),
      skillsGained: JSON.stringify(data.skillsGained || []),
      status: "DRAFT",
    },
  });

  return NextResponse.json({ success: true, course });
}
