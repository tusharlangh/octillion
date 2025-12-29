import { AppError } from "../../middleware/errorHandler.js";

export function createContextualChunks_v2(sitesContent, options = {}) {
  const { maxWords = 300, overlapSentences = 1 } = options;
  const chunks = [];
  let chunkIndex = 0;

  for (const site of sitesContent) {
    for (const page of site.pages) {
      const pageText = extractPageText(page);
      const paragraphs = pageText.split(/\n\s*\n/).filter((p) => p.trim());

      let previousSentences = [];
      let currentChunk = "";
      let currentWords = 0;

      for (const para of paragraphs) {
        const paraWords = para.trim().split(/\s+/).length;

        if (currentWords + paraWords <= maxWords) {
          if (currentChunk) currentChunk += "\n\n";
          currentChunk += para.trim();
          currentWords += paraWords;

          const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
          previousSentences.push(...sentences.map((s) => s.trim()));
          previousSentences = previousSentences.slice(-overlapSentences);
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
            });
          }

          if (paraWords > maxWords) {
            const paraChunks = splitLargeParagraph(
              para,
              maxWords,
              previousSentences,
              overlapSentences,
              page.file_name,
              page.page_number,
              chunkIndex
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
        });
      }
    }
  }

  return chunks;
}

function extractPageText(page) {
  let text = "";
  for (const block of page.blocks || []) {
    for (const line of block.lines || []) {
      for (const span of line.spans || []) {
        text += span.text;
      }
      text += "\n";
    }
    text += "\n";
  }
  return text;
}

