import { requireInstructor } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { formatDate } from "@/lib/format";
import { Star } from "lucide-react";

export default async function InstructorReviewsPage() {
  const user = await requireInstructor();

  const reviews = await db.review.findMany({
    where: {
      course: { instructorId: user.id },
      status: "APPROVED",
    },
    include: {
      user: { select: { firstName: true, lastName: true, avatar: true } },
      course: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description="What your students are saying." />
      {reviews.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">No reviews yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{r.user.firstName} {r.user.lastName}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                </div>
                <span className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
                  <Star className="h-4 w-4 fill-amber-400" /> {r.rating}
                </span>
              </div>
              <p className="text-xs text-primary mb-2">{r.course.title}</p>
              {r.content && <p className="text-sm text-muted-foreground">{r.content}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
