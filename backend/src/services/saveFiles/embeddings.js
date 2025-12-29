import { AppError } from "../../middleware/errorHandler.js";
import { callToEmbed } from "../../utils/openAi/callToEmbed.js";
import { generateEmbedding } from "../parse/embedding.js";
import { uploadChunksToQdrant } from "../qdrantService.js";
import qdrantClient from "../../utils/qdrant/client.js";
import pRetry from "p-retry";

export async function generateAndUploadEmbeddings(id, userId, pagesContent) {
  try {
    const UPLOAD_BATCH_SIZE = 50;
    let currentBatch = [];
    let totalUploaded = 0;
    const embedErrors = [];
    let totalProcessed = 0;

    for (const page of pagesContent) {
      if (!page.chunks || page.chunks.length === 0) continue;

      const CHUNK_BATCH_SIZE = 5;
      for (let i = 0; i < page.chunks.length; i += CHUNK_BATCH_SIZE) {
        const batch = page.chunks.slice(i, i + CHUNK_BATCH_SIZE);

        const batchEmbeddings = await Promise.all(
          batch.map(async (chunk) => {
            try {
              return await generateEmbedding(chunk.text);
            } catch {
              embedErrors.push({
                pageId: page.id,
                error: `Chunk embeddings failed for page: ${page.id}`,
              });
              return null;
            }
          })
        );

        for (let j = 0; j < batch.length; j++) {
          const embedding = batchEmbeddings[j];
          const chunk = batch[j];
          totalProcessed++;

          if (!embedding || !chunk) continue;

          currentBatch.push({
            embedding,
            pageId: page.id,
            file_name: page.name,
            startY: chunk.startY,
            endY: chunk.endY,
            text: chunk.text,
            wordCount: chunk.wordCount,
          });
        }

        if (currentBatch.length >= UPLOAD_BATCH_SIZE) {
          try {
            await uploadChunksToQdrant(id, userId, currentBatch, totalUploaded);
            totalUploaded += currentBatch.length;
            currentBatch = [];
            if (global.gc) global.gc();
          } catch (err) {
            throw new AppError(
              "Failed to upload embeddings batch to vector database",
              500,
              "QDRANT_BATCH_UPLOAD_FAILED"
            );
          }
        }
      }
    }

    if (currentBatch.length > 0) {
      try {
        await uploadChunksToQdrant(id, userId, currentBatch, totalUploaded);
        totalUploaded += currentBatch.length;
        currentBatch = [];
      } catch (err) {
        throw new AppError(
          "Failed to upload final embeddings batch to vector database",
          500,
          "QDRANT_FINAL_UPLOAD_FAILED"
        );
      }
    }

    if (
      totalUploaded === 0 &&
      totalProcessed > 0 &&
      embedErrors.length === totalProcessed
    ) {
      throw new AppError(
        "All chunks failed to embed",
        500,
        "ALL_CHUNKS_FAILED"
      );
    }

    const errorRate =
      totalProcessed > 0 ? embedErrors.length / totalProcessed : 0;

    if (errorRate > 0.3) {
      throw new AppError(
        `Too many embedding failures: ${embedErrors.length} out of ${totalProcessed} chunks failed`,
        500,
        "HIGH_EMBEDDING_FAILURE_RATE"
      );
    }
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    throw new AppError(
      "Failed to generate and upload embeddings",
      500,
      "EMBEDDING_PROCESS_FAILED"
    );
  }
}

function getCollectionName(parseId, userId) {
  if (!parseId || !userId) {
    throw new ValidationError("Parse ID and User ID are required");
  }
  return `parse_${parseId}_${userId}`;
}

async function ensureCollection(collectionName, vectorSize = 1024) {
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

function validateChunks(chunks) {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    throw new ValidationError("Chunks must be a non-empty array");
  }

  const invalidChunks = chunks.filter(
    (c) => !c.text || typeof c.text !== "string" || !c.id || !c.stats
  );

  if (invalidChunks.length > 0) {
    throw new ValidationError(
      `Found ${invalidChunks.length} invalid chunks. Each chunk must have text, id, and stats.`
    );
  }

  return true;
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

    validateChunks(chunks);

    const collectionName = getCollectionName(id, userId);

    await ensureCollection(collectionName);

    let successCount = 0;
    let failureCount = 0;

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
            id: `${id}_${chunk.id}`,
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
              await qdrantClient.upsert(collectionName, {
                wait: true,
                points: qdrantBatch,
              });
            },
            {
              retries: MAX_RETRIES,
              minTimeout: RETRY_DELAY,
              onFailedAttempt: (error) => {
                console.warn(
                  `Qdrant upsert attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`
                );
              },
            }
          );
        }
      } catch (error) {
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
