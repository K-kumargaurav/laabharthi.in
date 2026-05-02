// src/lib/queue/scrape-queue.ts
import { Queue, Worker, type Job } from "bullmq";
import { redis } from "@/lib/redis";
import { runMySchemeScrape } from "@/lib/scraper/myscheme-scraper";
import type { ScrapeJobData, ScrapeResult } from "@/types/scheme";

// ─── Queue Definition ─────────────────────────────────────────────────────────
// The Queue object is used to ADD jobs.
// The Worker object is used to PROCESS jobs.
// Both connect to Redis — that's where job data is stored.

export const scrapeQueue = new Queue<ScrapeJobData, ScrapeResult>(
  "scheme-scrape",
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 3, // Retry failed jobs up to 3 times
      backoff: { type: "exponential", delay: 5000 }, // 5s → 10s → 20s
      removeOnComplete: { count: 50 }, // Keep last 50 completed jobs for inspection
      removeOnFail: { count: 100 }, // Keep last 100 failed jobs for debugging
    },
  },
);

// ─── Worker Definition ────────────────────────────────────────────────────────
// The worker runs in the background and processes jobs from the queue.
// concurrency: 1 means only one scrape job runs at a time (intentional).

export function createScrapeWorker(): Worker<ScrapeJobData, ScrapeResult> {
  const worker = new Worker<ScrapeJobData, ScrapeResult>(
    "scheme-scrape",
    async (job: Job<ScrapeJobData, ScrapeResult>) => {
      console.log(
        `Processing scrape job ${job.id}, triggered by: ${job.data.triggeredBy}`,
      );

      const result = await runMySchemeScrape(job.data.limitUrls);
      return result;
    },
    {
      connection: redis,
      concurrency: 1,
    },
  );

  worker.on("completed", (job, result) => {
    console.log(
      `Job ${job.id} completed: ${result.scraped} schemes scraped in ${result.durationMs}ms`,
    );
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Add a manual scrape job to the queue */
export async function triggerManualScrape(limitUrls?: number) {
  const job = await scrapeQueue.add(
    "manual-scrape",
    { triggeredBy: "manual", limitUrls },
    { priority: 1 }, // Manual triggers get higher priority than scheduled
  );

  return { jobId: job.id };
}

/** Schedule automatic scrape every 48 hours at 2am */
export async function scheduleAutomaticScrape() {
  // Remove existing repeatable jobs first to avoid duplicates on restart
  const repeatableJobs = await scrapeQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await scrapeQueue.removeRepeatableByKey(job.key);
  }

  await scrapeQueue.add(
    "scheduled-scrape",
    { triggeredBy: "scheduler" },
    {
      repeat: { pattern: "0 2 */2 * *" }, // 2am every 2 days (cron syntax)
    },
  );

  console.log("Scheduled automatic scrape: every 48 hours at 2am");
}
