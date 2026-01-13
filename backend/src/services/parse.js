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

import * as queryIntent from "./queryIntent.js";
import { analyzeAndBoost } from "./parse/scoreSentenceIntent.js";
import { sentenceLevelReRanking } from "./parse/sentenceReRanker.js";
import {
  getQueryAnalysis,
  setQueryAnalysis,
} from "../utils/callsCache/queryAnalysisCache.js";

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

async function rawSemanticSearch(search, id, userId, options = {}) {
  const { topK, cachedEmbedding } = options;
  const embeddingsTimer = new SearchTimer("Embeddings");
  const embeddings = cachedEmbedding || (await callToEmbed(search));
  const embeddingsTimerLatency = embeddingsTimer.stop();

  const searchQdrantTimer = new SearchTimer("Search Qdrant");
  const result = await searchQdrant(id, userId, embeddings, { topK });
  const searchQdrantLatency = searchQdrantTimer.stop();

  console.log(`
    searchQdrantLatency: ${searchQdrantLatency}
    embeddingsTimerLatency: ${embeddingsTimerLatency}
  `);

  return { result, embedding: embeddings };
}

async function rawKeywordSearch(
  search,
  pagesContent,
  inverted,
  fileMapping,
  parseId,
  userId,
  options = {}
) {
  const { topK = 10 } = options;
  const searchContentTimer = new SearchTimer("Search Content");
  const scores = await searchContent_v2(pagesContent, inverted, search);
  const searchContentLatency = searchContentTimer.stop();

  if (scores.results && scores.results.length > topK * 2) {
    scores.results = scores.results.slice(0, topK * 2);
  }

  const searchBuildIndexTimer = new SearchTimer("Search Build Index");
  const result = await searchBuildIndex_v2(scores, fileMapping);
  const searchBuildIndexLatency = searchBuildIndexTimer.stop();

  console.log(`
    searchContentLatency: ${searchContentLatency}
    searchBuildIndexLatency: ${searchBuildIndexLatency}
  `);

  return result;
}

async function executeKeywordFlow(
  query,
  pagesContent,
  inverted,
  fileMapping,
  parseId,
  userId,
  topK,
  chunks
) {
  const rawResults = await rawKeywordSearch(
    query,
    pagesContent,
    inverted,
    fileMapping,
    parseId,
    userId,
    { topK: topK * 2 }
  );

  let results = await normalizeKeywordResults(rawResults, chunks);

  results.sort((a, b) => b.score - a.score);

  results = results.map((result, index) => ({
    ...result,
    rank: index,
  }));

  return results;
}

