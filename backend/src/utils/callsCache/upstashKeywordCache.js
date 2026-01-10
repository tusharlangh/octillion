import { Redis } from "@upstash/redis";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KEYWORD_TTL = 60 * 60;
const CACHE_PREFIX = "keyword:";

function getCacheKey(parseId, userId, query) {
  const queryHash = crypto.createHash("sha256").update(query).digest("hex");
  return `${CACHE_PREFIX}${parseId}:${userId}:${queryHash}`;
}

export async function getCachedKeywordSearch(parseId, userId, query) {
  try {
    const key = getCacheKey(parseId, userId, query);
    const cached = await redis.get(key);
    if (cached) {
      return cached;
    }
    return null;
  } catch (error) {
    console.error("Keyword cache get error:", error);
    return null;
  }
}

export async function setCacheKeywordSearch(parseId, userId, query, data) {
  try {
    const key = getCacheKey(parseId, userId, query);
    await redis.set(key, data, {
      ex: KEYWORD_TTL,
      nx: true,
    });
    return data;
  } catch (error) {
    console.error("Keyword cache set error:", error);
    return data;
  }
}
