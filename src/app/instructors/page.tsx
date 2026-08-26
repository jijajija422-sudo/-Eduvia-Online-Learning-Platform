import { db } from "@/lib/db";
import { InstructorCard } from "@/components/instructors/InstructorCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InstructorsPage() {
  // Fetch users with role INSTRUCTOR and include their course count
  const instructors = await db.user.findMany({
    where: {
      role: "INSTRUCTOR",
      isActive: true,
      // Optional: Only show instructors who have published at least one course
      courses: {
        some: {
          status: "PUBLISHED"
        }
      }
    },
    include: {
      _count: {
        select: {
          courses: {
            where: { status: "PUBLISHED" }
          }
        }
      }
    },
    orderBy: {
      firstName: "asc"
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-muted/30 py-16 sm:py-20 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-6">
              Our Expert Instructors
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Learn from industry professionals who bring real-world experience and actionable insights to every lesson.
            </p>
          </div>
        </section>

        {/* Results */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {instructors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {instructors.map((instructor) => (
                  <InstructorCard key={instructor.id} instructor={instructor} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-2xl border border-border max-w-2xl mx-auto">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No instructors found</h3>
                <p className="text-muted-foreground">
                  Check back later as we grow our team of experts!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
