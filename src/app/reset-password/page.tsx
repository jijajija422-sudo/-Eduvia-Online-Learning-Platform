import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ResetPasswordClient } from "./ResetPasswordClient";

export const metadata = { title: "Reset Password — Eduvia" };

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading…</div>}>
        <ResetPasswordClient />
      </Suspense>
      <Footer />
    </>
  );
}
