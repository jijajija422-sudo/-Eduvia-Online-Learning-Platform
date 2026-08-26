import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function InfoPage({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-background">
        <div className="bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-3 text-lg text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl prose prose-sm max-w-none">
          <div className="space-y-6 leading-relaxed text-foreground/90">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
