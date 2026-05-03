// src/lib/otp.ts
// Handles OTP generation, sending via MSG91, and verification.
// OTPs are stored in Redis with a 10-minute TTL.

import { redis } from "@/lib/redis";
import axios from "axios";

const OTP_TTL_SECONDS = 600; // 10 minutes
const OTP_PREFIX = "otp:";
const IS_DEV = process.env.NODE_ENV === "development";

// ─── Generate ─────────────────────────────────────────────────────────────────

function generateOTP(): string {
  // 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Send ─────────────────────────────────────────────────────────────────────

export async function sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
  // Validate Indian phone number
  const cleaned = phone.replace(/\D/g, "");
  const isValid = /^[6-9]\d{9}$/.test(cleaned);
  if (!isValid) {
    return { success: false, message: "Invalid phone number" };
  }

  const otp = generateOTP();
  const key = `${OTP_PREFIX}${cleaned}`;

  // Store OTP in Redis with TTL
  await redis.setex(key, OTP_TTL_SECONDS, otp);

  // In development — skip SMS, log OTP to console
  if (IS_DEV) {
    console.log(`\n🔐 DEV OTP for ${cleaned}: ${otp}\n`);
    return { success: true, message: "OTP sent (check console in dev mode)" };
  }

  // In production — send via MSG91
  try {
    await axios.get("https://api.msg91.com/api/v5/otp", {
      params: {
        authkey: process.env.MSG91_AUTH_KEY,
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: `91${cleaned}`, // MSG91 needs country code
        otp,
      },
    });

    return { success: true, message: "OTP sent successfully" };
  } catch (err) {
    console.error("MSG91 error:", err);
    // Don't expose internal errors to client
    return { success: false, message: "Failed to send OTP. Try again." };
  }
}

// ─── Verify ───────────────────────────────────────────────────────────────────

export async function verifyOTP(
  phone: string,
  otp: string
): Promise<{ valid: boolean; message: string }> {
  const cleaned = phone.replace(/\D/g, "");
  const key = `${OTP_PREFIX}${cleaned}`;

  const stored = await redis.get(key);

  if (!stored) {
    return { valid: false, message: "OTP expired or not found. Request a new one." };
  }

  if (stored !== otp.trim()) {
    return { valid: false, message: "Incorrect OTP. Please try again." };
  }

  // Delete OTP after successful verification — one-time use
  await redis.del(key);

  return { valid: true, message: "OTP verified successfully" };
}