import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = { title: "Register — Eduvia" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === "ADMIN") redirect("/admin");
    if (user.role === "INSTRUCTOR") redirect("/instructor");
    redirect("/student");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center py-20">Loading...</div>}>
        <RegisterForm />
      </Suspense>
      <Footer />
    </div>
  );
}
