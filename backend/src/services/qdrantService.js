import qdrantClient from "../utils/qdrant/client.js";
import { AppError, ValidationError } from "../middleware/errorHandler.js";

function getCollectionName(parseId, userId) {
  if (!parseId || !userId) {
    throw new ValidationError("Parse ID and User ID are required");
  }
  return `parse_${parseId}_${userId}`;
}

function isNotFoundError(error) {
  return (
    error?.status === 404 ||
    error?.statusCode === 404 ||
    error?.message?.includes("404") ||
    error?.message?.toLowerCase().includes("not found")
  );
}

export async function searchQdrant(
  parseId,
  userId,
  queryEmbedding,
  options = {}
) {
  try {
    if (!parseId) {
      throw new ValidationError("Parse ID is required");
    }

    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const { topK = 10 } = options;

    let collectionName;
    try {
      collectionName = getCollectionName(parseId, userId);
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw new AppError(
        `Failed to get collection name: ${error.message}`,
        500,
        "GET_COLLECTION_NAME_ERROR"
      );
    }

    let searchResults;
    try {
      searchResults = await qdrantClient.search(collectionName, {
        vector: queryEmbedding,
        limit: topK,
        with_payload: {
          include: ["chunk_id", "stats"]
        },
        with_vector: false,
      });
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }

      if (isNotFoundError(error)) {
        return [];
      }
      throw new AppError(
        `Failed to search Qdrant: ${error.message}`,
        500,
        "SEARCH_QDRANT_ERROR"
      );
    }

    if (!searchResults) {
      return [];
    }

    const results = [];

    for (const result of searchResults) {
      if (!result || !result.payload) {
        continue;
      }

      results.push({
        chunk_id: result.payload.chunk_id,
        chunk_index: result.payload.stats.chunk_index,
        score: result.score,
      });
    }

    return results;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to search global Qdrant: ${error.message}`,
      500,
      "SEARCH_QDRANT_ERROR"
    );
  }
}
