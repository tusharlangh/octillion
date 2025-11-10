import qdrantClient from "../utils/qdrant/client.js";

function getCollectionName(parseId, userId) {
  return `parse_${parseId}_${userId}`;
}

const VECTOR_DIMENSION = 384;

export async function ensureCollection(parseId, userId) {
  const collectionName = getCollectionName(parseId, userId);

  try {
    try {
      await qdrantClient.getCollection(collectionName);
      return collectionName;
    } catch (error) {
      const isNotFound =
        error?.status === 404 ||
        error?.statusCode === 404 ||
        error?.message?.includes("404") ||
        error?.message?.toLowerCase().includes("not found");

      if (isNotFound) {
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

        console.log(`Created qdrant collection: ${collectionName}`);
        return collectionName;
      }

      throw error;
    }
  } catch (error) {
    console.error(`Error ensuring collection ${collectionName}:`, error);
    throw error;
  }
}

export async function uploadChunksToQdrant(parseId, userId, chunksData) {
  const collectionName = await ensureCollection(parseId, userId);

  try {
    const points = [];

    for (let i = 0; i < chunksData.length; i++) {
      const chunkData = chunksData[i];
      const { embedding, pageId, file_name, startY, endY, text, wordCount } =
        chunkData;

      points.push({
        id: i + 1,
        vector: embedding,
        payload: {
          pageId,
          file_name,
          startY,
          endY,
          text,
          wordCount,
          parseId,
          userId,
        },
      });
    }

    const BATCH_SIZE = 100;
    const batches = [];

    for (let i = 0; i < points.length; i += BATCH_SIZE) {
      batches.push(points.slice(i, i + BATCH_SIZE));
    }

    const CONCURRENT_BATCHES = 3;
    for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
      const batchGroup = batches.slice(i, i + CONCURRENT_BATCHES);
      await Promise.all(
        batchGroup.map((batch) =>
          qdrantClient.upsert(collectionName, {
            wait: true,
            points: batch,
          })
        )
      );
    }

    console.log(
      `Successfully uploaded ${points.length} chunks to Qdrant collection: ${collectionName}`
    );

    return {
      success: true,
      collectionName,
      totalPoints: points.length,
    };
  } catch (error) {
    console.error("Error uploading chunks to Qdrant:", error);
    throw error;
  }
}

export async function searchQdrant(
  parseId,
  userId,
  queryEmbedding,
  options = {}
) {
  const { topK = 10, scoreThreshold = 0.0, filter = null } = options;

  const collectionName = getCollectionName(parseId, userId);

  try {
    try {
      await qdrantClient.getCollection(collectionName);
    } catch (error) {
      if (error.status === 404) {
        console.error(`Collection ${collectionName} does not exist`);
        return [];
      }
      throw error;
    }

    const searchResults = await qdrantClient.search(collectionName, {
      vector: queryEmbedding,
      limit: topK,
      score_threshold: scoreThreshold,
      filter: filter,
      with_payload: true,
      with_vector: false,
    });

    const results = searchResults.map((result) => ({
      file_name: result.payload.file_name,
      pageId: result.payload.pageId,
      startY: result.payload.startY,
      endY: result.payload.endY,
      sentence: result.payload.text,
      score: result.score,
      wordCount: result.payload.wordCount,
    }));

    return results;
  } catch (error) {
    console.error("Error searching Qdrant:", error);
    throw error;
  }
}

export async function deleteCollection(parseId, userId) {
  const collectionName = getCollectionName(parseId, userId);

  try {
    await qdrantClient.deleteCollection(collectionName);
    console.log(`Deleted Qdrant collection: ${collectionName}`);
    return { success: true };
  } catch (error) {
    // Collection might not exist, which is fine
    const isNotFound =
      error?.status === 404 ||
      error?.statusCode === 404 ||
      error?.message?.includes("404") ||
      error?.message?.toLowerCase().includes("not found");

    if (isNotFound) {
      console.log(`Collection ${collectionName} does not exist`);
      return { success: true };
    }
    console.error(`Error deleting collection ${collectionName}:`, error);
    throw error;
  }
}

export async function getCollectionInfo(parseId, userId) {
  const collectionName = getCollectionName(parseId, userId);

  try {
    const info = await qdrantClient.getCollection(collectionName);
    return info;
  } catch (error) {
    const isNotFound =
      error?.status === 404 ||
      error?.statusCode === 404 ||
      error?.message?.includes("404") ||
      error?.message?.toLowerCase().includes("not found");

    if (isNotFound) {
      return null;
    }
    throw error;
  }
}
