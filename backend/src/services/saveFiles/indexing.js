import { AppError } from "../../middleware/errorHandler.js";

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
    if (!docs || !Array.isArray(docs)) {
      console.warn("Invalid docs input:", typeof docs);
      return {};
    }

    const inverted = {};

    for (let doc of docs) {
      if (!doc || !doc.pages || !Array.isArray(doc.pages)) {
        console.warn("Invalid doc structure, skipping:", {
          hasDoc: !!doc,
          hasPages: !!doc?.pages,
          pagesType: typeof doc?.pages,
        });
        continue;
      }

      for (const page of doc.pages) {
        if (!page || typeof page.page_number === 'undefined' || !page.file_name) {
          console.warn("Invalid page structure, skipping:", {
            hasPage: !!page,
            hasPageNumber: page && typeof page.page_number !== 'undefined',
            hasFileName: !!page?.file_name,
          });
          continue;
        }

        const pageNo = page.page_number;
        const fileName = page.file_name;

        if (!page.blocks || !Array.isArray(page.blocks)) {
          console.warn(`Page ${pageNo} in ${fileName} has no blocks, skipping`);
          continue;
        }

        for (const block of page.blocks) {
          if (!block || !block.lines || !Array.isArray(block.lines)) {
            continue;
          }

          for (const line of block.lines) {
            if (!line || !line.spans || !Array.isArray(line.spans)) {
              continue;
            }

            const normalizedText = line.spans.map((s) => s?.text || "").join(" ");

            const words = normalizedText.toLowerCase().split(/\s+/);

            if (!words || words.length === 0) continue;

            for (const word of words) {
              if (!word) continue;
              
              const tokenized = normalizeToken(word);

              if (!tokenized) continue;

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
  } catch (error) {
    console.error("Inverted index creation error:", {
      message: error.message,
      stack: error.stack,
      docsLength: docs?.length,
      docsType: typeof docs,
    });
    throw new AppError(
      `Building Inverted index failed: ${error.message}`,
      500,
      "INVERTED_INDEX_FAILED_ERROR"
    );
  }
}
