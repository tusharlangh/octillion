export class SpanExtractor {
  constructor(windowSize = 75) {
    this.windowSize = windowSize;
  }

  tokenize(text) {
    const tokens = [];
    const pattern = /\b[\w]+([-'][\w]+)*\b/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      tokens.push({
        text: match[0].toLowerCase(),
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    return tokens;
  }

  scoreWindow(windowTokens, queryTokens) {
    let score = 0;
    const windowTexts = windowTokens.map((t) => t.text);
    const queryTexts = queryTokens.map((t) => t.text);
    const windowSet = new Set(windowTexts);

    const coverage =
      queryTexts.filter((qt) => windowSet.has(qt)).length / queryTexts.length;
    score += coverage * 10;

    const density =
      windowTexts.filter((wt) => queryTexts.includes(wt)).length /
      windowTexts.length;
    score += density * 5;

    const windowStr = windowTexts.join(" ");
    const queryStr = queryTexts.join(" ");
    if (windowStr.includes(queryStr)) {
      score += 20;
    }

    for (let n = queryTexts.length - 1; n >= 2; n--) {
      for (let i = 0; i <= queryTexts.length - n; i++) {
        const phrase = queryTexts.slice(i, i + n).join(" ");
        if (windowStr.includes(phrase)) {
          score += n * 2;
          break;
        }
      }
    }

    return score;
  }

  extractBestSpan(chunkText, query) {
    const chunkTokens = this.tokenize(chunkText);
    const queryTokens = this.tokenize(query);

    if (chunkTokens.length <= this.windowSize) {
      return {
        text: chunkText,
        startChar: 0,
        endChar: chunkText.length,
        score: this.scoreWindow(chunkTokens, queryTokens),
      };
    }

    let bestSpan = null;
    let bestScore = -1;

    for (let i = 0; i <= chunkTokens.length - this.windowSize; i++) {
      const windowTokens = chunkTokens.slice(i, i + this.windowSize);
      const score = this.scoreWindow(windowTokens, queryTokens);

      if (score > bestScore) {
        bestScore = score;
        bestSpan = {
          startChar: windowTokens[0].start,
          endChar: windowTokens[windowTokens.length - 1].end,
          score,
        };
      }
    }

    return this.expandToSentenceBoundary(chunkText, bestSpan);
  }

  expandToSentenceBoundary(fullText, span) {
    const sentenceEnders = /[.!?]/;
    const abbreviations =
      /\b(Dr|Mr|Mrs|Ms|Prof|Sr|Jr|vs|etc|Inc|Ltd|U\.S|Ph\.D)\./i;

    let startChar = span.startChar;
    for (let i = startChar - 1; i >= 0; i--) {
      if (sentenceEnders.test(fullText[i])) {
        const context = fullText.substring(Math.max(0, i - 10), i + 1);
        if (!abbreviations.test(context)) {
          startChar = i + 1;
          while (
            startChar < fullText.length &&
            /\s/.test(fullText[startChar])
          ) {
            startChar++;
          }
          break;
        }
      }
    }

    let endChar = span.endChar;
    for (let i = endChar; i < fullText.length; i++) {
      if (sentenceEnders.test(fullText[i])) {
        const context = fullText.substring(Math.max(0, i - 10), i + 1);
        if (!abbreviations.test(context)) {
          endChar = i + 1;
          break;
        }
      }
    }

    return {
      text: fullText.substring(startChar, endChar).trim(),
      startChar,
      endChar,
      score: span.score,
    };
  }
}
