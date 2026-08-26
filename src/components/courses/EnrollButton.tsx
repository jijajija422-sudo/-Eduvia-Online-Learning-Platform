"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
  courseSlug: string;
  isLoggedIn: boolean;
}

export function EnrollButton({ courseId, courseSlug, isLoggedIn }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      router.push(`/login?returnUrl=/courses/${courseSlug}`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to enroll in the course.");
        setIsLoading(false);
        return;
      }

      // Success! Redirect to the learning interface
      router.push(`/courses/${courseSlug}/learn`);
      router.refresh(); // Refresh to update server components (like the sidebar)
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("Something went wrong. Please try again later.");
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleEnroll}
      disabled={isLoading}
      className="w-full flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enrolling...
        </>
      ) : (
        "Enroll Now"
      )}
    </button>
  );
}
