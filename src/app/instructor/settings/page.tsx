import { requireInstructor } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import InstructorSettingsClient from "./InstructorSettingsClient";

export default async function InstructorSettingsPage() {
  const user = await requireInstructor();
  const full = await db.user.findUnique({
    where: { id: user.id },
    select: { firstName: true, lastName: true, bio: true, country: true, timezone: true, language: true, expertise: true },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Instructor Settings" description="Manage your public instructor profile." />
      <InstructorSettingsClient
        initial={{
          firstName: full?.firstName || "",
          lastName: full?.lastName || "",
          bio: full?.bio || "",
          country: full?.country || "",
          timezone: full?.timezone || "UTC",
          language: full?.language || "en",
          expertise: (full?.expertise as string[]) || [],
        }}
      />
    </div>
  );
}
