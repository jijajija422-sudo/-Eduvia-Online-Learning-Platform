import { db } from "@/lib/db";
import { CourseCard } from "@/components/courses/CourseCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, Filter, BookOpen } from "lucide-react";
import { FilterSelect } from "@/components/ui/FilterSelect";
import Link from "next/link";
import { redirect } from "next/navigation";

// Required for Next.js App Router parsing of search params
export const dynamic = "force-dynamic";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : undefined;
  const categorySlug = typeof resolvedSearchParams.category === "string" ? resolvedSearchParams.category : undefined;
  const difficulty = typeof resolvedSearchParams.difficulty === "string" ? resolvedSearchParams.difficulty.toUpperCase() : undefined;

  // Build the Prisma where clause
  const where: any = {
    status: "PUBLISHED",
  };

  if (query) {
    where.OR = [
      { title: { contains: query } },
      { shortDescription: { contains: query } },
    ];
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (difficulty && ["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(difficulty)) {
    where.difficulty = difficulty;
  }

  // Fetch data
  const [courses, categories] = await Promise.all([
    db.course.findMany({
      where,
      include: {
        instructor: { select: { firstName: true, lastName: true, avatar: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
    }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-muted/30 py-12 sm:py-16 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-4">
                Explore Courses
              </h1>
              <p className="text-lg text-muted-foreground">
                Discover high-quality, text-based courses taught by industry experts.
              </p>
            </div>
            
            {/* Search and Filters */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
              <form action="/courses" method="GET" className="relative flex-1 w-full max-w-lg">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Search courses..."
                  className="block w-full rounded-md border-0 py-2.5 pl-10 pr-3 text-foreground shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-card"
                />
                {/* Preserve existing filters when searching */}
                {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                {difficulty && <input type="hidden" name="difficulty" value={difficulty.toLowerCase()} />}
              </form>
              
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                <div className="relative shrink-0">
                  <form action="/courses" method="GET">
                    {query && <input type="hidden" name="q" value={query} />}
                    {difficulty && <input type="hidden" name="difficulty" value={difficulty.toLowerCase()} />}
                    <FilterSelect 
                      name="category"
                      defaultValue={categorySlug || ""}
                      className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-foreground shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-card cursor-pointer"
                    >
                      <option value="">All Categories</option>
                      {categories.map((c: any) => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </FilterSelect>
                  </form>
                </div>
                
                <div className="relative shrink-0">
                  <form action="/courses" method="GET">
                    {query && <input type="hidden" name="q" value={query} />}
                    {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                    <FilterSelect 
                      name="difficulty"
                      defaultValue={difficulty?.toLowerCase() || ""}
                      className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-foreground shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-card cursor-pointer"
                    >
                      <option value="">Any Difficulty</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </FilterSelect>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  We couldn't find any courses matching your current filters. Try adjusting your search criteria.
                </p>
                <Link 
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
