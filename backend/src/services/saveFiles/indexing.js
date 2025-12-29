import { AppError } from "../../middleware/errorHandler.js";
import { OptimizedKeywordIndex } from "../../utils/OptimizedKeywordIndex.js";
import { createContextualChunks } from "../parse.js";

export function createInvertedSearch(pagesContent) {
  try {
    const inverted = {};

    for (const { id, site_content } of pagesContent) {
      for (const word of site_content.split(" ")) {
        if (!inverted[word]) {
          inverted[word] = {};
        }
        const termMap = inverted[word];
        termMap[id] = (termMap[id] || 0) + 1;
      }
    }

    return inverted;
  } catch {
    throw new AppError(
      "Building Inverted index failed",
      500,
      "INVERTED_INDEX_FAILED_ERROR"
    );
  }
}

function normalizeToken(token) {
  if (!token || typeof token !== "string") return token;
  return token
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/[^\p{L}\p{N}]+$/u, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export function createInvertedSearch_V2_1(docs) {
  try {
    const inverted = {};

    for (let doc of docs) {
      for (const page of doc.pages) {
        const pageNo = page.page_number;
        const fileName = page.file_name;

        for (const block of page.blocks) {
          for (const line of block.lines) {
            const normalizedText = line.spans.map((s) => s.text).join(" ");

            const words = normalizedText.toLowerCase().split(/\s+/);

            if (!words) continue;

            for (const word of words) {
              const tokenized = normalizeToken(word);

              if (!inverted[tokenized]) inverted[tokenized] = {};
              if (!inverted[tokenized][fileName])
                inverted[tokenized][fileName] = {};
              if (!inverted[tokenized][fileName][`p${pageNo}`]) {
                inverted[tokenized][fileName][`p${pageNo}`] = [];
              }

              inverted[tokenized][fileName][`p${pageNo}`].push({
                lineBBox: line.bbox,
                surface: word,
                base: tokenized,
              });
            }
          }
        }
      }
    }

    return inverted;
  } catch {
    throw new AppError(
      "Building Inverted index failed",
      500,
      "INVERTED_INDEX_FAILED_ERROR"
    );
  }
}

export function buildOptimizedIndex(pagesContent) {
  try {
    const index = new OptimizedKeywordIndex();

    for (const page of pagesContent) {
      const pageId = page.id;
      const mapping = new Map(page.mapping);

      for (const [y, row] of mapping) {
        for (const wordObj of row) {
          const word = wordObj.word;
          if (word) {
            index.add(word, pageId, y);
          }
        }
      }
    }

    if (index.getStorageSize && index.getStorageSize() === 0) {
      throw new AppError(
        "Keyword index is empty",
        500,
        "EMPTY_KEYWORD_INDEX_ERROR",
        {
          pagesContent: pagesContent,
          index: index.toJSON,
        }
      );
    }

    index.finalize();

    return index;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    throw new AppError(
      `Building keyword index failed: ${error}`,
      500,
      "KEYWORD_INDEX_FAILED_ERROR"
    );
  }
}

export async function generateChunks(pagesContent) {
  try {
    for (const page of pagesContent) {
      try {
        const chunks = createContextualChunks(page.mapping);
        page.chunks = chunks;
      } catch (error) {
        if (error.isOperational) {
          throw error;
        }
        throw new AppError(
          `Failed generating chunks for page id: ${page.id}`,
          500,
          "FAILED_CHUNKS_ERROR"
        );
      }
    }
    return pagesContent;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError("Failed generating chunks", 500, "FAILED_CHUNKS_ERROR");
  }
}
