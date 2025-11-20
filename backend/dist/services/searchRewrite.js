"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SearchRewrite = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var STOP_WORDS = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "should", "could", "may", "might", "can", "this", "that", "these", "those"]);
var QUESTION_WORDS = new Set(["what", "where", "when", "why", "how", "who", "which"]);
var SearchRewrite = exports.SearchRewrite = /*#__PURE__*/function () {
  function SearchRewrite(search) {
    _classCallCheck(this, SearchRewrite);
    if (typeof search !== "string") {
      throw new Error("Search query must be a string");
    }
    this.search = search.trim();
    this.originalWords = [];
  }
  return _createClass(SearchRewrite, [{
    key: "process",
    value: function process() {
      if (!this.search || this.search.length === 0) {
        return "";
      }
      var normalized = this.normalize();
      if (normalized.length === 0) {
        return this.search.toLowerCase();
      }
      var filtered = this.filterWords(normalized);
      if (filtered.length === 0) {
        return normalized.join(" ");
      }
      console.log(filtered.join(" "));
      return filtered.join(" ");
    }
  }, {
    key: "normalize",
    value: function normalize() {
      if (!this.search) return [];
      var normalized = this.search.toLowerCase().replace(/[.,;:!?'"()[\]{}]+/g, " ").replace(/\s+/g, " ").trim();
      if (!normalized) return [];
      var words = normalized.split(/\s+/).filter(function (word) {
        return word.length > 0;
      });
      this.originalWords = words;
      return words;
    }
  }, {
    key: "filterWords",
    value: function filterWords(query) {
      if (!query || query.length === 0) return [];
      var filtered = [];
      var queryLength = query.length;
      for (var i = 0; i < queryLength; i++) {
        var word = query[i];
        if (!word || word.length === 0) continue;
        var wordLength = word.length;
        var isStopWord = STOP_WORDS.has(word);
        var isQuestionWord = QUESTION_WORDS.has(word);
        if (wordLength < 2) {
          continue;
        }
        if (isStopWord) {
          continue;
        }
        if (isQuestionWord) {
          var contextAfter = query[i + 1];
          var hasMeaningfulContext = contextAfter && !STOP_WORDS.has(contextAfter) && contextAfter.length >= 2;
          if (!hasMeaningfulContext) {
            continue;
          }
        }
        filtered.push(word);
      }
      if (filtered.length === 0 && query.length > 0) {
        return query.filter(function (word) {
          return word && word.length >= 2;
        });
      }
      return filtered;
    }
  }, {
    key: "extractKeyTerms",
    value: function extractKeyTerms(query) {
      var scoreWords = query.map(function (word, index) {
        var score = 0;
        score += word.length * 2;
        var positionScore = 1 - Math.abs((index - query.length / 2) / query.length);
        score += positionScore * 10;
        return {
          word: word,
          score: score,
          originalIndex: index
        };
      });
      scoreWords.sort(function (a, b) {
        return a.originalIndex - b.originalIndex;
      });
      return scoreWords.slice(0, 7).map(function (item) {
        return item.word;
      });
    }
  }]);
}();