// src/app/page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STATS = [
  { value: "26+", label: "Schemes Available" },
  { value: "₹6K", label: "PM Kisan Annual Support" },
  { value: "₹5L", label: "Ayushman Health Cover" },
  { value: "80Cr+", label: "Potential Beneficiaries" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tell us about yourself",
    desc: "Share basic details — age, income, state, occupation. Takes 2 minutes.",
    icon: "👤",
  },
  {
    step: "02",
    title: "We match your profile",
    desc: "Our engine checks 26+ schemes against your eligibility criteria instantly.",
    icon: "⚡",
  },
  {
    step: "03",
    title: "Apply with guidance",
    desc: "Get step-by-step help with documents and application process.",
    icon: "✅",
  },
];

const CATEGORIES = [
  { label: "Agriculture", icon: "🌾", color: "#1A7A4A" },
  { label: "Health", icon: "🏥", color: "#C92A2A" },
  { label: "Housing", icon: "🏠", color: "#1971C2" },
  { label: "Education", icon: "📚", color: "#862E9C" },
  { label: "Employment", icon: "💼", color: "#C9922A" },
  { label: "Women", icon: "👩", color: "#E64980" },
  { label: "Pension", icon: "🧓", color: "#2B8A3E" },
  { label: "Startup", icon: "🚀", color: "#FF6B00" },
];

export default function HomePage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      {/* ── Navbar ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrolled ? "rgba(253,250,245,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid var(--border)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "var(--saffron)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🇮🇳
          </div>
          <span
            style={{
              fontFamily: "'Tiro Devanagari Hindi', serif",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--navy)",
              letterSpacing: "-0.02em",
            }}
          >
            Laabharthi
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {session ? (
            <>
              <span
                style={{
                  fontSize: 14,
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                +91 {(session.user as { phone?: string }).phone}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{
                  padding: "10px 20px",
                  background: "transparent",
                  color: "var(--navy)",
                  border: "1.5px solid var(--border)",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              style={{
                padding: "10px 20px",
                background: "transparent",
                color: "var(--navy)",
                border: "1.5px solid var(--border)",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>
          )}
          <Link
            href="/find-schemes"
            style={{
              padding: "10px 24px",
              background: "var(--saffron)",
              color: "white",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Check Eligibility
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          paddingTop: 64,
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(255,107,0,0.06) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(11,31,58,0.04) 0%, transparent 50%),
              radial-gradient(circle at 60% 80%, rgba(201,146,42,0.05) 0%, transparent 40%)
            `,
          }}
        />

        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: 120,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            border: "1px solid rgba(255,107,0,0.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 160,
            right: -40,
            width: 300,
            height: 300,
            borderRadius: "50%",
            border: "1px solid rgba(255,107,0,0.08)",
          }}
        />

        <div
          className="container-main"
          style={{ position: "relative", zIndex: 1 }}
        >
          <div style={{ maxWidth: 680 }}>
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--saffron-pale)",
                border: "1px solid rgba(255,107,0,0.2)",
                borderRadius: 100,
                padding: "6px 16px",
                marginBottom: 32,
              }}
            >
              <span style={{ fontSize: 12 }}>🇮🇳</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--saffron)",
                  letterSpacing: "0.04em",
                }}
              >
                26+ Central Government Schemes
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(42px, 6vw, 72px)",
                lineHeight: 1.1,
                color: "var(--navy)",
                marginBottom: 24,
              }}
            >
              Find schemes
              <br />
              <span style={{ color: "var(--saffron)" }}>you deserve.</span>
            </h1>

            <p
              style={{
                fontSize: 20,
                lineHeight: 1.7,
                color: "var(--text-secondary)",
                marginBottom: 40,
                maxWidth: 520,
              }}
            >
              Millions of Indians miss out on government benefits they qualify
              for. Tell us about yourself — we'll find every scheme you're
              eligible for in seconds.
            </p>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Link
                href="/find-schemes"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "16px 32px",
                  background: "var(--navy)",
                  color: "white",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 16,
                  textDecoration: "none",
                  boxShadow: "0 8px 24px rgba(11,31,58,0.25)",
                  transition: "all 0.2s",
                }}
              >
                Check My Eligibility
                <span style={{ fontSize: 18 }}>→</span>
              </Link>

              <Link
                href="/find-schemes"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "16px 32px",
                  background: "white",
                  color: "var(--navy)",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 16,
                  textDecoration: "none",
                  border: "1px solid var(--border)",
                  transition: "all 0.2s",
                }}
              >
                Browse Schemes
              </Link>
            </div>

            {/* Trust signals */}
            <div
              style={{
                marginTop: 48,
                display: "flex",
                alignItems: "center",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              {["Free to use", "No login required", "2 min to complete"].map(
                (item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 14,
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span style={{ color: "var(--green)" }}>✓</span>
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section
        style={{
          background: "var(--navy)",
          padding: "64px 24px",
        }}
      >
        <div className="container-main">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 48,
            }}
          >
            {STATS.map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "'Tiro Devanagari Hindi', serif",
                    fontSize: 48,
                    fontWeight: 700,
                    color: "var(--saffron)",
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.6)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section style={{ padding: "96px 24px" }}>
        <div className="container-main">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                color: "var(--navy)",
                marginBottom: 16,
              }}
            >
              Every sector covered
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-secondary)" }}>
              From farming to startups, find schemes for your situation
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: 16,
            }}
          >
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href="/find-schemes"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  padding: "28px 16px",
                  background: "white",
                  borderRadius: 16,
                  border: "1px solid var(--border)",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 32 }}>{cat.icon}</span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--navy)",
                  }}
                >
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        style={{
          background: "var(--cream-dark)",
          padding: "96px 24px",
        }}
      >
        <div className="container-main">
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                color: "var(--navy)",
                marginBottom: 16,
              }}
            >
              How it works
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 32,
            }}
          >
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.step}
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 36,
                  border: "1px solid var(--border)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    right: 20,
                    fontSize: 80,
                    fontFamily: "'Tiro Devanagari Hindi', serif",
                    fontWeight: 700,
                    color: "rgba(255,107,0,0.06)",
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                >
                  {step.step}
                </div>
                <div style={{ fontSize: 36, marginBottom: 16 }}>
                  {step.icon}
                </div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--navy)",
                    marginBottom: 12,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          padding: "96px 24px",
          background: "var(--navy)",
          textAlign: "center",
        }}
      >
        <div className="container-main">
          <h2
            style={{
              fontSize: "clamp(32px, 4vw, 56px)",
              color: "white",
              marginBottom: 20,
            }}
          >
            Don't miss what's yours.
          </h2>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.6)",
              marginBottom: 40,
              maxWidth: 480,
              margin: "0 auto 40px",
            }}
          >
            Thousands of crores in government benefits go unclaimed every year.
            Check your eligibility now — it's free.
          </p>
          <Link
            href="/find-schemes"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "18px 40px",
              background: "var(--saffron)",
              color: "white",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 18,
              textDecoration: "none",
              boxShadow: "0 8px 32px rgba(255,107,0,0.35)",
            }}
          >
            Check My Eligibility — Free
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          background: "#060F1D",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "'Tiro Devanagari Hindi', serif",
            fontSize: 20,
            color: "white",
            marginBottom: 8,
          }}
        >
          Laabharthi
        </div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
          Helping every Indian access benefits they deserve.
        </p>
      </footer>
    </div>
  );
}
