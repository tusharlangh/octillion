import dotenv from "dotenv";
import { AppError } from "../middleware/errorHandler.js";
import { createPresignedUrls, uploadJsonToS3 } from "./saveFiles/upload.js";
import { createInvertedSearch_V2_1 } from "./saveFiles/indexing.js";
import { generateAndUploadEmbeddings_v2 } from "./saveFiles/embeddings.js";
import { saveFilesRecord } from "./saveFiles/persist.js";
import { createContextualChunks_v2 } from "./parse/chunks.js";
import {
  SearchTimer,
  trackFileProcessing,
  trackBatchProcessing,
  trackProcessingStage,
} from "../utils/processMetrics.js";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../utils/aws/s3Client.js";

dotenv.config();

async function getFileSize(key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });
    const response = await s3.send(command);
    return response.ContentLength || 0;
  } catch (error) {
    console.warn(`Failed to get file size for ${key}:`, error.message);
    return 0;
  }
}

function calculateJsonSizeMb(data) {
  const jsonString = JSON.stringify(data);
  const sizeBytes = new Blob([jsonString]).size;
  return (sizeBytes / (1024 * 1024)).toFixed(2);
}

export async function processFiles(id, keys, userId) {
  const batchStartTime = Date.now();
  let totalSizeBytes = 0;

  const fileSizes = await Promise.all(keys.map((key) => getFileSize(key)));
  totalSizeBytes = fileSizes.reduce((sum, size) => sum + size, 0);

  const fileObjects = keys.map((key, index) => {
    const parts = key.split("-");
    const originalname = parts.slice(6).join("-") || key;
    return {
      key,
      file_name: originalname,
      file_type: "PDF",
      status: "PROCESSED",
      size_bytes: fileSizes[index],
    };
  });

  const presignedLatency = new SearchTimer("Presignedurl");
  const urls = await createPresignedUrls(fileObjects);
  const presignedDuration = presignedLatency.stop();

  trackProcessingStage({
    parseId: id,
    userId,
    stageName: "presigned_urls",
    durationMs: presignedDuration,
    itemCount: fileObjects.length,
    metadata: {},
  });

  const links = urls.map((url) => url.presignedUrl);

  if (!links || links.length === 0) {
    throw new AppError(
      "No valid file URLs generated",
      500,
      "NO_URLS_GENERATED_ERROR"
    );
  }

  const canonicalDataLatency = new SearchTimer("Canonical Data");
  const canonicalData = await Promise.all(
    links.map((link, index) =>
      callMain(
        link,
        fileObjects[index].file_name,
        fileObjects[index],
        id,
        userId
      )
    )
  ).then((result) => {
    return result;
  });
  const canonicalDuration = canonicalDataLatency.stop();

  trackProcessingStage({
    parseId: id,
    userId,
    stageName: "canonical_data_extraction",
    durationMs: canonicalDuration,
    itemCount: canonicalData.length,
    metadata: {
      avg_duration_per_file: (canonicalDuration / canonicalData.length).toFixed(
        2
      ),
    },
  });

  let invertedIndex_v2;
  const invertedIndexLatency = new SearchTimer("Inverted Index");
  try {
    invertedIndex_v2 = createInvertedSearch_V2_1(canonicalData);
    console.log("end here: ", invertedIndex_v2);
    const invertedDuration = invertedIndexLatency.stop();

    trackProcessingStage({
      parseId: id,
      userId,
      stageName: "inverted_index",
      durationMs: invertedDuration,
      itemCount: Object.keys(invertedIndex_v2).length,
      metadata: {},
    });
  } catch {
    throw new AppError(
      "Failed to get inverted index",
      500,
      "FAILED_INVERTED_INDEX_ERROR"
    );
  }

  const chunksTimer = new SearchTimer("Chunks");
  const chunks = createContextualChunks_v2(canonicalData);
  const chunksLatency = chunksTimer.stop();

  trackProcessingStage({
    parseId: id,
    userId,
    stageName: "chunking",
    durationMs: chunksLatency,
    itemCount: chunks.length,
    metadata: {
      avg_chunk_size:
        chunks.length > 0
          ? (
              chunks.reduce((sum, c) => sum + (c.text?.length || 0), 0) /
              chunks.length
            ).toFixed(2)
          : 0,
    },
  });

  const embeddingsTimer = new SearchTimer("Embeddings");
  await generateAndUploadEmbeddings_v2(id, userId, chunks);
  const embeddingsLatency = embeddingsTimer.stop();

  trackProcessingStage({
    parseId: id,
    userId,
    stageName: "embeddings",
    durationMs: embeddingsLatency,
    itemCount: chunks.length,
    metadata: {
      avg_duration_per_chunk:
        chunks.length > 0 ? (embeddingsLatency / chunks.length).toFixed(2) : 0,
    },
  });

  const uploadJsonTimer = new SearchTimer("Upload JSON");
  const [pagesContentRef, invertedIndexRef, chunksRef] = await Promise.all([
    uploadJsonToS3(id, "pages_content", canonicalData),
    uploadJsonToS3(id, "inverted_index", invertedIndex_v2),
    uploadJsonToS3(id, "chunks", chunks),
  ]).then((result) => {
    uploadJsonTimer.stop();
    return result;
  });
  const uploadJsonLatency = uploadJsonTimer.stop();

  const pagesContentSizeMb = parseFloat(calculateJsonSizeMb(canonicalData));
  const invertedIndexSizeMb = parseFloat(calculateJsonSizeMb(invertedIndex_v2));
  const chunksSizeMb = parseFloat(calculateJsonSizeMb(chunks));
  const totalStorageMb =
    pagesContentSizeMb + invertedIndexSizeMb + chunksSizeMb;

  trackProcessingStage({
    parseId: id,
    userId,
    stageName: "upload_json",
    durationMs: uploadJsonLatency,
    itemCount: 3,
    metadata: {
      pages_content_mb: pagesContentSizeMb,
      inverted_index_mb: invertedIndexSizeMb,
      chunks_mb: chunksSizeMb,
      total_storage_mb: totalStorageMb,
    },
  });

  const data = await saveFilesRecord(
    id,
    userId,
    fileObjects,
    invertedIndexRef,
    pagesContentRef,
    chunksRef
  );

  const totalDuration = Date.now() - batchStartTime;

  trackBatchProcessing({
    parseId: id,
    userId,
    fileCount: keys.length,
    totalSizeBytes,
    totalDurationMs: totalDuration,
    totalStorageMb,
    successCount: keys.length,
    failureCount: 0,
    stageLatencies: {
      presigned_urls_ms: presignedDuration,
      canonical_data_ms: canonicalDuration,
      inverted_index_ms: invertedIndexLatency.stop(),
      chunking_ms: chunksLatency,
      embeddings_ms: embeddingsLatency,
      upload_json_ms: uploadJsonLatency,
    },
  });

  console.log(
    `🎉 Lambda processing completed successfully for parse_id: ${id} - All files processed, indexed, and saved to database`
  );

  return data;
}

async function callMain(presignedUrl, fileName, fileObject, parseId, userId) {
  const fileStartTime = Date.now();

  try {
    const response = await fetch("http://localhost:8000/parse_to_json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: presignedUrl, file_name: fileName }),
    });

    const data = await response.json();
    const fileDuration = Date.now() - fileStartTime;

    const storageMb = parseFloat(calculateJsonSizeMb(data));

    trackFileProcessing({
      parseId,
      userId,
      fileName,
      fileSizeBytes: fileObject.size_bytes,
      durationMs: fileDuration,
      storageMb,
      status: "success",
      errorMessage: null,
    });

    return data;
  } catch (error) {
    const fileDuration = Date.now() - fileStartTime;

    trackFileProcessing({
      parseId,
      userId,
      fileName,
      fileSizeBytes: fileObject.size_bytes,
      durationMs: fileDuration,
      storageMb: 0,
      status: "failed",
      errorMessage: error.message,
    });

    throw error;
  }
}
