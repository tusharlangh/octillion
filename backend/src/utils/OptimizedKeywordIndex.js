export class OptimizedKeywordIndex {
  constructor() {
    this.dictionary = [];
    this.wordToId = new Map();
    this.postings = new Map();

    this.ngramIndex = new Map();
    this.prefixIndex = new Map();
    this.suffixIndex = new Map();
  }

  add(word, pageId, y) {
    if (!word || word.length === 0) return;

    const normalizedWord = word.toLowerCase().replace(/[^a-z]/g, "");
    if (normalizedWord.length === 0) return;

    let wordId;
    if (this.wordToId.has(normalizedWord)) {
      wordId = this.wordToId.get(normalizedWord);
    } else {
      wordId = this.dictionary.length;
      this.dictionary.push(normalizedWord);
      this.wordToId.set(normalizedWord, wordId);
      this.postings.set(wordId, []);
    }

    this.postings.get(wordId).push([pageId, y]);
  }

  finalize() {
    for (let wordId = 0; wordId < this.dictionary.length; wordId++) {
      const word = this.dictionary[wordId];

      // Prefix Index
      const firstChar = word[0];
      if (firstChar) {
        if (!this.prefixIndex.has(firstChar)) {
          this.prefixIndex.set(firstChar, []);
        }
        this.prefixIndex.get(firstChar).push(wordId);
      }

      // Suffix Index
      const lastChar = word[word.length - 1];
      if (lastChar) {
        if (!this.suffixIndex.has(lastChar)) {
          this.suffixIndex.set(lastChar, []);
        }
        this.suffixIndex.get(lastChar).push(wordId);
      }

      // N-gram Index
      if (word.length >= 3) {
        const seenNgrams = new Set();
        for (let i = 0; i <= word.length - 3; i++) {
          const ngram = word.substring(i, i + 3);
          if (!seenNgrams.has(ngram)) {
            seenNgrams.add(ngram);
            if (!this.ngramIndex.has(ngram)) {
              this.ngramIndex.set(ngram, []);
            }
            this.ngramIndex.get(ngram).push(wordId);
          }
        }
      }
    }

    for (const [char, wordIds] of this.prefixIndex) {
      wordIds.sort((a, b) =>
        this.dictionary[a].localeCompare(this.dictionary[b])
      );
    }
    for (const [char, wordIds] of this.suffixIndex) {
      wordIds.sort((a, b) =>
        this.dictionary[a].localeCompare(this.dictionary[b])
      );
    }
  }

  search(pattern, matchType = "all") {
    if (!pattern || pattern.length === 0) return [];

    const normalizedPattern = pattern.toLowerCase().replace(/[^a-z]/g, "");
    if (normalizedPattern.length === 0) return [];

    const results = new Map(); // Key: "word:pageId:y", Value: [word, pageId, y]

    if (matchType === "all" || matchType === "prefix") {
      const prefixMatches = this._searchPrefix(normalizedPattern);
      this._collectResults(prefixMatches, results);
    }

    if (matchType === "all" || matchType === "suffix") {
      const suffixMatches = this._searchSuffix(normalizedPattern);
      this._collectResults(suffixMatches, results);
    }

    if (matchType === "all" || matchType === "infix") {
      const infixMatches = this._searchInfix(normalizedPattern);
      this._collectResults(infixMatches, results);
    }

    return Array.from(results.values());
  }

  _collectResults(wordIds, resultsMap) {
    for (const wordId of wordIds) {
      const word = this.dictionary[wordId];
      const positions = this.postings.get(wordId);
      if (positions) {
        for (const [pageId, y] of positions) {
          const key = `${word}:${pageId}:${y}`;
          if (!resultsMap.has(key)) {
            resultsMap.set(key, [word, pageId, y]);
          }
        }
      }
    }
  }

  _searchPrefix(prefix) {
    const firstChar = prefix[0];
    if (!firstChar || !this.prefixIndex.has(firstChar)) {
      return [];
    }

    const wordIds = this.prefixIndex.get(firstChar);
    const results = [];

    let left = 0;
    let right = wordIds.length - 1;
    let startIdx = -1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const word = this.dictionary[wordIds[mid]];

      if (word.startsWith(prefix)) {
        startIdx = mid;
        right = mid - 1;
      } else if (word < prefix) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    if (startIdx === -1) return [];

    for (let i = startIdx; i < wordIds.length; i++) {
      const word = this.dictionary[wordIds[i]];
      if (word.startsWith(prefix)) {
        results.push(wordIds[i]);
      } else {
        break;
      }
    }

    return results;
  }

  _searchSuffix(suffix) {
    const lastChar = suffix[suffix.length - 1];
    if (!lastChar || !this.suffixIndex.has(lastChar)) {
      return [];
    }

    const wordIds = this.suffixIndex.get(lastChar);
    const results = [];

    for (const wordId of wordIds) {
      if (this.dictionary[wordId].endsWith(suffix)) {
        results.push(wordId);
      }
    }

    return results;
  }

  _searchInfix(pattern) {
    if (pattern.length < 3) {
      const results = [];
      for (let i = 0; i < this.dictionary.length; i++) {
        if (this.dictionary[i].includes(pattern)) {
          results.push(i);
        }
      }
      return results;
    }

    const patternNGrams = [];
    for (let i = 0; i <= pattern.length - 3; i++) {
      patternNGrams.push(pattern.substring(i, i + 3));
    }

    if (patternNGrams.length === 0) return [];

    let candidateWordIds = null;

    for (const ngram of patternNGrams) {
      if (!this.ngramIndex.has(ngram)) {
        return [];
      }

      const ids = this.ngramIndex.get(ngram);
      const idSet = new Set(ids);

      if (candidateWordIds === null) {
        candidateWordIds = idSet;
      } else {
        candidateWordIds = new Set(
          [...candidateWordIds].filter((x) => idSet.has(x))
        );
      }

      if (candidateWordIds.size === 0) {
        return [];
      }
    }

    const results = [];
    for (const wordId of candidateWordIds) {
      if (this.dictionary[wordId].includes(pattern)) {
        results.push(wordId);
      }
    }

    return results;
  }

  toJSON() {
    const postingsObj = {};
    for (const [wordId, positions] of this.postings) {
      postingsObj[wordId] = positions;
    }

    const ngramObj = {};
    for (const [ngram, ids] of this.ngramIndex) {
      ngramObj[ngram] = ids;
    }

    const prefixObj = {};
    for (const [char, ids] of this.prefixIndex) {
      prefixObj[char] = ids;
    }

    const suffixObj = {};
    for (const [char, ids] of this.suffixIndex) {
      suffixObj[char] = ids;
    }

    return {
      dictionary: this.dictionary,
      postings: postingsObj,
      ngramIndex: ngramObj,
      prefixIndex: prefixObj,
      suffixIndex: suffixObj,
    };
  }

  static fromJSON(data) {
    const index = new OptimizedKeywordIndex();

    if (data.dictionary) {
      index.dictionary = data.dictionary;

      for (let i = 0; i < data.dictionary.length; i++) {
        index.wordToId.set(data.dictionary[i], i);
      }
    }

    if (data.postings) {
      for (const [wordId, positions] of Object.entries(data.postings)) {
        index.postings.set(parseInt(wordId, 10), positions);
      }
    }

    if (data.ngramIndex) {
      for (const [ngram, ids] of Object.entries(data.ngramIndex)) {
        index.ngramIndex.set(ngram, ids);
      }
    }

    if (data.prefixIndex) {
      for (const [char, ids] of Object.entries(data.prefixIndex)) {
        index.prefixIndex.set(char, ids);
      }
    }

    if (data.suffixIndex) {
      for (const [char, ids] of Object.entries(data.suffixIndex)) {
        index.suffixIndex.set(char, ids);
      }
    }

    return index;
  }

  getStorageSize() {
    let size = 0;

    size += this.dictionary.length;
    for (const positions of this.postings.values()) {
      size += positions.length;
    }
    for (const ids of this.ngramIndex.values()) {
      size += ids.length;
    }
    return size;
  }
}
