export function createContextualChunks_v2(sitesContent, options = {}) {
  const { maxWords = 300, overlapSentences = 1 } = options;
  const chunks = [];
  let chunkIndex = 0;

  for (const site of sitesContent) {
    for (const page of site.pages) {
      const pageRects = extractPageText(page);
      console.log(pageRects);

      let previousSentences = [];
      let currentChunk = "";
      let currentWords = 0;
      let currentTextSpans = [];
      let spanIdCounter = 0;

      for (const rect of pageRects) {
        const para = rect.block;
        const paraWords = para.trim().split(/\s+/).length;

        if (currentWords + paraWords <= maxWords) {
          if (currentChunk) currentChunk += "\n\n";
          currentChunk += para.trim();
          currentWords += paraWords;

          const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
          previousSentences.push(...sentences.map((s) => s.trim()));
          previousSentences = previousSentences.slice(-overlapSentences);

          for (const line of rect.lines) {
            currentTextSpans.push({
              span_text_id: spanIdCounter++,
              span: line.text,
              span_bbox: line.bbox,
            });
          }
        } else {
          if (currentChunk) {
            const chunkSentences = currentChunk.match(/[^.!?]+[.!?]+/g) || [
              currentChunk,
            ];

            chunks.push({
              id: chunks.length + 1,
              text: currentChunk,
              stats: {
                word_count: currentWords,
                sentence_count: chunkSentences.length,
                chunk_index: chunkIndex++,
              },
              source: {
                file: page.file_name,
                page_number: page.page_number,
              },
              structure: {
                type: detectStructureType(currentChunk),
                starts_with_header: startsWithHeader(currentChunk),
                contains_list: containsList(currentChunk),
              },
              text_spans: currentTextSpans,
              staticSignals: computeStaticSignals(currentChunk),
            });
          }

          currentTextSpans = [];
          spanIdCounter = 0;

          if (paraWords > maxWords) {
            const paraChunks = splitLargeParagraph(
              para,
              maxWords,
              previousSentences,
              overlapSentences,
              page.file_name,
              page.page_number,
              chunkIndex,
              rect.lines
            );
            chunks.push(...paraChunks);
            chunkIndex += paraChunks.length;

            const paraSentences = para.match(/[^.!?]+[.!?]+/g) || [para];
            previousSentences = paraSentences
              .slice(-overlapSentences)
              .map((s) => s.trim());

            currentChunk = "";
            currentWords = 0;
          } else {
            const overlap = previousSentences.slice(-overlapSentences);
            currentChunk = overlap.join(" ");
            if (currentChunk) currentChunk += " ";
            currentChunk += para.trim();

            currentWords = currentChunk.split(/\s+/).length;

            const paraSentences = para.match(/[^.!?]+[.!?]+/g) || [para];
            previousSentences = paraSentences.map((s) => s.trim());
          }
        }
      }

      if (currentChunk) {
        const chunkSentences = currentChunk.match(/[^.!?]+[.!?]+/g) || [
          currentChunk,
        ];

        chunks.push({
          id: chunks.length + 1,
          text: currentChunk,
          stats: {
            word_count: currentWords,
            sentence_count: chunkSentences.length,
            chunk_index: chunkIndex++,
          },
          source: {
            file: page.file_name,
            page_number: page.page_number,
          },
          structure: {
            type: detectStructureType(currentChunk),
            starts_with_header: startsWithHeader(currentChunk),
            contains_list: containsList(currentChunk),
          },
          text_spans: currentTextSpans,
          staticSignals: computeStaticSignals(currentChunk),
        });
      }
    }
  }

  return chunks;
}

function extractPageText(page) {
  const rects = [];
  for (const block of page.blocks || []) {
    let blockText = "";
    let lines = [];

    for (const line of block.lines || []) {
      const [x0, y0, x1, y1] = line.bbox;
      let lineText = "";

      for (const span of line.spans || []) {
        lineText += span.text;
      }

      lines.push({
        text: lineText,
        bbox: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 },
      });

      blockText += lineText + "\n";
    }

    blockText = blockText.trim();
    if (blockText !== "") {
      rects.push({
        block: blockText,
        lines: lines,
      });
    }
  }
  return rects;
}

