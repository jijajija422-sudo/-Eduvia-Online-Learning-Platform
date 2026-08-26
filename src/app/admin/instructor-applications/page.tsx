import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import InstructorApplicationsClient from "./InstructorApplicationsClient";

export default async function AdminInstructorApplicationsPage() {
  await requireAdmin();
  const apps = await db.instructorApplication.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="space-y-6">
      <PageHeader title="Instructor Applications" description="Review and approve instructor requests." />
      <InstructorApplicationsClient initial={apps.map((a) => ({ ...a, createdAt: a.createdAt.toISOString(), expertise: (a.expertise as string[]) || [] }))} />
    </div>
  );
}
