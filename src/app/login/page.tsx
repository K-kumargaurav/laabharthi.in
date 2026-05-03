// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Step = "phone" | "otp";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  border: "1.5px solid var(--border)",
  background: "white",
  fontSize: 18,
  color: "var(--text-primary)",
  outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  letterSpacing: "0.04em",
  textAlign: "center",
};

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // ── Send OTP ────────────────────────────────────────────────────────────────

  const handleSendOTP = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleaned }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        return;
      }

      setStep("otp");
      startResendTimer();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP + Sign in ────────────────────────────────────────────────────

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    const cleaned = phone.replace(/\D/g, "");

    try {
      const result = await signIn("phone-otp", {
        phone: cleaned,
        otp,
        redirect: false,
      });

      if (result?.error) {
        setError("Incorrect OTP or OTP expired. Try again.");
        return;
      }

      // Success — redirect to find-schemes
      router.push("/find-schemes");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend timer ────────────────────────────────────────────────────────────

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setOtp("");
    setError("");
    await handleSendOTP();
  };

  // ── OTP input handler ───────────────────────────────────────────────────────

  const handleOTPChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 6);
    setOtp(digits);
    if (digits.length === 6) {
      // Auto-submit when 6 digits entered
      setTimeout(() => {
        document.getElementById("verify-btn")?.click();
      }, 100);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

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
      {/* Background pattern */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255,107,0,0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(11,31,58,0.04) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: "var(--saffron)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                🇮🇳
              </div>
              <span
                style={{
                  fontFamily: "'Tiro Devanagari Hindi', serif",
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--navy)",
                }}
              >
                Laabharthi
              </span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: "40px 36px",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {step === "phone" ? (
            <>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--navy)",
                  marginBottom: 8,
                  fontFamily: "'DM Sans', sans-serif",
                  textAlign: "center",
                }}
              >
                Sign in
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  marginBottom: 32,
                  lineHeight: 1.5,
                }}
              >
                Enter your mobile number to receive a one-time password
              </p>

              {/* Phone input */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1.5px solid var(--border)",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "white",
                  }}
                >
                  <div
                    style={{
                      padding: "14px 16px",
                      background: "var(--cream-dark)",
                      borderRight: "1.5px solid var(--border)",
                      fontSize: 16,
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                    style={{
                      ...inputStyle,
                      border: "none",
                      borderRadius: 0,
                      textAlign: "left",
                      flex: 1,
                      fontSize: 16,
                    }}
                    autoFocus
                    maxLength={10}
                  />
                </div>
              </div>

              {error && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#DC2626",
                    marginBottom: 16,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading || phone.length !== 10}
                style={{
                  width: "100%",
                  padding: "15px",
                  background:
                    loading || phone.length !== 10
                      ? "var(--text-muted)"
                      : "var(--navy)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor:
                    loading || phone.length !== 10 ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Sending OTP..." : "Send OTP →"}
              </button>
            </>
          ) : (
            <>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--navy)",
                  marginBottom: 8,
                  fontFamily: "'DM Sans', sans-serif",
                  textAlign: "center",
                }}
              >
                Enter OTP
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  marginBottom: 8,
                  lineHeight: 1.5,
                }}
              >
                Sent to +91 {phone}
              </p>

              {/* Dev mode hint */}
              {process.env.NODE_ENV === "development" && (
                <div
                  style={{
                    padding: "8px 14px",
                    background: "#F0FDF4",
                    border: "1px solid #BBF7D0",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#15803D",
                    textAlign: "center",
                    marginBottom: 20,
                  }}
                >
                  Dev mode: check your terminal for the OTP
                </div>
              )}

              {/* OTP input */}
              <div style={{ marginBottom: 20 }}>
                <input
                  type="tel"
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => handleOTPChange(e.target.value)}
                  style={{
                    ...inputStyle,
                    fontSize: 32,
                    letterSpacing: "0.3em",
                    padding: "16px",
                  }}
                  autoFocus
                  maxLength={6}
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: "10px 14px",
                    background: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#DC2626",
                    marginBottom: 16,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                id="verify-btn"
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                style={{
                  width: "100%",
                  padding: "15px",
                  background:
                    loading || otp.length !== 6
                      ? "var(--text-muted)"
                      : "var(--saffron)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor:
                    loading || otp.length !== 6 ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Verifying..." : "Verify OTP →"}
              </button>

              {/* Resend */}
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 14,
                    color:
                      resendTimer > 0
                        ? "var(--text-muted)"
                        : "var(--saffron)",
                    cursor: resendTimer > 0 ? "default" : "pointer",
                    fontWeight: 500,
                  }}
                >
                  {resendTimer > 0
                    ? `Resend OTP in ${resendTimer}s`
                    : "Resend OTP"}
                </button>
              </div>

              {/* Change number */}
              <div style={{ textAlign: "center", marginTop: 12 }}>
                <button
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setError("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 13,
                    color: "var(--text-muted)",
                    cursor: "pointer",
                  }}
                >
                  ← Change number
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer note */}
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 20,
            lineHeight: 1.6,
          }}
        >
          By continuing, you agree to our terms. Your data is secure and never shared.
        </p>
      </div>
    </div>
  );
}