import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";

export const metadata = { title: "FAQ — Eduvia" };

export default async function FaqPage() {
  const faqs = await db.fAQ.findMany({ where: { isPublished: true }, orderBy: { orderIndex: "asc" } });

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-background">
        <div className="bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Frequently Asked Questions</h1>
            <p className="mt-3 text-lg text-muted-foreground">Find quick answers about learning on Eduvia.</p>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl space-y-4">
          {faqs.length === 0 ? (
            <p className="text-muted-foreground">No FAQs yet.</p>
          ) : (
            faqs.map((f) => (
              <div key={f.id} className="bg-card border border-border rounded-xl p-5">
                <h2 className="font-semibold mb-2">{f.question}</h2>
                <p className="text-sm text-muted-foreground">{f.answer}</p>
              </div>
            ))
          )}
          <p className="text-center text-muted-foreground pt-6">Still have questions? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
