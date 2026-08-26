import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ProgressCourseCard } from "@/components/courses/ProgressCourseCard";
import Link from "next/link";
import { BookOpen, Award, Clock } from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.id },
    include: {
      course: true
    },
    orderBy: { lastAccessedAt: 'desc' }
  });

  const activeCourses = enrollments.filter(e => e.status !== "COMPLETED");
  const completedCourses = enrollments.filter(e => e.status === "COMPLETED");

  const totalLearningHours = Math.round(
    enrollments.reduce((acc, curr) => acc + (curr.course as any).estimatedDuration * (curr.progress / 100), 0) / 60
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {session.firstName}!</h1>
        <p className="text-muted-foreground">Ready to continue your learning journey?</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Courses</p>
              <p className="text-3xl font-bold">{activeCourses.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold">{completedCourses.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hours Learned</p>
              <p className="text-3xl font-bold">{totalLearningHours}</p>
            </div>
          </div>
        </div>
      </div>

      {/* In Progress */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">In Progress</h2>
          <Link href="/courses" className="text-sm font-medium text-primary hover:underline">
            Explore more courses &rarr;
          </Link>
        </div>
        
        {activeCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeCourses.map((enrollment) => (
              <ProgressCourseCard
                key={enrollment.id}
                course={enrollment.course as any}
                progress={enrollment.progress}
                lastLessonId={enrollment.lastLessonId}
                status={enrollment.status}
              />
            ))}
          </div>
        ) : (
          <div className="bg-muted/50 border border-border rounded-xl p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">You aren't taking any courses right now</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Find a topic you're passionate about and start learning today.
            </p>
            <Link 
              href="/courses" 
              className="inline-flex justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Browse Catalog
            </Link>
          </div>
        )}
      </div>

      {/* Completed Courses */}
      {completedCourses.length > 0 && (
        <div className="pt-8">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Completed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {completedCourses.map((enrollment) => (
              <ProgressCourseCard
                key={enrollment.id}
                course={enrollment.course as any}
                progress={enrollment.progress}
                lastLessonId={enrollment.lastLessonId}
                status={enrollment.status}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
