import dotenv from "dotenv";
import { AppError } from "../middleware/errorHandler.js";
import { createPresignedUrls, uploadJsonToS3 } from "./saveFiles/upload.js";
import { extractPagesContent } from "./saveFiles/parser.js";
import {
  createInvertedSearch,
  buildOptimizedIndex,
  generateChunks,
  createInvertedSearch_V2_1,
} from "./saveFiles/indexing.js";
import {
  generateAndUploadEmbeddings,
  generateAndUploadEmbeddings_v2,
} from "./saveFiles/embeddings.js";
import { saveFilesRecord } from "./saveFiles/persist.js";
import { createContextualChunks_v2 } from "./parse/chunks.js";

dotenv.config();

export async function processFiles(id, keys, userId) {
  const fileObjects = keys.map((key) => {
    const parts = key.split("-");
    const originalname = parts.slice(6).join("-") || key;
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

  const canonicalData = await Promise.all(
    links.map((link, index) => callMain(link, fileObjects[index].file_name))
  );

  let pagesContent = await extractPagesContent(links, fileObjects);

  //let invertedIndex;
  let invertedIndex_v2;
  try {
    //invertedIndex = createInvertedSearch(pagesContent);
    invertedIndex_v2 = createInvertedSearch_V2_1(canonicalData);
  } catch {
    throw new AppError(
      "Failed to get inverted index",
      500,
      "FAILED_INVERTED_INDEX_ERROR"
    );
  }

  {
    /*
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
  */
  }

  {
    /*
    const buildIndex = keywordIndex.toJSON();
    try {
      pagesContent = await generateChunks(pagesContent);
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw new AppError("Failed to build chunks", 500, "FAILED_CHUNKS_ERROR");
    }
  */
  }

  const chunks = createContextualChunks_v2(canonicalData);

  //await generateAndUploadEmbeddings(id, userId, pagesContent);
  await generateAndUploadEmbeddings_v2(id, userId, chunks);

  const [pagesContentRef, invertedIndexRef, chunksRef] = await Promise.all([
    uploadJsonToS3(id, "pages_content", canonicalData),
    uploadJsonToS3(id, "inverted_index", invertedIndex_v2),
    uploadJsonToS3(id, "chunks", chunks),
  ]);

  const data = await saveFilesRecord(
    id,
    userId,
    fileObjects,
    null,
    invertedIndexRef,
    pagesContentRef,
    chunksRef
  );

  console.log(
    `🎉 Lambda processing completed successfully for parse_id: ${id} - All files processed, indexed, and saved to database`
  );

  return data;
}

async function callMain(presignedUrl, fileName) {
  const response = await fetch("http://localhost:8000/parse_to_json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: presignedUrl, file_name: fileName }),
  });

  const data = await response.json();

  return data;
}
