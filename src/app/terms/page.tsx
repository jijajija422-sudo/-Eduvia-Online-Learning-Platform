import InfoPage from "@/components/layout/InfoPage";

export const metadata = { title: "Terms of Service — Eduvia" };

export default function TermsPage() {
  return (
    <InfoPage title="Terms of Service" subtitle="Last updated: 2026">
      <p>By accessing or using Eduvia, you agree to the following terms.</p>
      <h2 className="text-2xl font-bold mt-8">Accounts</h2>
      <p>You are responsible for maintaining the confidentiality of your account and for all activity that occurs under it.</p>
      <h2 className="text-2xl font-bold mt-8">Acceptable use</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Do not copy, resell, or redistribute course content without permission.</li>
        <li>Do not attempt to disrupt or compromise the platform's security.</li>
        <li>Be respectful in all communications and reviews.</li>
      </ul>
      <h2 className="text-2xl font-bold mt-8">Certificates</h2>
      <p>Certificates are issued upon genuine completion of a course's requirements. Misrepresentation of achievement may result in revocation.</p>
      <h2 className="text-2xl font-bold mt-8">Changes</h2>
      <p>We may update these terms from time to time. Continued use of the platform constitutes acceptance of the revised terms.</p>
    </InfoPage>
  );
}
