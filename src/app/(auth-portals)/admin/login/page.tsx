import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import RoleLoginForm from "@/components/auth/RoleLoginForm";
import { getCurrentUser } from "@/lib/auth-guard";
import { redirect } from "next/navigation";

export const metadata = { title: "Admin Sign-In — Eduvia" };

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === "ADMIN") redirect("/admin");
    if (user.role === "INSTRUCTOR") redirect("/instructor");
    redirect("/student");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <RoleLoginForm role="ADMIN" />
      <Footer />
    </div>
  );
}
