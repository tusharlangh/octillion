import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const S3_TTL = 60 * 60 * 6;
const CACHE_PREFIX = "s3:";

let cacheHits = 0;
let cacheMisses = 0;

function getCacheKey(s3Key) {
  if (typeof s3Key !== "string") {
    throw new Error("Cache key must be a string");
  }
  return `${CACHE_PREFIX}${s3Key}`;
}

export async function getCachedJsonFromS3(s3Key) {
  try {
    const key = getCacheKey(s3Key);
    const cached = await redis.get(key);

    if (cached) {
      cacheHits++;
      const hitRate = ((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(
        1
      );
      console.log(
        `S3 cache HIT (${hitRate}% hit rate, ${cacheHits} hits, ${cacheMisses} misses)`
      );
      return cached;
    }

    cacheMisses++;
    return null;
  } catch (error) {
    console.error("S3 cache get error:", error);
    cacheMisses++;
    return null;
  }
}

export async function setCacheJsonFromS3(s3Key, data) {
  try {
    const key = getCacheKey(s3Key);

    const result = await redis.set(key, data, {
      ex: S3_TTL,
      nx: true,
    });

    if (result) {
      console.log("Stored S3 JSON in cache");
    } else {
      console.log("S3 cache key already exists (race avoided)");
    }

    return data;
  } catch (error) {
    console.error("S3 cache set error:", error);
    return data;
  }
}
