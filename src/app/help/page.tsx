import InfoPage from "@/components/layout/InfoPage";
import Link from "next/link";

export const metadata = { title: "Help Center — Eduvia" };

export default function HelpPage() {
  return (
    <InfoPage title="Help Center" subtitle="Answers to common questions">
      <h2 className="text-xl font-bold">Getting started</h2>
      <p>Create a free account, browse the <Link href="/courses" className="text-primary hover:underline">course catalog</Link>, and enroll in any published course.</p>
      <h2 className="text-xl font-bold mt-6">Tracking progress</h2>
      <p>Your progress is saved automatically. Use the "Mark as complete" button on each lesson to keep your course progress up to date.</p>
      <h2 className="text-xl font-bold mt-6">Certificates</h2>
      <p>Complete all required lessons and pass the assessments to earn a verifiable certificate. You can download it as a PDF or share the verification link.</p>
      <h2 className="text-xl font-bold mt-6">Become an instructor</h2>
      <p>Want to teach? Apply on the <Link href="/become-instructor" className="text-primary hover:underline">Become an Instructor</Link> page.</p>
      <h2 className="text-xl font-bold mt-6">Still need help?</h2>
      <p>Reach out via our <Link href="/contact" className="text-primary hover:underline">contact page</Link> and our team will get back to you.</p>
    </InfoPage>
  );
}
