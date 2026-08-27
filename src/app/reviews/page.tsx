import { db } from "@/lib/db";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = { title: "Reviews — Eduvia" };

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= rating ? "fill-amber-400" : "text-muted-foreground/40"}`} />
      ))}
    </span>
  );
}

export default async function ReviewsPage() {
  const reviews = await db.review.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { firstName: true, lastName: true } },
      course: { select: { slug: true, title: true } },
    },
  });

  const avg =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : "0";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Learner Reviews"
        description={`${reviews.length} verified reviews · ${avg} average rating`}
      />

      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">No reviews yet. Be the first to review a course you've taken.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <p className="font-medium">
                    {r.user.firstName} {r.user.lastName}
                  </p>
                  <Link href={`/courses/${r.course.slug}`} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                    {r.course.title} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <Stars rating={r.rating} />
              </div>
              {r.content && <p className="text-sm text-muted-foreground">{r.content}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
