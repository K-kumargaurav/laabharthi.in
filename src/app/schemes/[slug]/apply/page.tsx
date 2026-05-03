// src/app/schemes/[slug]/apply/page.tsx
// Pre-apply page — collects user details before redirecting to official portal.
// Only accessible to logged-in users.

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface SchemeData {
  name: string;
  nameHindi?: string;
  ministry: string;
  applicationUrl?: string;
  requiredDocuments: string[];
  applicationProcess: string[];
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 10,
  border: "1.5px solid var(--border)",
  background: "white",
  fontSize: 15,
  color: "var(--text-primary)",
  outline: "none",
  fontFamily: "'DM Sans', sans-serif",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: 8,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

export default function ApplyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [scheme, setScheme] = useState<SchemeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"details" | "documents" | "redirect">("details");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    aadhaarNumber: "",
    state: "",
    district: "",
    pincode: "",
    annualIncome: "",
    additionalInfo: "",
  });

  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  // ── Auth guard ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?redirect=/schemes/${slug}/apply`);
    }
  }, [status, slug, router]);

  // ── Fetch scheme ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/schemes/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setScheme(data);
        // Pre-fill phone from session
        if (session?.user) {
          setForm((f) => ({
            ...f,
            phone: (session.user as { phone?: string }).phone ?? "",
          }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, session]);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleDoc = (doc: string) =>
    setCheckedDocs((prev) => ({ ...prev, [doc]: !prev[doc] }));

  const allDocsChecked =
    scheme?.requiredDocuments.every((doc) => checkedDocs[doc]) ?? false;

  // ── Step: Redirect ────────────────────────────────────────────────────────

  const handleProceed = async () => {
    setSubmitting(true);

    // Save application record
    try {
      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeSlug: slug,
          formData: form,
        }),
      });
    } catch (err) {
      console.error("Failed to save application:", err);
    }

    setStep("redirect");
    setSubmitting(false);
  };

  // ── Loading / auth states ─────────────────────────────────────────────────

  if (status === "loading" || loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--cream)",
        }}
      >
        <div style={{ fontSize: 16, color: "var(--text-secondary)" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--cream)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, color: "var(--text-secondary)", marginBottom: 16 }}>
            Scheme not found
          </div>
          <Link href="/find-schemes" style={{ color: "var(--saffron)" }}>
            ← Back to schemes
          </Link>
        </div>
      </div>
    );
  }

  // ── Step: Redirect to official portal ─────────────────────────────────────

  if (step === "redirect") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--cream)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            maxWidth: 520,
            width: "100%",
            background: "white",
            borderRadius: 20,
            padding: "48px 40px",
            border: "1px solid var(--border)",
            textAlign: "center",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--navy)",
              marginBottom: 12,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Details saved!
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            Your details have been saved. You will now be redirected to the
            official government portal to complete your application.
          </p>

          {/* Summary */}
          <div
            style={{
              background: "var(--cream)",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 28,
              textAlign: "left",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Your Details
            </div>
            {[
              { label: "Name", value: form.fullName },
              { label: "Phone", value: `+91 ${form.phone}` },
              { label: "State", value: form.state },
            ].filter(i => i.value).map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 14,
                  padding: "4px 0",
                  color: "var(--text-primary)",
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                <span style={{ fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>

          {scheme.applicationUrl ? (
            <a
              href={scheme.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "16px",
                background: "var(--saffron)",
                color: "white",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 16,
                textDecoration: "none",
                boxShadow: "0 8px 24px rgba(255,107,0,0.35)",
                marginBottom: 12,
              }}
            >
              Go to Official Portal →
            </a>
          ) : (
            <div
              style={{
                padding: "16px",
                background: "var(--cream-dark)",
                borderRadius: 12,
                fontSize: 14,
                color: "var(--text-secondary)",
                marginBottom: 12,
              }}
            >
              This scheme requires offline application. Visit your nearest CSC or government office.
            </div>
          )}

          <Link
            href={`/schemes/${slug}`}
            style={{
              fontSize: 14,
              color: "var(--text-muted)",
              textDecoration: "none",
            }}
          >
            ← Back to scheme details
          </Link>
        </div>
      </div>
    );
  }

  // ── Step: Documents checklist ─────────────────────────────────────────────

  if (step === "documents") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
        <div style={{ background: "var(--navy)", padding: "40px 24px 56px" }}>
          <div className="container-main">
            <Link
              href={`/schemes/${slug}`}
              style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}
            >
              ← Back to scheme
            </Link>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
              Step 2 of 2
            </div>
            <h1 style={{ fontSize: 32, color: "white", marginBottom: 8 }}>
              Document Checklist
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)" }}>
              Confirm you have these ready before proceeding to the official portal
            </p>
          </div>
        </div>

        <div className="container-main" style={{ paddingTop: 40, paddingBottom: 80 }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div
              style={{
                background: "white",
                borderRadius: 20,
                padding: "36px",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
              }}
            >
              <div
                style={{
                  background: "var(--saffron-pale)",
                  border: "1px solid rgba(255,107,0,0.2)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginBottom: 24,
                  fontSize: 13,
                  color: "var(--saffron)",
                  fontWeight: 500,
                }}
              >
                💡 Keep physical copies + digital scans of all documents ready
              </div>

              {scheme.requiredDocuments.map((doc, i) => (
                <div
                  key={i}
                  onClick={() => toggleDoc(doc)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    borderRadius: 10,
                    border: `1.5px solid ${checkedDocs[doc] ? "var(--green)" : "var(--border)"}`,
                    background: checkedDocs[doc] ? "var(--green-light)" : "white",
                    cursor: "pointer",
                    marginBottom: 10,
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      border: `2px solid ${checkedDocs[doc] ? "var(--green)" : "var(--border)"}`,
                      background: checkedDocs[doc] ? "var(--green)" : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.15s",
                    }}
                  >
                    {checkedDocs[doc] && (
                      <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>✓</span>
                    )}
                  </div>
                  <span style={{ fontSize: 15, color: "var(--text-primary)", fontWeight: 500 }}>
                    📄 {doc}
                  </span>
                </div>
              ))}

              <div
                style={{
                  marginTop: 24,
                  padding: "12px 16px",
                  background: "var(--cream)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  marginBottom: 24,
                }}
              >
                {Object.values(checkedDocs).filter(Boolean).length} of{" "}
                {scheme.requiredDocuments.length} documents confirmed
              </div>

              <button
                onClick={handleProceed}
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "var(--saffron)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {submitting ? "Saving..." : "Proceed to Official Portal →"}
              </button>

              {!allDocsChecked && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
                  You can proceed even without checking all documents
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Personal details form ───────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <div style={{ background: "var(--navy)", padding: "40px 24px 56px" }}>
        <div className="container-main">
          <Link
            href={`/schemes/${slug}`}
            style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}
          >
            ← Back to scheme
          </Link>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
            Step 1 of 2
          </div>
          <h1 style={{ fontSize: 32, color: "white", marginBottom: 8 }}>
            Your Details
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)" }}>
            Fill your details for {scheme.name}
          </p>
        </div>
      </div>

      <div className="container-main" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "36px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow)",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Full Name *</label>
                <input
                  type="text"
                  placeholder="As per Aadhaar"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Mobile Number *</label>
                <input
                  type="tel"
                  placeholder="10-digit number"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Aadhaar Number</label>
                <input
                  type="text"
                  placeholder="XXXX XXXX XXXX"
                  value={form.aadhaarNumber}
                  onChange={(e) => update("aadhaarNumber", e.target.value.replace(/\D/g, "").slice(0, 12))}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Annual Income (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 120000"
                  value={form.annualIncome}
                  onChange={(e) => update("annualIncome", e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>State *</label>
                <input
                  type="text"
                  placeholder="e.g. Jharkhand"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>District</label>
                <input
                  type="text"
                  placeholder="e.g. Hazaribagh"
                  value={form.district}
                  onChange={(e) => update("district", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Additional Information</label>
              <textarea
                placeholder="Any other relevant details about your application..."
                value={form.additionalInfo}
                onChange={(e) => update("additionalInfo", e.target.value)}
                rows={3}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  lineHeight: 1.5,
                }}
              />
            </div>

            <button
              onClick={() => setStep("documents")}
              disabled={!form.fullName || !form.phone || !form.state}
              style={{
                width: "100%",
                padding: "15px",
                background: !form.fullName || !form.phone || !form.state
                  ? "var(--text-muted)"
                  : "var(--navy)",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: !form.fullName || !form.phone || !form.state
                  ? "not-allowed"
                  : "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Next: Document Checklist →
            </button>

            <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 12 }}>
              * Required fields. Your data is encrypted and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}