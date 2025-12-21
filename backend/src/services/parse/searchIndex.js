import { OptimizedKeywordIndex } from "../../utils/OptimizedKeywordIndex.js";
import { AppError, ValidationError } from "../../middleware/errorHandler.js";
import { identifyBlocks } from "./layoutEngine.js";

export function searchBuildIndex(
  buildIndex,
  searchTerms,
  pagesContent,
  topPageIds
) {
  try {
    const terms = searchTerms.toLowerCase().split(/\s+/);
    const pageSet = new Set(topPageIds);
    const sentenceMap = new Map();
    const pageMappings = new Map();

    for (let page of pagesContent) {
      if (!page || !page.id) {
        continue;
      }
      if (pageSet.has(page.id)) {
        if (!page.mapping) {
          continue;
        }
        pageMappings.set(page.id, new Map(page.mapping));
      }
    }

    const isOptimizedFormat =
      buildIndex.prefixIndex !== undefined ||
      buildIndex.suffixIndex !== undefined ||
      buildIndex.ngramIndex !== undefined;

    function getSentences(y, mapping) {
      const keys = Array.from(mapping.keys()).sort((a, b) => b - a);
      console.log(keys);

      const pos = keys.indexOf(y);
      if (pos === -1) return null;

      const startIndex = Math.max(0, pos - 2);
      const endIndex = Math.min(keys.length - 1, pos + 2);
      const needed = keys.slice(startIndex, endIndex + 1);

      if (needed.length === 0) {
        return null;
      }

      const parts = [];

      for (let key of needed) {
        const row = mapping.get(key);
        if (!row) continue;

        const text = row
          .filter((w) => w && w.word)
          .map((w) => w.word)
          .join(" ");

        parts.push(text);
      }

      const sentence = parts.join(" ").trim();
      const startY = needed[needed.length - 1];
      const endY = needed[0];
      console.log(`startY: ${startY}, endY: ${endY}`);

      return {
        sentence,
        range: { start: startY, end: endY },
      };
    }

    if (isOptimizedFormat) {
      let index;
      try {
        index = OptimizedKeywordIndex.fromJSON(buildIndex);
      } catch (error) {
        throw new AppError(
          `Failed to parse optimized index: ${error.message}`,
          500,
          "INDEX_PARSE_ERROR"
        );
      }

      const processedRanges = new Map();

      for (const term of terms) {
        const normalizedTerm = term.replace(/[.,;:!?'\"()[\]{}]+/g, "");
        if (!normalizedTerm) continue;

        let matches;

        try {
          matches = index.search(normalizedTerm, "all");
        } catch (error) {
          continue;
        }

        for (const [word, pageId, y] of matches) {
          if (!pageSet.has(pageId)) continue;

          const mapping = pageMappings.get(pageId);

          if (!mapping) continue;

          if (!processedRanges.has(pageId)) {
            processedRanges.set(pageId, []);
          }

          const ranges = processedRanges.get(pageId);

          const isAlreadyCovered = ranges.some(
            (range) => y >= range.start && y <= range.end
          );
          if (isAlreadyCovered) continue;

          const key = `${pageId}-${y}`;
          if (sentenceMap.has(key)) continue;

          const result = getSentences(y, mapping);

          if (!result) continue;

          const { sentence, range } = result;

          ranges.push(range);

          const fallbackSentence = mapping.has(y)
            ? mapping
                .get(y)
                .filter((w) => w && w.word)
                .map((w) => w.word)
                .join(" ")
            : "";

          sentenceMap.set(key, {
            file_name:
              pagesContent.find((p) => p.id === pageId)?.name || "Unknown",
            pageId: pageId,
            y: y,
            sentence: sentence || fallbackSentence,
          });
        }
      }
    } else {
      const processedRanges = new Map();

      for (const term of terms) {
        const normalizedTerm = term.replace(/[.,;:!?'\"()[\]{}]+/g, "");
        const firstChar = normalizedTerm[0]?.toLowerCase();
        if (!firstChar) continue;

        const positions = buildIndex[firstChar] || [];

        if (!Array.isArray(positions)) {
          continue;
        }

        for (const pos of positions) {
          const word = Array.isArray(pos) ? pos[0] : pos.word;
          const pageId = Array.isArray(pos) ? pos[1] : pos.pageId;
          const y = Array.isArray(pos) ? pos[2] : pos.y;

          if (!pageSet.has(pageId)) continue;

          const mapping = pageMappings.get(pageId);
          if (!mapping) continue;

          const row = mapping.get(y);
          if (!row || !Array.isArray(row)) continue;

          if (
            word === normalizedTerm ||
            word.startsWith(normalizedTerm) ||
            word.endsWith(normalizedTerm) ||
            word.includes(normalizedTerm)
          ) {
            if (!processedRanges.has(pageId)) {
              processedRanges.set(pageId, []);
            }

            const ranges = processedRanges.get(pageId);

            const isAlreadyCovered = ranges.some(
              (range) => y >= range.start && y <= range.end
            );

            if (isAlreadyCovered) continue;

            const key = `${pageId}-${y}`;
            if (!sentenceMap.has(key)) {
              const result = getSentences(y, mapping);

              const sentenceText = result ? result.sentence : "";
              const range = result ? result.range : null;

              if (range) {
                ranges.push(range);
              }

              sentenceMap.set(key, {
                file_name:
                  pagesContent.find((p) => p.id === pageId)?.name || "Unknown",
                pageId: pageId,
                y: y,
                sentence: sentenceText,
              });
            }
          }
        }
      }
    }

    return [...sentenceMap.values()];
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to search build index: ${error.message}`,
      500,
      "SEARCH_BUILD_INDEX_ERROR"
    );
  }
}

export async function searchContent(sitesContent, inverted, search) {
  try {
    if (
      !sitesContent ||
      !Array.isArray(sitesContent) ||
      sitesContent.length === 0
    ) {
      throw new AppError(
        "Sites content is empty or invalid",
        500,
        "INVALID_SITES_CONTENT"
      );
    }

    if (!inverted || typeof inverted !== "object") {
      throw new AppError(
        "Inverted index is invalid",
        500,
        "INVALID_INVERTED_INDEX"
      );
    }

    if (!search || typeof search !== "string" || !search.trim()) {
      throw new ValidationError("Search query is required");
    }

    const terms = search
      .toLowerCase()
      .replace(/[.,]/g, "")
      .split(/\s+/)
      .filter((t) => t.length > 0);

    if (terms.length === 0) {
      return {};
    }

    const k1 = 1.2;
    const b = 0.75;
    let totalWords = 0;
    let docCount = 0;
    const docLengths = {};

    for (const page of sitesContent) {
      const wordCount =
        typeof page.total_words === "number" ? page.total_words : 0;

      if (wordCount > 0) {
        totalWords += wordCount;
        docCount++;
        docLengths[page.id] = wordCount;
      }
    }

    const avgdl = docCount > 0 ? totalWords / docCount : 0;
    const N = sitesContent.length;
    const IDF = {};

    for (const term of terms) {
      const termEntry = inverted[term];
      const n_q = termEntry ? Object.keys(termEntry).length : 0;

      IDF[term] = Math.log(1 + (N - n_q + 0.5) / (n_q + 0.5));
    }

    const scores = {};

    for (const term of terms) {
      const termDocs = inverted[term] || {};
      const idf = IDF[term];

      if (!termDocs) continue;

      for (const [pageId, freq] of Object.entries(termDocs)) {
        const docLen = docLengths[pageId] || 0;

        if (docLen === 0) continue;

        const number = freq * (k1 + 1);
        const denom = freq + k1 * (1 - b + b * (docLen / avgdl));

        const score = idf * (number / denom);

        if (!scores[pageId]) scores[pageId] = 0;
        scores[pageId] += score;
      }
    }

    return scores;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to search content: ${error.message}`,
      500,
      "SEARCH_CONTENT_ERROR"
    );
  }
}
