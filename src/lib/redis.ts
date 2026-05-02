// src/lib/redis.ts
import { Redis } from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

// BullMQ requires maxRetriesPerRequest to be null (not a number)
// This is different from a regular Redis client config
export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: null, // Required by BullMQ
    retryStrategy(times) {
      return Math.min(times * 50, 2000);
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

process.on("beforeExit", async () => {
  await redis.quit();
});