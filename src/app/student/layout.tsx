import { Sidebar } from "@/components/layout/Sidebar";
import { getCurrentUser, requireStudent } from "@/lib/auth-guard";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStudent();

  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar role="STUDENT" user={user} />
      
      {/* Main Content */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
