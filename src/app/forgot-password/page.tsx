import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ForgotPasswordClient } from "./ForgotPasswordClient";

export const metadata = { title: "Forgot Password — Eduvia" };

export default function ForgotPasswordPage() {
  return (
    <>
      <Navbar />
      <ForgotPasswordClient />
      <Footer />
    </>
  );
}
