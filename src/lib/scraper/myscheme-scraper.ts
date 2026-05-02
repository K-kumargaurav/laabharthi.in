// src/lib/scraper/myscheme-scraper.ts
import * as cheerio from "cheerio";
import pLimit from "p-limit";
import pRetry from "p-retry";
import { prisma } from "@/lib/prisma";
import type { RawScheme, ScrapeResult } from "@/types/scheme";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = "https://myscheme.gov.in";
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;

// Max 2 concurrent requests - respectful to govt infrastructure.
const limit = pLimit(2);

// Bot user agent - descriptive so govt can whitelist us.
const USER_AGENT =
  "Mozilla/5.0 (compatible; LaabharthiBot/1.0; +https://laabharthi.in/bot)";

// ─── Fetcher ────────────────────────────────────────────────────────────────

/**
 * FEtch a URL with:
 * - Random delay between requests (avoid rate limiting)
 * - Automatic retry with exponential backoff on failure
 * - 15 second timeout per request
 */
async function fetchWithGuardrails(url: string): Promise<string> {
  // Random delay: 1-3 seconds between each request
  await sleep(randomBetween(1000, 3000));

  return pRetry(
    async () => {
      const res = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-IN, en;q=0.9",
        },
        signal: AbortSignal.timeout(15_000), // 15s timeout
      });

      // 429 = "Too Many Requests" - back off and retry
      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        const waitMs = retryAfter ? parseInt(retryAfter) * 1000 : 30_000;
        console.warn(`Rate limited on ${url}, waiting${waitMs}ms`);
        await sleep(waitMs);
        throw new Error("Rate Limited"); // pRetry will catch and retry
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }

      return res.text();
    },
    {
      retries: 3,
      factor: 2, // Exponential: 2s → 4s → 8s between retries
      minTimeout: 2000,
      onFailedAttempt: (err) => {
        console.warn(
          `Attempt ${err.attemptNumber} failed for ${url}: ${String(err)}`,
        );
      },
    },
  );
}

// ─── Sitemap Parser ────────────────────────────────────────────────────────────────
/**
 * Fetches the sitemap and extracts all scheme page URLs.
 * Using the sitemap is the correct way to scrape - it's meant for bots.
 */
async function fetchSchemeUrls(limitUrls?: number): Promise<string[]> {
  console.log("Fetching sitemap...");
  const xml = await fetchWithGuardrails(SITEMAP_URL);

  // cheerio parses HTML/XML - like jQuery but on the server
  const $ = cheerio.load(xml, { xmlMode: true });

  const urls = $("url > loc")
    .toArray()
    .map((el) => $(el).text().trim())
    .filter((url) => url.includes("/schemes")); // only scheme pages

  console.log(`Found ${urls.length} scheme URLs in sitemap`);

  // limitsUrls is useful during development - scraps only 10 to test
  return limitUrls ? urls.slice(0, limitUrls) : urls;
}

// ─── Page Parser ────────────────────────────────────────────────────────────────

/**
 * Extracts scheme data from a page
 *
 * myscheme.gov.in is built with Next.js — all page data is embedded
 * in a <script id="__NEXT_DATA__"> tag as JSON.
 * Parsing this is far more reliable than scraping HTML elements,
 * because JSON structure is stable even when the UI changes.
 */
function parseSchemePage(html: string, url: string): RawScheme | null {
  const $ = cheerio.load(html);

  // Try the Next.js data first (most reliable)
  const nextDataScript = $("#__NEXT_DATA__").text();

  if (nextDataScript) {
    try {
      const nextData = JSON.parse(nextDataScript);

      // Navigate the Next.js page props to find scheme data
      // This path may need adjustment if myscheme.gov.in updates their structure
      const scheme =
        nextData?.props?.pageProps?.schemaData ||
        nextData?.props?.pageProps?.scheme ||
        nextData?.props?.pageProps?.data;

      if (scheme) {
        return mapToRawScheme(scheme, url);
      }
    } catch (err) {
      console.warn(`Failed to parse __NEXT_DATA__ for ${url}:`, err);
    }
  }
  // Fallback: extract from HTML meta tags (less reliable but better than nothing)
  return extractFromMeta($, url);
}

/**
 * Maps raw Next.js page data to our RawScheme type.
 * Field names here are based on myscheme.gov.in's data structure.
 * May need updates if they change their schema.
 */
function mapToRawScheme(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>,
  url: string,
): RawScheme {
  const slug = extractSlugFromUrl(url);

  return {
    slug,
    sourceUrl: url,
    externalId: data.id?.toString() || data.schemeId?.toString(),
    name: data.schemeName || data.name || "",
    nameHindi: data.schemeNameHindi || data.nameHindi,
    description: data.briefDescription || data.description || "",
    detailedDescription: data.detailedDescription || data.fullDescription,
    ministry: data.nodalMinistryName || data.ministry || "Unknown",
    department: data.department || data.departmentName,
    level: inferLevel(data),
    state: data.state || data.stateName || null,
    district: data.district || null,
    eligibilityCriteria: parseEligibility(data),
    benefits: toStringArray(data.benefits || data.benefitsList),
    applicationProcess: toStringArray(
      data.applicationProcess || data.howToApply,
    ),
    requiredDocuments: toStringArray(
      data.requiredDocuments || data.documents || data.documentsList,
    ),
    tags: toStringArray(data.tags || data.keywords || data.categories),
    applicationUrl: data.applicationUrl || data.applyUrl || data.externalUrl,
    applicationMode: toStringArray(
      data.applicationMode || data.modeOfApplication,
    ),
    deadline: data.deadline ? new Date(data.deadline) : undefined,
  };
}

