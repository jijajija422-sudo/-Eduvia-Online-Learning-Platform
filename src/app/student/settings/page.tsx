import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import StudentSettingsClient from "./StudentSettingsClient";

export default async function StudentSettingsPage() {
  const session = await getSession();
  if (!session?.id) redirect("/login");

  const full = await db.user.findUnique({
    where: { id: session.id },
    select: {
      firstName: true,
      lastName: true,
      bio: true,
      country: true,
      timezone: true,
      language: true,
    },
  });

  const user = {
    firstName: full?.firstName ?? session.firstName ?? "",
    lastName: full?.lastName ?? session.lastName ?? "",
    bio: full?.bio ?? null,
    country: full?.country ?? null,
    timezone: full?.timezone ?? "UTC",
    language: full?.language ?? "en",
  };

  return <StudentSettingsClient user={user} />;
}
