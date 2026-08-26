import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookOpen, Folder, Code, Briefcase, PenTool, Database, Laptop, Layout } from "lucide-react";
import Link from "next/link";

// Dynamic page
export const dynamic = "force-dynamic";

// Map icon strings from DB to Lucide components
const IconMap: Record<string, React.ElementType> = {
  Code,
  Briefcase,
  PenTool,
  Database,
  Laptop,
  Layout,
  Folder
};

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { courses: { where: { status: "PUBLISHED" } } }
      },
      subcategories: {
        where: { isActive: true },
        select: { id: true, name: true, slug: true, _count: { select: { courses: { where: { status: "PUBLISHED" } } } } }
      }
    },
    orderBy: { orderIndex: "asc" }
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Header */}
        <section className="bg-muted/30 py-16 sm:py-20 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-6">
              Browse Categories
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Explore our extensive library of text-based courses organized by topic. Find exactly what you want to learn.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => {
                const IconComponent = category.icon && IconMap[category.icon] ? IconMap[category.icon] : BookOpen;
                
                return (
                  <div key={category.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    <Link href={`/categories/${category.slug}`} className="p-6 sm:p-8 flex items-start gap-5 group">
                      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <IconComponent className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {category.name}
                        </h2>
                        <p className="text-sm font-medium text-muted-foreground mt-1 mb-3">
                          {category._count.courses} Published Courses
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                      </div>
                    </Link>
                    
                    {category.subcategories.length > 0 && (
                      <div className="bg-muted/30 p-6 border-t border-border mt-auto">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          {category.subcategories.map(sub => (
                            <Link 
                              key={sub.id} 
                              href={`/categories/${category.slug}?subcategory=${sub.slug}`}
                              className="inline-flex items-center rounded-md bg-background px-3 py-1.5 text-xs font-medium text-foreground border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors shadow-sm"
                            >
                              {sub.name} <span className="ml-1 opacity-70">({sub._count.courses})</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {categories.length === 0 && (
              <div className="text-center py-20 bg-card rounded-2xl border border-border max-w-2xl mx-auto">
                <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No categories found</h3>
                <p className="text-muted-foreground">
                  Categories have not been set up yet.
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
