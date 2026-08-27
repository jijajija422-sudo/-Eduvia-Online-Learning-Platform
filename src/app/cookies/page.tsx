import InfoPage from "@/components/layout/InfoPage";

export const metadata = { title: "Cookie Policy — Eduvia" };

export default function CookiesPage() {
  return (
    <InfoPage title="Cookie Policy" subtitle="Last updated: 2026">
      <p>This Cookie Policy explains how Eduvia uses cookies and similar technologies to operate and improve the platform.</p>
      <h2 className="text-2xl font-bold mt-8">What are cookies</h2>
      <p>Cookies are small text files stored on your device that help us remember your preferences and keep you signed in.</p>
      <h2 className="text-2xl font-bold mt-8">How we use cookies</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Essential cookies</strong> — required for authentication and security (e.g. your session).</li>
        <li><strong>Preferences cookies</strong> — remember your theme (light/dark) and language choices.</li>
        <li><strong>Analytics cookies</strong> — help us understand how the platform is used so we can improve it. These are anonymized.</li>
      </ul>
      <h2 className="text-2xl font-bold mt-8">Managing cookies</h2>
      <p>You can control or delete cookies through your browser settings. Disabling essential cookies may prevent parts of the platform from working correctly.</p>
      <h2 className="text-2xl font-bold mt-8">Contact</h2>
      <p>For questions about our use of cookies, reach out via our <a href="/contact" className="text-primary hover:underline">contact page</a>.</p>
    </InfoPage>
  );
}
