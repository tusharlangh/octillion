import supabase from "../utils/supabase/client.js";
import { pipeline } from "@xenova/transformers";
import dotenv from "dotenv";
import { OptimizedKeywordIndex } from "../utils/OptimizedKeywordIndex.js";
import { searchQdrant } from "./qdrantService.js";
import { MinHeap } from "../utils/MinHeap.js";
import {
  AppError,
  ValidationError,
  NotFoundError,
} from "../middleware/errorHandler.js";
import { SearchRewrite } from "./searchRewrite.js";

dotenv.config();

let embeddingPipeline = null;

async function loadEmbeddingModel() {
  try {
    if (embeddingPipeline) return embeddingPipeline;

    console.log("Loading embedding model...");
    embeddingPipeline = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("Model loaded successfully");
    return embeddingPipeline;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to load model: ${error.message}`,
      500,
      "FAILED_MODEL_LOADING_ERROR"
    );
  }
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

    if (!output || !output.data) {
      throw new AppError(
        "Invalid embedding output",
        500,
        "INVALID_EMBEDDING_OUTPUT"
      );
    }

    return Array.from(output.data);
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to generate embedding: ${error.message}`,
      500,
      "FAILED_EMBEDDING_ERROR"
    );
  }
}

export function createContextualChunks(
  sortedMapping,
  chunkSizeInWords = 80,
  overlapWords = 20
) {
  if (!sortedMapping || sortedMapping.length === 0) {
    return "";
  }

  try {
    const chunks = [];
    let currentWords = [];
    let currentYRange = [];

    for (const [y, row] of sortedMapping) {
      const words = row.map((w) => w.word);

      if (!words || words.length === 0) continue;

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
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    throw new AppError("Failed building chunks", 500, "BUILDING_CHUNKS_ERROR");
  }
}

export async function parse(id, search, userId, options = {}) {
  const { searchMode, topK = 10 } = options;

  try {
    let searchRewrite = new SearchRewrite(search);
    search = searchRewrite.process();

    if (!search || search.length === 0) {
      throw new AppError(
        "Rewriting search came out empty",
        500,
        "REWRITE_SEARCH_ERROR"
      );
    }

    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("user_id", userId)
      .eq("parse_id", id);

    if (error) {
      throw new AppError(
        `Failed to fetch files: ${error.message}`,
        500,
        "SUPABASE_ERROR"
      );
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        searchResults: [],
      };
    }

    const d = data[0];

    if (!d || !d.pages_metadata || !d.inverted_index || !d.build_index) {
      throw new AppError(
        "Invalid or incomplete data row",
        500,
        "INVALID_DATA_ROW"
      );
    }

    const pagesContent = d.pages_metadata;
    const inverted = d.inverted_index;
    const buildIndex = d.build_index;

    if (!pagesContent || pagesContent.length === 0) {
      throw new AppError("Pages content is empty", 500, "EMPTY_PAGES_CONTENT");
    }

    if (
      !inverted ||
      typeof inverted !== "object" ||
      Object.keys(inverted).length === 0
    ) {
      throw new AppError(
        "Inverted index is empty or invalid",
        500,
        "EMPTY_INVERTED_INDEX"
      );
    }

    if (
      !buildIndex ||
      typeof buildIndex !== "object" ||
      Object.keys(buildIndex).length === 0
    ) {
      throw new AppError(
        "Build index is empty or invalid",
        500,
        "EMPTY_BUILD_INDEX"
      );
    }

    let searchResults;
    let topPages;

    try {
      if (searchMode === "hybrid") {
        try {
          const [semanticResults, keywordResults] = await Promise.all([
            (async () => {
              try {
                let queryEmbedding = await generateEmbedding(search);

                if (!queryEmbedding || queryEmbedding.length === 0) {
                  return [];
                }

                const results = await searchQdrant(id, userId, queryEmbedding, {
                  topK: topK * 2,
                  scoreThreshold: 0.2,
                });

                if (!results || results.length === 0) {
                  return [];
                }

                return results;
              } catch (error) {
                if (error.isOperational) {
                  throw error;
                }
                throw new AppError(
                  `Semantic search failed: ${error.message}`,
                  500,
                  "SEMANTIC_SEARCH_ERROR"
                );
              }
            })(),
            (async () => {
              try {
                const scores = await searchContent(
                  pagesContent,
                  inverted,
                  search
                );

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

                if (results.length === 0) {
                  return [];
                }

                return results.map((result) => ({
                  ...result,
                  score: scores[result.pageId],
                  startY: result.y,
                  endY: result.y,
                }));
              } catch (error) {
                if (error.isOperational) {
                  throw error;
                }
                throw new AppError(
                  `Keyword search failed: ${error.message}`,
                  500,
                  "KEYWORD_SEARCH_ERROR"
                );
              }
            })(),
          ]);

          if (semanticResults.length === 0 && keywordResults.length === 0) {
            return {
              success: true,
              searchResults: [],
            };
          }

          const normalize = (x, min, max) => {
            const range = max - min;
            if (range === 0) return 0.5;
            return (x - min) / range;
          };

          const getMinMax = (arr) => {
            if (arr.length === 0) return { min: 0, max: 1 };
            const scores = arr.map((item) => item.score || 0);
            return {
              min: Math.min(...scores),
              max: Math.max(...scores),
            };
          };

          const semanticRange = getMinMax(semanticResults);
          const keywordRange = getMinMax(keywordResults);

          semanticResults.forEach((item) => {
            item.score = normalize(
              item.score || 0,
              semanticRange.min,
              semanticRange.max
            );
            item.source = "semantic";
          });

          keywordResults.forEach((item) => {
            item.score = normalize(
              item.score || 0,
              keywordRange.min,
              keywordRange.max
            );
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

          if (!heap) {
            throw new AppError(
              "Failed to create heap",
              500,
              "HEAP_CREATION_ERROR"
            );
          }

          searchResults = heap.toArray();

          if (!searchResults || searchResults.length === 0) {
            return {
              success: true,
              searchResults: [],
            };
          }

          return {
            success: true,
            searchResults,
            metadata: {
              searchMode,
              totalResults: searchResults.length,
              semanticCount: semanticResults.length,
              keywordCount: keywordResults.length,
              uniqueResults: resultMap.size,
            },
          };
        } catch (error) {
          if (error.isOperational) {
            throw error;
          }
          throw new AppError(
            `Hybrid search failed: ${error.message}`,
            500,
            "FAILED_HYBRID_SEARCH_ERROR"
          );
        }
      } else if (searchMode === "semantic") {
        try {
          let queryEmbedding = await generateEmbedding(search);

          if (!queryEmbedding || queryEmbedding.length === 0) {
            return {
              success: true,
              searchResults: [],
            };
          }

          searchResults = await searchQdrant(id, userId, queryEmbedding, {
            topK: topK,
            scoreThreshold: 0.3,
          });

          if (searchResults.length === 0) {
            return {
              success: true,
              searchResults: [],
            };
          }
        } catch (error) {
          if (error.isOperational) {
            throw error;
          }
          throw new AppError(
            `Semantic search failed: ${error.message}`,
            500,
            "FAILED_SEMANTIC_SEARCH_ERROR"
          );
        }
      } else if (searchMode === "tfidf") {
        try {
          const scores = await searchContent(pagesContent, inverted, search);
          topPages = Object.entries(scores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, topK)
            .map(([id]) => id);

          if (Object.keys(scores || {}).length === 0) {
            return {
              success: true,
              searchResults: [],
            };
          }

          searchResults = searchBuildIndex(
            buildIndex,
            search,
            pagesContent,
            topPages
          );

          if (!searchResults || searchResults.length === 0) {
            return {
              success: true,
              searchResults: [],
            };
          }
        } catch (error) {
          if (error.isOperational) {
            throw error;
          }
          throw new AppError(
            `Keyword search failed: ${error.message}`,
            500,
            "FAILED_KEYWORD_SEARCH_ERROR"
          );
        }
      }
    } catch (error) {
      if (error.isOperational) {
        throw error;
      }
      throw new AppError(
        `Failed searching: ${error.message}`,
        500,
        "FAILED_SEARCH_ERROR"
      );
    }

    if (!searchResults || searchResults.length === 0) {
      return {
        success: true,
        searchResults: [],
      };
    }

    return {
      success: true,
      searchResults,
    };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(`System error: ${error.message}`, 500, "SYSTEM_ERROR");
  }
}

function searchBuildIndex(buildIndex, searchTerms, pagesContent, topPageIds) {
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

      for (const term of terms) {
        const normalizedTerm = term.replace(/[.,;:!?'"()[\]{}]+/g, "");
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

          const row = mapping.get(y);
          if (!row || !Array.isArray(row)) continue;

          const key = `${pageId}-${y}`;
          if (!sentenceMap.has(key)) {
            sentenceMap.set(key, {
              file_name:
                pagesContent.find((p) => p.id === pageId)?.name || "Unknown",
              pageId: pageId,
              y: y,
              sentence: row.map((w) => (w && w.word ? w.word : "")).join(" "),
            });
          }
        }
      }
    } else {
      for (const term of terms) {
        const normalizedTerm = term.replace(/[.,;:!?'"()[\]{}]+/g, "");
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
            const key = `${pageId}-${y}`;
            if (!sentenceMap.has(key)) {
              sentenceMap.set(key, {
                file_name:
                  pagesContent.find((p) => p.id === pageId)?.name || "Unknown",
                pageId: pageId,
                y: y,
                sentence: row.map((w) => (w && w.word ? w.word : "")).join(" "),
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

async function searchContent(sitesContent, inverted, search) {
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

    const N = sitesContent.length;
    const appearance = {};
    const TF = [];

    for (const page of sitesContent) {
      if (!page || !page.id || typeof page.total_words !== "number") {
        continue;
      }

      for (const term of terms) {
        const counts =
          inverted[term] && inverted[term][page.id]
            ? inverted[term][page.id]
            : 0;

        if (counts > 0) {
          if (!appearance[term]) appearance[term] = new Set();
          appearance[term].add(page.id);
        }

        if (page.total_words > 0) {
          TF.push({ id: page.id, term, tf: counts / page.total_words });
        }
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
