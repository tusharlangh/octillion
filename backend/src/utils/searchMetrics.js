import { Axiom } from "@axiomhq/js";

let axiom = null;
if (process.env.AXIOM_API_TOKEN && process.env.AXIOM_DATASET) {
  try {
    axiom = new Axiom({
      token: process.env.AXIOM_API_TOKEN,
    });
  } catch (error) {
    console.error("❌ Failed to initialize Axiom client:", error.message);
  }
}

const AXIOM_DATASET = process.env.AXIOM_DATASET || "octillion-search-metrics";

function logMetric(metric) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    _time: timestamp,
    metric_type: "search_quality",
    ...metric,
  };

  if (axiom) {
    try {
      axiom.ingest(AXIOM_DATASET, [logEntry]);
    } catch (error) {
      console.error("❌ Failed to send metric to Axiom:", error.message);
    }
  }
}

export function trackSearchMetrics({
  query,
  queryType,
  userId,
  parseId,
  totalResults,
  keywordResultCount,
  semanticResultCount,
  mergedResultCount,
  totalLatency,
  keywordLatency,
  semanticLatency,
  embeddingLatency,
  qdrantLatency,
  s3FetchLatency,
  contentWords,
  semanticWeight,
  keywordWeight,
  hasResults,
  scoreDistribution,
}) {
  logMetric({
    event: "search_executed",
    query: query.substring(0, 100),
    query_length: query.length,
    query_type: queryType,
    user_id: userId,
    parse_id: parseId,

    total_results: totalResults,
    keyword_result_count: keywordResultCount,
    semantic_result_count: semanticResultCount,
    merged_result_count: mergedResultCount,
    has_results: hasResults,

    total_latency_ms: totalLatency,
    keyword_latency_ms: keywordLatency,
    semantic_latency_ms: semanticLatency,
    embedding_latency_ms: embeddingLatency,
    qdrant_latency_ms: qdrantLatency,
    s3_fetch_latency_ms: s3FetchLatency,

    content_words_count: contentWords?.length || 0,
    semantic_weight: semanticWeight,
    keyword_weight: keywordWeight,
    score_distribution: scoreDistribution,
  });
}

export function trackZeroResults({
  query,
  queryType,
  userId,
  parseId,
  contentWords,
  totalLatency,
}) {
  logMetric({
    event: "zero_results",
    query: query.substring(0, 100),
    query_type: queryType,
    user_id: userId,
    parse_id: parseId,
    content_words_count: contentWords?.length || 0,
    total_latency_ms: totalLatency,
  });
}

export function trackQueryAnalysis({
  query,
  queryType,
  contentWords,
  semanticWeight,
  keywordWeight,
  userId,
}) {
  logMetric({
    event: "query_analyzed",
    query: query.substring(0, 100),
    query_type: queryType,
    content_words: contentWords.join(", "),
    content_words_count: contentWords.length,
    semantic_weight: semanticWeight,
    keyword_weight: keywordWeight,
    user_id: userId,
  });
}

export function trackResultQuality({ query, queryType, results, userId }) {
  if (!results || results.length === 0) {
    return;
  }

  const scores = results.map((r) => r.rrf_score || r.score || 0);
  const sortedScores = [...scores].sort((a, b) => b - a);

  const scoreDistribution = {
    min: Math.min(...scores),
    max: Math.max(...scores),
    p50: sortedScores[Math.floor(sortedScores.length * 0.5)],
    p95: sortedScores[Math.floor(sortedScores.length * 0.95)],
    min_max_diff: Math.max(...scores) - Math.min(...scores),
  };

  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  const hybridMatches = results.filter(
    (r) => r.keyword_rank !== null && r.semantic_rank !== null
  ).length;

  logMetric({
    event: "result_quality",
    query: query.substring(0, 100),
    query_type: queryType,
    user_id: userId,
    result_count: results.length,
    top_score: scores[0],
    avg_score: avgScore,
    score_distribution: scoreDistribution,
    hybrid_match_count: hybridMatches,
    hybrid_match_percentage: (hybridMatches / results.length) * 100,
  });
}

export function trackComponentPerformance({
  query,
  queryType,
  userId,
  components,
}) {
  const total = Object.values(components).reduce((a, b) => a + b, 0);

  const breakdown = {};
  for (const [component, latency] of Object.entries(components)) {
    breakdown[`${component}_latency_ms`] = latency;
    breakdown[`${component}_percentage`] = ((latency / total) * 100).toFixed(2);
  }

  logMetric({
    event: "performance_breakdown",
    query: query.substring(0, 100),
    query_type: queryType,
    user_id: userId,
    total_latency_ms: total,
    ...breakdown,
  });
}

export class SearchTimer {
  constructor(label) {
    this.label = label;
    this.startTime = Date.now();
  }

  stop() {
    return Date.now() - this.startTime;
  }

  stopAndLog() {
    const duration = this.stop();
    console.log(`⏱️  ${this.label}: ${duration}ms`);
    return duration;
  }
}

export default {
  trackSearchMetrics,
  trackZeroResults,
  trackQueryAnalysis,
  trackResultQuality,
  trackComponentPerformance,
  SearchTimer,
};
