export class OptimizedKeywordIndex {
  constructor() {
    this.prefixIndex = {};
    this.suffixIndex = {};
    this.ngramIndex = new Map();
    this.wordPositions = new Map();
    this.seen = new Set();
  }

  add(word, pageId, y) {
    if (!word || word.length === 0) return;

    const normalizedWord = word.toLowerCase().replace(/[^a-z]/g, "");
    if (normalizedWord.length === 0) return;

    // Deduplication key
    const uniqueKey = `${normalizedWord}:${pageId}:${y}`;
    if (this.seen.has(uniqueKey)) return;
    this.seen.add(uniqueKey);

    // Prefix index (first character only - fixes the bug!)
    const firstChar = normalizedWord[0];
    if (firstChar && /[a-z]/.test(firstChar)) {
      if (!this.prefixIndex[firstChar]) {
        this.prefixIndex[firstChar] = [];
      }
      this.prefixIndex[firstChar].push([normalizedWord, pageId, y]);
    }

    // Suffix index (last character)
    const lastChar = normalizedWord[normalizedWord.length - 1];
    if (lastChar && /[a-z]/.test(lastChar)) {
      if (!this.suffixIndex[lastChar]) {
        this.suffixIndex[lastChar] = [];
      }
      this.suffixIndex[lastChar].push([normalizedWord, pageId, y]);
    }

    // N-gram index for infix matching (3-grams)
    if (normalizedWord.length >= 3) {
      for (let i = 0; i <= normalizedWord.length - 3; i++) {
        const ngram = normalizedWord.substring(i, i + 3);
        if (!this.ngramIndex.has(ngram)) {
          this.ngramIndex.set(ngram, new Set());
        }
        this.ngramIndex.get(ngram).add(uniqueKey);
      }
    } else {
      // For short words, store directly
      if (!this.wordPositions.has(normalizedWord)) {
        this.wordPositions.set(normalizedWord, new Set());
      }
      this.wordPositions.get(normalizedWord).add(`${pageId}:${y}`);
    }
  }

  finalize() {
    // Sort prefix arrays for binary search
    for (const char in this.prefixIndex) {
      this.prefixIndex[char].sort((a, b) => a[0].localeCompare(b[0]));
    }

    // Sort suffix arrays
    for (const char in this.suffixIndex) {
      this.suffixIndex[char].sort((a, b) => a[0].localeCompare(b[0]));
    }
  }

  search(pattern, matchType = "all") {
    if (!pattern || pattern.length === 0) return [];

    const normalizedPattern = pattern.toLowerCase().replace(/[^a-z]/g, "");
    if (normalizedPattern.length === 0) return [];

    const results = new Map(); // Deduplicate results

    if (matchType === "all" || matchType === "prefix") {
      const prefixResults = this._searchPrefix(normalizedPattern);
      for (const result of prefixResults) {
        const key = `${result[0]}:${result[1]}:${result[2]}`;
        results.set(key, result);
      }
    }

    if (matchType === "all" || matchType === "suffix") {
      const suffixResults = this._searchSuffix(normalizedPattern);
      for (const result of suffixResults) {
        const key = `${result[0]}:${result[1]}:${result[2]}`;
        results.set(key, result);
      }
    }

    if (matchType === "all" || matchType === "infix") {
      const infixResults = this._searchInfix(normalizedPattern);
      for (const result of infixResults) {
        const key = `${result[0]}:${result[1]}:${result[2]}`;
        results.set(key, result);
      }
    }

    return Array.from(results.values());
  }

  _searchPrefix(prefix) {
    const firstChar = prefix[0];
    if (!firstChar || !this.prefixIndex[firstChar]) {
      return [];
    }

    const array = this.prefixIndex[firstChar];
    const results = [];

    // Binary search for first word starting with prefix
    let left = 0;
    let right = array.length - 1;
    let startIdx = -1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const word = array[mid][0];

      if (word.startsWith(prefix)) {
        startIdx = mid;
        right = mid - 1; // Continue searching left
      } else if (word < prefix) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    if (startIdx === -1) return [];

    // Collect all words starting with prefix
    for (let i = startIdx; i < array.length; i++) {
      const word = array[i][0];
      if (word.startsWith(prefix)) {
        results.push(array[i]);
      } else {
        break; // Sorted array, so we can stop
      }
    }

    return results;
  }

