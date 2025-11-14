const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "should",
  "could",
  "may",
  "might",
  "can",
  "this",
  "that",
  "these",
  "those",
]);

const QUESTION_WORDS = new Set([
  "what",
  "where",
  "when",
  "why",
  "how",
  "who",
  "which",
]);

export class SearchRewrite {
  constructor(search) {
    if (typeof search !== "string") {
      throw new Error("Search query must be a string");
    }
    this.search = search.trim();
    this.originalWords = [];
  }

  process() {
    if (!this.search || this.search.length === 0) {
      return "";
    }

    const normalized = this.normalize();
    if (normalized.length === 0) {
      return this.search.toLowerCase();
    }

    const filtered = this.filterWords(normalized);

    if (filtered.length === 0) {
      return normalized.join(" ");
    }

    console.log(filtered.join(" "));

    return filtered.join(" ");
  }

  normalize() {
    if (!this.search) return [];

    const normalized = this.search
      .toLowerCase()
      .replace(/[.,;:!?'"()[\]{}]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!normalized) return [];

    const words = normalized.split(/\s+/).filter((word) => word.length > 0);
    this.originalWords = words;
    return words;
  }

  filterWords(query) {
    if (!query || query.length === 0) return [];

    const filtered = [];
    const queryLength = query.length;

    for (let i = 0; i < queryLength; i++) {
      const word = query[i];

      if (!word || word.length === 0) continue;

      const wordLength = word.length;
      const isStopWord = STOP_WORDS.has(word);
      const isQuestionWord = QUESTION_WORDS.has(word);

      if (wordLength < 2) {
        continue;
      }

      if (isStopWord) {
        continue;
      }

      if (isQuestionWord) {
        const contextAfter = query[i + 1];
        const hasMeaningfulContext =
          contextAfter &&
          !STOP_WORDS.has(contextAfter) &&
          contextAfter.length >= 2;

        if (!hasMeaningfulContext) {
          continue;
        }
      }

      filtered.push(word);
    }

    if (filtered.length === 0 && query.length > 0) {
      return query.filter((word) => word && word.length >= 2);
    }

    return filtered;
  }

  extractKeyTerms(query) {
    const scoreWords = query.map((word, index) => {
      let score = 0;

      score += word.length * 2;

      const positionScore =
        1 - Math.abs((index - query.length / 2) / query.length);
      score += positionScore * 10;

      return {
        word,
        score,
        originalIndex: index,
      };
    });

    scoreWords.sort((a, b) => a.originalIndex - b.originalIndex);

    return scoreWords.slice(0, 7).map((item) => item.word);
  }
}
