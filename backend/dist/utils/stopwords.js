"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.analyzeQuery = analyzeQuery;
var STOP_WORDS = new Set(["a", "about", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "he", "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "were", "will", "with", "what", "when", "where", "who", "why", "how", "which", "this", "these", "those", "there", "their", "been", "being", "do", "does", "did", "having", "has", "i", "me", "my", "we", "our"]);
function removeStopWords(terms) {
  return terms.filter(function (term) {
    return term.length > 2 && !STOP_WORDS.has(term.toLowerCase());
  });
}
function analyzeQuery(query) {
  var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  var contentWords = removeStopWords(terms);
  var questionWords = new Set(["what", "who", "where", "when", "why", "how", "which"]);
  var hasQuestion = terms.some(function (t) {
    return questionWords.has(t);
  });
  var hasQuotes = query.includes('"');
  var hasUpperCase = /[A-Z]/.test(query) && query !== query.toUpperCase();
  var stopWordRatio = 1 - contentWords.length / terms.length;
  var questionBonus = hasQuestion ? 0.3 : 0;
  var exactMatchPenalty = hasQuotes || hasUpperCase ? -0.4 : 0;
  var semanticScore = Math.max(0.1, Math.min(0.9, stopWordRatio + questionBonus + exactMatchPenalty));
  return {
    originalQuery: query,
    contentWords: contentWords,
    stopWordRatio: stopWordRatio,
    hasQuestion: hasQuestion,
    hasQuotes: hasQuotes,
    semanticWeight: semanticScore,
    keywordWeight: 1 - semanticScore,
    queryType: semanticScore > 0.6 ? "semantic" : semanticScore < 0.3 ? "keyword" : "hybrid"
  };
}