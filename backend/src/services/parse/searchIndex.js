import { AppError, ValidationError } from "../../middleware/errorHandler.js";
import pLimit from "p-limit";

export async function searchBuildIndex_v2(scores, fileMapping) {
  try {
    const results = {};
    const geometryBatchMap = new Map();
    const limit = pLimit(20);

    for (let result of scores.results) {
      const url = fileMapping[result.fileName];
      const score = result.score;

      if (!geometryBatchMap.has(result.fileName)) {
        geometryBatchMap.set(result.fileName, {
          fileName: result.fileName,
          url,
          score,
          pages: [],
        });
      }

      const fileEntry = geometryBatchMap.get(result.fileName);

      for (let term of Object.keys(result.terms)) {
        const pages = result.terms[term].pages;

        for (let [pageNo, metadata] of Object.entries(pages)) {
          let pageEntry = fileEntry.pages.find((p) => p.page === pageNo);

          if (!pageEntry) {
            pageEntry = { page: pageNo, terms: [] };
            fileEntry.pages.push(pageEntry);
          }

          pageEntry.terms.push({
            term,
            matches: metadata.matches,
          });
        }
      }
    }

    const geometryCalls = [...geometryBatchMap.values()].map((batch) => ({
      run: () => callMainBatch(batch),
      fileName: batch.fileName,
      score: batch.score,
    }));

    const geometryResults = await Promise.all(
      geometryCalls.map((c) => limit(() => c.run()))
    );

    geometryResults.forEach((batchResult, idx) => {
      const { fileName, score } = geometryCalls[idx];

      if (!results[fileName]) {
        results[fileName] = { result: [], score: 0 };
      }

      if (batchResult.results && Array.isArray(batchResult.results)) {
        for (const pageResult of batchResult.results) {
          const page = pageResult.page;

          if (pageResult.results && Array.isArray(pageResult.results)) {
            for (const termResult of pageResult.results) {
              results[fileName].result.push({
                file_name: fileName,
                page: page,
                query: termResult.term,
                rects: termResult.rects,
                total: termResult.total,
              });
            }
          }
        }
      }

      results[fileName].score = score;
    });

    return results;
  } catch (error) {
    if (error.isOperational) throw error;

    throw new AppError(
      `Failed to search build index: ${error.message}`,
      500,
      "SEARCH_BUILD_INDEX_ERROR"
    );
  }
}

async function callMainBatch({ fileName, url, pages }) {
  const response = await fetch("http://localhost:8000/geometry_v2/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      file_name: fileName,
      url,
      pages,
    }),
  });

  const data = await response.json();

  return data;
}

