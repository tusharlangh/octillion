import { AppError } from "../../middleware/errorHandler.js";
import { generateEmbedding } from "../parse.js";
import { uploadChunksToQdrant } from "../qdrantService.js";

export async function generateAndUploadEmbeddings(id, userId, pagesContent) {
  try {
    const chunksData = [];
    const BATCH_SIZE = 10;
    const embedErrors = [];

    for (const page of pagesContent) {
      if (page.chunks && page.chunks.length > 0) {
        for (let i = 0; i < page.chunks.length; i += BATCH_SIZE) {
          const batch = page.chunks.slice(i, i + BATCH_SIZE);
          let batchEmbeddings;

          batchEmbeddings = await Promise.all(
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

            if (!embedding || !chunk) {
              continue;
            }

            chunksData.push({
              embedding,
              pageId: page.id,
              file_name: page.name,
              startY: chunk.startY,
              endY: chunk.endY,
              text: chunk.text,
              wordCount: chunk.wordCount,
            });
          }
        }
      }
    }

    if (chunksData.length === 0) {
      throw new AppError("Empty chunks data", 500, "EMPTY_CHUNKS_FAILED");
    }

    const errorRate =
      embedErrors.length / (chunksData.length + embedErrors.length);

    if (errorRate > 0.3) {
      throw new AppError(
        `Too many embedding failures: ${embedErrors.length} out of ${
          chunksData.length + embedErrors.length
        } chunks failed`,
        500,
        "HIGH_EMBEDDING_FAILURE_RATE"
      );
    }

    try {
      await uploadChunksToQdrant(id, userId, chunksData);
    } catch {
      throw new AppError(
        "Failed to upload embeddings to vector database",
        500,
        "QDRANT_UPLOAD_FAILED"
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