async function executeSemanticFlow(
  query,
  parseId,
  userId,
  topK,
  chunks,
  cachedEmbedding = null
) {
  const { result: rawResults, embedding } = await rawSemanticSearch(
    query,
    parseId,
    userId,
    { topK: topK * 2, cachedEmbedding }
  );

  let results = await normalizeSemanticResults(rawResults, chunks);

  results = results.map((result) => {
    const chunk = chunks.find((c) => c.id === result.chunk_id);
    if (chunk) {
      const intentBoost = analyzeAndBoost(
        result.chunk_id,
        query,
        chunk.text,
        result.score
      );
      return {
        ...result,
        score: intentBoost.new_score,
        metadata: {
          ...result.metadata,
          intent_boost: intentBoost.boostWeight,
        },
      };
    }
    return result;
  });

  if (results.length > 0) {
    await sentenceLevelReRanking(results, query);
    results = results.map((r) => {
      if (r.rrf_score !== undefined) {
        r.score = r.rrf_score;
      }
      return r;
    });
  }

  results = results.map((result) => {
    let bboxes = result.rects || [];
    if (result.text && result.best_sentence) {
      const startChar = result.text.indexOf(result.best_sentence);
      if (startChar !== -1) {
        const endChar = startChar + result.best_sentence.length;
        const calculatedBBoxes = mapCharsToBBoxes(
          result.text_spans,
          result.text,
          startChar,
          endChar
        );
        if (calculatedBBoxes.length > 0) {
          bboxes = calculatedBBoxes;
        }
      }
    }
    return { ...result, rects: bboxes };
  });

  results.sort((a, b) => b.score - a.score);

  results = results.map((result, index) => ({
    ...result,
    rank: index,
  }));

  return { results, embedding };
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

  let analysis = await getQueryAnalysis(query);

  if (!analysis) {
    const intentAnalysis = queryIntent.analyzeQuery(query);
    const legacyAnalysis = analyzeQuery(query);

    analysis = {
      ...legacyAnalysis,
      intent: intentAnalysis.intent,
      semanticWeight: intentAnalysis.semanticWeight,
      keywordWeight: intentAnalysis.keywordWeight,
      expansions: intentAnalysis.expansions,
    };

    setQueryAnalysis(query, analysis).catch(console.error);
  }

  console.log("\nQUERY ANALYSIS:");
  console.log(`  Original: "${query}"`);
  console.log(`  Intent: ${analysis.intent.toUpperCase()}`);
  console.log(`  Content words: ${analysis.contentWords.join(", ")}`);
  console.log(`  Type: ${analysis.queryType.toUpperCase()}`);

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

  let finalResults = [];
  let keywordResultsForMetrics = [];
  let semanticResultsForMetrics = [];
  const queryEmbedding = await callToEmbed(primarySemanticQuery);

  if (analysis.queryType === "keyword") {
    finalResults = await executeKeywordFlow(
      keywordQuery,
      pagesContent,
      inverted,
      fileMapping,
      parseId,
      userId,
      topK,
      chunks
    );
    keywordResultsForMetrics = finalResults;
  } else if (analysis.queryType === "semantic") {
    const { results } = await executeSemanticFlow(
      primarySemanticQuery,
      parseId,
      userId,
      topK,
      chunks,
      queryEmbedding
    );
    finalResults = results;
    semanticResultsForMetrics = finalResults;
  } else {
    const [kwRanked, semRankedData] = await Promise.all([
      executeKeywordFlow(
        keywordQuery,
        pagesContent,
        inverted,
        fileMapping,
        parseId,
        userId,
        topK,
        chunks
      ),
      executeSemanticFlow(
        primarySemanticQuery,
        parseId,
        userId,
        topK,
        chunks,
        queryEmbedding
      ),
    ]);

    const semRanked = semRankedData.results;
    keywordResultsForMetrics = kwRanked;
    semanticResultsForMetrics = semRanked;

    const rrfScores = new Map();

    kwRanked.forEach((result) => {
      const key = `${result.chunk_id}`;
      const rrfScore = analysis.keywordWeight * (1 / (k + result.rank));

      if (!rrfScores.has(key)) {
        rrfScores.set(key, {
          ...result,
          rrf_score: 0,
          keyword_rank: null,
          semantic_rank: null,
        });
      }
      const entry = rrfScores.get(key);
      entry.rrf_score += rrfScore;
      entry.keyword_rank = result.rank;
      entry.keyword_score = result.score;
    });

    semRanked.forEach((result) => {
      const key = `${result.chunk_id}`;
      const rrfScore = analysis.semanticWeight * (1 / (k + result.rank));

      if (!rrfScores.has(key)) {
        rrfScores.set(key, {
          ...result,
          rrf_score: 0,
          keyword_rank: null,
          semantic_rank: null,
        });
      }
      const entry = rrfScores.get(key);
      entry.rrf_score += rrfScore;
      entry.semantic_rank = result.rank;
      entry.semantic_score = result.score;
      if (result.rects && result.rects.length > 0) {
        entry.rects = result.rects;
      }
      if (result.best_sentence) {
        entry.best_sentence = result.best_sentence;
      }
      entry.text = result.text;
    });

    finalResults = Array.from(rrfScores.values());

    finalResults.sort((a, b) => b.rrf_score - a.rrf_score);
  }

  const finalResultsSliced = finalResults.slice(0, topK);

  const resultsFormatted = finalResultsSliced.map((result) => {
    const finalScore =
      result.rrf_score !== undefined ? result.rrf_score : result.score;

    return {
      chunk_id: result.chunk_id,
      file_name: result.file_name,
      page_number: result.page_number,
      score: finalScore,
      source: result.source,
      text: result.text,
      rects: result.rects || [],
      rank: result.rank,
      metadata: {
        intent_boost: result.metadata?.intent_boost,
        best_sentence: result.best_sentence,
        texts_span: result.text_spans,
        ...(result.metadata?.terms && { terms: result.metadata.terms }),
        ...(result.metadata?.match_count !== undefined && {
          match_count: result.metadata.match_count,
        }),
        ...(result.metadata?.term_breakdown && {
          term_breakdown: result.metadata.term_breakdown,
        }),
        ...(result.keyword_rank !== undefined && {
          keyword_rank: result.keyword_rank,
        }),
        ...(result.semantic_rank !== undefined && {
          semantic_rank: result.semantic_rank,
        }),
      },
    };
  });

  const totalLatency = overallTimer.stop();

  trackSearchMetrics({
    query,
    queryType: analysis.queryType,
    userId,
    parseId,
    totalResults: resultsFormatted.length,
    keywordResultCount: keywordResultsForMetrics.length,
    semanticResultCount: semanticResultsForMetrics.length,
    mergedResultCount: resultsFormatted.length,
    totalLatency,
    keywordLatency: 0,
    semanticLatency: 0,
    contentWords: analysis.contentWords,
    semanticWeight: analysis.semanticWeight,
    keywordWeight: analysis.keywordWeight,
    hasResults: resultsFormatted.length > 0,
    scoreDistribution: null,
  });

  if (resultsFormatted.length === 0) {
    trackZeroResults({
      query,
      queryType: analysis.queryType,
      userId,
      parseId,
      contentWords: analysis.contentWords,
      totalLatency,
    });
  }

  return [resultsFormatted, analysis.queryType];
}

function mapCharsToBBoxes(textSpans, chunkText, startChar, endChar) {
  if (!textSpans || textSpans.length === 0) {
    return [];
  }

  let charPosition = 0;
  const spanRanges = [];

  for (const span of textSpans) {
    const spanText = span.span;
    const spanStart = charPosition;
    const spanEnd = charPosition + spanText.length;

    spanRanges.push({
      span_text_id: span.span_text_id,
      span: spanText,
      span_bbox: span.span_bbox,
      startChar: spanStart,
      endChar: spanEnd,
    });

    charPosition = spanEnd + 1;
  }

  const relevantSpans = spanRanges.filter((spanRange) => {
    return spanRange.endChar > startChar && spanRange.startChar < endChar;
  });

  return relevantSpans.map((spanRange) => spanRange.span_bbox);
}
