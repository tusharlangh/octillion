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

    const termStats = {};

    const pageById = new Map();
    const pageMappings = new Map();

    for (const page of pagesContent) {
      if (!page?.id || !pageSet.has(page.id) || !page.mapping) continue;

      pageById.set(page.id, page);
      pageMappings.set(page.id, new Map(page.mapping));
    }

    const isOptimizedFormat =
      buildIndex.prefixIndex !== undefined ||
      buildIndex.suffixIndex !== undefined ||
      buildIndex.ngramIndex !== undefined;

    if (!isOptimizedFormat) return {};

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

    for (const rawTerm of terms) {
      const term = rawTerm.replace(/[^\w]/g, "");
      if (!term) continue;

      let matches;
      try {
        matches = index.search(term, "all");
      } catch {
        continue;
      }

      for (const [word, pageId, y] of matches) {
        if (!pageSet.has(pageId)) continue;

        const page = pageById.get(pageId);
        const mapping = pageMappings.get(pageId);
        if (!page || !mapping) continue;

        const row = mapping.get(y);
        if (!row) continue;

        const coord = row.find((w) => w.word === word);
        if (!coord) continue;

        const fileName = page.name;
        const pageNo = page.pageNumber ?? pageId;

        if (!termStats[term]) {
          termStats[term] = {
            global: { fileCount: 0 },
            files: {},
          };
        }

        const termEntry = termStats[term];

        if (!termEntry.files[fileName]) {
          termEntry.files[fileName] = {
            total: 0,
            pages: {},
          };
          termEntry.global.fileCount += 1;
        }

        const fileEntry = termEntry.files[fileName];

        if (!fileEntry.pages[pageNo]) {
          fileEntry.pages[pageNo] = {
            coords: [],
            count: 0,
          };
        }

        fileEntry.pages[pageNo].coords.push(coord);
        fileEntry.pages[pageNo].count += 1;
        fileEntry.total += 1;
      }
      Object.entries(termStats[term].files).sort(
        ([, a], [, b]) => b.total - a.total
      );
    }

    Object.keys(termStats).sort(
      (a, b) => termStats[b].global.fileCount - termStats[a].global.fileCount
    );

    return termStats;
  } catch (error) {
    if (error.isOperational) throw error;

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
