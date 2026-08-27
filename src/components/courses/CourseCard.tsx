import Link from "next/link";
import { User, Star, Eye } from "lucide-react";
// @ts-ignore
import type { Course, User as UserType, Category } from "@prisma/client";

type CourseWithRelations = Course & {
  instructor: { firstName: string; lastName: string; avatar: string | null };
  category: { name: string; slug: string };
  _count?: { enrollments: number; modules: number };
};

interface CourseCardProps {
  course: CourseWithRelations;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`} className="group flex flex-col bg-white rounded-3xl shadow-sm hover:shadow-lg transition-all overflow-hidden h-full">
      {/* Thumbnail Area */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden m-3 rounded-2xl w-[calc(100%-24px)]">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-amber-50 flex items-center justify-center">
            {/* Fallback image */}
            <div className="text-amber-200">No Image</div>
          </div>
        )}
      </div>
      
      {/* Content Area */}
      <div className="flex flex-col flex-1 px-5 pb-5">
        
        {/* Category and Price row */}
        <div className="flex items-center justify-between mb-3 mt-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
              {course.category.name}
            </span>
          </div>
          <span className="text-sm font-bold text-blue-600">
            Free
          </span>
        </div>
        
        <h3 className="text-[17px] font-bold text-slate-800 leading-tight mb-4 group-hover:text-amber-500 transition-colors line-clamp-2">
          {course.title}
        </h3>
        
        <div className="mt-auto pt-4 flex items-center justify-between text-slate-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              <span className="text-xs font-bold">{course._count?.enrollments || 0}k</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span className="text-xs font-bold">{course._count?.modules || 0}k</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4" />
              <span className="text-xs font-bold">{course.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <div>
            {course.instructor.avatar ? (
              <img src={course.instructor.avatar} alt={course.instructor.firstName} className="h-7 w-7 rounded-full object-cover shadow-sm" />
            ) : (
              <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center shadow-sm">
                <User className="h-3.5 w-3.5 text-slate-500" />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
