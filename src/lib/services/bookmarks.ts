import { db } from "@/lib/db";

export async function toggleCourseBookmark(userId: string, courseId: string): Promise<"added" | "removed"> {
  const existing = await db.courseBookmark.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (existing) {
    await db.courseBookmark.delete({ where: { userId_courseId: { userId, courseId } } });
    return "removed";
  }
  await db.courseBookmark.create({ data: { userId, courseId } });
  return "added";
}

export async function toggleLessonBookmark(userId: string, lessonId: string): Promise<"added" | "removed"> {
  const existing = await db.lessonBookmark.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  if (existing) {
    await db.lessonBookmark.delete({ where: { userId_lessonId: { userId, lessonId } } });
    return "removed";
  }
  await db.lessonBookmark.create({ data: { userId, lessonId } });
  return "added";
}

export async function bookmarkedCourseIds(userId: string): Promise<Set<string>> {
  const rows = await db.courseBookmark.findMany({ where: { userId }, select: { courseId: true } });
  return new Set(rows.map((r) => r.courseId));
}

export async function bookmarkedLessonIds(userId: string): Promise<Set<string>> {
  const rows = await db.lessonBookmark.findMany({ where: { userId }, select: { lessonId: true } });
  return new Set(rows.map((r) => r.lessonId));
}
