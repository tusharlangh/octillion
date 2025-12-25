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

            const words = normalizedText.toLowerCase().match(/\b[\w]+\b/g);

            if (!words) continue;

            for (const word of words) {
              if (!inverted[word]) inverted[word] = {};
              if (!inverted[word][fileName]) inverted[word][fileName] = {};
              if (!inverted[word][fileName][`p${pageNo}`]) {
                inverted[word][fileName][`p${pageNo}`] = [];
              }

              inverted[word][fileName][`p${pageNo}`].push({
                lineBBox: line.bbox,
                text: word,
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
