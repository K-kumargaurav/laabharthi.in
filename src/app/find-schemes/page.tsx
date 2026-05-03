// src/app/find-schemes/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SchemeResult {
  scheme: {
    id: string;
    slug: string;
    name: string;
    nameHindi?: string;
    description: string;
    ministry: string;
    level: string;
    tags: string[];
    applicationUrl?: string;
    applicationMode: string[];
  };
  score: number;
  isEligible: boolean;
  matchReasons: string[];
  failReasons: string[];
}

interface MatchResponse {
  total: number;
  returned: number;
  results: SchemeResult[];
}

// ─── Form state type ──────────────────────────────────────────────────────────

interface ProfileForm {
  dateOfBirth: string;
  gender: string;
  caste: string;
  state: string;
  isRural: string;
  annualIncome: string;
  bplCardHolder: boolean;
  occupation: string;
  employmentStatus: string;
  isFarmer: boolean;
  isDisabled: boolean;
  isWidow: boolean;
  isMinority: boolean;
}

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
];

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
  transition: "border-color 0.2s",
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

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function CheckboxField({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 10,
        border: `1.5px solid ${checked ? "var(--saffron)" : "var(--border)"}`,
        background: checked ? "var(--saffron-pale)" : "white",
        cursor: "pointer",
        transition: "all 0.15s",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          border: `2px solid ${checked ? "var(--saffron)" : "var(--border)"}`,
          background: checked ? "var(--saffron)" : "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
          transition: "all 0.15s",
        }}
      >
        {checked && (
          <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>
            ✓
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--navy)" }}>
          {label}
        </div>
        <div
          style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({
  score,
  isEligible,
}: {
  score: number;
  isEligible: boolean;
}) {
  const color = isEligible ? (score >= 80 ? "#1A7A4A" : "#C9922A") : "#8A9DB5";
  const bg = isEligible ? (score >= 80 ? "#E8F5EE" : "#FFF8E8") : "#F0F4F8";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: 100,
        background: bg,
        fontSize: 13,
        fontWeight: 700,
        color,
      }}
    >
      {isEligible ? "✓" : "~"} {score}% match
    </div>
  );
}

