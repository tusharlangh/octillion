import supabase from "../utils/supabase/client.js";
import dotenv from "dotenv";
import { searchQdrant } from "./qdrantService.js";
import { getJsonFromS3 } from "./saveFiles/upload.js";
import { MinHeap } from "../utils/MinHeap.js";
import { AppError } from "../middleware/errorHandler.js";
import { SearchRewrite } from "./searchRewrite.js";
import { generateEmbedding } from "./parse/embedding.js";
import { searchBuildIndex, searchContent } from "./parse/searchIndex.js";
dotenv.config();

export { generateEmbedding } from "./parse/embedding.js";
export { createContextualChunks } from "./parse/chunks.js";

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

    let pagesContent = d.pages_metadata;
    let inverted = d.inverted_index;
    let buildIndex = d.build_index;

    if (pagesContent && pagesContent.s3Key) {
      pagesContent = await getJsonFromS3(pagesContent.s3Key);
    }

    if (inverted && inverted.s3Key) {
      inverted = await getJsonFromS3(inverted.s3Key);
    }

    if (buildIndex && buildIndex.s3Key) {
      buildIndex = await getJsonFromS3(buildIndex.s3Key);
    }

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
                  .filter(([, score]) => score > 0)
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

          if (Object.keys(scores || {}).length === 0) {
            return {
              success: true,
              searchResults: [],
            };
          }

          topPages = Object.entries(scores)
            .filter(([, score]) => score > 0)
            .map(([id]) => id);

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
