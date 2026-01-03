import { Axiom } from "@axiomhq/js";

const axiom =
  process.env.AXIOM_API_TOKEN && process.env.AXIOM_DATASET
    ? new Axiom({
        token: process.env.AXIOM_API_TOKEN,
      })
    : null;

const AXIOM_DATASET = process.env.AXIOM_DATASET || "octillion-search-metrics";

function logMetric(metric) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    _time: timestamp,
    metric_type: "",
    ...metric,
  };

  if (axiom) {
    try {
      axiom.ingest(AXIOM_DATASET, [logEntry]);
    } catch (error) {
      console.error("Failed to send metric to Axiom:", error.message);
    }
  }
}

export function trackFileProcessing({
  parseId,
  userId,
  fileName,
  fileSizeBytes,
  durationMs,
  storageMb,
  status,
  errorMessage,
}) {
  const fileSizeMb = (fileSizeBytes / (1024 * 1024)).toFixed(2);
  const durationSeconds = (durationMs / 1000).toFixed(2);

  logMetric({
    metric_type: "file_processing",
    event: "file_processed",
    parse_id: parseId,
    user_id: userId,
    file_name: fileName,
    file_size_bytes: fileSizeBytes,
    file_size_mb: parseFloat(fileSizeMb),
    duration_ms: durationMs,
    duration_seconds: parseFloat(durationSeconds),
    storage_mb: storageMb,
    status: status,
    error_message: errorMessage || null,
  });
}

export function trackBatchProcessing({
  parseId,
  userId,
  fileCount,
  totalSizeBytes,
  totalDurationMs,
  totalStorageMb,
  successCount,
  failureCount,
  stageLatencies,
}) {
  const totalSizeMb = (totalSizeBytes / (1024 * 1024)).toFixed(2);
  const totalDurationSeconds = (totalDurationMs / 1000).toFixed(2);
  const avgDurationPerFile =
    fileCount > 0 ? (totalDurationMs / fileCount).toFixed(2) : 0;
  const avgSizePerFile =
    fileCount > 0 ? (totalSizeBytes / fileCount / (1024 * 1024)).toFixed(2) : 0;

  logMetric({
    metric_type: "file_processing",
    event: "batch_processed",
    parse_id: parseId,
    user_id: userId,
    file_count: fileCount,
    total_size_bytes: totalSizeBytes,
    total_size_mb: parseFloat(totalSizeMb),
    total_duration_ms: totalDurationMs,
    total_duration_seconds: parseFloat(totalDurationSeconds),
    total_storage_mb: totalStorageMb,
    success_count: successCount,
    failure_count: failureCount,
    success_rate:
      fileCount > 0 ? ((successCount / fileCount) * 100).toFixed(2) : 0,
    avg_duration_per_file_ms: parseFloat(avgDurationPerFile),
    avg_size_per_file_mb: parseFloat(avgSizePerFile),
    stage_latencies: stageLatencies,
  });
}

export function trackProcessingStage({
  parseId,
  userId,
  stageName,
  durationMs,
  itemCount,
  metadata,
}) {
  logMetric({
    metric_type: "file_processing",
    event: "processing_stage",
    parse_id: parseId,
    user_id: userId,
    stage_name: stageName,
    duration_ms: durationMs,
    item_count: itemCount,
    ...metadata,
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

export function trackChatMetrics({
  userId,
  parseId,
  query,
  queryLength,
  totalLatency,
  searchLatency,
  contextBuildLatency,
  llmLatency,
  contextLength,
  contextChunkCount,
  responseLength,
  modelUsed,
  success,
  errorMessage,
}) {
  logMetric({
    metric_type: "chat_rag",
    event: "chat_completed",
    user_id: userId,
    parse_id: parseId,
    query: query.substring(0, 100),
    query_length: queryLength,
    total_latency_ms: totalLatency,
    search_latency_ms: searchLatency,
    context_build_latency_ms: contextBuildLatency,
    llm_latency_ms: llmLatency,
    context_length_chars: contextLength,
    context_chunk_count: contextChunkCount,
    response_length_chars: responseLength,
    model_used: modelUsed,
    success: success,
    error_message: errorMessage || null,
  });
}

export function trackRAGRetrieval({
  userId,
  parseId,
  query,
  retrievedChunks,
  avgRelevanceScore,
  topScore,
  contextLength,
  retrievalLatency,
}) {
  logMetric({
    metric_type: "chat_rag",
    event: "rag_retrieval",
    user_id: userId,
    parse_id: parseId,
    query: query.substring(0, 100),
    retrieved_chunks: retrievedChunks,
    avg_relevance_score: avgRelevanceScore,
    top_relevance_score: topScore,
    context_length_chars: contextLength,
    retrieval_latency_ms: retrievalLatency,
  });
}

export function trackLLMPerformance({
  userId,
  modelUsed,
  promptTokens,
  completionTokens,
  totalTokens,
  latency,
  temperature,
  maxTokens,
  success,
  errorMessage,
}) {
  logMetric({
    metric_type: "chat_rag",
    event: "llm_call",
    user_id: userId,
    model_used: modelUsed,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: totalTokens,
    latency_ms: latency,
    temperature: temperature,
    max_tokens: maxTokens,
    success: success,
    error_message: errorMessage || null,
    cost_estimate_usd:
      totalTokens > 0 ? (totalTokens / 1000000) * 0.5 : 0,
  });
}

export default {
  trackFileProcessing,
  trackBatchProcessing,
  trackProcessingStage,
  trackChatMetrics,
  trackRAGRetrieval,
  trackLLMPerformance,
  SearchTimer,
};