function SchemeCard({ result }: { result: SchemeResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: `1.5px solid ${result.isEligible ? "rgba(26,122,74,0.2)" : "var(--border)"}`,
        overflow: "hidden",
        transition: "all 0.2s",
        boxShadow: result.isEligible
          ? "0 4px 16px rgba(26,122,74,0.08)"
          : "none",
      }}
    >
      <div style={{ padding: "20px 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--text-muted)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              {result.scheme.ministry}
            </div>
            <Link
              href={`/schemes/${result.scheme.slug}`}
              style={{ textDecoration: "none" }}
            >
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "var(--navy)",
                  lineHeight: 1.3,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                }}
              >
                {result.scheme.name}
              </h3>
            </Link>
            {result.scheme.nameHindi && (
              <div
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginTop: 2,
                  fontFamily: "'Tiro Devanagari Hindi', serif",
                }}
              >
                {result.scheme.nameHindi}
              </div>
            )}
          </div>
          <ScoreBadge score={result.score} isEligible={result.isEligible} />
        </div>

        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          {result.scheme.description.slice(0, 160)}...
        </p>

        {/* Tags */}
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          {result.scheme.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              style={{
                padding: "3px 10px",
                background: "var(--cream-dark)",
                borderRadius: 100,
                fontSize: 12,
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Match reasons */}
        {result.matchReasons.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            {result.matchReasons.slice(0, 2).map((reason, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "var(--green)",
                  marginBottom: 4,
                }}
              >
                <span>✓</span> {reason}
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {result.scheme.applicationUrl && (
            <a
              href={result.scheme.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "8px 20px",
                background: result.isEligible
                  ? "var(--navy)"
                  : "var(--cream-dark)",
                color: result.isEligible ? "white" : "var(--text-secondary)",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Apply Now →
            </a>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: "8px 16px",
              background: "transparent",
              color: "var(--text-secondary)",
              border: "1.5px solid var(--border)",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {expanded ? "Show less" : "More details"}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "20px 24px",
            background: "var(--cream)",
          }}
        >
          {result.failReasons.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Why you may not qualify
              </div>
              {result.failReasons.map((reason, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 13,
                    color: "#C92A2A",
                    marginBottom: 4,
                    display: "flex",
                    gap: 6,
                  }}
                >
                  <span>✗</span> {reason}
                </div>
              ))}
            </div>
          )}
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--text-muted)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Application modes
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {result.scheme.applicationMode.map((mode) => (
              <span
                key={mode}
                style={{
                  padding: "4px 12px",
                  background: "white",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}
              >
                {mode}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FindSchemesPage() {
  const [step, setStep] = useState<"form" | "results">("form");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ProfileForm>({
    dateOfBirth: "",
    gender: "",
    caste: "",
    state: "",
    isRural: "",
    annualIncome: "",
    bplCardHolder: false,
    occupation: "",
    employmentStatus: "",
    isFarmer: false,
    isDisabled: false,
    isWidow: false,
    isMinority: false,
  });

  const update = (key: keyof ProfileForm, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        limit: 26,
        onlyEligible: false,
      };

      if (form.dateOfBirth)
        payload.dateOfBirth = new Date(form.dateOfBirth).toISOString();
      if (form.gender) payload.gender = form.gender;
      if (form.caste) payload.caste = form.caste;
      if (form.state) payload.state = form.state;
      if (form.isRural !== "") payload.isRural = form.isRural === "rural";
      if (form.annualIncome)
        payload.annualIncome = parseFloat(form.annualIncome);
      if (form.bplCardHolder) payload.bplCardHolder = true;
      if (form.occupation) payload.occupation = form.occupation;
      if (form.employmentStatus)
        payload.employmentStatus = form.employmentStatus;
      if (form.isFarmer) payload.isFarmer = true;
      if (form.isDisabled) payload.isDisabled = true;
      if (form.isWidow) payload.isWidow = true;
      if (form.isMinority) payload.isMinority = true;

      const res = await fetch("/api/schemes/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to fetch schemes");

      const data: MatchResponse = await res.json();
      setResults(data);
      setStep("results");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Results view ──────────────────────────────────────────────────────────

  if (step === "results" && results) {
    const eligible = results.results.filter((r) => r.isEligible);
    const others = results.results.filter((r) => !r.isEligible);

    return (
      <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
        {/* Header */}
        <div
          style={{
            background: "var(--navy)",
            padding: "48px 24px 64px",
          }}
        >
          <div className="container-main">
            <Link
              href="/"
              style={{
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 24,
              }}
            >
              ← Back to home
            </Link>
            <h1
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                color: "white",
                marginBottom: 12,
              }}
            >
              {eligible.length > 0
                ? `You qualify for ${eligible.length} scheme${eligible.length > 1 ? "s" : ""}!`
                : "Here are schemes near your profile"}
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)" }}>
              {results.total} schemes checked • {eligible.length} fully eligible
              • {others.length} partial matches
            </p>
          </div>
        </div>

        <div
          className="container-main"
          style={{ paddingTop: 40, paddingBottom: 80 }}
        >
          {/* Action bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 32,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              Showing {results.returned} of {results.total} schemes
            </div>
            <button
              onClick={() => setStep("form")}
              style={{
                padding: "8px 20px",
                background: "white",
                border: "1.5px solid var(--border)",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                color: "var(--navy)",
              }}
            >
              ← Edit Profile
            </button>
          </div>

          {/* Eligible schemes */}
          {eligible.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--green)",
                  }}
                />
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--navy)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Schemes you qualify for ({eligible.length})
                </h2>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                  gap: 16,
                }}
              >
                {eligible.map((result) => (
                  <SchemeCard key={result.scheme.id} result={result} />
                ))}
              </div>
            </div>
          )}

          {/* Partial matches */}
          {others.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--text-muted)",
                  }}
                />
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Other schemes ({others.length})
                </h2>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                  gap: 16,
                }}
              >
                {others.map((result) => (
                  <SchemeCard key={result.scheme.id} result={result} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Form view ─────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* Header */}
      <div
        style={{
          background: "var(--navy)",
          padding: "48px 24px 64px",
        }}
      >
        <div className="container-main">
          <Link
            href="/"
            style={{
              color: "rgba(255,255,255,0.6)",
              textDecoration: "none",
              fontSize: 14,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 24,
            }}
          >
            ← Back to home
          </Link>
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              color: "white",
              marginBottom: 12,
            }}
          >
            Tell us about yourself
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)" }}>
            Share your details to find schemes you qualify for. No account
            needed.
          </p>
        </div>
      </div>

      {/* Form */}
      <div
        className="container-main"
        style={{ paddingTop: 40, paddingBottom: 80 }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: "40px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow)",
            }}
          >
            {/* Personal */}
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--navy)",
                marginBottom: 28,
                paddingBottom: 16,
                borderBottom: "1px solid var(--border)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Personal Details
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0 24px",
              }}
            >
              <FormField label="Date of birth">
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Gender">
                <select
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </FormField>

              <FormField label="Caste category">
                <select
                  value={form.caste}
                  onChange={(e) => update("caste", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select category</option>
                  <option value="GENERAL">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </FormField>

              <FormField label="State">
                <select
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select state</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Economic */}
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--navy)",
                margin: "8px 0 28px",
                paddingBottom: 16,
                borderBottom: "1px solid var(--border)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Economic Details
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0 24px",
              }}
            >
              <FormField label="Annual household income (₹)">
                <input
                  type="number"
                  placeholder="e.g. 120000"
                  value={form.annualIncome}
                  onChange={(e) => update("annualIncome", e.target.value)}
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Residence type">
                <select
                  value={form.isRural}
                  onChange={(e) => update("isRural", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select type</option>
                  <option value="rural">Rural (Village/Town)</option>
                  <option value="urban">Urban (City)</option>
                </select>
              </FormField>

              <FormField label="Employment status">
                <select
                  value={form.employmentStatus}
                  onChange={(e) => update("employmentStatus", e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select status</option>
                  <option value="EMPLOYED">Employed</option>
                  <option value="SELF_EMPLOYED">Self Employed</option>
                  <option value="UNEMPLOYED">Unemployed</option>
                  <option value="STUDENT">Student</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </FormField>

              <FormField label="Occupation (optional)">
                <input
                  type="text"
                  placeholder="e.g. farmer, weaver, teacher"
                  value={form.occupation}
                  onChange={(e) => update("occupation", e.target.value)}
                  style={inputStyle}
                />
              </FormField>
            </div>

            {/* Special categories */}
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--navy)",
                margin: "8px 0 20px",
                paddingBottom: 16,
                borderBottom: "1px solid var(--border)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Special Categories
            </h2>

            <CheckboxField
              label="BPL Card Holder"
              desc="Below Poverty Line ration card holder"
              checked={form.bplCardHolder}
              onChange={(v) => update("bplCardHolder", v)}
            />
            <CheckboxField
              label="Farmer"
              desc="Own or cultivate agricultural land"
              checked={form.isFarmer}
              onChange={(v) => update("isFarmer", v)}
            />
            <CheckboxField
              label="Person with Disability"
              desc="Have a disability certificate"
              checked={form.isDisabled}
              onChange={(v) => update("isDisabled", v)}
            />
            <CheckboxField
              label="Widow"
              desc="Lost spouse and not remarried"
              checked={form.isWidow}
              onChange={(v) => update("isWidow", v)}
            />
            <CheckboxField
              label="Minority Community"
              desc="Muslim, Christian, Sikh, Buddhist, Jain, Parsi"
              checked={form.isMinority}
              onChange={(v) => update("isMinority", v)}
            />

            {error && (
              <div
                style={{
                  padding: "12px 16px",
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: 8,
                  fontSize: 14,
                  color: "#DC2626",
                  marginBottom: 20,
                }}
              >
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                background: loading ? "var(--text-muted)" : "var(--navy)",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: 8,
                transition: "all 0.2s",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {loading ? "Finding your schemes..." : "Find My Schemes →"}
            </button>

            <p
              style={{
                fontSize: 12,
                color: "var(--text-muted)",
                textAlign: "center",
                marginTop: 16,
              }}
            >
              Your data is not stored. Results are instant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
