// src/types/scheme.ts
// Shared TypeScript types used across scraper, queue, and API.
// Defining types once here prevents duplications and drifts.

export interface RawScheme {
    slug: string;
    sourceUrl: string;
    externalId?: string;
    name: string;
    nameHindi?: string;
    description: string;
    detailedDescription?: string;
    ministry: string;
    department?: string;
    level: "CENTRAL" | "STATE" | "DISTRICT";
    state?: string;
    district?: string;
    eligibilityCriteria: Record<string, unknown>;
    benefits: string[];
    applicationProcess: string[];
    requiredDocuments: string[];
    tags: string[];
    applicationUrl?: string;
    applicationMode: string[];
    deadline?: Date;
    // isActive: boolean;
    // isVerified: boolean;
    // lastFetchedAt?: Date;
    // lastVerifiedAt?: Date;
    // createdAt: Date;
    // updatedAt: Date;
}

export interface ScrapeResult {
    scraped: number;
    failed: number;
    skipped: number;
    durationMs: number;
}

export interface ScrapeJobData {
    triggeredBy: "scheduler" | "manual";
    limitUrls?: number; // For testing — only scrape N schemes
}