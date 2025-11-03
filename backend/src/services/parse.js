import supabase from "../utils/supabase/client.js";
import { pipeline } from "@xenova/transformers";
import dotenv from "dotenv";

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

async function generateEmbedding(text) {
  if (!embeddingPipeline) {
    await loadEmbeddingModel();
  }

  const output = await embeddingPipeline(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
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

async function semanticSearchPages(pagesContent, queryEmbedding) {
  const semanticScores = {};

  for (const page of pagesContent) {
    let pageEmbedding;

    if (page.embedding) {
      pageEmbedding = page.embedding;
    } else {
      const pageText = page.mapping
        .flatMap((row) => row.map((w) => w.word))
        .join(" ");
      pageEmbedding = await generateEmbedding(pageText);
    }

    const similarity = cosineSimilarity(queryEmbedding, pageEmbedding);
    semanticScores[page.id] = similarity;
  }

  return semanticScores;
}

async function semanticSearchSentences(
  pagesContent,
  queryEmbedding,
  topPageIds
) {
  const pageSet = new Set(topPageIds);
  const sentenceResults = [];

  for (const page of pagesContent) {
    if (!pageSet.has(page.id)) continue;

    const mapping = new Map(page.mapping);

    for (const [y, row] of mapping) {
      const sentence = row.map((w) => w.word).join(" ");

      // Skip very short sentences
      if (sentence.split(/\s+/).length < 3) continue;

      // Generate embedding for this sentence
      let sentenceEmbedding;
      if (row[0]?.embedding) {
        sentenceEmbedding = row[0].embedding;
      } else {
        sentenceEmbedding = await generateEmbedding(sentence);
      }

      const similarity = cosineSimilarity(queryEmbedding, sentenceEmbedding);

      sentenceResults.push({
        pageId: page.id,
        y,
        sentence,
        semanticScore: similarity,
      });
    }
  }

  return sentenceResults;
}

export async function parse(id, search, userId, options = {}) {
  const { searchMode, topK = 5 } = options;

  if (!search.trim()) {
    return {
      success: false,
      searchResults: [],
      error: `failed since the search is empty`,
    };
  }

  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", userId)
    .eq("parse_id", id);

  if (error) {
    console.error(error);
    return {
      success: false,
      searchResults: [],
      error: `failed extracting files`,
    };
  }

  const d = data[0];
  const pagesContent = d.pages_metadata;
  const inverted = d.inverted_index;
  const buildIndex = d.build_index;

  let scores;
  let topPages;

  if (searchMode === "tfidf") {
    scores = await searchContent(pagesContent, inverted, search);
    topPages = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, topK)
      .map(([id]) => id);
  } else {
    const queryEmbedding = await generateEmbedding(search);
    scores = await semanticSearchPages(pagesContent, queryEmbedding);
    topPages = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, topK)
      .map(([id]) => id);
  }

  if (Object.keys(scores).length === 0) {
    return {
      success: false,
      searchResults: [],
      error: "No results found",
    };
  }

  let searchResults;
  if (searchMode === "semantic") {
    // Use semantic sentence search
    const queryEmbedding = await generateEmbedding(search);
    const sentenceResults = await semanticSearchSentences(
      pagesContent,
      queryEmbedding,
      topPages
    );

    searchResults = sentenceResults
      .sort((a, b) => b.semanticScore - a.semanticScore)
      .slice(0, 10);
  } else {
    // Use your original keyword-based sentence search
    searchResults = searchBuildIndex(
      buildIndex,
      search,
      pagesContent,
      topPages
    );
  }

  if (searchResults.length === 0) {
    return {
      success: false,
      searchResults: [],
      error: "failed search results",
    };
  }

  return {
    success: true,
    searchResults,
    error: null,
    metadata: {
      searchMode,
      totalResults: searchResults.length,
      topPages,
    },
  };
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

  for (const term of terms) {
    const normalizedTerm = term.replace(/[.,;:!?'"()[\]{}]+/g, "");
    const positions = buildIndex[normalizedTerm[0].toLowerCase()] || [];

    for (const pos of positions) {
      const mapping = pageMappings.get(pos.pageId);
      if (!mapping) continue;

      const row = mapping.get(pos.y);
      if (!row) continue;

      if (
        pos.word === normalizedTerm ||
        pos.word.startsWith(normalizedTerm) ||
        pos.word.endsWith(normalizedTerm) ||
        pos.word.includes(normalizedTerm)
      ) {
        const key = `${pos.pageId}-${pos.y}`;
        console.log(key);
        if (!sentenceMap.has(key)) {
          sentenceMap.set(key, {
            pageId: pos.pageId,
            y: pos.y,
            sentence: row.map((w) => w.word).join(" "),
          });
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

  console.log(scores);

  return scores;
}
