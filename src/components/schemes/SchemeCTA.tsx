// src/components/schemes/SchemeCTA.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SchemeCTAProps {
  schemeSlug: string;
  schemeName: string;
  applicationUrl?: string | null;
  applicationMode: string[];
}

export function SchemeCTA({
  schemeSlug,
  schemeName,
  applicationUrl,
  applicationMode,
}: SchemeCTAProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const isLoggedIn = !!session;

  const handleApply = () => {
    if (!isLoggedIn) {
      // Redirect to login with return URL
      router.push(`/login?redirect=/schemes/${schemeSlug}/apply`);
      return;
    }
    // Logged in → go to pre-apply details form
    router.push(`/schemes/${schemeSlug}/apply`);
  };

  if (!isLoggedIn) {
    // Anonymous user — no apply button, just login prompt
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 12,
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 10 }}>🔒</div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "white",
            marginBottom: 8,
          }}
        >
          Login to Apply
        </div>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 16,
            lineHeight: 1.5,
          }}
        >
          Create a free account to get step-by-step help applying for this scheme.
        </p>
        <Link
          href={`/login?redirect=/schemes/${schemeSlug}/apply`}
          style={{
            display: "block",
            padding: "12px",
            background: "var(--saffron)",
            color: "white",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 15,
            textDecoration: "none",
          }}
        >
          Login to Apply →
        </Link>
      </div>
    );
  }

  // Logged in — show apply button
  return (
    <div>
      <button
        onClick={handleApply}
        style={{
          display: "block",
          width: "100%",
          padding: "14px",
          background: "var(--saffron)",
          color: "white",
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 15,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(255,107,0,0.35)",
          marginBottom: 10,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Apply for this Scheme →
      </button>
      {applicationUrl && (
        <a
          href={applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            padding: "12px",
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.7)",
            borderRadius: 10,
            fontWeight: 500,
            fontSize: 13,
            textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.15)",
            textAlign: "center",
          }}
        >
          Go directly to official portal ↗
        </a>
      )}
      <div
        style={{
          marginTop: 12,
          fontSize: 11,
          color: "rgba(255,255,255,0.35)",
          textAlign: "center",
        }}
      >
        We'll collect your details before redirecting
      </div>
    </div>
  );
}

// ── Hero CTA (shown in page header) ──────────────────────────────────────────

export function SchemeHeroCTA({
  schemeSlug,
  applicationUrl,
}: {
  schemeSlug: string;
  applicationUrl?: string | null;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const isLoggedIn = !!session;

  if (!isLoggedIn) {
    return (
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link
          href={`/login?redirect=/schemes/${schemeSlug}/apply`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 28px",
            background: "var(--saffron)",
            color: "white",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 15,
            textDecoration: "none",
            boxShadow: "0 8px 24px rgba(255,107,0,0.35)",
          }}
        >
          Login to Apply →
        </Link>
        <Link
          href="/find-schemes"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 28px",
            background: "rgba(255,255,255,0.1)",
            color: "white",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 15,
            textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          Check My Eligibility
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <button
        onClick={() => router.push(`/schemes/${schemeSlug}/apply`)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 28px",
          background: "var(--saffron)",
          color: "white",
          borderRadius: 10,
          fontWeight: 700,
          fontSize: 15,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(255,107,0,0.35)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Apply for this Scheme →
      </button>
      <Link
        href="/find-schemes"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 28px",
          background: "rgba(255,255,255,0.1)",
          color: "white",
          borderRadius: 10,
          fontWeight: 600,
          fontSize: 15,
          textDecoration: "none",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        Check My Eligibility
      </Link>
    </div>
  );
}