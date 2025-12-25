import { AppError, ValidationError } from "../../middleware/errorHandler.js";

export async function searchBuildIndex(
  searchTerms,
  pagesContent,
  topPageIds,
  fileMapping
) {
  try {
    const terms = searchTerms.toLowerCase().split(/\s+/);
    const pageSet = new Set(topPageIds);

    const pageById = new Map();
    const pageMappings = new Map();

    for (const page of pagesContent) {
      if (!page?.id || !pageSet.has(page.id) || !page.mapping) continue;

      pageById.set(page.id, page);
      pageMappings.set(page.id, new Map(page.mapping));
    }

    if (!isOptimizedFormat) return {};

    const highlights = {};

    const tasks = [];
    const processedMap = new Set();

    for (const rawTerm of terms) {
      const term = rawTerm.replace(/[^\w]/g, "");
      if (!term) continue;

      let matches;
      try {
        //matches = index.search(term, "all");
      } catch {
        continue;
      }

      for (const [word, pageId] of matches) {
        const file_index = Number(pageId.split(".")[0]);
        const key = `${word}:${file_index}`;

        if (processedMap.has(key)) continue;
        processedMap.add(key);

        const pageData = pageById.get(pageId);
        const fileName = pageData ? pageData.name : `Document ${file_index}`;
        const presigned_url = fileMapping[`Document ${file_index}`];

        if (!presigned_url) continue;

        tasks.push(async () => {
          try {
            const results = await callMain(presigned_url, 0, word);

            if (!highlights[word]) {
              highlights[word] = [];
            }

            const transformed = results.map((r) => ({
              file_name: fileName,
              page: r.page,
              rects: r.rects,
              total: r.total || r.rects.length,
            }));

            highlights[word].push(...transformed);
          } catch (e) {
            console.error(
              `Error fetching geometry for ${fileName} word ${word}:`,
              e
            );
          }
        });
      }
    }

    await Promise.all(tasks.map((t) => t()));

    return highlights;
  } catch (error) {
    if (error.isOperational) throw error;

    throw new AppError(
      `Failed to search build index: ${error.message}`,
      500,
      "SEARCH_BUILD_INDEX_ERROR"
    );
  }
}

export async function searchBuildIndex_v2(scores, fileMapping) {
  try {
    const results = [];
    for (let result of scores.results) {
      const url = fileMapping[result.fileName];
      const terms = result.terms;

      for (let term of Object.keys(terms)) {
        const pages = result.terms[term].pages;
        for (let [pageNo, metadata] of Object.entries(pages)) {
          const bboxes = metadata.bboxes;
          const result = await callMain(url, pageNo, term, bboxes);
          results.push(result);
        }
      }
    }

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

async function callMain(presignedUrl, page, query, bboxes) {
  const response = await fetch("http://localhost:8000/geometry_v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: presignedUrl, page, query, bboxes }),
  });

  const data = await response.json();

  return data;
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

    /* ----------------------------------
       Tokenize query
    ---------------------------------- */
    const terms = search.toLowerCase().split(/\s+/).filter(Boolean);

    if (terms.length === 0) return {};

    /* ----------------------------------
       BM25 constants
    ---------------------------------- */
    const k1 = 1.2;
    const b = 0.75;

    /* ----------------------------------
       Build document lengths (file-level)
    ---------------------------------- */
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

    /* ----------------------------------
       Compute IDF per term
    ---------------------------------- */
    const IDF = {};

    for (const term of terms) {
      const termEntry = inverted[term] || {};
      const n_q = Object.keys(termEntry).length;

      IDF[term] = Math.log(1 + (N - n_q + 0.5) / (n_q + 0.5));
    }

    /* ----------------------------------
       Build results with evidence
    ---------------------------------- */
    const fileResults = {};

    for (const term of terms) {
      const termFiles = inverted[term];
      if (!termFiles) continue;

      const idf = IDF[term];

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

        let tf = 0;
        const pageMap = {};

        for (const [pageNo, hits] of Object.entries(pages)) {
          if (!Array.isArray(hits)) continue;

          tf += hits.length;

          pageMap[pageNo] = {
            count: hits.length,
            bboxes: hits.map((h) => h.lineBBox),
          };
        }

        if (tf === 0) continue;

        const dl = docLengths[fileName] || 0;
        if (dl === 0) continue;

        const bm25 =
          idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (dl / avgdl))));

        fileResults[fileName].score += bm25;
        fileResults[fileName].coverage.totalOccurrences += tf;
        fileResults[fileName].coverage.matchedTerms += 1;

        fileResults[fileName].terms[term] = {
          score: bm25,
          occurrences: tf,
          pages: pageMap,
        };
      }
    }

    /* ----------------------------------
       Rank results
    ---------------------------------- */
    const rankedResults = Object.values(fileResults)
      .sort((a, b) => b.score - a.score)
      .map((r, idx) => ({
        ...r,
        rank: idx + 1,
      }));

    /* ----------------------------------
       Final Google-level response
    ---------------------------------- */
    return {
      meta: {
        query: search,
        terms,
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
