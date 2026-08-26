import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import UsersTable from "./UsersTable";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await db.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      _count: { select: { enrollments: true, courses: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const initial = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage platform users, roles, and access." />
      <UsersTable initial={initial} />
    </div>
  );
}
