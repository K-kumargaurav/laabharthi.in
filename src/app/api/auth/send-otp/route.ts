// src/app/api/auth/send-otp/route.ts
// POST /api/auth/send-otp
// Validates phone number and sends OTP via MSG91.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendOTP } from "@/lib/otp";

const Schema = z.object({
  phone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
});

export async function POST(req: NextRequest) {
  let phone: string;

  try {
    const body = await req.json();
    const parsed = Schema.parse(body);
    phone = parsed.phone;
  } catch {
    return NextResponse.json(
      { error: "Invalid phone number" },
      { status: 400 }
    );
  }

  const result = await sendOTP(phone);

  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: result.message });
}