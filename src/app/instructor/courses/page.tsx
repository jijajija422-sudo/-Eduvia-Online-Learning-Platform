import { requireInstructor } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";
import { BookOpen, PlusCircle, Eye, Pencil, Send } from "lucide-react";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_REVIEW: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  APPROVED: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  PUBLISHED: "bg-green-500/15 text-green-600 dark:text-green-400",
  REJECTED: "bg-red-500/15 text-red-600 dark:text-red-400",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export default async function InstructorCoursesPage() {
  const user = await requireInstructor();
  const courses = await db.course.findMany({
    where: { instructorId: user.id },
    include: {
      category: { select: { name: true } },
      _count: { select: { enrollments: true, modules: true, reviews: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        description="Create and manage your courses."
        action={
          <Link href="/instructor/courses/new" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="h-4 w-4" /> New Course
          </Link>
        }
      />

      {courses.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">No courses yet</h3>
          <p className="text-sm text-muted-foreground mb-6">Create your first course to start teaching.</p>
          <Link href="/instructor/courses/new" className="inline-flex justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Create a course</Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Title</th>
                <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Category</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-right font-medium px-4 py-3 hidden sm:table-cell">Students</th>
                <th className="text-right font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.category.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles[c.status]}`}>
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">{c._count.enrollments}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/instructor/courses/${c.id}`} title="Edit" className="p-2 rounded-md hover:bg-muted text-muted-foreground">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      {c.status === "PUBLISHED" && (
                        <Link href={`/courses/${c.slug}`} title="View" className="p-2 rounded-md hover:bg-muted text-muted-foreground">
                          <Eye className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