  _searchSuffix(suffix) {
    const lastChar = suffix[suffix.length - 1];
    if (!lastChar || !this.suffixIndex[lastChar]) {
      return [];
    }

    const array = this.suffixIndex[lastChar];
    const results = [];

    // Linear scan (could be optimized with reverse trie, but this is simpler)
    for (const entry of array) {
      if (entry[0].endsWith(suffix)) {
        results.push(entry);
      }
    }

    return results;
  }

  _searchInfix(pattern) {
    if (pattern.length < 3) {
      // For short patterns, check word positions directly
      const results = [];
      for (const [word, positions] of this.wordPositions.entries()) {
        if (word.includes(pattern)) {
          for (const pos of positions) {
            const [pageId, y] = pos.split(":");
            results.push([word, pageId, parseInt(y, 10)]);
          }
        }
      }
      return results;
    }

    // Extract 3-grams from pattern
    const patternNGrams = [];
    for (let i = 0; i <= pattern.length - 3; i++) {
      patternNGrams.push(pattern.substring(i, i + 3));
    }

    if (patternNGrams.length === 0) return [];

    // Find intersection of n-gram sets
    let candidateKeys = null;

    for (const ngram of patternNGrams) {
      if (!this.ngramIndex.has(ngram)) {
        return []; // Pattern doesn't exist
      }

      const ngramSet = this.ngramIndex.get(ngram);

      if (candidateKeys === null) {
        candidateKeys = new Set(ngramSet);
      } else {
        // Intersection
        candidateKeys = new Set(
          [...candidateKeys].filter((x) => ngramSet.has(x))
        );
      }

      if (candidateKeys.size === 0) {
        return [];
      }
    }

    // Convert keys back to [word, pageId, y] format
    const results = [];
    for (const key of candidateKeys) {
      const [word, pageId, y] = key.split(":");
      // Verify word actually contains pattern (n-gram intersection might have false positives)
      if (word.includes(pattern)) {
        results.push([word, pageId, parseInt(y, 10)]);
      }
    }

    return results;
  }

  toJSON() {
    // Convert Sets to Arrays for JSON serialization
    const ngramIndexSerialized = {};
    for (const [ngram, set] of this.ngramIndex.entries()) {
      ngramIndexSerialized[ngram] = Array.from(set);
    }

    const wordPositionsSerialized = {};
    for (const [word, set] of this.wordPositions.entries()) {
      wordPositionsSerialized[word] = Array.from(set);
    }

    return {
      prefixIndex: this.prefixIndex,
      suffixIndex: this.suffixIndex,
      ngramIndex: ngramIndexSerialized,
      wordPositions: wordPositionsSerialized,
    };
  }

  static fromJSON(data) {
    const index = new OptimizedKeywordIndex();
    index.prefixIndex = data.prefixIndex || {};
    index.suffixIndex = data.suffixIndex || {};

    for (const char in index.prefixIndex) {
      index.prefixIndex[char].sort((a, b) => a[0].localeCompare(b[0]));
    }
    for (const char in index.suffixIndex) {
      index.suffixIndex[char].sort((a, b) => a[0].localeCompare(b[0]));
    }

    index.ngramIndex = new Map();
    if (data.ngramIndex) {
      for (const [ngram, array] of Object.entries(data.ngramIndex)) {
        index.ngramIndex.set(ngram, new Set(array));
      }
    }

    index.wordPositions = new Map();
    if (data.wordPositions) {
      for (const [word, array] of Object.entries(data.wordPositions)) {
        index.wordPositions.set(word, new Set(array));
      }
    }

    for (const char in index.prefixIndex) {
      for (const entry of index.prefixIndex[char]) {
        index.seen.add(`${entry[0]}:${entry[1]}:${entry[2]}`);
      }
    }

    return index;
  }

  getStorageSize() {
    let size = 0;
    for (const char in this.prefixIndex) {
      size += this.prefixIndex[char].length;
    }
    for (const char in this.suffixIndex) {
      size += this.suffixIndex[char].length;
    }
    for (const set of this.ngramIndex.values()) {
      size += set.size;
    }
    return size;
  }
}
