import { Redis } from "@upstash/redis";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const QDRANT_TTL = 60 * 60 * 2;
const CACHE_PREFIX = "qdrant:";

function getCacheKey(parseId, userId, embedding) {
  const embeddingHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(embedding))
    .digest("hex");
  return `${CACHE_PREFIX}${parseId}:${userId}:${embeddingHash}`;
}

export async function getCachedQdrant(parseId, userId, embedding) {
  try {
    const key = getCacheKey(parseId, userId, embedding);
    const cached = await redis.get(key);
    if (cached) {
      return cached;
    }
    return null;
  } catch (error) {
    console.error("Qdrant cache get error:", error);
    return null;
  }
}

export async function setCacheQdrant(parseId, userId, embedding, data) {
  try {
    const key = getCacheKey(parseId, userId, embedding);
    await redis.set(key, data, {
      ex: QDRANT_TTL,
      nx: true,
    });
    return data;
  } catch (error) {
    console.error("Qdrant cache set error:", error);
    return data;
  }
}
