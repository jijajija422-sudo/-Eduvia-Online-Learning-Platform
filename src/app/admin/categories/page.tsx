import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import AdminCategoriesClient from "./AdminCategoriesClient";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await db.category.findMany({
    include: { _count: { select: { subcategories: true, courses: true } } },
    orderBy: { name: "asc" },
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description="Organize courses into categories and subcategories." />
      <AdminCategoriesClient initial={categories.map((c) => ({ ...c, isActive: c.isActive }))} />
    </div>
  );
}
