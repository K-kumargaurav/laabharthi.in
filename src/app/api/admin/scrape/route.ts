// src/app/api/admin/scrape/route.ts
// HTTP POST /api/admin/scrape
// Manually triggers a scrape job — useful for testing and bootstrapping data.

import { NextRequest, NextResponse } from "next/server";
import { triggerManualScrape } from "@/lib/queue/scrape-queue";
import { createScrapeWorker } from "@/lib/queue/scrape-queue";
import { z } from "zod";

// Input validation schema — zod validates request body shape at runtime
const TriggerScrapeSchema = z.object({
  limitUrls: z.number().int().positive().max(100).optional(),
  // limitUrls: scrape only N schemes — use this during dev to test quickly
  // e.g. { "limitUrls": 5 } scrapes only 5 schemes
});

// Security: simple admin secret check
// In production, replace with proper admin auth middleware
function isAuthorized(req: NextRequest): boolean {
  const secret = req.headers.get("x-admin-secret");
  return secret === process.env.ADMIN_SECRET;
}

export async function POST(req: NextRequest) {
  // Auth check — never expose scrape triggers publicly
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse + validate request body
  let body: z.infer<typeof TriggerScrapeSchema> = {};
  try {
    const raw = await req.json().catch(() => ({}));
    body = TriggerScrapeSchema.parse(raw);
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body", details: err },
      { status: 400 },
    );
  }

  // Start the worker (processes jobs from the queue)
  createScrapeWorker();

  // Add job to queue
  const { jobId } = await triggerManualScrape(body.limitUrls);

  return NextResponse.json({
    success: true,
    jobId,
    message: body.limitUrls
      ? `Scraping ${body.limitUrls} schemes (test mode)`
      : "Full scrape triggered",
  });
}

// GET /api/admin/scrape — check queue status
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { scrapeQueue } = await import("@/lib/queue/scrape-queue");

  const [waiting, active, completed, failed] = await Promise.all([
    scrapeQueue.getWaitingCount(),
    scrapeQueue.getActiveCount(),
    scrapeQueue.getCompletedCount(),
    scrapeQueue.getFailedCount(),
  ]);

  return NextResponse.json({ waiting, active, completed, failed });
}
