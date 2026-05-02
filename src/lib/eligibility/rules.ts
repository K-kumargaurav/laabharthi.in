// src/lib/eligibility/rules.ts
// Individual eligibility rule checkers.
// Each function takes a user profile + scheme criteria and returns
// a RuleResult — whether the rule passed and why.

import type { UserProfile, Scheme } from "@prisma/client";

export interface RuleResult {
  passed: boolean;
  reason: string;
  weight: number; // How important is this rule (1-10)
}

export interface EligibilityScore {
  schemeId: string;
  score: number;        // 0-100
  passed: RuleResult[];
  failed: RuleResult[];
  isEligible: boolean;  // true if no hard rules failed
}

// ─── Type for eligibility criteria JSON ───────────────────────────────────────
// This mirrors the structure we store in the DB per scheme

interface EligibilityCriteria {
  minAge?: number;
  maxAge?: number;
  gender?: string[];
  caste?: string[];
  minIncome?: number;
  maxIncome?: number;
  residence?: "rural" | "urban" | "both";
  bplRequired?: boolean;
  occupation?: string[];
  isDisabledRequired?: boolean;
  isWidowRequired?: boolean;
  isFarmerRequired?: boolean;
  isMinorityRequired?: boolean;
  states?: string[];          // if empty/absent = all states
  educationLevel?: string[];
  maritalStatus?: string[];
}

// ─── Individual Rule Checkers ─────────────────────────────────────────────────

export function checkAge(
  profile: Partial<UserProfile>,
  criteria: EligibilityCriteria
): RuleResult | null {
  if (!criteria.minAge && !criteria.maxAge) return null; // Rule not applicable

  if (!profile.dateOfBirth) {
    return {
      passed: false,
      reason: "Age not provided in profile",
      weight: 8,
    };
  }

  const age = calculateAge(profile.dateOfBirth);

  if (criteria.minAge && age < criteria.minAge) {
    return {
      passed: false,
      reason: `Must be at least ${criteria.minAge} years old (you are ${age})`,
      weight: 10,
    };
  }

  if (criteria.maxAge && age > criteria.maxAge) {
    return {
      passed: false,
      reason: `Must be at most ${criteria.maxAge} years old (you are ${age})`,
      weight: 10,
    };
  }

  return {
    passed: true,
    reason: `Age ${age} meets requirement (${criteria.minAge ?? 0}-${criteria.maxAge ?? "no limit"})`,
    weight: 8,
  };
}

export function checkGender(
  profile: Partial<UserProfile>,
  criteria: EligibilityCriteria
): RuleResult | null {
  if (!criteria.gender || criteria.gender.length === 0) return null;

  if (!profile.gender) {
    return {
      passed: false,
      reason: "Gender not provided in profile",
      weight: 9,
    };
  }

  const matches = criteria.gender.includes(profile.gender);
  return {
    passed: matches,
    reason: matches
      ? `Gender ${profile.gender} is eligible`
      : `This scheme is only for: ${criteria.gender.join(", ")}`,
    weight: 10,
  };
}

export function checkCaste(
  profile: Partial<UserProfile>,
  criteria: EligibilityCriteria
): RuleResult | null {
  if (!criteria.caste || criteria.caste.length === 0) return null;

  if (!profile.caste) {
    return {
      passed: false,
      reason: "Caste not provided in profile",
      weight: 7,
    };
  }

  const matches = criteria.caste.includes(profile.caste);
  return {
    passed: matches,
    reason: matches
      ? `Caste category ${profile.caste} is eligible`
      : `This scheme is for: ${criteria.caste.join(", ")} only`,
    weight: 9,
  };
}

export function checkIncome(
  profile: Partial<UserProfile>,
  criteria: EligibilityCriteria
): RuleResult | null {
  if (!criteria.minIncome && !criteria.maxIncome) return null;

  if (profile.annualIncome === null || profile.annualIncome === undefined) {
    return {
      passed: false,
      reason: "Annual income not provided in profile",
      weight: 7,
    };
  }

  if (criteria.maxIncome && profile.annualIncome > criteria.maxIncome) {
    return {
      passed: false,
      reason: `Income ₹${profile.annualIncome.toLocaleString("en-IN")} exceeds limit of ₹${criteria.maxIncome.toLocaleString("en-IN")}`,
      weight: 9,
    };
  }

  if (criteria.minIncome && profile.annualIncome < criteria.minIncome) {
    return {
      passed: false,
      reason: `Income ₹${profile.annualIncome.toLocaleString("en-IN")} is below minimum of ₹${criteria.minIncome.toLocaleString("en-IN")}`,
      weight: 9,
    };
  }

  return {
    passed: true,
    reason: `Income ₹${profile.annualIncome.toLocaleString("en-IN")} is within eligible range`,
    weight: 7,
  };
}

