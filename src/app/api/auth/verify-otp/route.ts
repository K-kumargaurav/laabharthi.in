// src/app/api/auth/verify-otp/route.ts
// POST /api/auth/verify-otp
// Verifies OTP and returns session token via NextAuth.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOTP } from "@/lib/otp";

const Schema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().length(6),
});

export async function POST(req: NextRequest) {
  let phone: string;
  let otp: string;

  try {
    const body = await req.json();
    const parsed = Schema.parse(body);
    phone = parsed.phone;
    otp = parsed.otp;
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }

  const result = await verifyOTP(phone, otp);

  if (!result.valid) {
    return NextResponse.json({ error: result.message }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}