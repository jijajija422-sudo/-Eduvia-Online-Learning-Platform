import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { CourseCard } from "@/components/courses/CourseCard";
import Link from "next/link";

export default async function WishlistPage() {
  const session = await getSession();
  if (!session?.id) redirect("/login");

  const items = await db.wishlistItem.findMany({
    where: { userId: session.id },
    include: {
      course: {
        include: {
          instructor: { select: { firstName: true, lastName: true, avatar: true } },
          category: { select: { name: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Wishlist</h1>
        <p className="text-muted-foreground mt-1">Courses you've saved for later.</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Heart className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <h3 className="font-semibold mb-1">Your wishlist is empty</h3>
          <p className="text-sm text-muted-foreground mb-6">Browse the catalog and tap the heart on any course to save it here.</p>
          <Link href="/courses" className="inline-flex justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Explore courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((item) => (
            <CourseCard key={item.id} course={item.course as any} />
          ))}
        </div>
      )}
    </div>
  );
}
