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

          // Add text_spans for each line in this block
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
