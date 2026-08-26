import Link from "next/link";
import { BookOpen, PlayCircle, CheckCircle } from "lucide-react";
// @ts-ignore
import type { Course } from "@prisma/client";

interface ProgressCourseCardProps {
  course: Course & { [key: string]: any };
  progress: number;
  lastLessonId?: string | null;
  status: "ACTIVE" | "COMPLETED" | "SUSPENDED" | "ABANDONED";
}

export function ProgressCourseCard({ course, progress, lastLessonId, status }: ProgressCourseCardProps) {
  const isCompleted = status === "COMPLETED";

  return (
    <div className="flex flex-col rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all overflow-hidden group">
      <Link href={lastLessonId ? `/courses/${course.slug}/learn/${lastLessonId}` : `/courses/${course.slug}/learn`} className="block relative aspect-video overflow-hidden">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-muted flex flex-col items-center justify-center group-hover:bg-muted/80 transition-colors">
            <BookOpen className="h-10 w-10 text-muted-foreground/30 mb-2" />
          </div>
        )}
        
        {/* Overlay Play Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          {isCompleted ? (
            <CheckCircle className="text-white h-12 w-12" />
          ) : (
            <PlayCircle className="text-white h-12 w-12" />
          )}
        </div>
      </Link>
      
      <div className="flex flex-col flex-1 p-5">
        <Link href={`/courses/${course.slug}`} className="font-bold text-foreground hover:text-primary transition-colors line-clamp-2 mb-4">
          {course.title}
        </Link>
        
        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className={isCompleted ? "text-green-500" : "text-primary"}>
              {Math.round(progress)}% Complete
            </span>
            {isCompleted ? (
              <span className="text-muted-foreground">Finished</span>
            ) : (
              <span className="text-muted-foreground">In Progress</span>
            )}
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-primary'}`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
