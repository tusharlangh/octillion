import dotenv from "dotenv";
import { AppError } from "../middleware/errorHandler.js";
import { createPresignedUrls, uploadJsonToS3 } from "./saveFiles/upload.js";
import { extractPagesContent } from "./saveFiles/parser.js";
import {
  createInvertedSearch,
  buildOptimizedIndex,
  generateChunks,
} from "./saveFiles/indexing.js";
import { generateAndUploadEmbeddings } from "./saveFiles/embeddings.js";
import { saveFilesRecord } from "./saveFiles/persist.js";

dotenv.config();

export async function processFiles(id, keys, userId) {
  const fileObjects = keys.map((key) => {
    const parts = key.split("-");
    const originalname = parts.slice(2).join("-") || key;
    return {
      key,
      file_name: originalname,
      file_type: "PDF",
      status: "PROCESSED",
    };
  });

  const urls = await createPresignedUrls(fileObjects);

  const links = urls.map((url) => url.presignedUrl);

  if (!links || links.length === 0) {
    throw new AppError(
      "No valid file URLs generated",
      500,
      "NO_URLS_GENERATED_ERROR"
    );
  }

  let pagesContent = await extractPagesContent(links, fileObjects);

  let invertedIndex;
  try {
    invertedIndex = createInvertedSearch(pagesContent);
  } catch {
    throw new AppError(
      "Failed to get inverted index",
      500,
      "FAILED_INVERTED_INDEX_ERROR"
    );
  }

  let keywordIndex;

  try {
    keywordIndex = buildOptimizedIndex(pagesContent);
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    throw new AppError(
      "Failed to build optimized index",
      500,
      "FAILED_OPTIMIZED_INDEX_ERROR"
    );
  }

  const buildIndex = keywordIndex.toJSON();

  try {
    pagesContent = await generateChunks(pagesContent);
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError("Failed to build chunks", 500, "FAILED_CHUNKS_ERROR");
  }

  await generateAndUploadEmbeddings(id, userId, pagesContent);

  const [pagesContentRef, invertedIndexRef, buildIndexRef] = await Promise.all([
    uploadJsonToS3(id, "pages_content", pagesContent),
    uploadJsonToS3(id, "inverted_index", invertedIndex),
    uploadJsonToS3(id, "build_index", buildIndex),
  ]);

  const data = await saveFilesRecord(
    id,
    userId,
    fileObjects,
    buildIndexRef,
    invertedIndexRef,
    pagesContentRef
  );

  return data;
}
