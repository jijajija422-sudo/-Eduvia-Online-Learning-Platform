import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function UnauthorizedPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-foreground">
              Access Denied
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You do not have permission to view this page. If you believe this is an error, please contact support.
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/"
              className="flex w-full justify-center items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Home
            </Link>
            <Link
              href="/login"
              className="flex w-full justify-center items-center gap-2 rounded-md bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground shadow-sm hover:bg-secondary/80 transition-colors border border-border"
            >
              Sign In with Different Account
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
