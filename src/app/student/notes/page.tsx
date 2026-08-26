import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import NotesClient from "./NotesClient";

export default async function NotesPage() {
  const session = await getSession();
  if (!session?.id) redirect("/login");

  const notes = await db.note.findMany({
    where: { userId: session.id },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          slug: true,
          module: { select: { courseId: true, course: { select: { slug: true } } } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const initial = notes.map((n) => ({
    id: n.id,
    content: n.content,
    updatedAt: n.updatedAt.toISOString(),
    lesson: {
      id: n.lesson.id,
      title: n.lesson.title,
      courseSlug: n.lesson.module.course.slug,
    },
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="My Notes" description="Private notes you've written while learning." />
      <NotesClient initial={initial} />
    </div>
  );
}
