import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { notFound } from "next/navigation";
import { Clock, BookOpen, Star, CheckCircle, PlayCircle, BarChart, Globe, Calendar, User } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { EnrollButton } from "@/components/courses/EnrollButton";
import CourseDetailActions from "@/components/courses/CourseDetailActions";


export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const course = await db.course.findUnique({
    where: { 
      slug: resolvedParams.slug,
      status: "PUBLISHED"
    },
    include: {
      instructor: {
        select: { id: true, firstName: true, lastName: true, avatar: true, bio: true, expertise: true }
      },
      category: true,
      modules: {
        orderBy: { orderIndex: 'asc' },
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' },
            select: { id: true, title: true, slug: true, estimatedMinutes: true, isPreview: true }
          }
        }
      }
    }
  });

  if (!course) {
    notFound();
  }

  const session = await getSession();
  let isEnrolled = false;
  let savedInWishlist = false;
  let userReview: { id: string; rating: number; content: string | null } | null = null;
  
  if (session?.id) {
    const enrollment = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.id,
          courseId: course.id,
        },
      },
    });
    isEnrolled = !!enrollment;

    const [wish, review] = await Promise.all([
      db.wishlistItem.findUnique({ where: { userId_courseId: { userId: session.id, courseId: course.id } } }),
      db.review.findFirst({ where: { userId: session.id, courseId: course.id } }),
    ]);
    savedInWishlist = !!wish;
    userReview = review ? { id: review.id, rating: review.rating, content: review.content } : null;
  }

  // Parse JSON fields safely
  const parseJsonArray = (val: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const learningObjectives = parseJsonArray(course.learningObjectives);
  const prerequisites = parseJsonArray(course.prerequisites);
  const skillsGained = parseJsonArray(course.skillsGained);
  
  // Calculate totals
  const totalModules = course.modules.length;
  const totalLessons = course.modules.reduce((acc: any, mod: any) => acc + mod.lessons.length, 0);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Course Hero */}
        <div className="bg-primary text-primary-foreground py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3 text-sm font-medium text-primary-foreground/80">
                  <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
                  <span>›</span>
                  <Link href={`/categories/${course.category.slug}`} className="hover:text-white transition-colors">{course.category.name}</Link>
                </div>
                
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  {course.title}
                </h1>
                
                <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-3xl leading-relaxed">
                  {course.shortDescription}
                </p>
                
                <div className="flex flex-wrap items-center gap-6 text-sm font-medium pt-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span>{course.rating.toFixed(1)} ({course.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 opacity-80" />
                    <span>{course.enrollmentCount.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 opacity-80" />
                    <span className="capitalize">{course.difficulty.toLowerCase()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 opacity-80" />
                    <span className="capitalize">{course.language}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 pt-6 border-t border-primary-foreground/20">
                  {course.instructor.avatar ? (
                    <img src={course.instructor.avatar} alt={course.instructor.firstName} className="h-10 w-10 rounded-full border-2 border-primary-foreground/20" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-primary-foreground/70">Created by</p>
                    <Link href={`/instructors/${course.instructor.id}`} className="text-sm font-bold hover:underline">
                      {course.instructor.firstName} {course.instructor.lastName}
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Enrollment Sticky Sidebar */}
              <div className="w-full lg:w-[400px] shrink-0 bg-card text-foreground rounded-2xl shadow-xl overflow-hidden border border-border mt-0 lg:-mt-32 relative z-10">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full aspect-video object-cover" />
                ) : (
                  <div className="w-full aspect-video bg-muted flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                )}
                
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="space-y-4">
                    {isEnrolled ? (
                      <Link
                        href={`/courses/${course.slug}/learn`}
                        className="flex w-full justify-center rounded-md bg-primary px-3 py-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                      >
                        Continue Learning
                      </Link>
                    ) : (
                      <EnrollButton 
                        courseId={course.id} 
                        courseSlug={course.slug} 
                        isLoggedIn={!!session?.id} 
                      />
                    )}
                    <CourseDetailActions
                      courseId={course.id}
                      courseSlug={course.slug}
                      isEnrolled={isEnrolled}
                      initialSaved={savedInWishlist}
                      userReview={userReview}
                      courseTitle={course.title}
                    />
                    <p className="text-xs text-center text-muted-foreground">
                      Join {course.enrollmentCount} others learning this topic.
                    </p>
                  </div>
                  
                  <div className="pt-6 border-t border-border space-y-4 text-sm">
                    <h3 className="font-bold">This course includes:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-muted-foreground">
                        <Clock className="h-5 w-5 text-primary" />
                        {Math.floor(course.estimatedDuration / 60)}h {course.estimatedDuration % 60}m of content
                      </li>
                      <li className="flex items-center gap-3 text-muted-foreground">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {totalModules} modules, {totalLessons} lessons
                      </li>
                      <li className="flex items-center gap-3 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        Certificate of completion
                      </li>
                      <li className="flex items-center gap-3 text-muted-foreground">
                        <Globe className="h-5 w-5 text-primary" />
                        Accessible anywhere, anytime
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            
            <div className="flex-1 max-w-3xl space-y-12">
              
              {/* Learning Objectives */}
              {learningObjectives.length > 0 && (
                <section className="bg-muted/30 border border-border rounded-2xl p-6 sm:p-8">
                  <h2 className="text-2xl font-bold mb-6">What you'll learn</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {learningObjectives.map((obj, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{obj}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              
              {/* Description */}
              <section>
                <h2 className="text-2xl font-bold mb-6">About this course</h2>
                <div 
                  className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: course.fullDescription }}
                />
              </section>
              
              {/* Curriculum */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Course Curriculum</h2>
                  <span className="text-sm text-muted-foreground font-medium">
                    {totalModules} sections • {totalLessons} lessons • {Math.floor(course.estimatedDuration / 60)}h {course.estimatedDuration % 60}m
                  </span>
                </div>
                
                <div className="border border-border rounded-2xl overflow-hidden bg-card">
                  {course.modules.map((module: any, i: any) => (
                    <div key={module.id} className="border-b border-border last:border-b-0">
                      <div className="bg-muted/50 px-6 py-4 flex items-center justify-between font-bold">
                        <h3>Module {i + 1}: {module.title}</h3>
                        <span className="text-sm font-medium text-muted-foreground">{module.lessons.length} lessons</span>
                      </div>
                      <div className="px-2 py-2">
                        {module.lessons.map((lesson: any, j: any) => (
                          <div key={lesson.id} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors group">
                            <div className="flex items-center gap-4 text-sm font-medium">
                              <PlayCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              <span>{j + 1}. {lesson.title}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {lesson.isPreview && (
                                <Link href={`/login`} className="text-primary hover:underline text-xs font-bold">
                                  Preview
                                </Link>
                              )}
                              <span>{lesson.estimatedMinutes} min</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              
              {/* Prerequisites & Skills */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {prerequisites.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Prerequisites</h2>
                    <ul className="space-y-2 list-disc list-inside text-muted-foreground text-sm">
                      {prerequisites.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {skillsGained.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Skills you will gain</h2>
                    <div className="flex flex-wrap gap-2">
                      {skillsGained.map((skill, i) => (
                        <span key={i} className="bg-muted text-foreground px-3 py-1 rounded-full text-xs font-semibold border border-border">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* Instructor */}
              <section>
                <h2 className="text-2xl font-bold mb-6">Your Instructor</h2>
                <div className="flex gap-6 items-start">
                  {course.instructor.avatar ? (
                    <img src={course.instructor.avatar} alt={course.instructor.firstName} className="h-24 w-24 rounded-full object-cover shadow-sm" />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center shrink-0 shadow-sm">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold">
                      <Link href={`/instructors/${course.instructor.id}`} className="hover:text-primary transition-colors">
                        {course.instructor.firstName} {course.instructor.lastName}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 mb-4 leading-relaxed">
                      {course.instructor.bio || "Instructor at Eduvia"}
                    </p>
                    <Link href={`/instructors/${course.instructor.id}`} className="text-sm font-semibold text-primary hover:underline">
                      View full profile
                    </Link>
                  </div>
                </div>
              </section>
              
            </div>
            
            {/* Empty space for sidebar desktop layout */}
            <div className="hidden lg:block w-[400px] shrink-0"></div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
