import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import SearchPageClient from "@/components/search/SearchPageClient";

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen">
        <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Loading…</div>}>
          <SearchPageClient />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
