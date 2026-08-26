import { db } from "@/lib/db";
import { CourseCard } from "@/components/courses/CourseCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookOpen, ChevronRight } from "lucide-react";
import { FilterSelect } from "@/components/ui/FilterSelect";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CategoryDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const subcategorySlug = typeof resolvedSearchParams.subcategory === "string" ? resolvedSearchParams.subcategory : undefined;
  const difficulty = typeof resolvedSearchParams.difficulty === "string" ? resolvedSearchParams.difficulty.toUpperCase() : undefined;

  // Fetch category to ensure it exists
  const category = await db.category.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      subcategories: {
        where: { isActive: true },
        select: { name: true, slug: true }
      }
    }
  });

  if (!category || !category.isActive) {
    notFound();
  }

  // Build the Prisma where clause for courses
  const where: any = {
    categoryId: category.id,
    status: "PUBLISHED",
  };

  if (subcategorySlug) {
    where.subcategory = { slug: subcategorySlug };
  }

  if (difficulty && ["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(difficulty)) {
    where.difficulty = difficulty;
  }

  // Fetch courses
  const courses = await db.course.findMany({
    where,
    include: {
      instructor: { select: { firstName: true, lastName: true, avatar: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-primary text-primary-foreground py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground/80 mb-6">
              <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">{category.name}</span>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl mb-4">
              {category.name} Courses
            </h1>
            
            {category.description && (
              <p className="text-lg text-primary-foreground/90 max-w-3xl leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
        </section>

        {/* Filters and Subcategories */}
        <section className="border-b border-border bg-muted/30 py-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground mr-2">Topics:</span>
              <Link 
                href={`/categories/${category.slug}${difficulty ? `?difficulty=${difficulty.toLowerCase()}` : ''}`}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!subcategorySlug ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground border border-border hover:bg-muted'}`}
              >
                All Topics
              </Link>
              {category.subcategories.map((sub: any) => (
                <Link 
                  key={sub.slug}
                  href={`/categories/${category.slug}?subcategory=${sub.slug}${difficulty ? `&difficulty=${difficulty.toLowerCase()}` : ''}`}
                  className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${subcategorySlug === sub.slug ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground border border-border hover:bg-muted'}`}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
            
            <div className="shrink-0 w-full sm:w-auto">
              <form action={`/categories/${category.slug}`} method="GET">
                {subcategorySlug && <input type="hidden" name="subcategory" value={subcategorySlug} />}
                <FilterSelect 
                  name="difficulty"
                  defaultValue={difficulty?.toLowerCase() || ""}
                  className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-foreground shadow-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-card cursor-pointer"
                >
                  <option value="">Any Difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </FilterSelect>
              </form>
            </div>
            
          </div>
        </section>

        {/* Results */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between text-sm font-medium text-muted-foreground">
              <p>Showing {courses.length} course{courses.length !== 1 && 's'}</p>
            </div>
            
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course: any) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-2xl border border-border max-w-2xl mx-auto">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  We couldn't find any courses matching your filters in this category.
                </p>
                <Link 
                  href={`/categories/${category.slug}`}
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
