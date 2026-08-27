import { Suspense } from "react";
import AcceptInviteClient from "./AcceptInviteClient";

export const metadata = { title: "Accept Instructor Invitation — Eduvia" };

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<p className="text-center text-muted-foreground py-20">Loading…</p>}>
      <AcceptInviteClient />
    </Suspense>
  );
}
