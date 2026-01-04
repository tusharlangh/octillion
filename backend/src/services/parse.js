import supabase from "../utils/supabase/client.js";
import dotenv from "dotenv";
import { searchQdrant } from "./qdrantService.js";
import { getJsonFromS3 } from "./saveFiles/upload.js";
import { AppError } from "../middleware/errorHandler.js";
import { searchBuildIndex_v2, searchContent_v2 } from "./parse/searchIndex.js";
import { createPresignedUrl } from "./saveFiles/upload.js";
import { callToEmbed } from "../utils/callsAi/callToEmbed.js";
import {
  normalizeKeywordResults,
  normalizeSemanticResults,
} from "./parse/resultNormalizer.js";
import { analyzeQuery } from "../utils/stopwords.js";
import {
  trackSearchMetrics,
  trackZeroResults,
  trackQueryAnalysis,
  trackResultQuality,
  trackComponentPerformance,
  SearchTimer,
} from "../utils/searchMetrics.js";
import { PreciseHighlighter } from "./parse/preciseHighlighter.js";
import * as queryIntent from "./queryIntent.js";
import { scoreChunkByIntent } from "./intentScoring.js";

dotenv.config();

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

export async function parse_v2(id, search, userId, options = {}) {
  try {
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
        result: [],
        fileMapping: {},
      };
    }

    const d = data[0];

    if (!d || !d.pages_metadata || !d.inverted_index) {
      throw new AppError(
        "Invalid or incomplete data row",
        500,
        "INVALID_DATA_ROW"
      );
    }

    const fileMapping = await getFileMapping(d.files);

    let pagesContent = d.pages_metadata;
    let inverted = d.inverted_index;
    let chunks = d.chunks_metadata;

    if (pagesContent && pagesContent.s3Key) {
      pagesContent = await getJsonFromS3(pagesContent.s3Key);
    }

    if (inverted && inverted.s3Key) {
      inverted = await getJsonFromS3(inverted.s3Key);
    }

    if (chunks && chunks.s3Key) {
      chunks = await getJsonFromS3(chunks.s3Key);
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

    const [hybridSearchResults, type] = await hybridSearch(
      id,
      userId,
      search,
      pagesContent,
      inverted,
      fileMapping,
      chunks
    );

    return {
      success: true,
      result: hybridSearchResults,
      fileMapping,
    };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(`System error: ${error.message}`, 500, "SYSTEM_ERROR");
  }
}

async function semanticSearch(search, id, userId, options = {}) {
  const { topK } = options;
  const embeddings = await callToEmbed(search);
  const result = await searchQdrant(id, userId, embeddings, { topK });

  return result;
}

async function keywordSearch(
  search,
  pagesContent,
  inverted,
  fileMapping,
  options = {}
) {
  const { topK } = options;
  const scores = await searchContent_v2(pagesContent, inverted, search);
  const result = await searchBuildIndex_v2(scores, fileMapping);

  return result;
}