function splitLargeParagraph(
  paragraph,
  maxWords,
  previousSentences = [],
  overlapSentences = 1,
  file_name,
  page_number,
  startIndex
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

export function createContextualChunks(sortedMapping) {
  if (!sortedMapping || sortedMapping.length === 0) return [];

  try {
    const rows = sortedMapping.map(([y, words]) => words);

    const regions = generateRegionsUnified(rows);
    const allChunks = [];

    for (const region of regions) {
      if (region.rows.length === 0) continue;

      if (region.type === "PROSE") {
        const proseWords = region.rows.flat();
        let s = chunkifyProse(proseWords);
        s.map((item) =>
          allChunks.push({
            text: item.text,
            startY: item.startY,
            endY: item.endY,
            wordCount: item.wordCount,
          })
        );
        continue;
      }

      const regionStartY = region.rows[0][0]?.y || 0;
      const regionEndY = region.rows[region.rows.length - 1][0]?.y || 0;

      const tableLines = buildUnifiedTable(region.rows);
      const tableText = tableLines.join("\n");

      if (tableText.trim().length > 0) {
        allChunks.push({
          text: tableText,
          startY: regionStartY,
          endY: regionEndY,
          wordCount: tableText.split(/\s+/).length,
        });
      }
    }

    return allChunks;
  } catch (error) {
    if (error.isOperational) throw error;
    throw new AppError("Failed building chunks", 500, "BUILDING_CHUNKS_ERROR");
  }
}

function generateRegionsUnified(rows) {
  const regions = [];
  let currentRegion = null;

  for (const row of rows) {
    const isMultiColumn = detectXClusters(row).length > 1;
    const rowType = isMultiColumn ? "TABLE" : "PROSE";

    if (!currentRegion) {
      currentRegion = { type: rowType, rows: [row] };
      continue;
    }

    if (rowType === currentRegion.type) {
      currentRegion.rows.push(row);
    } else {
      regions.push(currentRegion);
      currentRegion = { type: rowType, rows: [row] };
    }
  }

  if (currentRegion) regions.push(currentRegion);
  return regions;
}

function detectXClusters(row) {
  if (!row.length) return [];

  const clusters = [];
  let currentCluster = [];
  const GAP_THRESHOLD = dynamicGapThreshold(row);

  for (let i = 0; i < row.length; i++) {
    if (i === 0) {
      currentCluster.push(row[i].x);
      continue;
    }

    const gap = row[i].x - (row[i - 1].x + row[i - 1].width);
    if (gap > GAP_THRESHOLD) {
      clusters.push(currentCluster);
      currentCluster = [];
    }
    currentCluster.push(row[i].x);
  }

  if (currentCluster.length > 0) clusters.push(currentCluster);
  return clusters.map(average);
}

function dynamicGapThreshold(row) {
  const avgH = row.reduce((sum, w) => sum + w.height, 0) / row.length;
  return 2.7 * avgH + 11;
}

function average(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function buildUnifiedTable(rows) {
  if (!rows.length) return [];

  const boundaries = computeColumnBoundaries(rows);

  const table = rows.map((row) => {
    const rowColumns = Array(boundaries.length)
      .fill("")
      .map(() => []);
    for (const w of row) {
      let colIdx = 0;
      for (let i = 0; i < boundaries.length; i++) {
        if (w.x >= boundaries[i][0] && w.x < boundaries[i][1]) {
          colIdx = i;
          break;
        }
      }
      rowColumns[colIdx].push(w.word);
    }
    return rowColumns.map((col) => col.join(" "));
  });

  const maxWidths = table[0].map((_, colIdx) =>
    Math.max(...table.map((row) => (row[colIdx] || "").length))
  );

  return table.map(
    (row) =>
      "| " +
      row.map((cell, i) => (cell || "").padEnd(maxWidths[i])).join(" | ") +
      " |"
  );
}

function computeColumnBoundaries(rows) {
  const allXs = rows.flatMap((row) =>
    row.map((w) => ({ start: w.x, end: w.x + (w.width || 0) }))
  );

  const xMin = Math.min(...allXs.map((w) => w.start));
  const xMax = Math.max(...allXs.map((w) => w.end));

  const histogram = new Array(Math.ceil(xMax) + 1).fill(0);
  for (const w of allXs) {
    for (let i = Math.floor(w.start); i <= Math.ceil(w.end); i++) {
      histogram[i]++;
    }
  }

  const GAP_MIN_WIDTH = 25;
  const gaps = [];
  let gapStart = -1;

  for (let i = Math.floor(xMin); i <= Math.ceil(xMax); i++) {
    if (histogram[i] === 0) {
      if (gapStart === -1) gapStart = i;
    } else if (gapStart !== -1) {
      if (i - gapStart >= GAP_MIN_WIDTH) gaps.push([gapStart, i]);
      gapStart = -1;
    }
  }
  if (gapStart !== -1 && Math.ceil(xMax) - gapStart >= GAP_MIN_WIDTH) {
    gaps.push([gapStart, Math.ceil(xMax)]);
  }

  const boundaries = [];
  let last = xMin;
  for (const gap of gaps) {
    boundaries.push([last, gap[0]]);
    last = gap[1];
  }
  boundaries.push([last, xMax]);

  return boundaries;
}

function chunkifyProse(
  sortedMapping,
  targetLimit = 80,
  maxLimit = 120,
  overlap = 10
) {
  if (!sortedMapping || sortedMapping.length === 0) {
    return [];
  }

  try {
    const allWords = sortedMapping;

    if (allWords.length === 0) {
      return [];
    }
    const chunks = [];
    let l = 0;
    while (l < allWords.length) {
      let r = l;
      let lastSentenceEnd = -1;
      while (r < allWords.length && r - l < maxLimit) {
        const word = allWords[r].word;
        if (/[.!?]["')\]]?$/.test(word)) {
          lastSentenceEnd = r;
          if (r - l >= targetLimit) break;
        }
        r++;
      }
      const cutPoint =
        lastSentenceEnd !== -1
          ? lastSentenceEnd + 1
          : Math.min(l + maxLimit, allWords.length);
      const slice = allWords.slice(l, cutPoint);
      if (slice.length > 0) {
        chunks.push({
          text: slice.map((w) => w.word).join(" "),
          startY: slice[0].y,
          endY: slice[slice.length - 1].y,
          wordCount: slice.length,
        });
      }
      const nextL = cutPoint - overlap;
      l = nextL > l ? nextL : cutPoint;
    }
    return chunks;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError("Failed building chunks", 500, "BUILDING_CHUNKS_ERROR");
  }
}
