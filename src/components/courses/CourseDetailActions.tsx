"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { WishlistButton } from "@/components/courses/CourseActions";
import { ReviewModal } from "@/components/courses/ReviewModal";

export default function CourseDetailActions({
  courseId,
  courseSlug,
  isEnrolled,
  initialSaved,
  userReview,
  courseTitle,
}: {
  courseId: string;
  courseSlug: string;
  isEnrolled: boolean;
  initialSaved: boolean;
  userReview: { id: string; rating: number; content: string | null } | null;
  courseTitle: string;
}) {
  const [open, setOpen] = useState(false);

  if (isEnrolled) {
    return (
      <div className="flex items-center gap-2">
        <WishlistButton courseId={courseId} initialSaved={initialSaved} variant="full" />
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted flex-1"
        >
          <Star className="h-4 w-4" /> {userReview ? "Edit review" : "Leave a review"}
        </button>
        {open && (
          <ReviewModal
            courseId={courseId}
            courseTitle={courseTitle}
            existing={userReview}
            onClose={() => setOpen(false)}
            onSubmitted={() => {}}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <WishlistButton courseId={courseId} initialSaved={initialSaved} variant="full" />
    </div>
  );
}
