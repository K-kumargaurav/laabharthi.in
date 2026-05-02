// src/lib/redis.ts
import { Redis } from "ioredis";

// Same singleton pattern as Prisma —
// prevents multiple Redis connections during hot reload.

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      // Exponential backoff: 50ms, 100ms, 200ms... max 2s
      return Math.min(times * 50, 2000);
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// Graceful shutdown — close connection when process exits
process.on("beforeExit", async () => {
  await redis.quit();
});