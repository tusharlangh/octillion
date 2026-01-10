import { Redis } from "@upstash/redis";
import crypto from "crypto";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const EMBEDDING_TTL = 60 * 60 * 24;
const CACHE_PREFIX = "embed:";

let cacheHits = 0;
let cacheMisses = 0;

function getCacheKey(text) {
  if (typeof text !== "string") {
    throw new Error("Cache key must be a string");
  }
  const hash = crypto.createHash("sha256").update(text).digest("hex");
  return `${CACHE_PREFIX}${hash}`;
}

export async function getEmbedding(text) {
  if (Array.isArray(text)) {
    return null;
  }

  try {
    const key = getCacheKey(text);
    const cached = await redis.get(key);

    if (cached) {
      cacheHits++;
      const hitRate = ((cacheHits / (cacheHits + cacheMisses)) * 100).toFixed(
        1
      );
      console.log(
        `Upstash cache HIT (${hitRate}% hit rate, ${cacheHits} hits, ${cacheMisses} misses)`
      );
      return cached;
    }

    cacheMisses++;
    return null;
  } catch (error) {
    console.error("Upstash get error:", error);
    cacheMisses++;
    return null;
  }
}

export async function setEmbedding(text, embedding) {
  if (Array.isArray(text)) {
    return embedding;
  }

  try {
    const key = getCacheKey(text);

    const result = await redis.set(key, embedding, {
      ex: EMBEDDING_TTL,
      nx: true,
    });

    if (result) {
      console.log("Stored in Upstash cache");
    } else {
      console.log("Cache key already exists (race condition avoided)");
    }

    return embedding;
  } catch (error) {
    console.error("Upstash set error:", error);
    return embedding;
  }
}
