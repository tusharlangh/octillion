import supabase from "../utils/supabase/client.js";
import { pipeline } from "@xenova/transformers";
import dotenv from "dotenv";
import { MinHeap } from "../utils/MinHeap.js";
import { OptimizedKeywordIndex } from "../utils/OptimizedKeywordIndex.js";

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

    // Create chunk when we reach target size
    if (currentWords.length >= chunkSizeInWords) {
      const chunkText = currentWords.join(" ");

      chunks.push({
        text: chunkText,
        startY: currentYRange[0],
        endY: currentYRange[currentYRange.length - 1],
        wordCount: currentWords.length,
      });

      // Keep overlap for context
      currentWords = currentWords.slice(-overlapWords);
      currentYRange = currentYRange.slice(-overlapWords);
    }
  }

  // Add remaining words as final chunk
  if (currentWords.length > 30) {
    // Lower minimum for last chunk
    chunks.push({
      text: currentWords.join(" "),
      startY: currentYRange[0],
      endY: currentYRange[currentYRange.length - 1],
      wordCount: currentWords.length,
    });
  }

  return chunks;
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function semanticSearchAllChunks(
  pagesContent,
  queryEmbedding,
  topK = 10
) {
  const minHeap = new MinHeap(topK);

  // Process all pages
  for (const page of pagesContent) {
    // Use cached chunks and embeddings if available, otherwise generate on-the-fly
    let chunks, chunkEmbeddings;

    if (
      page.chunks &&
      page.chunk_embeddings &&
      page.chunk_embeddings.length > 0
    ) {
      // Use cached embeddings (preferred - much faster)
      chunks = page.chunks;
      chunkEmbeddings = page.chunk_embeddings;
    } else {
      // Fallback: generate chunks and embeddings on-the-fly (for backward compatibility)
      chunks = createContextualChunks(page.mapping);
      // Generate embeddings in parallel batches
      const BATCH_SIZE = 10;
      chunkEmbeddings = [];
      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        const batchEmbeddings = await Promise.all(
          batch.map((chunk) => generateEmbedding(chunk.text))
        );
        chunkEmbeddings.push(...batchEmbeddings);
      }
    }

    // Compute similarities and maintain top-K using MinHeap
    for (let i = 0; i < chunks.length; i++) {
      try {
        const similarity = cosineSimilarity(queryEmbedding, chunkEmbeddings[i]);

        minHeap.push({
          file_name: page.name,
          pageId: page.id,
          startY: chunks[i].startY,
          endY: chunks[i].endY,
          sentence: chunks[i].text,
          semanticScore: similarity,
          wordCount: chunks[i].wordCount,
        });
      } catch (error) {
        console.error(
          `Error computing similarity for chunk ${i} on page ${page.id}:`,
          error
        );
        // Continue with other chunks
      }
    }
  }

  // Return top K chunks sorted by score (descending)
  return minHeap.toArray();
}

async function semanticSearchPages(pagesContent, queryEmbedding) {
  const semanticScores = {};

  for (const page of pagesContent) {
    try {
      let pageEmbedding;

      if (
        page.embedding &&
        Array.isArray(page.embedding) &&
        page.embedding.length > 0
      ) {
        // Use cached page embedding (preferred)
        pageEmbedding = page.embedding;
      } else {
        // Fallback: generate on-the-fly (for backward compatibility)
        const pageText = page.mapping
          .flatMap((row) => row.map((w) => w.word))
          .join(" ");
        pageEmbedding = await generateEmbedding(pageText);
      }

      const similarity = cosineSimilarity(queryEmbedding, pageEmbedding);
      semanticScores[page.id] = similarity;
    } catch (error) {
      console.error(`Error processing page ${page.id}:`, error);
      semanticScores[page.id] = 0; // Set to 0 if error occurs
    }
  }

  return semanticScores;
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

    let scores;
    let topPages;
    let queryEmbedding = null;

    if (searchMode === "semantic") {
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
    }

    if (searchMode === "tfidf") {
      scores = await searchContent(pagesContent, inverted, search);
      topPages = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, topK)
        .map(([id]) => id);
    } else if (searchMode === "semantic") {
      scores = await semanticSearchPages(pagesContent, queryEmbedding);
      topPages = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, topK)
        .map(([id]) => id);
    }

    if (Object.keys(scores || {}).length === 0) {
      return {
        success: true,
        searchResults: [],
        error: "No results found",
      };
    }

    let searchResults;
    if (searchMode === "semantic") {
      searchResults = await semanticSearchAllChunks(
        pagesContent,
        queryEmbedding,
        topK
      );
    } else {
      searchResults = searchBuildIndex(
        buildIndex,
        search,
        pagesContent,
        topPages
      );
    }

    if (searchResults.length === 0) {
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

  // Check if buildIndex is the new optimized format
  const isOptimizedFormat =
    buildIndex.prefixIndex !== undefined ||
    buildIndex.suffixIndex !== undefined ||
    buildIndex.ngramIndex !== undefined;

  if (isOptimizedFormat) {
    // Use optimized index
    const index = OptimizedKeywordIndex.fromJSON(buildIndex);

    for (const term of terms) {
      const normalizedTerm = term.replace(/[.,;:!?'"()[\]{}]+/g, "");
      if (!normalizedTerm) continue;

      // Search for all match types (prefix, suffix, infix)
      const matches = index.search(normalizedTerm, "all");

      for (const [word, pageId, y] of matches) {
        // Only include results from top pages
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
