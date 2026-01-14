"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.explanationDensityBoost = explanationDensityBoost;
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var EXPLANATION_MARKERS = [{
  phrase: "because",
  weight: 2.0
}, {
  phrase: "without",
  weight: 1.8
}, {
  phrase: "therefore",
  weight: 1.8
}, {
  phrase: "thus",
  weight: 1.5
}, {
  phrase: "as a result",
  weight: 2.0
}, {
  phrase: "consequently",
  weight: 1.8
}, {
  phrase: "leads to",
  weight: 1.5
}, {
  phrase: "results in",
  weight: 1.5
}, {
  phrase: "causes",
  weight: 2.0
}, {
  phrase: "due to",
  weight: 1.8
}, {
  phrase: "necessary",
  weight: 1.6
}, {
  phrase: "essential",
  weight: 1.6
}, {
  phrase: "important",
  weight: 1.4
}, {
  phrase: "critical",
  weight: 1.6
}, {
  phrase: "depends on",
  weight: 1.7
}, {
  phrase: "allows",
  weight: 1.3
}, {
  phrase: "enables",
  weight: 1.3
}, {
  phrase: "ensures",
  weight: 1.4
}, {
  phrase: "since",
  weight: 1.8
}, {
  phrase: "so that",
  weight: 1.6
}, {
  phrase: "in order to",
  weight: 1.5
}, {
  phrase: "this means",
  weight: 1.4
}, {
  phrase: "which means",
  weight: 1.4
}];
function splitIntoSentences(text) {
  var cleaned = text.replace(/\s+/g, " ").trim();
  var sentences = cleaned.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(function (s) {
    return s.trim().length > 0;
  });
  return sentences;
}
function detectExplanationDensity(sentence) {
  if (sentence.length < 20) return 0;
  var s = sentence.toLowerCase();
  var score = 0;
  var _iterator = _createForOfIteratorHelper(EXPLANATION_MARKERS),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var marker = _step.value;
      var re = new RegExp("\\b".concat(marker.phrase, "\\b"), "i");
      if (re.test(s)) {
        score += marker.weight;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return score;
}
function classifyDensity(chunkText) {
  var sentences = splitIntoSentences(chunkText);
  if (sentences.length === 0) {
    return {
      density: 0,
      raw_score: 0,
      contributing: 0,
      total: 0
    };
  }
  var totalScore = 0;
  var contributingSentences = 0;
  var _iterator2 = _createForOfIteratorHelper(sentences),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var sentence = _step2.value;
      var score = detectExplanationDensity(sentence);
      if (score > 0) {
        totalScore += score;
        contributingSentences++;
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return {
    density: contributingSentences / sentences.length,
    raw_score: totalScore,
    contributing: contributingSentences,
    total: sentences.length
  };
}
function explanationMultiplier(density, rawScore) {
  if (density === 0) return 0.85;
  if (density < 0.25) return 0.95;
  if (density < 0.4) return 1.05;
  if (density < 0.6) return 1.15;
  if (density < 0.75) return 1.25;
  if (rawScore > 8) return 1.4;
  return 1.3;
}
function shouldApplyExplanationBoost(queryIntent) {
  var explanatoryIntents = ["IMPORTANCE", "PROCEDURAL", "EVIDENCE"];
  return explanatoryIntents.includes(queryIntent);
}
function explanationDensityBoost(chunkId, chunkText, originalScore) {
  var queryIntent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
  if (queryIntent && !shouldApplyExplanationBoost(queryIntent)) {
    return {
      chunkId: chunkId,
      new_score: originalScore,
      explanation: {
        density: 0,
        raw_score: 0,
        boost: 1.0,
        applied: false,
        reason: "Not applicable for ".concat(queryIntent, " queries")
      }
    };
  }
  var explanation = classifyDensity(chunkText);
  var boost = explanationMultiplier(explanation.density, explanation.raw_score);
  return {
    chunkId: chunkId,
    new_score: originalScore * boost,
    explanation: {
      density: explanation.density,
      raw_score: explanation.raw_score,
      contributing_sentences: explanation.contributing,
      total_sentences: explanation.total,
      boost: boost,
      applied: true
    }
  };
}