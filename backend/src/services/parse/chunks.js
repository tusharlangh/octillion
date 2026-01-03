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
      let curRects = [];

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

          curRects.push(...rect.bboxes);
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
              rects: curRects,
            });
          }

          curRects = [];

          if (paraWords > maxWords) {
            const paraChunks = splitLargeParagraph(
              para,
              maxWords,
              previousSentences,
              overlapSentences,
              page.file_name,
              page.page_number,
              chunkIndex,
              rect.bboxes
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
          rects: curRects,
        });
      }
    }
  }

  return chunks;
}

function extractPageText(page) {
  const rects = [];
  for (const block of page.blocks || []) {
    let rect = { block: "", bboxes: [] };
    for (const line of block.lines || []) {
      const [x0, y0, x1, y1] = line.bbox;
      rect.bboxes.push({ x: x0, y: y0, width: x1 - x0, height: y1 - y0 });
      for (const span of line.spans || []) {
        rect.block += span.text;
      }
      rect.block += "\n";
    }
    rect.block += "\n";
    rect.block = rect.block.trim();
    if (rect.block !== "") {
      rects.push(rect);
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
  bboxes = []
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
          rects: [],
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
      rects: [],
    });
  }

  if (chunks.length > 0 && bboxes.length > 0) {
    const totalTextLength = chunks.reduce((sum, c) => sum + c.text.length, 0);

    let bboxStartIdx = 0;

    chunks.forEach((chunk, idx) => {
      const chunkProportion = chunk.text.length / totalTextLength;

      const numBboxes =
        idx === chunks.length - 1
          ? bboxes.length - bboxStartIdx
          : Math.max(1, Math.round(bboxes.length * chunkProportion));

      const bboxEndIdx = Math.min(bboxStartIdx + numBboxes, bboxes.length);

      chunk.rects = bboxes.slice(bboxStartIdx, bboxEndIdx);

      bboxStartIdx = bboxEndIdx;
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
