import { AppError, ValidationError } from "../../middleware/errorHandler.js";
import { callToEmbed } from "../../utils/openAi/callToEmbed.js";
import qdrantClient from "../../utils/qdrant/client.js";
import pRetry from "p-retry";
import crypto from "crypto";

function getCollectionName(parseId, userId) {
  if (!parseId || !userId) {
    throw new ValidationError("Parse ID and User ID are required");
  }
  return `parse_${parseId}_${userId}`;
}

async function ensureCollection(collectionName, vectorSize = 1536) {
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === collectionName
    );

    if (exists) {
      console.log(`Collection ${collectionName} already exists`);
      return;
    }

    await qdrantClient.createCollection(collectionName, {
      vectors: {
        size: vectorSize,
        distance: "Cosine",
      },
      strict_mode_config: {
        enabled: false,
      },
      optimizers_config: {
        indexing_threshold: 20000,
      },
    });
  } catch (error) {
    console.error(`Failed to ensure collection:`, error);
    throw new AppError(
      `Failed to create collection: ${error.message}`,
      500,
      "COLLECTION_CREATION_FAILED"
    );
  }
}

async function callToEmbedWithRetry(text, MAX_RETRIES, RETRY_DELAY) {
  return pRetry(
    async () => {
      const embedding = await callToEmbed(text);

      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error("Invalid embedding response");
      }

      return embedding;
    },
    {
      retries: MAX_RETRIES,
      minTimeout: RETRY_DELAY,
      onFailedAttempt: (error) => {
        console.warn(
          `Embedding attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`
        );
      },
    }
  );
}

async function batchEmbed(texts, MAX_RETRIES, RETRY_DELAY) {
  const embeddings = [];
  const errors = [];

  const results = await Promise.allSettled(
    texts.map((text, idx) =>
      callToEmbedWithRetry(text, MAX_RETRIES, RETRY_DELAY).catch((err) => {
        errors.push({ index: idx, error: err });
        return null;
      })
    )
  );

  results.forEach((result, idx) => {
    if (result.status === "fulfilled" && result.value) {
      embeddings.push(result.value);
    } else {
      embeddings.push(null);
      if (result.status === "rejected") {
        errors.push({ index: idx, error: result.reason });
      }
    }
  });

  return embeddings;
}

export async function generateAndUploadEmbeddings_v2(
  id,
  userId,
  chunks,
  options = {}
) {
  try {
    if (!id || !userId) {
      throw new ValidationError("Document ID and User ID are required");
    }

    const {
      EMBEDDING_BATCH_SIZE = 128,
      QDRANT_BATCH_SIZE = 100,
      MAX_RETRIES = 3,
      RETRY_DELAY = 1000,
    } = options;

    const collectionName = getCollectionName(id, userId);

    await ensureCollection(collectionName);

    let successCount = 0;
    let failureCount = 0;
    let totalPointsUploaded = 0;

    for (let i = 0; i < chunks.length; i += EMBEDDING_BATCH_SIZE) {
      const batch = chunks.slice(i, i + EMBEDDING_BATCH_SIZE);

      try {
        const batchEmbeddings = await batchEmbed(
          batch.map((c) => c.text),
          MAX_RETRIES,
          RETRY_DELAY
        );

        const points = [];

        for (let j = 0; j < batch.length; j++) {
          const embedding = batchEmbeddings[j];

          if (!embedding) {
            failureCount++;
            continue;
          }

          const chunk = batch[j];

          points.push({
            id: crypto.randomUUID(),
            vector: embedding,
            payload: {
              text: chunk.text,
              chunk_id: chunk.id,
              chunk_index: chunk.stats?.chunk_index ?? j,
              source: chunk.source,
              stats: chunk.stats,
              structure: chunk.structure,
              user_id: userId,
              doc_id: id,
              created_at: new Date().toISOString(),
            },
          });

          successCount++;
        }

        if (points.length === 0) {
          continue;
        }

        for (let k = 0; k < points.length; k += QDRANT_BATCH_SIZE) {
          const qdrantBatch = points.slice(k, k + QDRANT_BATCH_SIZE);

          await pRetry(
            async () => {
              try {
                await qdrantClient.upsert(collectionName, {
                  wait: true,
                  points: qdrantBatch,
                });
                totalPointsUploaded += qdrantBatch.length;
              } catch (err) {
                console.error(`❌ Qdrant upsert error:`, err.message);
                throw err;
              }
            },
            {
              retries: MAX_RETRIES,
              minTimeout: RETRY_DELAY,
              onFailedAttempt: (error) => {
                console.warn(
                  `Retry ${error.attemptNumber}/${MAX_RETRIES + 1} - ${
                    error.retriesLeft
                  } left`
                );
              },
            }
          );
        }
      } catch (error) {
        console.error(`Batch error:`, error.message);
        failureCount += batch.length;
        continue;
      }
    }

    return {
      success: true,
      total: chunks.length,
      successful: successCount,
      failed: failureCount,
      collectionName,
    };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    throw new AppError(
      `Failed to generate and upload embeddings: ${error.message}`,
      500,
      "EMBEDDING_PROCESS_FAILED",
      { originalError: error.message }
    );
  }
}
