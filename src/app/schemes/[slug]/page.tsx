// src/app/schemes/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
  params: { slug: string };
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getScheme(slug: string) {
  const scheme = await prisma.scheme.findUnique({
    where: { slug },
  });
  return scheme;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: 3,
          height: 24,
          background: "var(--saffron)",
          borderRadius: 2,
          flexShrink: 0,
        }}
      />
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "var(--navy)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid var(--border)",
        padding: "28px 32px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function ListItem({
  text,
  index,
  type = "bullet",
}: {
  text: string;
  index: number;
  type?: "bullet" | "numbered" | "check" | "document";
}) {
  const icons = {
    bullet: "•",
    numbered: `${index + 1}.`,
    check: "✓",
    document: "📄",
  };

  const colors = {
    bullet: "var(--saffron)",
    numbered: "var(--navy)",
    check: "var(--green)",
    document: "transparent",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          color: colors[type],
          fontWeight: 700,
          fontSize: type === "numbered" ? 13 : 16,
          flexShrink: 0,
          minWidth: 20,
          paddingTop: type === "numbered" ? 1 : 0,
        }}
      >
        {icons[type]}
      </span>
      <span
        style={{
          fontSize: 15,
          color: "var(--text-primary)",
          lineHeight: 1.6,
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function SchemeDetailPage({ params }: PageProps) {
  const scheme = await getScheme(params.slug);

  if (!scheme) notFound();

  const eligibility = scheme.eligibilityCriteria as Record<string, unknown>;

  // Format eligibility criteria into readable strings
  const eligibilityPoints: string[] = [];

  if (eligibility.minAge || eligibility.maxAge) {
    const min = eligibility.minAge as number | undefined;
    const max = eligibility.maxAge as number | undefined;
    if (min && max) eligibilityPoints.push(`Age between ${min} and ${max} years`);
    else if (min) eligibilityPoints.push(`Minimum age: ${min} years`);
    else if (max) eligibilityPoints.push(`Maximum age: ${max} years`);
  }

  if (eligibility.gender && Array.isArray(eligibility.gender)) {
    eligibilityPoints.push(
      `Gender: ${(eligibility.gender as string[]).join(" or ")}`
    );
  }

  if (eligibility.caste && Array.isArray(eligibility.caste)) {
    eligibilityPoints.push(
      `Category: ${(eligibility.caste as string[]).join(", ")}`
    );
  }

  if (eligibility.residence) {
    eligibilityPoints.push(
      `Residence: ${eligibility.residence === "rural" ? "Rural areas only" : eligibility.residence === "urban" ? "Urban areas only" : "Rural and Urban"}`
    );
  }

  if (eligibility.bplRequired) {
    eligibilityPoints.push("Must have BPL (Below Poverty Line) card");
  }

  if (eligibility.isFarmerRequired) {
    eligibilityPoints.push("Must be a farmer with cultivable land");
  }

  if (eligibility.isDisabledRequired) {
    eligibilityPoints.push("Must have a valid disability certificate");
  }

  if (eligibility.isWidowRequired) {
    eligibilityPoints.push("Widows only");
  }

  if (eligibility.maxIncome) {
    eligibilityPoints.push(
      `Annual income must not exceed ₹${(eligibility.maxIncome as number).toLocaleString("en-IN")}`
    );
  }

  if (eligibility.occupation && Array.isArray(eligibility.occupation)) {
    eligibilityPoints.push(
      `Occupation: ${(eligibility.occupation as string[]).join(", ")}`
    );
  }

  // Add raw criteria keys not handled above
  const handled = new Set([
    "minAge", "maxAge", "gender", "caste", "residence",
    "bplRequired", "isFarmerRequired", "isDisabledRequired",
    "isWidowRequired", "maxIncome", "occupation",
  ]);

  Object.entries(eligibility).forEach(([key, val]) => {
    if (!handled.has(key) && val) {
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase());
      const value = typeof val === "object" ? JSON.stringify(val) : String(val);
      eligibilityPoints.push(`${label}: ${value}`);
    }
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>

      {/* ── Hero ── */}
      <div style={{ background: "var(--navy)", padding: "48px 24px 64px" }}>
        <div className="container-main">

          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 28,
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <Link href="/" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
              Home
            </Link>
            <span>›</span>
            <Link href="/find-schemes" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
              Schemes
            </Link>
            <span>›</span>
            <span style={{ color: "rgba(255,255,255,0.8)" }}>{scheme.name}</span>
          </div>

          {/* Ministry + level badge */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                padding: "4px 12px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: 100,
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                fontWeight: 500,
              }}
            >
              {scheme.ministry}
            </span>
            <span
              style={{
                padding: "4px 12px",
                background: "rgba(255,107,0,0.2)",
                borderRadius: 100,
                fontSize: 12,
                color: "var(--saffron-light)",
                fontWeight: 600,
              }}
            >
              {scheme.level} SCHEME
            </span>
            {scheme.isActive && (
              <span
                style={{
                  padding: "4px 12px",
                  background: "rgba(26,122,74,0.2)",
                  borderRadius: 100,
                  fontSize: 12,
                  color: "#4ADE80",
                  fontWeight: 600,
                }}
              >
                ● ACTIVE
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "clamp(24px, 4vw, 42px)",
              color: "white",
              lineHeight: 1.2,
              marginBottom: 12,
              maxWidth: 800,
            }}
          >
            {scheme.name}
          </h1>

          {/* Hindi name */}
          {scheme.nameHindi && (
            <div
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 20,
                fontFamily: "'Tiro Devanagari Hindi', serif",
              }}
            >
              {scheme.nameHindi}
            </div>
          )}

          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.7,
              maxWidth: 700,
              marginBottom: 32,
            }}
          >
            {scheme.description}
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {scheme.applicationUrl && (
              <a
                href={scheme.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
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
                Apply Now →
              </a>
            )}
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
        </div>
      </div>

      {/* ── Content ── */}
      <div
        className="container-main"
        style={{ paddingTop: 48, paddingBottom: 80 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: 32,
            alignItems: "start",
          }}
        >
          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Benefits */}
            {scheme.benefits.length > 0 && (
              <Card>
                <SectionHeader title="Benefits" />
                {scheme.benefits.map((benefit, i) => (
                  <ListItem key={i} text={benefit} index={i} type="check" />
                ))}
              </Card>
            )}

            {/* Eligibility */}
            {eligibilityPoints.length > 0 && (
              <Card>
                <SectionHeader title="Eligibility Criteria" />
                {eligibilityPoints.map((point, i) => (
                  <ListItem key={i} text={point} index={i} type="bullet" />
                ))}
              </Card>
            )}

            {/* Application process */}
            {scheme.applicationProcess.length > 0 && (
              <Card>
                <SectionHeader title="How to Apply" />
                {scheme.applicationProcess.map((step, i) => (
                  <ListItem key={i} text={step} index={i} type="numbered" />
                ))}
              </Card>
            )}

            {/* Required documents */}
            {scheme.requiredDocuments.length > 0 && (
              <Card>
                <SectionHeader title="Required Documents" />
                <div
                  style={{
                    background: "var(--saffron-pale)",
                    border: "1px solid rgba(255,107,0,0.15)",
                    borderRadius: 10,
                    padding: "12px 16px",
                    marginBottom: 16,
                    fontSize: 13,
                    color: "var(--saffron)",
                    fontWeight: 500,
                  }}
                >
                  💡 Keep photocopies of all documents ready before applying.
                </div>
                {scheme.requiredDocuments.map((doc, i) => (
                  <ListItem key={i} text={doc} index={i} type="document" />
                ))}
              </Card>
            )}
          </div>

          {/* ── Right column (sticky sidebar) ── */}
          <div
            style={{
              position: "sticky",
              top: 24,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >

            {/* Quick info card */}
            <Card>
              <SectionHeader title="Quick Info" />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { label: "Ministry", value: scheme.ministry },
                  { label: "Level", value: scheme.level },
                  ...(scheme.state ? [{ label: "State", value: scheme.state }] : []),
                  {
                    label: "Application Mode",
                    value: scheme.applicationMode.join(", ") || "—",
                  },
                  {
                    label: "Deadline",
                    value: scheme.deadline
                      ? new Date(scheme.deadline).toLocaleDateString("en-IN")
                      : "No deadline (always open)",
                  },
                  {
                    label: "Last Updated",
                    value: scheme.lastFetchedAt
                      ? new Date(scheme.lastFetchedAt).toLocaleDateString("en-IN")
                      : "—",
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        marginBottom: 4,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        color: "var(--text-primary)",
                        fontWeight: 500,
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tags */}
            {scheme.tags.length > 0 && (
              <Card>
                <SectionHeader title="Tags" />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {scheme.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: "5px 12px",
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
              </Card>
            )}

              {/* Apply CTA */}
            {scheme.applicationUrl ? (
                <Card
                  style={{
                    background: "var(--navy)",
                    border: "none",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "white",
                      marginBottom: 8,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Ready to apply?
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.6)",
                      marginBottom: 20,
                      lineHeight: 1.5,
                    }}
                  >
                    Visit the official government portal to submit your application.
                  </p>
                  <a
                    href={scheme.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      padding: "14px",
                      background: "var(--saffron)",
                      color: "white",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 15,
                      textDecoration: "none",
                      boxShadow: "0 8px 24px rgba(255,107,0,0.35)",
                    }}
                  >
                    Apply on Official Portal →
                  </a>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 11,
                      color: "rgba(255,255,255,0.35)",
                    }}
                  >
                    You will be redirected to the official government website
                  </div>
                </Card>
              ) : null}

            {/* Back to results */}
            <Link
              href="/find-schemes"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px",
                background: "white",
                border: "1.5px solid var(--border)",
                borderRadius: 10,
                color: "var(--navy)",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              ← Check My Eligibility
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}