"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ShieldCheck, ArrowRight } from "lucide-react";

export default function VerifyLanding() {
  const router = useRouter();
  const [certId, setCertId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = certId.trim().toUpperCase();
    if (!id) {
      setError("Please enter a certificate ID.");
      return;
    }
    router.push(`/verify/${encodeURIComponent(id)}`);
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Verify a Certificate</h1>
        <p className="text-muted-foreground mt-2">
          Enter a certificate ID to confirm its authenticity. Certificate IDs look like <code className="bg-muted px-1 rounded">EDU-XXXXXXXXXXXXXX</code>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={certId}
          onChange={(e) => { setCertId(e.target.value); setError(""); }}
          placeholder="EDU-..."
          className="flex-1 rounded-md border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button type="submit" className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Search className="h-4 w-4" /> Verify
        </button>
      </form>

      {error && <p className="text-destructive text-sm mt-2">{error}</p>}

      <div className="mt-6 text-center">
        <Link href="/courses" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
          Browse courses <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
