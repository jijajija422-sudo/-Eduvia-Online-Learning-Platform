import Link from "next/link";
import { User, BookOpen } from "lucide-react";
// @ts-ignore
import type { User as UserType } from "@prisma/client";

interface InstructorWithStats extends UserType {
  [key: string]: any; // fallback for IDE caching issues
  _count?: {
    courses: number;
  };
}

interface InstructorCardProps {
  instructor: InstructorWithStats;
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  // Parse expertise if it exists (stored as JSON string)
  let expertiseList: string[] = [];
  if (instructor.expertise) {
    try {
      expertiseList = JSON.parse(instructor.expertise as string);
    } catch (e) {
      expertiseList = [];
    }
  }

  return (
    <Link href={`/instructors/${instructor.id}`} className="group flex flex-col bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden p-6 text-center h-full">
      <div className="mx-auto h-24 w-24 rounded-full overflow-hidden bg-muted mb-4 border-4 border-background shadow-sm group-hover:scale-105 transition-transform duration-300">
        {instructor.avatar ? (
          <img 
            src={instructor.avatar} 
            alt={`${instructor.firstName} ${instructor.lastName}`} 
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-primary/10">
            <User className="h-10 w-10 text-primary/40" />
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
        {instructor.firstName} {instructor.lastName}
      </h3>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
        {instructor.bio || "Instructor at Eduvia"}
      </p>
      
      {expertiseList.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5">
          {expertiseList.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              {skill}
            </span>
          ))}
          {expertiseList.length > 3 && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              +{expertiseList.length - 3}
            </span>
          )}
        </div>
      )}
      
      <div className="mt-auto pt-4 border-t border-border flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium">
        <BookOpen className="h-4 w-4" />
        <span>{instructor._count?.courses || 0} Courses Published</span>
      </div>
    </Link>
  );
}
