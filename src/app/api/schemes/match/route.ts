// src/app/api/schemes/match/route.ts
// POST /api/schemes/match
// Takes a user profile and returns matched schemes ranked by eligibility score.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { matchSchemes } from "@/lib/eligibility/matcher";

// ─── Input validation schema ───────────────────────────────────────────────────
// Zod validates the request body at runtime — catches invalid data before
// it ever reaches the matcher or database.

const MatchRequestSchema = z.object({
  // Demographics
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  caste: z.enum(["GENERAL", "OBC", "SC", "ST", "EWS"]).optional(),

  // Geography
  state: z.string().optional(),
  district: z.string().optional(),
  isRural: z.boolean().optional(),

  // Economic
  annualIncome: z.number().positive().optional(),
  bplCardHolder: z.boolean().optional(),

  // Employment
  employmentStatus: z.enum([
    "EMPLOYED", "SELF_EMPLOYED", "UNEMPLOYED", "STUDENT", "RETIRED"
  ]).optional(),
  occupation: z.string().optional(),

  // Special categories
  isDisabled: z.boolean().optional(),
  isWidow: z.boolean().optional(),
  isFarmer: z.boolean().optional(),
  isMinority: z.boolean().optional(),
  landHoldingAcres: z.number().optional(),

  // Filters
  limit: z.number().int().min(1).max(100).default(20),
  onlyEligible: z.boolean().default(false),
});

export type MatchRequest = z.infer<typeof MatchRequestSchema>;

export async function POST(req: NextRequest) {
  // Parse and validate request body
  let input: MatchRequest;
  try {
    const body = await req.json();
    input = MatchRequestSchema.parse(body);
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request", details: err },
      { status: 400 }
    );
  }

  // Fetch all active schemes from DB
  // In production with 10k+ schemes, we'd add filters here to narrow down
  // before running the full matcher (by state, category, etc.)
  const schemes = await prisma.scheme.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  // Build profile object for matcher
  const profile = {
    dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
    gender: input.gender,
    caste: input.caste,
    state: input.state,
    district: input.district,
    isRural: input.isRural,
    annualIncome: input.annualIncome,
    bplCardHolder: input.bplCardHolder ?? false,
    occupation: input.occupation,
    isDisabled: input.isDisabled ?? false,
    isWidow: input.isWidow ?? false,
    isFarmer: input.isFarmer ?? false,
    isMinority: input.isMinority ?? false,
    landHoldingAcres: input.landHoldingAcres,
  };

  // Run the matcher
  const matched = matchSchemes(profile, schemes);

  // Apply filters
  const filtered = input.onlyEligible
    ? matched.filter((m) => m.isEligible)
    : matched;

  // Return top N results
  const results = filtered.slice(0, input.limit).map((m) => ({
    scheme: {
      id: m.scheme.id,
      slug: m.scheme.slug,
      name: m.scheme.name,
      nameHindi: m.scheme.nameHindi,
      description: m.scheme.description,
      ministry: m.scheme.ministry,
      level: m.scheme.level,
      tags: m.scheme.tags,
      applicationUrl: m.scheme.applicationUrl,
      applicationMode: m.scheme.applicationMode,
    },
    score: m.score,
    isEligible: m.isEligible,
    matchReasons: m.matchReasons,
    failReasons: m.failReasons,
  }));

  return NextResponse.json({
    total: filtered.length,
    returned: results.length,
    results,
  });
}