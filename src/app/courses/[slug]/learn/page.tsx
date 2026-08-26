import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export default async function LearnRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  
  if (!session || !session.id) {
    redirect(`/login`);
  }

  const resolvedParams = await params;
  
  // Find the course and its lessons
  const course = await db.course.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      modules: {
        orderBy: { orderIndex: 'asc' },
        include: {
          lessons: {
            orderBy: { orderIndex: 'asc' },
            select: { id: true }
          }
        }
      },
      enrollments: {
        where: { userId: session.id },
        select: { lastLessonId: true }
      }
    }
  });

  if (!course) {
    redirect("/courses");
  }

  // Check enrollment
  if (course.enrollments.length === 0 && session.role !== "ADMIN") {
    redirect(`/courses/${course.slug}`);
  }

  // 1. Try to redirect to last accessed lesson
  const lastLessonId = course.enrollments[0]?.lastLessonId;
  if (lastLessonId) {
    redirect(`/courses/${course.slug}/learn/${lastLessonId}`);
  }

  // 2. Try to find the first lesson of the first module
  for (const module of course.modules) {
    if (module.lessons.length > 0) {
      redirect(`/courses/${course.slug}/learn/${module.lessons[0].id}`);
    }
  }

  // Fallback if course has no lessons
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4">No Content Yet</h2>
        <p className="text-muted-foreground">
          This course doesn't have any lessons available right now. Please check back later!
        </p>
      </div>
    </div>
  );
}
