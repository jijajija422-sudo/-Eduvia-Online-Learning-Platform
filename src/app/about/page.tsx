import InfoPage from "@/components/layout/InfoPage";
import Link from "next/link";

export const metadata = { title: "About Eduvia" };

export default function AboutPage() {
  return (
    <InfoPage title="About Eduvia" subtitle="Learn. Grow. Achieve.">
      <p>
        Eduvia is a modern, text-first learning platform built for people who value depth over distraction.
        We believe the best way to master a skill is through clear, well-structured written material you can read
        at your own pace — no video overload, no fluff.
      </p>
      <h2 className="text-2xl font-bold mt-8">Our mission</h2>
      <p>
        To make high-quality education accessible to everyone. Whether you're switching careers, leveling up at work,
        or exploring a new hobby, Eduvia gives you the structured path and verifiable credentials to prove your progress.
      </p>
      <h2 className="text-2xl font-bold mt-8">What makes us different</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Text-first design:</strong> comfortable reading experience with adjustable typography and progress tracking.</li>
        <li><strong>Real certificates:</strong> every completed course issues a verifiable, shareable certificate.</li>
        <li><strong>Expert instructors:</strong> courses are created by vetted industry professionals.</li>
        <li><strong>Focus on outcomes:</strong> quizzes and assessments ensure you actually learn, not just browse.</li>
      </ul>
      <p className="mt-8">
        Ready to begin? <Link href="/courses" className="text-primary font-medium hover:underline">Browse our courses</Link> or{" "}
        <Link href="/register" className="text-primary font-medium hover:underline">create a free account</Link>.
      </p>
    </InfoPage>
  );
}
