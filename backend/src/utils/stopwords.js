const STOP_WORDS = new Set([
  "a",
  "about",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "that",
  "the",
  "to",
  "was",
  "were",
  "will",
  "with",
  "what",
  "when",
  "where",
  "who",
  "why",
  "how",
  "which",
  "this",
  "these",
  "those",
  "there",
  "their",
  "been",
  "being",
  "do",
  "does",
  "did",
  "having",
  "has",
  "i",
  "me",
  "my",
  "we",
  "our",
]);

function removeStopWords(terms) {
  return terms.filter(
    (term) => term.length > 2 && !STOP_WORDS.has(term.toLowerCase())
  );
}

export function analyzeQuery(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const contentWords = removeStopWords(terms);

  const questionWords = new Set([
    "what",
    "who",
    "where",
    "when",
    "why",
    "how",
    "which",
  ]);
  const hasQuestion = terms.some((t) => questionWords.has(t));

  const hasQuotes = query.includes('"');
  const hasUpperCase = /[A-Z]/.test(query) && query !== query.toUpperCase();

  const stopWordRatio = 1 - contentWords.length / terms.length;
  const questionBonus = hasQuestion ? 0.3 : 0;
  const exactMatchPenalty = hasQuotes || hasUpperCase ? -0.4 : 0;

  const semanticScore = Math.max(
    0.1,
    Math.min(0.9, stopWordRatio + questionBonus + exactMatchPenalty)
  );

  return {
    originalQuery: query,
    contentWords,
    stopWordRatio,
    hasQuestion,
    hasQuotes,
    semanticWeight: semanticScore,
    keywordWeight: 1 - semanticScore,
    queryType:
      semanticScore > 0.6
        ? "semantic"
        : semanticScore < 0.3
        ? "keyword"
        : "hybrid",
  };
}
