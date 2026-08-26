import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import ContactForm from "@/components/forms/ContactForm";
import { Mail, MessageCircle, BookOpen } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Contact — Eduvia" };

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-5xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Get in touch</h1>
            <p className="mt-3 text-lg text-muted-foreground">We're here to help with any questions about Eduvia.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Mail className="h-5 w-5" /></div>
                <div><p className="font-medium">Email</p><p className="text-sm text-muted-foreground">support@eduvia.example</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><MessageCircle className="h-5 w-5" /></div>
                <div><p className="font-medium">Support</p><p className="text-sm text-muted-foreground">We typically respond within 24 hours.</p></div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><BookOpen className="h-5 w-5" /></div>
                <div><p className="font-medium">Help Center</p><Link href="/help" className="text-sm text-primary hover:underline">Browse articles →</Link></div>
              </div>
            </div>
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
