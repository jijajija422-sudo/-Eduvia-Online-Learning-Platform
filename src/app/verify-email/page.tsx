"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function VerifyForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Missing verification token.");
      return;
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setState("ok");
        } else {
          setState("error");
          setMessage(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setState("error");
        setMessage("Verification failed.");
      });
  }, [token]);

  return (
    <main className="flex-1 flex flex-col justify-center items-center py-12 px-6 bg-background">
      <div className="bg-card border border-border rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
        {state === "loading" && <p className="text-muted-foreground">Verifying your email…</p>}
        {state === "ok" && (
          <div className="space-y-4">
            <CheckCircle className="h-14 w-14 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold">Email verified!</h1>
            <p className="text-muted-foreground">Your account is now active. You can start learning.</p>
            <Link href="/student" className="inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Go to dashboard</Link>
          </div>
        )}
        {state === "error" && (
          <div className="space-y-4">
            <XCircle className="h-14 w-14 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Verification failed</h1>
            <p className="text-muted-foreground">{message}</p>
            <Link href="/login" className="inline-block rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Back to login</Link>
          </div>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading…</div>}>
        <VerifyForm />
      </Suspense>
      <Footer />
    </>
  );
}
