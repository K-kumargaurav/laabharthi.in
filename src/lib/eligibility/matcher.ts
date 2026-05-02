// src/lib/eligibility/matcher.ts
// Core eligibility matching engine.
// Takes a user profile and a list of schemes,
// runs all rule checks, and returns ranked results.

import type { UserProfile, Scheme } from "@prisma/client";
import {
  checkAge,
  checkGender,
  checkCaste,
  checkIncome,
  checkResidence,
  checkBPL,
  checkOccupation,
  checkFarmer,
  checkDisability,
  checkWidow,
  checkMinority,
  checkState,
  parseCriteria,
  type RuleResult,
  type EligibilityScore,
} from "./rules";

export interface MatchedScheme {
  scheme: Scheme;
  score: number;
  isEligible: boolean;
  matchReasons: string[];   // Why they qualify
  failReasons: string[];    // Why they don't qualify (partial matches)
}

// All rule checkers in one array — easy to add new rules later
const RULE_CHECKERS = [
  checkAge,
  checkGender,
  checkCaste,
  checkIncome,
  checkResidence,
  checkBPL,
  checkOccupation,
  checkFarmer,
  checkDisability,
  checkWidow,
  checkMinority,
  checkState,
];

/**
 * Score a single scheme against a user profile.
 * Returns a score 0-100 and pass/fail reasons.
 */
export function scoreScheme(
  profile: Partial<UserProfile>,
  scheme: Scheme
): EligibilityScore {
  const criteria = parseCriteria(scheme.eligibilityCriteria);
  const passed: RuleResult[] = [];
  const failed: RuleResult[] = [];

  // Run all rule checkers
  for (const checker of RULE_CHECKERS) {
    const result = checker(profile, criteria);
    if (result === null) continue; // Rule not applicable to this scheme

    if (result.passed) {
      passed.push(result);
    } else {
      failed.push(result);
    }
  }

  // Calculate score
  // Score = (sum of passed weights) / (sum of all weights) * 100
  const totalWeight = [...passed, ...failed].reduce((sum, r) => sum + r.weight, 0);
  const passedWeight = passed.reduce((sum, r) => sum + r.weight, 0);

  // If no rules apply to this scheme, it's universally eligible → score 70
  const score = totalWeight === 0
    ? 70
    : Math.round((passedWeight / totalWeight) * 100);

  // A scheme is eligible only if NO hard rules (weight >= 9) failed
  const hardRuleFailed = failed.some((r) => r.weight >= 9);
  const isEligible = !hardRuleFailed;

  return {
    schemeId: scheme.id,
    score: isEligible ? score : Math.min(score, 40), // Cap ineligible at 40
    passed,
    failed,
    isEligible,
  };
}

/**
 * Match a user profile against all provided schemes.
 * Returns schemes sorted by score (highest first).
 * Eligible schemes always ranked above ineligible ones.
 */
export function matchSchemes(
  profile: Partial<UserProfile>,
  schemes: Scheme[]
): MatchedScheme[] {
  const results: MatchedScheme[] = schemes.map((scheme) => {
    const eligibility = scoreScheme(profile, scheme);

    return {
      scheme,
      score: eligibility.score,
      isEligible: eligibility.isEligible,
      matchReasons: eligibility.passed.map((r) => r.reason),
      failReasons: eligibility.failed.map((r) => r.reason),
    };
  });

  // Sort: eligible first, then by score descending
  return results.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1;
    if (!a.isEligible && b.isEligible) return 1;
    return b.score - a.score;
  });
}
