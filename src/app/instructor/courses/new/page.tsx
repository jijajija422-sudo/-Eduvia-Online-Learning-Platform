import { requireInstructor } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import CourseForm from "../CourseForm";

export default async function NewCoursePage() {
  await requireInstructor();
  const categories = await db.category.findMany({
    where: { isActive: true },
    include: { subcategories: { where: { isActive: true }, select: { id: true, name: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Create a new course" description="Fill in the details. You can add modules, lessons and quizzes after creating it." />
      <CourseForm categories={categories.map((c) => ({ id: c.id, name: c.name, subcategories: c.subcategories }))} />
    </div>
  );
}
