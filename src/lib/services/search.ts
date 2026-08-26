import { db } from "@/lib/db";

export interface GlobalSearchResult {
  courses: { id: string; title: string; slug: string; type: "course" }[];
  categories: { id: string; name: string; slug: string; type: "category" }[];
  instructors: { id: string; name: string; type: "instructor" }[];
}

// Lightweight global search across courses, categories and instructors.
export async function globalSearch(query: string): Promise<GlobalSearchResult> {
  const q = query.trim();
  if (!q) return { courses: [], categories: [], instructors: [] };

  const [courses, categories, instructors] = await Promise.all([
    db.course.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q } },
          { shortDescription: { contains: q } },
          { fullDescription: { contains: q } },
        ],
      },
      include: { instructor: { select: { firstName: true, lastName: true } } },
      take: 8,
      orderBy: { enrollmentCount: "desc" },
    }),
    db.category.findMany({
      where: { isActive: true, name: { contains: q } },
      take: 6,
    }),
    db.user.findMany({
      where: {
        role: "INSTRUCTOR",
        OR: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { bio: { contains: q } },
        ],
      },
      select: { id: true, firstName: true, lastName: true },
      take: 6,
    }),
  ]);

  return {
    courses: courses.map((c) => ({ id: c.id, title: c.title, slug: c.slug, type: "course" as const })),
    categories: categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, type: "category" as const })),
    instructors: instructors.map((i) => ({
      id: i.id,
      name: `${i.firstName} ${i.lastName}`,
      type: "instructor" as const,
    })),
  };
}
