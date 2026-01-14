"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.SearchTimer = void 0;
exports.trackComponentPerformance = trackComponentPerformance;
exports.trackQueryAnalysis = trackQueryAnalysis;
exports.trackResultQuality = trackResultQuality;
exports.trackSearchMetrics = trackSearchMetrics;
exports.trackZeroResults = trackZeroResults;
var _js = require("@axiomhq/js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
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
    metric_type: "search_quality"
  }, metric);
  if (axiom) {
    try {
      axiom.ingest(AXIOM_DATASET, [logEntry]);
    } catch (error) {
      console.error("❌ Failed to send metric to Axiom:", error.message);
    }
  }
}
function trackSearchMetrics(_ref) {
  var query = _ref.query,
    queryType = _ref.queryType,
    userId = _ref.userId,
    parseId = _ref.parseId,
    totalResults = _ref.totalResults,
    keywordResultCount = _ref.keywordResultCount,
    semanticResultCount = _ref.semanticResultCount,
    mergedResultCount = _ref.mergedResultCount,
    totalLatency = _ref.totalLatency,
    keywordLatency = _ref.keywordLatency,
    semanticLatency = _ref.semanticLatency,
    embeddingLatency = _ref.embeddingLatency,
    qdrantLatency = _ref.qdrantLatency,
    s3FetchLatency = _ref.s3FetchLatency,
    contentWords = _ref.contentWords,
    semanticWeight = _ref.semanticWeight,
    keywordWeight = _ref.keywordWeight,
    hasResults = _ref.hasResults,
    scoreDistribution = _ref.scoreDistribution;
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
    content_words_count: (contentWords === null || contentWords === void 0 ? void 0 : contentWords.length) || 0,
    semantic_weight: semanticWeight,
    keyword_weight: keywordWeight,
    score_distribution: scoreDistribution
  });
}
function trackZeroResults(_ref2) {
  var query = _ref2.query,
    queryType = _ref2.queryType,
    userId = _ref2.userId,
    parseId = _ref2.parseId,
    contentWords = _ref2.contentWords,
    totalLatency = _ref2.totalLatency;
  logMetric({
    event: "zero_results",
    query: query.substring(0, 100),
    query_type: queryType,
    user_id: userId,
    parse_id: parseId,
    content_words_count: (contentWords === null || contentWords === void 0 ? void 0 : contentWords.length) || 0,
    total_latency_ms: totalLatency
  });
}
function trackQueryAnalysis(_ref3) {
  var query = _ref3.query,
    queryType = _ref3.queryType,
    contentWords = _ref3.contentWords,
    semanticWeight = _ref3.semanticWeight,
    keywordWeight = _ref3.keywordWeight,
    userId = _ref3.userId;
  logMetric({
    event: "query_analyzed",
    query: query.substring(0, 100),
    query_type: queryType,
    content_words: contentWords.join(", "),
    content_words_count: contentWords.length,
    semantic_weight: semanticWeight,
    keyword_weight: keywordWeight,
    user_id: userId
  });
}
function trackResultQuality(_ref4) {
  var query = _ref4.query,
    queryType = _ref4.queryType,
    results = _ref4.results,
    userId = _ref4.userId;
  if (!results || results.length === 0) {
    return;
  }
  var scores = results.map(function (r) {
    return r.rrf_score || r.score || 0;
  });
  var sortedScores = _toConsumableArray(scores).sort(function (a, b) {
    return b - a;
  });
  var scoreDistribution = {
    min: Math.min.apply(Math, _toConsumableArray(scores)),
    max: Math.max.apply(Math, _toConsumableArray(scores)),
    p50: sortedScores[Math.floor(sortedScores.length * 0.5)],
    p95: sortedScores[Math.floor(sortedScores.length * 0.95)],
    min_max_diff: Math.max.apply(Math, _toConsumableArray(scores)) - Math.min.apply(Math, _toConsumableArray(scores))
  };
  var avgScore = scores.reduce(function (a, b) {
    return a + b;
  }, 0) / scores.length;
  var hybridMatches = results.filter(function (r) {
    return r.keyword_rank !== null && r.semantic_rank !== null;
  }).length;
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
    hybrid_match_percentage: hybridMatches / results.length * 100
  });
}
function trackComponentPerformance(_ref5) {
  var query = _ref5.query,
    queryType = _ref5.queryType,
    userId = _ref5.userId,
    components = _ref5.components;
  var total = Object.values(components).reduce(function (a, b) {
    return a + b;
  }, 0);
  var breakdown = {};
  for (var _i = 0, _Object$entries = Object.entries(components); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      component = _Object$entries$_i[0],
      latency = _Object$entries$_i[1];
    breakdown["".concat(component, "_latency_ms")] = latency;
    breakdown["".concat(component, "_percentage")] = (latency / total * 100).toFixed(2);
  }
  logMetric(_objectSpread({
    event: "performance_breakdown",
    query: query.substring(0, 100),
    query_type: queryType,
    user_id: userId,
    total_latency_ms: total
  }, breakdown));
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
var _default = exports["default"] = {
  trackSearchMetrics: trackSearchMetrics,
  trackZeroResults: trackZeroResults,
  trackQueryAnalysis: trackQueryAnalysis,
  trackResultQuality: trackResultQuality,
  trackComponentPerformance: trackComponentPerformance,
  SearchTimer: SearchTimer
};