async function hybridSearch(
  parseId,
  userId,
  query,
  pagesContent,
  inverted,
  fileMapping,
  chunks,
  options = {}
) {
  const { topK = 10, k = 60 } = options;

  const overallTimer = new SearchTimer("Overall Search");

  const intentAnalysis = queryIntent.analyzeQuery(query);

  const legacyAnalysis = analyzeQuery(query);

  const analysis = {
    ...legacyAnalysis,
    intent: intentAnalysis.intent,
    semanticWeight: intentAnalysis.semanticWeight,
    keywordWeight: intentAnalysis.keywordWeight,
    expansions: intentAnalysis.expansions,
  };

  console.log("\nQUERY ANALYSIS:");
  console.log(`  Original: "${query}"`);
  console.log(`  Intent: ${analysis.intent.toUpperCase()}`);
  console.log(`  Content words: ${analysis.contentWords.join(", ")}`);
  console.log(`  Type: ${analysis.queryType.toUpperCase()}`);
  console.log(
    `  Weights: ${(analysis.semanticWeight * 100).toFixed(0)}% semantic, ${(
      analysis.keywordWeight * 100
    ).toFixed(0)}% keyword`
  );

  trackQueryAnalysis({
    query,
    queryType: analysis.queryType,
    intent: analysis.intent,
    contentWords: analysis.contentWords,
    semanticWeight: analysis.semanticWeight,
    keywordWeight: analysis.keywordWeight,
    userId,
  });

  const keywordQuery = analysis.contentWords.join(" ") || query;
  const primarySemanticQuery = query;

  const keywordTimer = new SearchTimer("Keyword Search");
  const semanticTimer = new SearchTimer("Semantic Search");

  const [keywordResultsRaw, semanticResultsRaw] = await Promise.all([
    keywordSearch(keywordQuery, pagesContent, inverted, fileMapping, {
      topK: topK * 2,
    }).then((result) => {
      keywordTimer.stop();
      return result;
    }),
    semanticSearch(primarySemanticQuery, parseId, userId, {
      topK: topK * 2,
    }).then((result) => {
      semanticTimer.stop();
      return result;
    }),
  ]);

  const keywordLatency = keywordTimer.stop();
  const semanticLatency = semanticTimer.stop();

  const keywordResults = await normalizeKeywordResults(
    keywordResultsRaw,
    chunks
  );
  const semanticResults = await normalizeSemanticResults(
    semanticResultsRaw,
    chunks
  );

  const keywordRanked = keywordResults
    .sort((a, b) => b.score - a.score)
    .map((result, index) => ({ ...result, rank: index }));

  const semanticRanked = semanticResults
    .sort((a, b) => b.score - a.score)
    .map((result, index) => ({ ...result, rank: index }));

  const rrfScores = new Map();

  if (analysis.queryType === "keyword" || analysis.queryType === "hybrid") {
    keywordRanked.forEach((result) => {
      const key = `${result.chunk_id}`;
      const rrfScore = analysis.keywordWeight * (1 / (k + result.rank));

      if (!rrfScores.has(key)) {
        rrfScores.set(key, {
          ...result,
          rrf_score: 0,
          keyword_rank: null,
          semantic_rank: null,
          keyword_score: null,
          semantic_score: null,
        });
      }

      const entry = rrfScores.get(key);
      entry.rrf_score += rrfScore;
      entry.keyword_rank = result.rank;
      entry.keyword_score = result.score;
      entry.keyword_weight = analysis.keywordWeight;
      entry.match_count = result.match_count;
      entry.rects = result.rects;
    });
  }

  if (analysis.queryType === "semantic" || analysis.queryType === "hybrid") {
    semanticRanked.forEach((result) => {
      const key = `${result.chunk_id}`;
      const rrfScore = analysis.semanticWeight * (1 / (k + result.rank));

      if (!rrfScores.has(key)) {
        rrfScores.set(key, {
          ...result,
          rrf_score: 0,
          keyword_rank: null,
          semantic_rank: null,
          keyword_score: null,
          semantic_score: null,
        });
      }

      const entry = rrfScores.get(key);
      entry.rrf_score += rrfScore;
      entry.semantic_rank = result.rank;
      entry.semantic_score = result.score;
      entry.semantic_weight = analysis.semanticWeight;
      entry.text = result.text;
    });
  }

  const mergedResults = Array.from(rrfScores.values());

  mergedResults.forEach((result) => {
    const chunk = chunks.find((c) => c.id === result.chunk_id);
    if (chunk) {
      result.rrf_score = scoreChunkByIntent(chunk, query, result.rrf_score);
      result.intent_boosted = true;
    }
  });

  const finalResults = mergedResults
    .sort((a, b) => b.rrf_score - a.rrf_score)
    .slice(0, topK);

  const highlighter = new PreciseHighlighter();
  const resultsWithPreciseHighlights = await Promise.all(
    finalResults.map(async (result) => {
      if (!result.text) return result;

      const highlight = await highlighter.extractPreciseHighlight(
        result.text,
        query,
        result
      );

      return {
        ...result,
        preciseHighlight: highlight,
      };
    })
  );

  console.log("resultsWithPreciseHighlights", resultsWithPreciseHighlights);

  const totalLatency = overallTimer.stop();

  const scores = finalResults.map((r) => r.rrf_score);
  const sortedScores = [...scores].sort((a, b) => b - a);
  const scoreDistribution =
    scores.length > 0
      ? {
          min: Math.min(...scores),
          max: Math.max(...scores),
          p50: sortedScores[Math.floor(sortedScores.length * 0.5)] || 0,
          p95: sortedScores[Math.floor(sortedScores.length * 0.95)] || 0,
        }
      : null;

  trackSearchMetrics({
    query,
    queryType: analysis.queryType,
    userId,
    parseId,

    totalResults: resultsWithPreciseHighlights.length,
    keywordResultCount: keywordResults.length,
    semanticResultCount: semanticResults.length,
    mergedResultCount: resultsWithPreciseHighlights.length,

    totalLatency,
    keywordLatency,
    semanticLatency,

    contentWords: analysis.contentWords,
    semanticWeight: analysis.semanticWeight,
    keywordWeight: analysis.keywordWeight,

    hasResults: resultsWithPreciseHighlights.length > 0,
    scoreDistribution,
  });

  if (resultsWithPreciseHighlights.length === 0) {
    trackZeroResults({
      query,
      queryType: analysis.queryType,
      userId,
      parseId,
      contentWords: analysis.contentWords,
      totalLatency,
    });
  }

  if (resultsWithPreciseHighlights.length > 0) {
    trackResultQuality({
      query,
      queryType: analysis.queryType,
      results: resultsWithPreciseHighlights,
      userId,
    });
  }

  trackComponentPerformance({
    query,
    queryType: analysis.queryType,
    userId,
    components: {
      keyword: keywordLatency,
      semantic: semanticLatency,
    },
  });

  console.log(`\n📊 Search completed in ${totalLatency}ms`);
  console.log(
    `   Keyword: ${keywordLatency}ms | Semantic: ${semanticLatency}ms`
  );
  console.log(
    `   Results: ${resultsWithPreciseHighlights.length} (${keywordResults.length} keyword, ${semanticResults.length} semantic)`
  );

  return [resultsWithPreciseHighlights, analysis.queryType];
}