export function checkResidence(
  profile: Partial<UserProfile>,
  criteria: EligibilityCriteria
): RuleResult | null {
  if (!criteria.residence || criteria.residence === "both") return null;

  if (profile.isRural === null || profile.isRural === undefined) {
    return {
      passed: false,
      reason: "Rural/urban status not provided in profile",
      weight: 6,
    };
  }

  const isRuralScheme = criteria.residence === "rural";
  const matches = isRuralScheme === profile.isRural;

  return {
    passed: matches,
    reason: matches
      ? `Residence type matches (${criteria.residence})`
      : `This scheme is for ${criteria.residence} residents only`,
    weight: 8,
  };
}

export function checkBPL(
  profile: Partial<UserProfile>,
  criteria: EligibilityCriteria
): RuleResult | null {
  if (!criteria.bplRequired) return null;

  const hasBPL = profile.bplCardHolder === true;
  return {
    passed: hasBPL,
    reason: hasBPL
      ? "BPL card holder — eligible"
      : "This scheme requires a BPL (Below Poverty Line) card",
    weight: 9,
  };
}

export function checkOccupation(
  profile: Partial<UserProfile>,
  criteria: EligibilityCriteria
): RuleResult | null {
  if (!criteria.occupation || criteria.occupation.length === 0) return null;

  if (!profile.occupation) {
    return {
      passed: false,
      reason: "Occupation not provided in profile",
      weight: 6,
    };
  }

  const profileOccupation = profile.occupation.toLowerCase();
  const matches = criteria.occupation.some((occ) =>
    profileOccupation.includes(occ.toLowerCase())
  );

  return {
    passed: matches,
    reason: matches
      ? `Occupation "${profile.occupation}" is eligible`
      : `This scheme is for: ${criteria.occupation.join(", ")}`,
    weight: 8,
  };
}

export function checkFarmer(
  profile: Partial<UserProfile>,
  criteria: EligibilityCriteria
): RuleResult | null {
  if (!criteria.isFarmerRequired) return null;

  const isFarmer = profile.isFarmer === true;
  return {
    passed: isFarmer,
    reason: isFarmer
      ? "Farmer status confirmed — eligible"
      : "This scheme is only for farmers",
    weight: 9,
  };
}

export function checkDisability(
  profile: Partial<UserProfile>,
  criteria: EligibilityCriteria
): RuleResult | null {
  if (!criteria.isDisabledRequired) return null;

  const isDisabled = profile.isDisabled === true;
  return {
    passed: isDisabled,
    reason: isDisabled
      ? "Disability status confirmed — eligible"
      : "This scheme requires a disability certificate",
    weight: 9,
  };
}

export function checkWidow(
  profile: Partial<UserProfile>,
  criteria: EligibilityCriteria
): RuleResult | null {
  if (!criteria.isWidowRequired) return null;

  const isWidow = profile.isWidow === true;
  return {
    passed: isWidow,
    reason: isWidow
      ? "Widow status confirmed — eligible"
      : "This scheme is only for widows",
    weight: 9,
  };
}

export function checkMinority(
  profile: Partial<UserProfile>,
  criteria: EligibilityCriteria
): RuleResult | null {
  if (!criteria.isMinorityRequired) return null;

  const isMinority = profile.isMinority === true;
  return {
    passed: isMinority,
    reason: isMinority
      ? "Minority status confirmed — eligible"
      : "This scheme is for minority communities only",
    weight: 8,
  };
}

export function checkState(
  profile: Partial<UserProfile>,
  criteria: EligibilityCriteria
): RuleResult | null {
  if (!criteria.states || criteria.states.length === 0) return null;

  if (!profile.state) {
    return {
      passed: false,
      reason: "State not provided in profile",
      weight: 7,
    };
  }

  const matches = criteria.states.some(
    (s) => s.toLowerCase() === profile.state!.toLowerCase()
  );

  return {
    passed: matches,
    reason: matches
      ? `State ${profile.state} is covered by this scheme`
      : `This scheme is only available in: ${criteria.states.join(", ")}`,
    weight: 9,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function parseCriteria(raw: unknown): EligibilityCriteria {
  // Safely parse the JSON criteria from DB
  if (!raw || typeof raw !== "object") return {};
  return raw as EligibilityCriteria;
}