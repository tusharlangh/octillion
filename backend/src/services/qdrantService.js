import qdrantClient from "../utils/qdrant/client.js";
import { AppError, ValidationError } from "../middleware/errorHandler.js";

function getCollectionName(parseId, userId) {
  try {
    if (!parseId) {
      throw new ValidationError("Parse ID is required");
    }

    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    return `parse_${parseId}_${userId}`;
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
}

const VECTOR_DIMENSION = 1536;

function isNotFoundError(error) {
  return (
    error?.status === 404 ||
    error?.statusCode === 404 ||
    error?.message?.includes("404") ||
    error?.message?.toLowerCase().includes("not found")
  );
}

export async function ensureCollection(parseId, userId) {
  try {
    if (!parseId) {
      throw new ValidationError("Parse ID is required");
    }

    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    const collectionName = getCollectionName(parseId, userId);

    try {
      await qdrantClient.getCollection(collectionName);
      return collectionName;
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }

      if (isNotFoundError(error)) {
        try {
          await qdrantClient.createCollection(collectionName, {
            vectors: {
              size: VECTOR_DIMENSION,
              distance: "Cosine",
            },
            optimizers_config: {
              default_segment_number: 2,
            },
            replication_factor: 1,
          });

          return collectionName;
        } catch (createError) {
          if (createError.isOperational) {
            throw createError;
          }
          throw new AppError(
            `Failed to create collection: ${createError.message}`,
            500,
            "CREATE_COLLECTION_ERROR"
          );
        }
      }

      throw new AppError(
        `Failed to get collection: ${error.message}`,
        500,
        "GET_COLLECTION_ERROR"
      );
    }
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to ensure collection: ${error.message}`,
      500,
      "ENSURE_COLLECTION_ERROR"
    );
  }
}

export async function uploadChunksToQdrant(
  parseId,
  userId,
  chunksData,
  offset = 0
) {
  try {
    if (!parseId) {
      throw new ValidationError("Parse ID is required");
    }

    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    if (!chunksData || chunksData.length === 0) {
      throw new ValidationError(
        "Chunks data is required and must be a non-empty array"
      );
    }

    let collectionName;
    try {
      collectionName = await ensureCollection(parseId, userId);
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw new AppError(
        `Failed to ensure collection: ${error.message}`,
        500,
        "ENSURE_COLLECTION_ERROR"
      );
    }

    if (!collectionName) {
      throw new AppError(
        "Invalid collection name",
        500,
        "INVALID_COLLECTION_NAME"
      );
    }

    const points = [];

    for (let i = 0; i < chunksData.length; i++) {
      const chunkData = chunksData[i];

      if (!chunkData) {
        continue;
      }

      const { embedding, pageId, file_name, startY, endY, text, wordCount } =
        chunkData;

      if (!embedding || embedding.length !== VECTOR_DIMENSION) {
        continue;
      }

      if (!pageId) {
        continue;
      }

      points.push({
        id: offset + i + 1,
        vector: embedding,
        payload: {
          pageId,
          file_name: file_name || "Unknown",
          startY: startY || 0,
          endY: endY || 0,
          text: text || "",
          wordCount: wordCount || 0,
          parseId,
          userId,
        },
      });
    }

    if (points.length === 0) {
      throw new AppError("No valid chunks to upload", 400, "NO_VALID_CHUNKS");
    }

    const BATCH_SIZE = 100;
    const batches = [];

    for (let i = 0; i < points.length; i += BATCH_SIZE) {
      batches.push(points.slice(i, i + BATCH_SIZE));
    }

    const CONCURRENT_BATCHES = 3;
    for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
      const batchGroup = batches.slice(i, i + CONCURRENT_BATCHES);

      try {
        await Promise.all(
          batchGroup.map((batch) =>
            qdrantClient.upsert(collectionName, {
              wait: true,
              points: batch,
            })
          )
        );
      } catch (error) {
        if (error.isOperational) {
          throw error;
        }
        throw new AppError(
          `Failed to upload batch: ${error.message}`,
          500,
          "UPLOAD_BATCH_ERROR"
        );
      }
    }

    return {
      success: true,
      collectionName,
      totalPoints: points.length,
    };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to upload chunks to Qdrant: ${error.message}`,
      500,
      "UPLOAD_CHUNKS_ERROR"
    );
  }
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

    if (!queryEmbedding || queryEmbedding.length !== VECTOR_DIMENSION) {
      throw new ValidationError(
        `Query embedding is required and must be an array of length ${VECTOR_DIMENSION}`
      );
    }

    const { topK = 10, scoreThreshold = 0.0, filter = null } = options;

    if (topK <= 0 || topK > 1000) {
      throw new ValidationError("topK must be a number between 1 and 1000");
    }

    if (scoreThreshold < 0 || scoreThreshold > 1) {
      throw new ValidationError(
        "scoreThreshold must be a number between 0 and 1"
      );
    }

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

    try {
      await qdrantClient.getCollection(collectionName);
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }

      if (isNotFoundError(error)) {
        return [];
      }

      throw new AppError(
        `Failed to get collection: ${error.message}`,
        500,
        "GET_COLLECTION_ERROR"
      );
    }

    let searchResults;
    try {
      searchResults = await qdrantClient.search(collectionName, {
        vector: queryEmbedding,
        limit: topK,
        score_threshold: scoreThreshold,
        filter: filter,
        with_payload: true,
        with_vector: false,
      });
    } catch (error) {
      if (error.isOperational) {
        throw error;
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
        file_name: result.payload.file_name || "Unknown",
        pageId: result.payload.pageId || "",
        startY: result.payload.startY || 0,
        endY: result.payload.endY || 0,
        sentence: result.payload.text || "",
        score: result.score || 0,
        wordCount: result.payload.wordCount || 0,
      });
    }

    return results;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to search Qdrant: ${error.message}`,
      500,
      "SEARCH_QDRANT_ERROR"
    );
  }
}

export async function deleteCollection(parseId, userId) {
  try {
    if (!parseId) {
      throw new ValidationError("Parse ID is required");
    }

    if (!userId) {
      throw new ValidationError("User ID is required");
    }

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

    try {
      await qdrantClient.deleteCollection(collectionName);
      return { success: true };
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }

      if (isNotFoundError(error)) {
        return { success: true };
      }

      throw new AppError(
        `Failed to delete collection: ${error.message}`,
        500,
        "DELETE_COLLECTION_ERROR"
      );
    }
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to delete collection: ${error.message}`,
      500,
      "DELETE_COLLECTION_ERROR"
    );
  }
}

export async function getCollectionInfo(parseId, userId) {
  try {
    if (!parseId) {
      throw new ValidationError("Parse ID is required");
    }

    if (!userId) {
      throw new ValidationError("User ID is required");
    }

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

    try {
      const info = await qdrantClient.getCollection(collectionName);
      return info;
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }

      if (isNotFoundError(error)) {
        return null;
      }

      throw new AppError(
        `Failed to get collection info: ${error.message}`,
        500,
        "GET_COLLECTION_INFO_ERROR"
      );
    }
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to get collection info: ${error.message}`,
      500,
      "GET_COLLECTION_INFO_ERROR"
    );
  }
}
