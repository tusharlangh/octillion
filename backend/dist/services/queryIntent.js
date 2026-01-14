"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.analyzeQuery = analyzeQuery;
exports.detectIntent = detectIntent;
exports.expandQuery = expandQuery;
exports.getIntentWeights = getIntentWeights;
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function detectIntent(query) {
  var q = query.toLowerCase().trim();
  if (q.startsWith("what is") || q.startsWith("define")) {
    if (q.includes("importance") || q.includes("why")) {
      return "importance";
    }
    return "definition";
  }
  if (q.includes("why") || q.includes("importance") || q.includes("benefits") || q.includes("significance")) {
    return "importance";
  }
  if (q.startsWith("how to") || q.startsWith("how do") || q.includes("steps") || q.includes("process") || q.includes("procedure")) {
    return "procedural";
  }
  if (q.includes(" vs ") || q.includes(" vs. ") || q.includes("difference between") || q.includes("compare") || q.includes("versus")) {
    return "comparison";
  }
  if (q.includes("study") || q.includes("research") || q.includes("evidence") || q.includes("findings") || q.includes("results")) {
    return "evidence";
  }
  if (q.startsWith("when") || q.startsWith("where") || q.startsWith("who")) {
    return "factual";
  }
  if (q.includes("example") || q.includes("instance") || q.includes("demonstrate")) {
    return "example";
  }
  return "definition";
}
function getIntentWeights(intent) {
  var weights = {
    importance: {
      semantic: 0.7,
      keyword: 0.3
    },
    definition: {
      semantic: 0.6,
      keyword: 0.4
    },
    procedural: {
      semantic: 0.7,
      keyword: 0.3
    },
    comparison: {
      semantic: 0.65,
      keyword: 0.35
    },
    evidence: {
      semantic: 0.5,
      keyword: 0.5
    },
    factual: {
      semantic: 0.4,
      keyword: 0.6
    },
    example: {
      semantic: 0.6,
      keyword: 0.4
    }
  };
  return weights[intent] || {
    semantic: 0.5,
    keyword: 0.5
  };
}
function expandQuery(query, intent) {
  var q = query.toLowerCase();
  var expansions = [query];
  var acronyms = {
    api: "application programming interface",
    ml: "machine learning",
    ai: "artificial intelligence",
    nlp: "natural language processing",
    sql: "structured query language",
    rest: "representational state transfer",
    http: "hypertext transfer protocol",
    json: "javascript object notation"
  };
  for (var _i = 0, _Object$entries = Object.entries(acronyms); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      acronym = _Object$entries$_i[0],
      expansion = _Object$entries$_i[1];
    if (q.includes(acronym)) {
      expansions.push(query.replace(new RegExp("\\b".concat(acronym, "\\b"), "gi"), expansion));
    }
  }
  if (intent === "importance") {
    if (!q.includes("why")) expansions.push("why ".concat(query));
    if (!q.includes("importance")) expansions.push("importance of ".concat(query));
  }
  if (intent === "procedural") {
    if (!q.startsWith("how")) expansions.push("how to ".concat(query));
  }
  return expansions;
}
function analyzeQuery(query) {
  var intent = detectIntent(query);
  var weights = getIntentWeights(intent);
  var expansions = expandQuery(query, intent);
  return {
    intent: intent,
    semanticWeight: weights.semantic,
    keywordWeight: weights.keyword,
    expansions: expansions
  };
}