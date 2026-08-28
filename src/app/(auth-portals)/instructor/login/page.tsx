import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import RoleLoginForm from "@/components/auth/RoleLoginForm";

export const metadata = { title: "Instructor Login — Eduvia" };

export default function InstructorLoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <RoleLoginForm role="INSTRUCTOR" />
      <Footer />
    </div>
  );
}
