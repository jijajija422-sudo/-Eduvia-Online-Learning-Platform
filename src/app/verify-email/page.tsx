import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { VerifyEmailClient } from "./VerifyEmailClient";

export const metadata = { title: "Verify Email — Eduvia" };

export default function VerifyEmailPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading…</div>}>
        <VerifyEmailClient />
      </Suspense>
      <Footer />
    </>
  );
}
