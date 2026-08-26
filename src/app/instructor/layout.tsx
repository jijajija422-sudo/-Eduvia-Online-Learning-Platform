import { Sidebar } from "@/components/layout/Sidebar";
import { requireInstructor } from "@/lib/auth-guard";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireInstructor();

  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar role="INSTRUCTOR" user={user} />
      
      {/* Main Content */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
