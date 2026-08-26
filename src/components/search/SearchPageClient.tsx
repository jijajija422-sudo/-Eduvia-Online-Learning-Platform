"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search as SearchIcon, Loader2, BookOpen, Tag, User } from "lucide-react";
import { CourseCard } from "@/components/courses/CourseCard";

export default function SearchPageClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [debounced, setDebounced] = useState(q);
  const [results, setResults] = useState<any>({ courses: [], categories: [], instructors: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const url = new URLSearchParams();
    if (debounced) url.set("q", debounced);
    router.replace(`/search?${url.toString()}`, { scroll: false });
  }, [debounced, router]);

  useEffect(() => {
    if (!debounced.trim()) { setResults({ courses: [], categories: [], instructors: [] }); return; }
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`)
      .then((r) => r.json())
      .then((d) => setResults(d.results))
      .finally(() => setLoading(false));
  }, [debounced]);

  const hasQuery = debounced.trim().length > 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Search</h1>
      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search courses, categories, instructors…"
          className="w-full rounded-xl border-0 py-3.5 pl-12 pr-4 text-lg ring-1 ring-inset ring-border bg-card text-foreground shadow-sm"
        />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground py-10"><Loader2 className="h-5 w-5 animate-spin" /> Searching…</div>
      )}

      {!hasQuery && !loading && (
        <div className="text-center py-16 text-muted-foreground">
          <SearchIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Start typing to search the catalog.</p>
        </div>
      )}

      {hasQuery && !loading && (
        <div className="space-y-10">
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Courses ({results.courses.length})</h2>
            {results.courses.length === 0 ? (
              <p className="text-muted-foreground">No courses found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.courses.map((c: any) => <CourseCard key={c.id} course={c} />)}
              </div>
            )}
          </section>

          {results.categories.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Tag className="h-5 w-5 text-primary" /> Categories ({results.categories.length})</h2>
              <div className="flex flex-wrap gap-2">
                {results.categories.map((c: any) => (
                  <Link key={c.id} href={`/categories/${c.slug}`} className="bg-card border border-border rounded-full px-4 py-2 text-sm hover:bg-muted">{c.name}</Link>
                ))}
              </div>
            </section>
          )}

          {results.instructors.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Instructors ({results.instructors.length})</h2>
              <div className="flex flex-wrap gap-3">
                {results.instructors.map((u: any) => (
                  <Link key={u.id} href={`/instructors/${u.slug}`} className="bg-card border border-border rounded-xl px-4 py-3 text-sm hover:bg-muted">
                    {u.firstName} {u.lastName}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.courses.length === 0 && results.categories.length === 0 && results.instructors.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p>No results for "{debounced}".</p>
              <Link href="/courses" className="text-primary hover:underline">Browse all courses →</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