/** Fallback: extract minimal data from HTML meta tags */
function extractFromMeta($: cheerio.CheerioAPI, url: string): RawScheme | null {
  const name = $("h1").first().text().trim();

  // If we can't find even the name, skip this page
  if (!name) return null;

  return {
    slug: extractSlugFromUrl(url),
    sourceUrl: url,
    name,
    description: $('meta[name="description"]').attr("content") || "",
    ministry:
      $(".ministry-name, [class*='ministry']").first().text().trim() ||
      "Unknown",
    level: "CENTRAL",
    eligibilityCriteria: {},
    benefits: [],
    applicationProcess: [],
    requiredDocuments: [],
    tags: [],
    applicationMode: [],
  };
}

// ─── Database Writer ───────────────────────────────────────────────────────────

/**
 * Upserts a scheme into the database.
 * Upsert = Insert if not exists, Update if exists.
 * This makes the scraper fully idempotent — safe to run multiple times.
 */
async function persistScheme(raw: RawScheme): Promise<void> {
  await prisma.scheme.upsert({
    where: { slug: raw.slug },
    update: {
      name: raw.name,
      nameHindi: raw.nameHindi,
      description: raw.description,
      detailedDescription: raw.detailedDescription,
      ministry: raw.ministry,
      department: raw.department,
      level: raw.level,
      state: raw.state,
      district: raw.district,
      eligibilityCriteria: raw.eligibilityCriteria as object,
      benefits: raw.benefits,
      applicationProcess: raw.applicationProcess,
      requiredDocuments: raw.requiredDocuments,
      tags: raw.tags,
      applicationUrl: raw.applicationUrl,
      applicationMode: raw.applicationMode,
      deadline: raw.deadline,
      sourceUrl: raw.sourceUrl,
      lastFetchedAt: new Date(),
      isActive: true,
    },
    create: {
      slug: raw.slug,
      externalId: raw.externalId,
      sourceUrl: raw.sourceUrl,
      name: raw.name,
      nameHindi: raw.nameHindi,
      description: raw.description,
      detailedDescription: raw.detailedDescription,
      ministry: raw.ministry,
      department: raw.department,
      level: raw.level,
      state: raw.state,
      district: raw.district,
      eligibilityCriteria: raw.eligibilityCriteria as object,
      benefits: raw.benefits,
      applicationProcess: raw.applicationProcess,
      requiredDocuments: raw.requiredDocuments,
      tags: raw.tags,
      applicationUrl: raw.applicationUrl,
      applicationMode: raw.applicationMode,
      deadline: raw.deadline,
      lastFetchedAt: new Date(),
    },
  });
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Main scrape function — called by the BullMQ worker.
 * Fetches all scheme URLs from sitemap, then scrapes each one
 * with controlled concurrency and error isolation.
 */
export async function runMySchemeScrape(
  limitUrls?: number,
): Promise<ScrapeResult> {
  const startTime = Date.now();
  console.log("Starting myScheme scrape job...");

  const urls = await fetchSchemeUrls(limitUrls);

  let scraped = 0;
  let failed = 0;
  let skipped = 0;

  // Process all URLs with controlled concurrency (max 2 at a time)
  await Promise.all(
    urls.map((url) =>
      limit(async () => {
        try {
          const html = await fetchWithGuardrails(url);
          const scheme = parseSchemePage(html, url);

          if (!scheme) {
            console.warn(`Skipping ${url} — could not parse scheme data`);
            skipped++;
            return;
          }

          await persistScheme(scheme);
          scraped++;
          console.log(`✓ Scraped: ${scheme.name}`);
        } catch (err) {
          failed++;
          // Log but don't throw — let other URLs continue processing
          console.error(`✗ Failed: ${url}`, err);
        }
      }),
    ),
  );

  const result: ScrapeResult = {
    scraped,
    failed,
    skipped,
    durationMs: Date.now() - startTime,
  };

  console.log(
    `Scrape complete: ${scraped} scraped, ${failed} failed, ${skipped} skipped in ${result.durationMs}ms`,
  );

  return result;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function extractSlugFromUrl(url: string): string {
  // "https://myscheme.gov.in/schemes/pm-kisan" → "pm-kisan"
  return url.split("/").filter(Boolean).pop() ?? url;
}

function inferLevel(
  data: Record<string, unknown>,
): "CENTRAL" | "STATE" | "DISTRICT" {
  if (data.district) return "DISTRICT";
  if (data.state || data.stateName) return "STATE";
  return "CENTRAL";
}

function parseEligibility(
  data: Record<string, unknown>,
): Record<string, unknown> {
  // Eligibility data comes in many shapes from myscheme.gov.in
  // Normalise to a consistent object
  if (data.eligibility && typeof data.eligibility === "object") {
    return data.eligibility as Record<string, unknown>;
  }
  if (
    data.eligibilityCriteria &&
    typeof data.eligibilityCriteria === "object"
  ) {
    return data.eligibilityCriteria as Record<string, unknown>;
  }
  return {};
}

function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.description || item?.text || JSON.stringify(item),
      )
      .filter(Boolean);
  }
  if (typeof val === "string" && val.trim()) return [val.trim()];
  return [];
}
