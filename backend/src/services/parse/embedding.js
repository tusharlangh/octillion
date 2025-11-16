import { pipeline } from "@xenova/transformers";
import { AppError } from "../../middleware/errorHandler.js";

let embeddingPipeline = null;

async function loadEmbeddingModel() {
  try {
    if (embeddingPipeline) return embeddingPipeline;

    console.log("Loading embedding model...");
    embeddingPipeline = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("Model loaded successfully");
    return embeddingPipeline;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to load model: ${error.message}`,
      500,
      "FAILED_MODEL_LOADING_ERROR"
    );
  }
}

export async function generateEmbedding(text) {
  if (!embeddingPipeline) {
    await loadEmbeddingModel();
  }

  try {
    const output = await embeddingPipeline(text, {
      pooling: "mean",
      normalize: true,
    });

    if (!output || !output.data) {
      throw new AppError(
        "Invalid embedding output",
        500,
        "INVALID_EMBEDDING_OUTPUT"
      );
    }

    return Array.from(output.data);
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to generate embedding: ${error.message}`,
      500,
      "FAILED_EMBEDDING_ERROR"
    );
  }
}


