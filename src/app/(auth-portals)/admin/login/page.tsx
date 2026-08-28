import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import RoleLoginForm from "@/components/auth/RoleLoginForm";

export const metadata = { title: "Admin Sign-In — Eduvia" };

export default function AdminLoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <RoleLoginForm role="ADMIN" />
      <Footer />
    </div>
  );
}
