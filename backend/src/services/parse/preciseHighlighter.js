import { SpanExtractor } from "./spanExtractor.js";
import { SentenceRanker } from "./sentenceRanker.js";

export class PreciseHighlighter {
  constructor() {
    this.spanExtractor = new SpanExtractor(35);
    this.sentenceRanker = new SentenceRanker();
    this.confidenceThreshold = 12;
  }

  async extractPreciseHighlight(chunkText, query, chunkMetadata) {
    const algorithmicSpan = this.spanExtractor.extractBestSpan(
      chunkText,
      query
    );

    if (algorithmicSpan.score >= this.confidenceThreshold) {
      return {
        ...algorithmicSpan,
        method: "algorithmic",
        confidence: "high",
        boundingBoxes: this.mapCharsToBBoxes(
          chunkMetadata.text_spans,
          chunkText,
          algorithmicSpan.startChar,
          algorithmicSpan.endChar
        ),
      };
    }

    const semanticSpan = await this.sentenceRanker.findBestSentences(
      chunkText,
      query,
      1
    );

    return {
      ...semanticSpan,
      method: "semantic",
      confidence: "medium",
      boundingBoxes: this.mapCharsToBBoxes(
        chunkMetadata.text_spans,
        chunkText,
        semanticSpan.startChar,
        semanticSpan.endChar
      ),
    };
  }

  mapCharsToBBoxes(textSpans, chunkText, startChar, endChar) {
    if (!textSpans || textSpans.length === 0) {
      return [];
    }

    let charPosition = 0;
    const spanRanges = [];

    for (const span of textSpans) {
      const spanText = span.span;
      const spanStart = charPosition;
      const spanEnd = charPosition + spanText.length;

      spanRanges.push({
        span_text_id: span.span_text_id,
        span: spanText,
        span_bbox: span.span_bbox,
        startChar: spanStart,
        endChar: spanEnd,
      });

      charPosition = spanEnd + 1;
    }

    const relevantSpans = spanRanges.filter((spanRange) => {
      return spanRange.endChar > startChar && spanRange.startChar < endChar;
    });

    return relevantSpans.map((spanRange) => spanRange.span_bbox);
  }
}
