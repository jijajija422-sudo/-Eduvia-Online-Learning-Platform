import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Bell, Check, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session?.id) redirect("/login");

  const notifications = await db.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Messages" description="Your notifications and messages inbox." />

      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No messages yet. We'll notify you about enrollments, certificates, and course updates.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 bg-card border rounded-xl p-4 ${n.isRead ? "border-border" : "border-primary/50 bg-primary/5"}`}
            >
              <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">{n.title}</p>
                {n.message && <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <Check className="h-4 w-4 text-primary" />}
            </div>
          ))}
          <div className="pt-2">
            <Link href="/student/notifications" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Manage notifications <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
