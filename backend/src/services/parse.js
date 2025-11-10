import supabase from "../utils/supabase/client.js";
import { pipeline } from "@xenova/transformers";
import dotenv from "dotenv";
import { OptimizedKeywordIndex } from "../utils/OptimizedKeywordIndex.js";
import { searchQdrant } from "./qdrantService.js";
import { MinHeap } from "../utils/MinHeap.js";

dotenv.config();

let embeddingPipeline = null;

async function loadEmbeddingModel() {
  if (embeddingPipeline) return embeddingPipeline;

  console.log("Loading embedding model...");
  embeddingPipeline = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  console.log("Model loaded successfully");
  return embeddingPipeline;
}

export async function generateEmbedding(text) {
  if (!embeddingPipeline) {
    await loadEmbeddingModel();
  }

  try {
    const output = await embeddingPipeline(text, {
      pooling: "mean",
      normalize: true,
    });

    return Array.from(output.data);
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

export function createContextualChunks(
  sortedMapping,
  chunkSizeInWords = 80,
  overlapWords = 20
) {
  const chunks = [];
  let currentWords = [];
  let currentYRange = [];

  for (const [y, row] of sortedMapping) {
    const words = row.map((w) => w.word);

    currentWords.push(...words);
    currentYRange.push(y);

    if (currentWords.length >= chunkSizeInWords) {
      const chunkText = currentWords.join(" ");

      chunks.push({
        text: chunkText,
        startY: currentYRange[0],
        endY: currentYRange[currentYRange.length - 1],
        wordCount: currentWords.length,
      });

      currentWords = currentWords.slice(-overlapWords);
      currentYRange = currentYRange.slice(-overlapWords);
    }
  }

  if (currentWords.length > 30) {
    chunks.push({
      text: currentWords.join(" "),
      startY: currentYRange[0],
      endY: currentYRange[currentYRange.length - 1],
      wordCount: currentWords.length,
    });
  }

  return chunks;
}

export async function parse(id, search, userId, options = {}) {
  const { searchMode, topK = 10 } = options;

  if (!search || !search.trim()) {
    return {
      success: true,
      searchResults: [],
      error: `failed since the search is empty`,
    };
  }

  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .eq("parse_id", id);

    if (error) {
      console.error("Database error:", error);
      return {
        success: false,
        searchResults: [],
        error: `failed extracting files: ${error.message}`,
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        searchResults: [],
        error: "No files found for the given ID",
      };
    }

    const d = data[0];
    const pagesContent = d.pages_metadata;
    const inverted = d.inverted_index;
    const buildIndex = d.build_index;

    if (!pagesContent || pagesContent.length === 0) {
      return {
        success: true,
        searchResults: [],
        error: "No pages found in the document",
      };
    }

    let searchResults;
    let topPages;
    if (searchMode === "hybrid") {
      const [semanticResults, keywordResults] = await Promise.all([
        (async () => {
          let queryEmbedding = await generateEmbedding(search);
          const results = await searchQdrant(id, userId, queryEmbedding, {
            topK: topK * 2,
            scoreThreshold: 0.2,
          });

          //console.log("sematic scores are: ", results);
          return results;
        })(),
        (async () => {
          const scores = await searchContent(pagesContent, inverted, search);

          if (Object.keys(scores || {}).length === 0) {
            return [];
          }
          const topPages = Object.entries(scores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, topK * 2)
            .map(([id]) => id);

          const results = searchBuildIndex(
            buildIndex,
            search,
            pagesContent,
            topPages
          );

          return results.map((result) => ({
            ...result,
            score: scores[result.pageId],
            startY: result.y,
            endY: result.y,
          }));
        })(),
      ]);

      if (semanticResults.length === 0 && keywordResults.length === 0) {
        return {
          success: true,
          searchResults: [],
          error: "No results found",
        };
      }

      const normalize = (x, min, max) => {
        const range = max - min;
        if (range === 0) return 0.5;
        return (x - min) / range;
      };

      const getMinMax = (arr) => {
        if (arr.length === 0) return { min: 0, max: 1 };
        const scores = arr.map((item) => item.score);
        return {
          min: Math.min(...scores),
          max: Math.max(...scores),
        };
      };

      const semanticRange = getMinMax(semanticResults);
      const keywordRange = getMinMax(keywordResults);

      semanticResults.forEach((item) => {
        item.score = normalize(
          item.score,
          semanticRange.min,
          semanticRange.max
        );
        item.source = "semantic";
      });

      keywordResults.forEach((item) => {
        item.score = normalize(item.score, keywordRange.min, keywordRange.max);
        item.source = "keyword";
      });

      const resultMap = new Map();

      for (const result of semanticResults) {
        const key = `${result.pageId}-${result.startY}-${result.endY}`;
        resultMap.set(key, result);
      }

      for (const result of keywordResults) {
        const key = `${result.pageId}-${result.startY}-${result.endY}`;

        if (resultMap.has(key)) {
          const existing = resultMap.get(key);
          existing.score = (existing.score + result.score) / 2;
        } else {
          resultMap.set(key, result);
        }
      }

      const heap = new MinHeap(topK);
      for (const result of resultMap.values()) {
        heap.push(result);
      }

      searchResults = heap.toArray();

      return {
        success: true,
        searchResults,
        error: null,
        metadata: {
          searchMode,
          totalResults: searchResults.length,
          semanticCount: semanticResults.length,
          keywordCount: keywordResults.length,
          uniqueResults: resultMap.size,
        },
      };
    } else if (searchMode === "semantic") {
      let queryEmbedding;
      try {
        queryEmbedding = await generateEmbedding(search);
      } catch (error) {
        console.error("Error generating query embedding:", error);
        return {
          success: false,
          searchResults: [],
          error: `Failed to generate query embedding: ${error.message}`,
        };
      }

      try {
        searchResults = await searchQdrant(id, userId, queryEmbedding, {
          topK: topK,
          scoreThreshold: 0.3,
        });

        if (searchResults.length === 0) {
          return {
            success: true,
            searchResults: [],
            error: "No results found in Qdrant",
          };
        }

        console.log(`Found ${searchResults.length} results from Qdrant`);
      } catch (error) {
        console.error("Qdrant search failed:", error);
        return {
          success: false,
          searchResults: [],
          error: `Qdrant search failed: ${error.message}`,
        };
      }
    } else if (searchMode === "tfidf") {
      const scores = await searchContent(pagesContent, inverted, search);
      topPages = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, topK)
        .map(([id]) => id);

      if (Object.keys(scores || {}).length === 0) {
        return {
          success: true,
          searchResults: [],
          error: "No results found",
        };
      }

      searchResults = searchBuildIndex(
        buildIndex,
        search,
        pagesContent,
        topPages
      );
    } else {
      return {
        success: false,
        searchResults: [],
        error: `Invalid search mode: ${searchMode}`,
      };
    }

    if (!searchResults || searchResults.length === 0) {
      return {
        success: true,
        searchResults: [],
        error: "search yielded no results",
      };
    }

    return {
      success: true,
      searchResults,
      error: null,
      metadata: {
        searchMode,
        totalResults: searchResults.length,
        topPages: topPages || [],
      },
    };
  } catch (error) {
    console.error("Unexpected error in parse function:", error);
    return {
      success: false,
      searchResults: [],
      error: `Unexpected error: ${error.message}`,
    };
  }
}

