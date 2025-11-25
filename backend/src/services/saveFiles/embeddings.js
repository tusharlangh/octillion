import { AppError } from "../../middleware/errorHandler.js";
import { generateEmbedding } from "../parse.js";
import { uploadChunksToQdrant } from "../qdrantService.js";

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
