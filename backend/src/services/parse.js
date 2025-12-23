import supabase from "../utils/supabase/client.js";
import dotenv from "dotenv";
import { searchQdrant } from "./qdrantService.js";
import { getJsonFromS3 } from "./saveFiles/upload.js";
import { AppError } from "../middleware/errorHandler.js";
import { SearchRewrite } from "./searchRewrite.js";
import { generateEmbedding } from "./parse/embedding.js";
import { searchBuildIndex, searchContent } from "./parse/searchIndex.js";
import { createPresignedUrl } from "./saveFiles/upload.js";
dotenv.config();

export { generateEmbedding } from "./parse/embedding.js";
export { createContextualChunks } from "./parse/chunks.js";

async function getFileMapping(files) {
  const mapping = {};
  if (!files || !Array.isArray(files)) return mapping;

  const results = await Promise.all(
    files.map(async (file) => {
      try {
        const res = await createPresignedUrl(file);
        return res;
      } catch (err) {
        console.error(
          `Failed to create presigned URL for ${file.file_name}:`,
          err
        );
        return null;
      }
    })
  );

  results.filter(Boolean).forEach((res, index) => {
    mapping[res.file_name] = res.presignedUrl;
    mapping[`Document ${index + 1}`] = res.presignedUrl;
  });
  return mapping;
}

function performRRF(semanticResults, keywordResults, k = 60) {
  const fusedScores = new Map();

  const processList = (results) => {
    results.forEach((item, index) => {
      const key = `${item.pageId}-${item.startY}-${item.endY}`;
      const rank = index + 1;
      const score = 1 / (k + rank);

      if (fusedScores.has(key)) {
        const existing = fusedScores.get(key);
        existing.score += score;
      } else {
        fusedScores.set(key, { ...item, score });
      }
    });
  };

  processList(semanticResults);
  processList(keywordResults);

  return Array.from(fusedScores.values()).sort((a, b) => b.score - a.score);
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

    const fileMapping = await getFileMapping(d.files);

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
                  return { termStats: {}, hits: [] };
                }
                const topPagesForKeyword = Object.entries(scores)
                  .filter(([, score]) => score > 0)
                  .map(([id]) => id);

                const termStats = searchBuildIndex(
                  buildIndex,
                  search,
                  pagesContent,
                  topPagesForKeyword
                );

                const hits = [];
                for (const term in termStats) {
                  for (const fileName in termStats[term].files) {
                    for (const pageNo in termStats[term].files[fileName]
                      .pages) {
                      const pageData =
                        termStats[term].files[fileName].pages[pageNo];
                      // Find pageId from pagNo/pagesContent
                      const page = pagesContent.find(
                        (p) =>
                          (p.pageNumber ?? p.id) == pageNo &&
                          p.name === fileName
                      );
                      if (!page) continue;

                      hits.push(
                        ...pageData.coords.map((coord) => ({
                          pageId: page.id,
                          file_name: fileName,
                          y: coord.y,
                          startY: coord.y,
                          endY: coord.y,
                          sentence: coord.word, // dummy sentence or we could try to reconstruct
                          score: scores[page.id] || 0,
                        }))
                      );
                    }
                  }
                }

                return { termStats, hits };
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

          const { termStats, hits: keywordHits } = keywordResults;

          if (semanticResults.length === 0 && keywordHits.length === 0) {
            return {
              success: true,
              searchResults: [],
              termStats: termStats || {},
              fileMapping,
            };
          }

          semanticResults.sort((a, b) => b.score - a.score);
          keywordHits.sort((a, b) => b.score - a.score);

          const finalResults = performRRF(semanticResults, keywordHits);

          if (!finalResults || finalResults.length === 0) {
            return {
              success: true,
              searchResults: [],
              termStats: termStats || {},
              fileMapping,
            };
          }

          return {
            success: true,
            searchResults: finalResults.slice(0, topK),
            termStats: termStats || {},
            fileMapping,
            metadata: {
              searchMode,
              totalResults: finalResults.length,
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
              fileMapping,
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
              fileMapping,
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
              termStats: {},
              fileMapping,
            };
          }

          const topPagesForTfidf = Object.entries(scores)
            .filter(([, score]) => score > 0)
            .map(([id]) => id);

          const termStats = await searchBuildIndex(
            buildIndex,
            search,
            pagesContent,
            topPagesForTfidf,
            fileMapping
          );

          console.log(termStats);

          return {
            success: true,
            searchResults: [],
            termStats,
            fileMapping,
          };
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

    return {
      success: true,
      searchResults: searchResults || [],
      termStats: {},
      fileMapping,
    };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(`System error: ${error.message}`, 500, "SYSTEM_ERROR");
  }
}
