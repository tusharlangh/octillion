"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.SearchTimer = void 0;
exports.trackBatchProcessing = trackBatchProcessing;
exports.trackChatMetrics = trackChatMetrics;
exports.trackFileProcessing = trackFileProcessing;
exports.trackLLMPerformance = trackLLMPerformance;
exports.trackProcessingStage = trackProcessingStage;
exports.trackRAGRetrieval = trackRAGRetrieval;
var _js = require("@axiomhq/js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var axiom = null;
if (process.env.AXIOM_API_TOKEN && process.env.AXIOM_DATASET) {
  try {
    axiom = new _js.Axiom({
      token: process.env.AXIOM_API_TOKEN
    });
  } catch (error) {
    console.error("❌ Failed to initialize Axiom client:", error.message);
  }
}
var AXIOM_DATASET = process.env.AXIOM_DATASET || "octillion-search-metrics";
function logMetric(metric) {
  var timestamp = new Date().toISOString();
  var logEntry = _objectSpread({
    _time: timestamp,
    metric_type: ""
  }, metric);
  if (axiom) {
    try {
      axiom.ingest(AXIOM_DATASET, [logEntry]);
    } catch (error) {
      console.error("❌ Failed to send metric to Axiom:", error.message);
    }
  }
}
function trackFileProcessing(_ref) {
  var parseId = _ref.parseId,
    userId = _ref.userId,
    fileName = _ref.fileName,
    fileSizeBytes = _ref.fileSizeBytes,
    durationMs = _ref.durationMs,
    storageMb = _ref.storageMb,
    status = _ref.status,
    errorMessage = _ref.errorMessage;
  var fileSizeMb = (fileSizeBytes / (1024 * 1024)).toFixed(2);
  var durationSeconds = (durationMs / 1000).toFixed(2);
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
    error_message: errorMessage || null
  });
}
function trackBatchProcessing(_ref2) {
  var parseId = _ref2.parseId,
    userId = _ref2.userId,
    fileCount = _ref2.fileCount,
    totalSizeBytes = _ref2.totalSizeBytes,
    totalDurationMs = _ref2.totalDurationMs,
    totalStorageMb = _ref2.totalStorageMb,
    successCount = _ref2.successCount,
    failureCount = _ref2.failureCount,
    stageLatencies = _ref2.stageLatencies;
  var totalSizeMb = (totalSizeBytes / (1024 * 1024)).toFixed(2);
  var totalDurationSeconds = (totalDurationMs / 1000).toFixed(2);
  var avgDurationPerFile = fileCount > 0 ? (totalDurationMs / fileCount).toFixed(2) : 0;
  var avgSizePerFile = fileCount > 0 ? (totalSizeBytes / fileCount / (1024 * 1024)).toFixed(2) : 0;
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
    success_rate: fileCount > 0 ? (successCount / fileCount * 100).toFixed(2) : 0,
    avg_duration_per_file_ms: parseFloat(avgDurationPerFile),
    avg_size_per_file_mb: parseFloat(avgSizePerFile),
    stage_latencies: stageLatencies
  });
}
function trackProcessingStage(_ref3) {
  var parseId = _ref3.parseId,
    userId = _ref3.userId,
    stageName = _ref3.stageName,
    durationMs = _ref3.durationMs,
    itemCount = _ref3.itemCount,
    metadata = _ref3.metadata;
  logMetric(_objectSpread({
    metric_type: "file_processing",
    event: "processing_stage",
    parse_id: parseId,
    user_id: userId,
    stage_name: stageName,
    duration_ms: durationMs,
    item_count: itemCount
  }, metadata));
}
var SearchTimer = exports.SearchTimer = /*#__PURE__*/function () {
  function SearchTimer(label) {
    _classCallCheck(this, SearchTimer);
    this.label = label;
    this.startTime = Date.now();
  }
  return _createClass(SearchTimer, [{
    key: "stop",
    value: function stop() {
      return Date.now() - this.startTime;
    }
  }, {
    key: "stopAndLog",
    value: function stopAndLog() {
      var duration = this.stop();
      console.log("\u23F1\uFE0F  ".concat(this.label, ": ").concat(duration, "ms"));
      return duration;
    }
  }]);
}();
function trackChatMetrics(_ref4) {
  var userId = _ref4.userId,
    parseId = _ref4.parseId,
    query = _ref4.query,
    queryLength = _ref4.queryLength,
    totalLatency = _ref4.totalLatency,
    searchLatency = _ref4.searchLatency,
    contextBuildLatency = _ref4.contextBuildLatency,
    llmLatency = _ref4.llmLatency,
    contextLength = _ref4.contextLength,
    contextChunkCount = _ref4.contextChunkCount,
    responseLength = _ref4.responseLength,
    modelUsed = _ref4.modelUsed,
    success = _ref4.success,
    errorMessage = _ref4.errorMessage;
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
    error_message: errorMessage || null
  });
}
function trackRAGRetrieval(_ref5) {
  var userId = _ref5.userId,
    parseId = _ref5.parseId,
    query = _ref5.query,
    retrievedChunks = _ref5.retrievedChunks,
    avgRelevanceScore = _ref5.avgRelevanceScore,
    topScore = _ref5.topScore,
    contextLength = _ref5.contextLength,
    retrievalLatency = _ref5.retrievalLatency;
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
    retrieval_latency_ms: retrievalLatency
  });
}
function trackLLMPerformance(_ref6) {
  var userId = _ref6.userId,
    modelUsed = _ref6.modelUsed,
    promptTokens = _ref6.promptTokens,
    completionTokens = _ref6.completionTokens,
    totalTokens = _ref6.totalTokens,
    latency = _ref6.latency,
    temperature = _ref6.temperature,
    maxTokens = _ref6.maxTokens,
    success = _ref6.success,
    errorMessage = _ref6.errorMessage;
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
    cost_estimate_usd: totalTokens > 0 ? totalTokens / 1000000 * 0.5 : 0
  });
}
var _default = exports["default"] = {
  trackFileProcessing: trackFileProcessing,
  trackBatchProcessing: trackBatchProcessing,
  trackProcessingStage: trackProcessingStage,
  trackChatMetrics: trackChatMetrics,
  trackRAGRetrieval: trackRAGRetrieval,
  trackLLMPerformance: trackLLMPerformance,
  SearchTimer: SearchTimer
};