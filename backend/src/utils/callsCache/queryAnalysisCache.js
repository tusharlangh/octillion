import { Redis } from "@upstash/redis";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

const ANALYSIS_TTL = 60 * 60 * 24 * 7;
const CACHE_PREFIX = "analysis:";

function getCacheKey(text) {
  if (typeof text !== "string") {
    throw new Error("Cache key must be a string");
  }
  const hash = crypto.createHash("sha256").update(text).digest("hex");
  return `${CACHE_PREFIX}${hash}`;
}

export async function getQueryAnalysis(query) {
  try {
    const key = getCacheKey(query);
    const cached = await redis.get(key);
    return cached;
  } catch (error) {
    console.error("Upstash get error:", error);
    return null;
  }
}

export async function setQueryAnalysis(query, analysis) {
  try {
    const key = getCacheKey(query);
    await redis.set(key, analysis, {
      ex: ANALYSIS_TTL,
      nx: true,
    });
    return analysis;
  } catch (error) {
    console.error("Upstash set error:", error);
    return analysis;
  }
}
