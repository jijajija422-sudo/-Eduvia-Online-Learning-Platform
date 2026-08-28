import { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import RoleLoginForm from "@/components/auth/RoleLoginForm";

export const metadata = { title: "Sign In — Eduvia" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center py-20">Loading…</div>}>
      <LoginShell searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginShell({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  const normalized =
    role === "admin" ? "ADMIN" : role === "instructor" ? "INSTRUCTOR" : "STUDENT";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <RoleLoginForm role={normalized} />
      <Footer />
    </div>
  );
}