function searchBuildIndex(buildIndex, searchTerms, pagesContent, topPageIds) {
  const terms = searchTerms.toLowerCase().split(/\s+/);
  const pageSet = new Set(topPageIds);
  const sentenceMap = new Map();
  const pageMappings = new Map();

  for (let page of pagesContent) {
    if (pageSet.has(page.id)) {
      pageMappings.set(page.id, new Map(page.mapping));
    }
  }

  const isOptimizedFormat =
    buildIndex.prefixIndex !== undefined ||
    buildIndex.suffixIndex !== undefined ||
    buildIndex.ngramIndex !== undefined;

  if (isOptimizedFormat) {
    const index = OptimizedKeywordIndex.fromJSON(buildIndex);

    for (const term of terms) {
      const normalizedTerm = term.replace(/[.,;:!?'"()[\]{}]+/g, "");
      if (!normalizedTerm) continue;

      const matches = index.search(normalizedTerm, "all");

      for (const [word, pageId, y] of matches) {
        if (!pageSet.has(pageId)) continue;

        const mapping = pageMappings.get(pageId);
        if (!mapping) continue;

        const row = mapping.get(y);
        if (!row) continue;

        const key = `${pageId}-${y}`;
        if (!sentenceMap.has(key)) {
          sentenceMap.set(key, {
            file_name:
              pagesContent.find((p) => p.id === pageId)?.name || "Unknown",
            pageId: pageId,
            y: y,
            sentence: row.map((w) => w.word).join(" "),
          });
        }
      }
    }
  } else {
    // Legacy format - backward compatibility
    for (const term of terms) {
      const normalizedTerm = term.replace(/[.,;:!?'"()[\]{}]+/g, "");
      const firstChar = normalizedTerm[0]?.toLowerCase();
      if (!firstChar) continue;

      // Handle both old object format and array format
      const positions = buildIndex[firstChar] || [];

      for (const pos of positions) {
        // Handle both old format {word, pageId, y} and new format [word, pageId, y]
        const word = Array.isArray(pos) ? pos[0] : pos.word;
        const pageId = Array.isArray(pos) ? pos[1] : pos.pageId;
        const y = Array.isArray(pos) ? pos[2] : pos.y;

        if (!pageSet.has(pageId)) continue;

        const mapping = pageMappings.get(pageId);
        if (!mapping) continue;

        const row = mapping.get(y);
        if (!row) continue;

        // Check all match types
        if (
          word === normalizedTerm ||
          word.startsWith(normalizedTerm) ||
          word.endsWith(normalizedTerm) ||
          word.includes(normalizedTerm)
        ) {
          const key = `${pageId}-${y}`;
          if (!sentenceMap.has(key)) {
            sentenceMap.set(key, {
              file_name:
                pagesContent.find((p) => p.id === pageId)?.name || "Unknown",
              pageId: pageId,
              y: y,
              sentence: row.map((w) => w.word).join(" "),
            });
          }
        }
      }
    }
  }

  return [...sentenceMap.values()];
}

async function searchContent(sitesContent, inverted, search) {
  const terms = search.toLowerCase().replace(/[.,]/g, "").split(/\s+/);
  const N = sitesContent.length;

  const appearance = {};
  const TF = [];

  for (const { id, total_words } of sitesContent) {
    for (const term of terms) {
      const counts =
        inverted[term] && inverted[term][id] ? inverted[term][id] : 0;

      if (counts > 0) {
        if (!appearance[term]) appearance[term] = new Set();
        appearance[term].add(id);
      }

      TF.push({ id, term, tf: counts / total_words });
    }
  }

  const IDF = {};
  for (const term of terms) {
    const df = appearance[term] ? appearance[term].size : 0;
    IDF[term] = df === 0 ? 0 : Math.log((N + 1) / (df + 1)) + 1;
  }

  const scores = {};
  for (const { id, term, tf } of TF) {
    if (!scores[id]) scores[id] = 0;
    scores[id] += tf * IDF[term];
  }

  return scores;
}
