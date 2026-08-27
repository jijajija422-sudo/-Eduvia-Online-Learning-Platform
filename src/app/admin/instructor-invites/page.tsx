import { requireAdmin } from "@/lib/auth-guard";
import { PageHeader } from "@/components/layout/PageHeader";
import InstructorInvitesClient from "./InstructorInvitesClient";

export const metadata = { title: "Invite Instructors — Eduvia" };

export default async function InstructorInvitesPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <PageHeader title="Invite Instructors" description="Send email invitations to people you'd like to teach on Eduvia." />
      <InstructorInvitesClient />
    </div>
  );
}
