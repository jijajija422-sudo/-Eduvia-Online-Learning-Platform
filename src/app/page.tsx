import Link from "next/link";
import { ArrowRight, BookOpen, Award, Users, Star, CheckCircle, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { db } from "@/lib/db";
import { CourseCard } from "@/components/courses/CourseCard";
import { formatDuration } from "@/lib/format";
import NewsletterForm from "@/components/forms/NewsletterForm";

const features = [
  { title: "Read at Your Pace", description: "Our text-based approach lets you skim, deep-read, or review material exactly as you prefer. No more rewinding videos.", icon: BookOpen },
  { title: "Earn Certificates", description: "Complete courses, pass assessments, and earn verifiable certificates to showcase on your resume or LinkedIn profile.", icon: Award },
  { title: "Expert Instructors", description: "Learn from vetted industry professionals who bring real-world experience and actionable insights to every lesson.", icon: Users },
];

const testimonials = [
  { name: "Sarah Chen", role: "Software Engineer", quote: "The text-based format is perfect for learning on my commute. I finished three courses in a month." },
  { name: "Marcus Reed", role: "Marketing Manager", quote: "Clear, structured, and genuinely useful. The certificates helped me land my current role." },
  { name: "Priya Nair", role: "Data Analyst", quote: "Best reading experience of any learning platform I've tried. The progress tracking kept me motivated." },
];

export default async function Home() {
  const [popular, featured, categories, stats] = await Promise.all([
    db.course.findMany({ where: { status: "PUBLISHED" }, orderBy: { enrollmentCount: "desc" }, take: 8, include: courseInclude() }),
    db.course.findMany({ where: { status: "PUBLISHED", isFeatured: true }, take: 4, include: courseInclude() }),
    db.category.findMany({ where: { isActive: true }, include: { _count: { select: { courses: true } } }, orderBy: { name: "asc" }, take: 8 }),
    db.$transaction([
      db.user.count({ where: { role: "STUDENT" } }),
      db.course.count({ where: { status: "PUBLISHED" } }),
      db.enrollment.count(),
      db.certificate.count(),
    ]),
  ]);

  const showCourses = popular.length ? popular : [];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-background py-20 sm:py-32">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl mb-6">
                Master New Skills with <span className="text-primary">Eduvia</span>
              </h1>
              <p className="text-lg leading-8 text-muted-foreground mb-10">
                Join learners worldwide. Access high-quality, text-based courses taught by industry experts. Learn at your own pace, anytime, anywhere.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/courses" className="w-full sm:w-auto rounded-md bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                  Explore Courses <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/register" className="w-full sm:w-auto rounded-md bg-secondary px-8 py-3.5 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/80 border border-border transition-all flex items-center justify-center gap-2">
                  Join for Free
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-10 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <Stat value={`${stats[1]}+`} label="Courses" />
            <Stat value={`${stats[0].toLocaleString()}+`} label="Students" />
            <Stat value={`${stats[2].toLocaleString()}+`} label="Enrollments" />
            <Stat value={`${stats[3].toLocaleString()}+`} label="Certificates" />
          </div>
        </section>

        {/* Popular Courses */}
        {showCourses.length > 0 && (
          <section className="py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Popular Courses</h2>
                  <p className="mt-2 text-muted-foreground">Join thousands already learning these topics.</p>
                </div>
                <Link href="/courses" className="text-primary font-medium hover:underline hidden sm:block">View all →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {showCourses.map((c: any) => <CourseCard key={c.id} course={c} />)}
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Why learn on Eduvia?</h2>
              <p className="mt-4 text-lg text-muted-foreground">A distraction-free, text-first learning experience designed for deep comprehension.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((f, idx) => (
                <div key={idx} className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6"><f.icon className="h-6 w-6 text-primary" /></div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Browse by Category</h2>
              <p className="mt-3 text-muted-foreground">Find the perfect course across our most popular topics.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((c: any) => (
                <Link key={c.id} href={`/categories/${c.slug}`} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c._count.courses} courses</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured */}
        {featured.length > 0 && (
          <section className="py-20 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 mb-10">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Featured Courses</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featured.map((c: any) => <CourseCard key={c.id} course={c} />)}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12"><h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Loved by learners</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-1 text-amber-400 mb-3"><Star className="h-4 w-4 fill-amber-400" /><Star className="h-4 w-4 fill-amber-400" /><Star className="h-4 w-4 fill-amber-400" /><Star className="h-4 w-4 fill-amber-400" /><Star className="h-4 w-4 fill-amber-400" /></div>
                  <p className="text-muted-foreground mb-4">"{t.quote}"</p>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-primary">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl mb-3">Never miss a new course</h2>
            <p className="text-primary-foreground/90 mb-8">Subscribe to the Eduvia newsletter for the best new courses and learning tips.</p>
            <NewsletterForm />
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card rounded-3xl p-8 sm:p-16 text-center shadow-lg border border-border">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">Ready to start your journey?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-8">Create an account today and get access to courses spanning technology, business, design, and more.</p>
              <Link href="/register" className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">Sign Up Now</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function courseInclude() {
  return {
    category: { select: { name: true, slug: true } },
    instructor: { select: { firstName: true, lastName: true } },
    _count: { select: { enrollments: true, modules: true } },
  };
}