export async function searchContent_v2(sitesContent, inverted, search) {
  try {
    if (!Array.isArray(sitesContent) || sitesContent.length === 0) {
      throw new AppError("Sites content invalid", 500);
    }

    if (!inverted || typeof inverted !== "object") {
      throw new AppError("Inverted index invalid", 500);
    }

    if (!search || typeof search !== "string") {
      throw new ValidationError("Search query required");
    }

    const queryTerms = search.toLowerCase().split(/\s+/).filter(Boolean);

    if (queryTerms.length === 0) return {};

    const k1 = 1.2;
    const b = 0.75;

    const docLengths = {};
    let totalWords = 0;
    let docCount = 0;

    for (const site of sitesContent) {
      if (!Array.isArray(site.pages)) continue;

      for (const page of site.pages) {
        const fileName = page.file_name;
        if (!fileName) continue;

        if (!docLengths[fileName]) {
          docLengths[fileName] = 0;
          docCount++;
        }

        for (const block of page.blocks || []) {
          if (block.type !== "text") continue;

          for (const line of block.lines || []) {
            for (const span of line.spans || []) {
              if (typeof span.text === "string") {
                docLengths[fileName] += span.text.trim().split(/\s+/).length;
              }
            }
          }
        }
      }
    }

    for (const len of Object.values(docLengths)) {
      totalWords += len;
    }

    const avgdl = docCount > 0 ? totalWords / docCount : 0;
    const N = docCount;

    const matchingTermsMap = {};

    for (const queryTerm of queryTerms) {
      const matches = [];

      for (const indexedTerm of Object.keys(inverted)) {
        if (indexedTerm.includes(queryTerm)) {
          matches.push(indexedTerm);
        }
      }

      matchingTermsMap[queryTerm] = matches;
    }

    const IDF = {};

    for (const queryTerm of queryTerms) {
      const matchingTerms = matchingTermsMap[queryTerm];

      const docsWithTerm = new Set();

      for (const term of matchingTerms) {
        const termEntry = inverted[term] || {};
        for (const fileName of Object.keys(termEntry)) {
          docsWithTerm.add(fileName);
        }
      }

      const n_q = docsWithTerm.size;
      IDF[queryTerm] = Math.log(1 + (N - n_q + 0.5) / (n_q + 0.5));
    }

    const fileResults = {};

    for (const queryTerm of queryTerms) {
      const matchingTerms = matchingTermsMap[queryTerm];
      const idf = IDF[queryTerm];

      for (const term of matchingTerms) {
        const termFiles = inverted[term];
        if (!termFiles) continue;

        for (const [fileName, pages] of Object.entries(termFiles)) {
          if (!fileResults[fileName]) {
            fileResults[fileName] = {
              fileName,
              score: 0,
              coverage: {
                matchedTerms: 0,
                totalOccurrences: 0,
              },
              terms: {},
            };
          }

          if (!fileResults[fileName].terms[queryTerm]) {
            fileResults[fileName].terms[queryTerm] = {
              score: 0,
              occurrences: 0,
              pages: {},
              matchedVariants: [],
            };
          }

          let tf = 0;

          for (const [pageNo, hits] of Object.entries(pages)) {
            if (!Array.isArray(hits)) continue;

            tf += hits.length;

            if (!fileResults[fileName].terms[queryTerm].pages[pageNo]) {
              fileResults[fileName].terms[queryTerm].pages[pageNo] = {
                count: 0,
                matches: [],
              };
            }

            fileResults[fileName].terms[queryTerm].pages[pageNo].count +=
              hits.length;

            fileResults[fileName].terms[queryTerm].pages[pageNo].matches.push(
              ...hits.map((h) => ({
                bbox: h.lineBBox,
                surface: h.surface,
                base: term,
                query: queryTerm,
              }))
            );
          }

          if (tf === 0) continue;

          if (
            !fileResults[fileName].terms[queryTerm].matchedVariants.includes(
              term
            )
          ) {
            fileResults[fileName].terms[queryTerm].matchedVariants.push(term);
          }

          fileResults[fileName].terms[queryTerm].occurrences += tf;
        }

        for (const [fileName, result] of Object.entries(fileResults)) {
          if (result.terms[queryTerm]) {
            const tf = result.terms[queryTerm].occurrences;
            const dl = docLengths[fileName] || 0;

            if (dl > 0 && tf > 0) {
              const bm25 =
                idf *
                ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (dl / avgdl))));

              result.terms[queryTerm].score = bm25;
              result.score += bm25;
            }
          }
        }
      }
    }

    for (const result of Object.values(fileResults)) {
      const matchedTerms = Object.keys(result.terms).length;
      const totalOccurrences = Object.values(result.terms).reduce(
        (sum, term) => sum + term.occurrences,
        0
      );

      result.coverage.matchedTerms = matchedTerms;
      result.coverage.totalOccurrences = totalOccurrences;
    }

    const rankedResults = Object.values(fileResults)
      .sort((a, b) => b.score - a.score)
      .map((r, idx) => ({
        ...r,
        rank: idx + 1,
      }));

    return {
      meta: {
        query: search,
        terms: queryTerms,
        totalDocsMatched: rankedResults.length,
        avgDocLength: avgdl,
      },
      results: rankedResults,
    };
  } catch (error) {
    if (error.isOperational) throw error;

    throw new AppError(
      `Search failed: ${error.message}`,
      500,
      "SEARCH_CONTENT_ERROR"
    );
  }
}
