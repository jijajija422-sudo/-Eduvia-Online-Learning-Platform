import { db } from "@/lib/db";
import { CourseCard } from "@/components/courses/CourseCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { User, BookOpen, MapPin, Globe } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InstructorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const instructor = await db.user.findUnique({
    where: { 
      id: resolvedParams.id,
      role: "INSTRUCTOR",
      isActive: true
    },
    include: {
      courses: {
        where: { status: "PUBLISHED" },
        include: {
          instructor: { select: { firstName: true, lastName: true, avatar: true } },
          category: { select: { name: true, slug: true } },
        },
        orderBy: { publishedAt: "desc" }
      },
      _count: {
        select: {
          courses: { where: { status: "PUBLISHED" } }
        }
      }
    }
  });

  if (!instructor) {
    notFound();
  }

  // Parse expertise safely
  let expertiseList: string[] = [];
  if (instructor.expertise) {
    try {
      expertiseList = JSON.parse(instructor.expertise as string);
    } catch (e) {
      expertiseList = [];
    }
  }

  // Calculate total students across all courses
  const totalStudents = instructor.courses.reduce((acc: any, course: any) => acc + course.enrollmentCount, 0);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Profile Header */}
        <section className="bg-muted/30 pt-16 pb-12 sm:pt-24 sm:pb-16 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 text-center md:text-left">
              
              <div className="h-40 w-40 sm:h-48 sm:w-48 shrink-0 rounded-full overflow-hidden bg-background border-4 border-background shadow-xl">
                {instructor.avatar ? (
                  <img 
                    src={instructor.avatar} 
                    alt={`${instructor.firstName} ${instructor.lastName}`} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10">
                    <User className="h-20 w-20 text-primary/40" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  Instructor
                </div>
                
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                  {instructor.firstName} {instructor.lastName}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-muted-foreground font-medium pt-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <span>{instructor._count.courses} Courses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>{totalStudents.toLocaleString()} Students</span>
                  </div>
                  {instructor.country && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span>{instructor.country}</span>
                    </div>
                  )}
                  {instructor.language && (
                    <div className="flex items-center gap-2 uppercase">
                      <Globe className="h-5 w-5" />
                      <span>{instructor.language}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Biography & Expertise */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold">About Me</h2>
                <div className="prose prose-slate dark:prose-invert text-muted-foreground max-w-none leading-relaxed">
                  {instructor.bio ? (
                    <p>{instructor.bio}</p>
                  ) : (
                    <p>This instructor hasn't provided a biography yet.</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Expertise</h2>
                {expertiseList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {expertiseList.map((skill, idx) => (
                      <span key={idx} className="inline-flex items-center rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic text-sm">No specific expertise listed.</p>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Instructor's Courses */}
        <section className="py-16 bg-muted/10 border-t border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h2 className="text-3xl font-bold mb-10">Courses by {instructor.firstName}</h2>
            
            {instructor.courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {instructor.courses.map((course: any) => (
                  <CourseCard key={course.id} course={course as any} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No courses published</h3>
                <p className="text-muted-foreground">
                  This instructor hasn't published any courses yet.
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
