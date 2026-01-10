import { Redis } from "@upstash/redis";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const RERANKER_TTL = 60 * 60 * 4;
const CACHE_PREFIX = "rerank:";

function getCacheKey(query, passages) {
  const passagesHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(passages))
    .digest("hex");
  const queryHash = crypto.createHash("sha256").update(query).digest("hex");
  return `${CACHE_PREFIX}${queryHash}:${passagesHash}`;
}

export async function getCachedReranker(query, passages) {
  try {
    const key = getCacheKey(query, passages);
    const cached = await redis.get(key);
    if (cached) {
      return cached;
    }
    return null;
  } catch (error) {
    console.error("Reranker cache get error:", error);
    return null;
  }
}

export async function setCacheReranker(query, passages, data) {
  try {
    const key = getCacheKey(query, passages);
    await redis.set(key, data, {
      ex: RERANKER_TTL,
      nx: true,
    });
    return data;
  } catch (error) {
    console.error("Reranker cache set error:", error);
    return data;
  }
}
