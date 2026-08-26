import Link from "next/link";
import { Clock, BookOpen, User, Star } from "lucide-react";
// @ts-ignore
import type { Course, User as UserType, Category } from "@prisma/client";

type CourseWithRelations = Course & {
  instructor: { firstName: string; lastName: string; avatar: string | null };
  category: { name: string; slug: string };
};

interface CourseCardProps {
  course: CourseWithRelations;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`} className="group flex flex-col bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden h-full">
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full bg-muted overflow-hidden">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <BookOpen className="h-12 w-12 text-primary/40" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="inline-flex items-center rounded-full bg-background/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-foreground shadow-sm">
            {course.category.name}
          </span>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {course.estimatedDuration} mins
          </span>
          <span className="flex items-center gap-1.5 capitalize bg-muted px-2 py-0.5 rounded-sm">
            {course.difficulty.toLowerCase()}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {course.shortDescription}
        </p>
        
        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {course.instructor.avatar ? (
              <img src={course.instructor.avatar} alt={course.instructor.firstName} className="h-6 w-6 rounded-full object-cover" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                <User className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
            <span className="text-sm font-medium text-foreground">
              {course.instructor.firstName} {course.instructor.lastName}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-sm font-medium text-amber-500">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span>{course.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
