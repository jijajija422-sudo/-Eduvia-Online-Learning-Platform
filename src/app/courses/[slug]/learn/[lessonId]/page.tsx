import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { CompleteLessonButton } from "@/components/courses/CompleteLessonButton";
import LessonTools from "@/components/courses/LessonTools";
import { Clock } from "lucide-react";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const session = await getSession();
  
  if (!session || !session.id) {
    redirect(`/login`);
  }

  const resolvedParams = await params;
  
  const course = await db.course.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      enrollments: {
        where: { userId: session.id },
      },
      modules: {
        orderBy: { orderIndex: 'asc' },
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' },
            select: { id: true }
          }
        }
      }
    }
  });

  if (!course) {
    notFound();
  }

  // Check enrollment
  if (course.enrollments.length === 0 && session.role !== "ADMIN") {
    redirect(`/courses/${course.slug}`);
  }

  // Find the requested lesson
  const lesson = await db.lesson.findUnique({
    where: { id: resolvedParams.lessonId },
    include: {
      module: true
    }
  });

  if (!lesson || lesson.module.courseId !== course.id) {
    notFound();
  }

  // Update last accessed lesson in the background (no need to await for UI rendering)
  if (course.enrollments.length > 0) {
    db.enrollment.update({
      where: { id: course.enrollments[0].id },
      data: { 
        lastLessonId: lesson.id,
        lastAccessedAt: new Date()
      }
    }).catch(console.error);
  }

  // Find next lesson to pass to the completion button
  let nextLessonId = null;
  const allLessonsFlat = course.modules.flatMap(m => m.lessons.map(l => l.id));
  const currentIndex = allLessonsFlat.indexOf(lesson.id);
  if (currentIndex !== -1 && currentIndex < allLessonsFlat.length - 1) {
    nextLessonId = allLessonsFlat[currentIndex + 1];
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-8 py-10 pb-32">
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-3 text-sm text-primary font-medium">
          <span>{lesson.module.title}</span>
          <span className="text-muted-foreground">•</span>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1.5" />
            {lesson.estimatedMinutes} min read
          </div>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          {lesson.title}
        </h1>
      </div>

      <div 
        className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md"
        dangerouslySetInnerHTML={{ __html: lesson.content }}
      />

      <div className="mt-16 pt-8 border-t border-border">
        <CompleteLessonButton 
          lessonId={lesson.id} 
          courseId={course.id} 
          courseSlug={course.slug}
          nextLessonId={nextLessonId} 
        />
        <div className="mt-8">
          <LessonTools lessonId={lesson.id} courseSlug={course.slug} />
        </div>
      </div>
    </article>
  );
}