function splitLargeParagraph(
  paragraph,
  maxWords,
  previousSentences = [],
  overlapSentences = 1,
  file_name,
  page_number,
  startIndex,
  lines = []
) {
  const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
  const chunks = [];
  let chunkIndex = startIndex;

  let overlap = previousSentences.slice(-overlapSentences);
  let chunk = overlap.join(" ");
  let words = chunk ? chunk.split(/\s+/).length : 0;

  for (const sent of sentences) {
    const sentWords = sent.trim().split(/\s+/).length;

    if (words + sentWords <= maxWords) {
      if (chunk) chunk += " ";
      chunk += sent.trim();
      words += sentWords;
      overlap.push(sent.trim());
      overlap = overlap.slice(-overlapSentences);
    } else {
      if (chunk) {
        const chunkSentences = chunk.match(/[^.!?]+[.!?]+/g) || [chunk];

        chunks.push({
          id: chunks.length + 1,
          text: chunk.trim(),
          stats: {
            word_count: words,
            sentence_count: chunkSentences.length,
            chunk_index: chunkIndex++,
          },
          source: {
            file: file_name,
            page_number: page_number,
          },
          structure: {
            type: detectStructureType(chunk),
            starts_with_header: startsWithHeader(chunk),
            contains_list: containsList(chunk),
          },
          text_spans: [],
          staticSignals: computeStaticSignals(chunk.trim()),
        });
      }

      overlap = overlap.slice(-overlapSentences);
      chunk = overlap.join(" ");
      if (chunk) chunk += " ";
      chunk += sent.trim();
      words = chunk.split(/\s+/).length;
      overlap = [sent.trim()];
    }
  }

  if (chunk) {
    const chunkSentences = chunk.match(/[^.!?]+[.!?]+/g) || [chunk];

    chunks.push({
      id: chunks.length + 1,
      text: chunk.trim(),
      stats: {
        word_count: words,
        sentence_count: chunkSentences.length,
        chunk_index: chunkIndex++,
      },
      source: {
        file: file_name,
        page_number: page_number,
      },
      structure: {
        type: detectStructureType(chunk),
        starts_with_header: startsWithHeader(chunk),
        contains_list: containsList(chunk),
      },
      text_spans: [],
    });
  }

  if (chunks.length > 0 && lines.length > 0) {
    let spanIdCounter = 0;
    const totalTextLength = chunks.reduce((sum, c) => sum + c.text.length, 0);
    let lineStartIdx = 0;

    chunks.forEach((chunk, idx) => {
      const chunkProportion = chunk.text.length / totalTextLength;

      const numLines =
        idx === chunks.length - 1
          ? lines.length - lineStartIdx
          : Math.max(1, Math.round(lines.length * chunkProportion));

      const lineEndIdx = Math.min(lineStartIdx + numLines, lines.length);

      chunk.text_spans = lines.slice(lineStartIdx, lineEndIdx).map((line) => ({
        span_text_id: spanIdCounter++,
        span: line.text,
        span_bbox: line.bbox,
      }));

      lineStartIdx = lineEndIdx;
    });
  }

  return chunks;
}

function splitSentences(text) {
  return text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+/g) || [];
}

function computeStaticSignals(text) {
  const sentences = splitSentences(text);
  const sentenceCount = sentences.length;
  const avgSentenceLength = computeAvgSentenceWordLength(sentences);

  const definitionScore = detectDefinitionScore(text);
  const causalScore = detectCausalScore(text);
  const proceduralScore = detectProceduralScore(text);
  const comparativeScore = detectComparativeScore(text);

  const citationDensity = computeCitationDensity(text);
  const sectionType = detectSectionType(text);

  return {
    sentenceCount,
    avgSentenceLength,

    hasDefinitionLanguage: definitionScore >= 2,
    hasCausalLanguage: causalScore >= 2,
    hasProceduralLanguage: proceduralScore >= 2,
    hasComparativeLanguage: comparativeScore >= 2,

    definitionScore,
    causalScore,
    proceduralScore,
    comparativeScore,

    citationDensity,
    sectionType,
  };
}

