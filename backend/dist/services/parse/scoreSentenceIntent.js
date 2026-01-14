"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.analyzeAndBoost = analyzeAndBoost;
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var INTENT_PATTERNS = {
  definition: {
    patterns: [/\b(is|are|refers? to|means?|defined as|known as|called)\b/i, /\b(definition|term|concept|notion)\b/i, /\b(essentially|basically|simply put)\b/i],
    weight: 1.3
  },
  importance: {
    patterns: [/\b(important|critical|essential|crucial|vital|significant|key)\b/i, /\b(because|since|as|due to|owing to)\b/i, /\b(impact|effect|influence|consequence|result)\b/i, /\b(benefit|advantage|value|worth|merit)\b/i, /\b(without|lacking|absence of)\b/i],
    weight: 1.4
  },
  procedural: {
    patterns: [/\b(step|first|second|third|next|then|finally|lastly)\b/i, /\b(how to|process|procedure|method|approach|technique)\b/i, /\b(should|must|need to|have to|required to)\b/i, /\b(begin|start|initiate|commence|proceed)\b/i],
    weight: 1.35
  },
  comparison: {
    patterns: [/\b(versus|vs\.?|compared to|in contrast|unlike|whereas)\b/i, /\b(difference|similar|alike|distinct|divergent)\b/i, /\b(better|worse|more|less|superior|inferior)\b/i, /\b(both|either|neither|while|although)\b/i],
    weight: 1.3
  },
  evidence: {
    patterns: [/\b(study|research|experiment|investigation|analysis)\b/i, /\b(found|discovered|showed|demonstrated|revealed)\b/i, /\b(data|evidence|findings|results|statistics)\b/i, /\b(according to|based on|suggests|indicates)\b/i, /\b(significant|correlation|relationship|association)\b/i],
    weight: 1.35
  },
  factual: {
    patterns: [/\b(when|where|who|what|which)\b/i, /\b(date|year|time|period|era)\b/i, /\b(location|place|region|area)\b/i, /\b(person|people|individual|group)\b/i],
    weight: 1.2
  },
  example: {
    patterns: [/\b(example|instance|case|illustration|demonstration)\b/i, /\b(such as|like|including|for instance|e\.?g\.?)\b/i, /\b(specifically|particularly|notably)\b/i],
    weight: 1.25
  }
};
function detectQueryIntent(query) {
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
function splitIntoSentences(text) {
  if (!text || typeof text !== "string") return [];
  var cleaned = text.replace(/\s+/g, " ").trim();
  var sentences = cleaned.split(/(?<=[.!?])\s+(?=[A-Z])/g).filter(function (s) {
    return s.trim().length > 15;
  });
  return sentences;
}
function scoreSentenceForIntent(sentence, intent) {
  if (!sentence || !intent || !INTENT_PATTERNS[intent]) {
    return 0;
  }
  var intentConfig = INTENT_PATTERNS[intent];
  var matchCount = 0;
  var _iterator = _createForOfIteratorHelper(intentConfig.patterns),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var pattern = _step.value;
      if (pattern.test(sentence)) {
        matchCount++;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return matchCount;
}
function calculateIntentAlignment(chunkText, queryIntent) {
  var sentences = splitIntoSentences(chunkText);
  if (sentences.length === 0) {
    return {
      alignment: 0,
      matchingSentences: 0,
      totalSentences: 0,
      avgMatchScore: 0
    };
  }
  var totalMatches = 0;
  var matchingSentences = 0;
  var _iterator2 = _createForOfIteratorHelper(sentences),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var sentence = _step2.value;
      var score = scoreSentenceForIntent(sentence, queryIntent);
      if (score > 0) {
        totalMatches += score;
        matchingSentences++;
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  var alignment = matchingSentences / sentences.length;
  var avgMatchScore = matchingSentences > 0 ? totalMatches / matchingSentences : 0;
  return {
    alignment: alignment,
    matchingSentences: matchingSentences,
    totalSentences: sentences.length,
    avgMatchScore: avgMatchScore
  };
}
function computeBoostWeight(alignment, avgMatchScore, queryIntent) {
  if (alignment === 0) {
    return 0.9;
  }
  var intentConfig = INTENT_PATTERNS[queryIntent];
  var baseWeight = (intentConfig === null || intentConfig === void 0 ? void 0 : intentConfig.weight) || 1.0;
  var boost = 1.0;
  if (alignment < 0.2) {
    boost = 0.95;
  } else if (alignment < 0.4) {
    boost = 1.0 + (alignment - 0.2) * 0.5;
  } else if (alignment < 0.6) {
    boost = 1.1 + (alignment - 0.4) * 0.75;
  } else if (alignment < 0.8) {
    boost = 1.25 + (alignment - 0.6) * 1.0;
  } else {
    boost = 1.45 + (alignment - 0.8) * 0.75;
  }
  if (avgMatchScore >= 3) {
    boost *= 1.15;
  } else if (avgMatchScore >= 2) {
    boost *= 1.1;
  } else if (avgMatchScore >= 1.5) {
    boost *= 1.05;
  }
  var finalBoost = Math.min(boost * baseWeight, 2.0);
  return finalBoost;
}
function analyzeAndBoost(chunkId, query, chunkText, originalScore) {
  if (!chunkText || typeof chunkText !== "string" || chunkText.trim().length === 0) {
    return {
      chunkId: chunkId,
      new_score: originalScore,
      boostWeight: 1.0,
      intent: null,
      alignment: 0,
      reason: "Empty or invalid chunk text"
    };
  }
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return {
      chunkId: chunkId,
      new_score: originalScore,
      boostWeight: 1.0,
      intent: null,
      alignment: 0,
      reason: "Empty or invalid query"
    };
  }
  var queryIntent = detectQueryIntent(query);
  var analysis = calculateIntentAlignment(chunkText, queryIntent);
  var boostWeight = computeBoostWeight(analysis.alignment, analysis.avgMatchScore, queryIntent);
  var newScore = originalScore * boostWeight;
  return {
    chunkId: chunkId,
    new_score: newScore,
    boostWeight: boostWeight,
    intent: queryIntent,
    alignment: analysis.alignment,
    matchingSentences: analysis.matchingSentences,
    totalSentences: analysis.totalSentences,
    avgMatchScore: analysis.avgMatchScore
  };
}