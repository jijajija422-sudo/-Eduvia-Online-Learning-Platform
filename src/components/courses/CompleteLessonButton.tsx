"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, ChevronRight, Loader2 } from "lucide-react";

interface CompleteLessonButtonProps {
  lessonId: string;
  courseId: string;
  courseSlug: string;
  nextLessonId: string | null;
}

export function CompleteLessonButton({ 
  lessonId, 
  courseId, 
  courseSlug,
  nextLessonId 
}: CompleteLessonButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      const res = await fetch(`/api/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId,
          courseId,
          status: "COMPLETED"
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update progress");
      }

      router.refresh(); // Refresh to update sidebar checkmarks

      if (nextLessonId) {
        router.push(`/courses/${courseSlug}/learn/${nextLessonId}`);
      } else {
        // Course is effectively done (or needs quiz). For now redirect to dashboard.
        router.push("/student");
      }
    } catch (error) {
      console.error("Progress error:", error);
      alert("Failed to save progress. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-6 rounded-2xl border border-border">
      <div>
        <h3 className="font-bold text-lg">Finished reading?</h3>
        <p className="text-sm text-muted-foreground">Mark this lesson as complete to track your progress.</p>
      </div>
      
      <button
        onClick={handleComplete}
        disabled={isLoading}
        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <CheckCircle className="h-5 w-5" />
        )}
        {nextLessonId ? "Complete & Continue" : "Complete Course"}
        {!isLoading && nextLessonId && <ChevronRight className="h-4 w-4 ml-1" />}
      </button>
    </div>
  );
}
