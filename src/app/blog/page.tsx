import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, Lightbulb, Code2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = { title: "Blog — Eduvia" };

const posts = [
  {
    slug: "how-to-stay-motivated-while-learning-online",
    title: "How to Stay Motivated While Learning Online",
    excerpt: "Practical strategies to build a consistent study habit and finish the courses you start.",
    icon: GraduationCap,
    readTime: "5 min read",
  },
  {
    slug: "best-practices-for-taking-notes",
    title: "Best Practices for Taking Notes That Stick",
    excerpt: "A simple system for capturing key concepts and revisiting them so they become long-term knowledge.",
    icon: Lightbulb,
    readTime: "4 min read",
  },
  {
    slug: "learn-to-code-without-a-cs-degree",
    title: "Learn to Code Without a CS Degree",
    excerpt: "A roadmap for breaking into software development using free, project-based learning on Eduvia.",
    icon: Code2,
    readTime: "7 min read",
  },
  {
    slug: "why-microlearning-works",
    title: "Why Microlearning Works",
    excerpt: "Short, focused lessons beat marathon study sessions. Here's the science — and how to use it.",
    icon: BookOpen,
    readTime: "3 min read",
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Eduvia Blog" description="Tips, guides, and ideas to help you learn better and faster." />

      <div className="grid gap-4 sm:grid-cols-2">
        {posts.map((p) => {
          const Icon = p.icon;
          return (
            <article key={p.slug} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 text-primary mb-3">
                <Icon className="h-5 w-5" />
                <span className="text-xs text-muted-foreground">{p.readTime}</span>
              </div>
              <h2 className="font-semibold mb-1">{p.title}</h2>
              <p className="text-sm text-muted-foreground mb-3">{p.excerpt}</p>
              <span className="text-sm text-primary inline-flex items-center gap-1 hover:underline">
                Read more <ArrowRight className="h-4 w-4" />
              </span>
            </article>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground text-center pt-4">
        Want course-specific guidance? Visit the <Link href="/courses" className="text-primary hover:underline">course catalog</Link>.
      </p>
    </div>
  );
}
