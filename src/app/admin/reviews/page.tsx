import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import AdminReviewsClient from "./AdminReviewsClient";

export default async function AdminReviewsPage() {
  await requireAdmin();
  const reviews = await db.review.findMany({
    where: { status: { in: ["PENDING", "FLAGGED"] } },
    include: {
      user: { select: { firstName: true, lastName: true } },
      course: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Review Moderation" description="Approve, hide, or remove course reviews." />
      <AdminReviewsClient initial={reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))} />
    </div>
  );
}
