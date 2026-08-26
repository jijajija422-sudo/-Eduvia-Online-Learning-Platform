import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import AdminSettingsClient from "./AdminSettingsClient";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const rows = await db.platformSetting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const initial = {
    appName: String(map.appName || "Eduvia"),
    appDescription: String(map.appDescription || "Learn. Grow. Achieve."),
    contactEmail: String(map.contactEmail || ""),
    supportEmail: String(map.supportEmail || ""),
    allowRegistration: map.allowRegistration !== "false",
    requireEmailVerification: map.requireEmailVerification !== "false",
    instructorApproval: map.instructorApproval === "true",
    courseApproval: map.courseApproval === "true",
  };
  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Platform Settings" description="Configure global platform behavior." />
      <AdminSettingsClient initial={initial} />
    </div>
  );
}
