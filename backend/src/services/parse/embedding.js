import { AppError } from "../../middleware/errorHandler.js";
import { callToEmbed } from "../../utils/openAi/callToEmbed.js";

export async function generateEmbedding(text) {
  try {
    const embedding = await callToEmbed(text);

    if (!embedding || embedding.length === 0) {
      throw new AppError(
        "Invalid embedding output from OpenAI",
        500,
        "INVALID_EMBEDDING_OUTPUT"
      );
    }

    return embedding;
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
