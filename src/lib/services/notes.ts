import { db } from "@/lib/db";

export async function createNote(userId: string, lessonId: string, content: string) {
  return db.note.create({ data: { userId, lessonId, content } });
}

export async function updateNote(userId: string, noteId: string, content: string) {
  return db.note.updateMany({ where: { id: noteId, userId }, data: { content } });
}

export async function deleteNote(userId: string, noteId: string) {
  return db.note.deleteMany({ where: { id: noteId, userId } });
}

export async function listNotes(userId: string, lessonId: string) {
  return db.note.findMany({
    where: { userId, lessonId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getNotesForUser(userId: string) {
  return db.note.findMany({
    where: { userId },
    include: { lesson: { select: { id: true, title: true, slug: true, moduleId: true } } },
    orderBy: { updatedAt: "desc" },
  });
}
