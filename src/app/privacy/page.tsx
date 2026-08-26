import InfoPage from "@/components/layout/InfoPage";

export const metadata = { title: "Privacy Policy — Eduvia" };

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" subtitle="Last updated: 2026">
      <p>This Privacy Policy explains how Eduvia ("we", "us") collects, uses, and protects your information.</p>
      <h2 className="text-2xl font-bold mt-8">Information we collect</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Account details you provide (name, email, password).</li>
        <li>Learning activity such as enrollments, progress, and quiz results.</li>
        <li>Optional profile information like bio, country, and language preferences.</li>
      </ul>
      <h2 className="text-2xl font-bold mt-8">How we use your information</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>To provide and personalize your learning experience.</li>
        <li>To issue certificates and communicate important account updates.</li>
        <li>To improve our courses and platform.</li>
      </ul>
      <h2 className="text-2xl font-bold mt-8">Data security</h2>
      <p>Passwords are stored using strong one-way hashing. We never sell your personal data to third parties.</p>
      <h2 className="text-2xl font-bold mt-8">Your rights</h2>
      <p>You may request access to, correction of, or deletion of your personal data at any time by contacting support.</p>
    </InfoPage>
  );
}