function computeAvgSentenceWordLength(sentences) {
  if (!sentences.length) return 0;

  const totalWords = sentences.reduce((sum, s) => {
    return sum + s.split(/\s+/).filter(Boolean).length;
  }, 0);

  return Math.round(totalWords / sentences.length);
}

function detectDefinitionScore(text) {
  let score = 0;

  const strongPatterns = [
    /\b(is defined as|refers to|means that|is the process of|is how)\b/i,
    /\b(can be defined as|is known as)\b/i,
  ];

  const weakPatterns = [/\b(is a|are a)\s+\w+/i];

  strongPatterns.forEach((p) => p.test(text) && (score += 2));
  weakPatterns.forEach((p) => p.test(text) && (score += 1));

  return score;
}

function detectCausalScore(text) {
  let score = 0;

  const strongPatterns = [
    /\b(because|therefore|thus|hence|consequently)\b/i,
    /\b(as a result|leads to|results in|causes)\b/i,
  ];

  const weakPatterns = [/\b(due to|since)\b/i];

  strongPatterns.forEach((p) => p.test(text) && (score += 2));
  weakPatterns.forEach((p) => p.test(text) && (score += 1));

  return score;
}

function detectProceduralScore(text) {
  let score = 0;

  const strongPatterns = [
    /\b(step\s+\d+|step by step)\b/i,
    /\b(how to|instructions for|procedure for)\b/i,
  ];

  const weakPatterns = [
    /\b(first|second|third|finally|next|then)\b/i,
    /\b(begin by|start by|complete the process)\b/i,
  ];

  strongPatterns.forEach((p) => p.test(text) && (score += 2));
  weakPatterns.forEach((p) => p.test(text) && (score += 1));

  return score;
}

function detectComparativeScore(text) {
  let score = 0;

  const strongPatterns = [
    /\b(compared to|in contrast to|as opposed to)\b/i,
    /\b(more|less|better|worse)\b.*\bthan\b/i,
  ];

  const weakPatterns = [/\b(whereas|however|on the other hand)\b/i];

  strongPatterns.forEach((p) => p.test(text) && (score += 2));
  weakPatterns.forEach((p) => p.test(text) && (score += 1));

  return score;
}

function computeCitationDensity(text) {
  const citationPatterns = [/\[\d+\]/g, /\(\d{4}\)/g, /\bet al\.\b/gi];

  let citationCount = 0;
  citationPatterns.forEach((p) => {
    const matches = text.match(p);
    if (matches) citationCount += matches.length;
  });

  const words = text.split(/\s+/).filter(Boolean).length;
  return words > 0 ? citationCount / words : 0;
}

function detectSectionType(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const firstLine = lines[0]?.toLowerCase() || "";
  const lower = text.toLowerCase();

  if (/\b(introduction|background|overview|abstract)\b/.test(firstLine)) {
    return "intro";
  }

  if (
    /\b(reference|bibliography|works cited)\b/.test(firstLine) ||
    lines.filter((l) => /\[\d+\]/.test(l)).length >= 3
  ) {
    return "reference";
  }

  if (
    /\b(conclusion|summary|discussion|future work)\b/.test(firstLine) ||
    /\b(in conclusion|to summarize|in summary)\b/.test(lower)
  ) {
    return "conclusion";
  }

  if (lines.some((l) => /^[A-Z][A-Za-z\s]{3,}:$/.test(l))) {
    return "mixed";
  }

  return "body";
}

function detectStructureType(text) {
  if (containsList(text)) return "list";
  if (startsWithHeader(text)) return "header";
  return "paragraph";
}

function startsWithHeader(text) {
  const headerPattern = /^(#{1,6}\s|[A-Z][^.!?]{5,50}:|\d+\.\s+[A-Z])/;
  return headerPattern.test(text.trim());
}

function containsList(text) {
  const listPattern = /(^|\n)\s*(?:[-*•●]|\d+\.)\s+/;
  return listPattern.test(text);
}
