import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bookmark, BookOpen, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function BookmarksPage() {
  const session = await getSession();
  if (!session?.id) redirect("/login");

  const courseBookmarks = await db.courseBookmark.findMany({
    where: { userId: session.id },
    include: {
      course: {
        select: {
          slug: true,
          title: true,
          instructor: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const lessonBookmarks = await db.lessonBookmark.findMany({
    where: { userId: session.id },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          module: { select: { course: { select: { slug: true, title: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader title="Bookmarks" description="Courses and lessons you've saved for later." />

      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> Saved courses ({courseBookmarks.length})
        </h2>
        {courseBookmarks.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No saved courses yet. Browse the{" "}
            <Link href="/courses" className="text-primary hover:underline">
              catalog
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courseBookmarks.map((b) => (
              <Link
                key={b.id}
                href={`/courses/${b.course.slug}`}
                className="group block bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
              >
                <p className="font-medium group-hover:text-primary">{b.course.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  by {b.course.instructor?.firstName} {b.course.instructor?.lastName}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-primary" /> Saved lessons ({lessonBookmarks.length})
        </h2>
        {lessonBookmarks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No saved lessons yet.</p>
        ) : (
          <div className="space-y-2">
            {lessonBookmarks.map((b) => (
              <Link
                key={b.id}
                href={`/courses/${b.lesson.module.course.slug}/learn/${b.lesson.id}`}
                className="flex items-center justify-between gap-3 bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{b.lesson.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.lesson.module.course.title}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
