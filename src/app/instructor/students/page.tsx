import { requireInstructor } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";
import { Users, BookOpen, Trophy } from "lucide-react";

export default async function InstructorStudentsPage() {
  const user = await requireInstructor();

  const enrollments = await db.enrollment.findMany({
    where: {
      course: { instructorId: user.id },
      status: { not: "ABANDONED" },
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
      course: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { enrolledAt: "desc" },
    take: 300,
  });

  // Group by student
  const byStudent = new Map<string, { user: any; courses: any[]; progress: number }>();
  for (const e of enrollments) {
    const uid = e.user.id;
    if (!byStudent.has(uid)) byStudent.set(uid, { user: e.user, courses: [], progress: 0 });
    byStudent.get(uid)!.courses.push({ title: e.course.title, slug: e.course.slug, progress: e.progress, status: e.status });
  }

  const students = Array.from(byStudent.values());

  return (
    <div className="space-y-6">
      <PageHeader title="Students" description="Learners enrolled in your courses." />
      {students.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">No students enrolled yet.</div>
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-3">Student</th>
                <th className="text-left font-medium px-4 py-3">Courses</th>
                <th className="text-left font-medium px-4 py-3 hidden md:table-cell">Avg Progress</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const avg = Math.round(s.courses.reduce((a, c) => a + c.progress, 0) / s.courses.length);
                return (
                  <tr key={s.user.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{s.user.firstName} {s.user.lastName}</div>
                      <div className="text-xs text-muted-foreground">{s.user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.courses.slice(0, 2).map((c: any) => (
                        <Link key={c.slug} href={`/courses/${c.slug}`} className="block hover:text-primary">{c.title}</Link>
                      ))}
                      {s.courses.length > 2 && <span className="text-xs">+{s.courses.length - 2} more</span>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${avg}%` }} />
                        </div>
                        <span className="text-xs">{avg}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
