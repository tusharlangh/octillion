import {
  buildChunkPageMap,
  getChunksForPage,
} from "../../utils/chunkPageMapper.js";

export async function normalizeKeywordResults(keywordResults, chunks) {
  const chunkPageMap = buildChunkPageMap(chunks);
  const chunkMap = new Map();

  for (const [fileName, fileData] of Object.entries(keywordResults)) {
    for (const pageResult of fileData.result) {
      if (!pageResult || !pageResult.page) {
        console.warn(`Invalid pageResult:`, pageResult);
        continue;
      }

      const pageNum = typeof pageResult.page === 'string' 
        ? parseInt(pageResult.page.replace("p", ""))
        : parseInt(pageResult.page);
      const term = pageResult.query;

      const chunksOnPage = getChunksForPage(chunkPageMap, fileName, pageNum);

      if (chunksOnPage.length === 0) {
        console.warn(`No chunks found for ${fileName} page ${pageNum}`);
        continue;
      }

      const chunksWithTerm = chunksOnPage.filter((chunk) => {
        return chunk.text.toLowerCase().includes(term.toLowerCase());
      });

      for (const chunk of chunksWithTerm) {
        const key = chunk.chunk_id;

        if (!chunkMap.has(key)) {
          chunkMap.set(key, {
            chunk_id: chunk.chunk_id,
            chunk_index: chunk.chunk_index,
            file_name: fileName,
            page_number: pageNum,
            score: 0,
            source: "keyword",
            text: chunk.text,
            text_spans: [],
            rects: [],
            metadata: {
              terms: [],
              match_count: 0,
              term_breakdown: {},
            },
          });
        }

        const entry = chunkMap.get(key);

        if (!entry.metadata.terms.includes(term)) {
          entry.metadata.terms.push(term);
        }

        if (pageResult.rects && Array.isArray(pageResult.rects)) {
          entry.rects.push(...pageResult.rects);
        }

        if (pageResult.text_spans && Array.isArray(pageResult.text_spans)) {
          entry.text_spans.push(...pageResult.text_spans);
        }

        entry.metadata.term_breakdown[term] = {
          count: 0,
          score: 0,
          rects: pageResult.rects || [],
          text_spans: pageResult.text_spans || [],
        };
      }
    }
  }

  const allChunks = Array.from(chunkMap.values());

  for (const chunk of allChunks) {
    const queryTerms = chunk.metadata.terms;

    const totalScore = calculateMultiTermBM25(chunk, queryTerms, allChunks);
    chunk.score = totalScore;

    for (const term of queryTerms) {
      const termScore = calculateChunkBM25(chunk, term, allChunks);
      const termCount = countTermInChunk(chunk.text, term);

      chunk.metadata.term_breakdown[term].score = termScore;
      chunk.metadata.term_breakdown[term].count = termCount;
    }

    chunk.metadata.match_count = queryTerms.reduce(
      (sum, term) => sum + chunk.metadata.term_breakdown[term].count,
      0
    );
  }

  const pageMap = new Map();

  for (const chunk of allChunks) {
    const pageKey = `${chunk.file_name}_p${chunk.page_number}`;

    if (!pageMap.has(pageKey)) {
      pageMap.set(pageKey, {
        ...chunk,
        aggregated_chunks: [chunk.chunk_id],
        best_chunk_score: chunk.score,
      });
    } else {
      const existing = pageMap.get(pageKey);

      existing.aggregated_chunks.push(chunk.chunk_id);

      if (chunk.score > existing.best_chunk_score) {
        existing.best_chunk_score = chunk.score;
        existing.chunk_id = chunk.chunk_id;
        existing.chunk_index = chunk.chunk_index;
      }

      existing.score += chunk.score;

      existing.rects.push(...chunk.rects);
      existing.text_spans.push(...chunk.text_spans);

      for (const term of chunk.metadata.terms) {
        if (!existing.metadata.terms.includes(term)) {
          existing.metadata.terms.push(term);
        }
      }

      existing.metadata.match_count += chunk.metadata.match_count;

      for (const [term, breakdown] of Object.entries(
        chunk.metadata.term_breakdown
      )) {
        if (existing.metadata.term_breakdown[term]) {
          existing.metadata.term_breakdown[term].count += breakdown.count;
          existing.metadata.term_breakdown[term].score += breakdown.score;
          existing.metadata.term_breakdown[term].rects.push(...breakdown.rects);
          existing.metadata.term_breakdown[term].text_spans.push(
            ...breakdown.text_spans
          );
        } else {
          existing.metadata.term_breakdown[term] = breakdown;
        }
      }

      if (existing.text.length < 500) {
        existing.text = `${existing.text}\n\n${chunk.text}`;
      }
    }
  }

  const pageResults = Array.from(pageMap.values());

  for (const page of pageResults) {
    page.rects = dedupeByCoordinates(page.rects);
    page.text_spans = dedupeByCoordinates(page.text_spans);

    for (const term in page.metadata.term_breakdown) {
      page.metadata.term_breakdown[term].rects = dedupeByCoordinates(
        page.metadata.term_breakdown[term].rects
      );
      page.metadata.term_breakdown[term].text_spans = dedupeByCoordinates(
        page.metadata.term_breakdown[term].text_spans
      );
    }
  }

  return pageResults;
}

function dedupeByCoordinates(items) {
  if (!items || items.length === 0) return items;

  const map = new Map();

  for (const item of items) {
    if (!item) continue;
    const key = `${item.x}|${item.y}|${item.width}|${item.height}`;
    if (!map.has(key)) {
      map.set(key, item);
    }
  }

  return Array.from(map.values());
}

function calculateChunkBM25(chunk, term, allChunks, k1 = 1.2, b = 0.75) {
  const N = allChunks.length;
  const tf = countTermInChunk(chunk.text, term);
  const chunkLength = chunk.text.trim().split(/\s+/).length;
  const avgChunkLength =
    allChunks.reduce((sum, c) => sum + c.text.trim().split(/\s+/).length, 0) /
    N;

  const chunksWithTerm = allChunks.filter((c) =>
    c.text.toLowerCase().includes(term.toLowerCase())
  ).length;

  const idf = Math.log(1 + (N - chunksWithTerm + 0.5) / (chunksWithTerm + 0.5));

  const numerator = tf * (k1 + 1);
  const denominator = tf + k1 * (1 - b + b * (chunkLength / avgChunkLength));

  return idf * (numerator / denominator);
}

function calculateMultiTermBM25(chunk, queryTerms, allChunks) {
  return queryTerms.reduce(
    (totalScore, term) =>
      totalScore + calculateChunkBM25(chunk, term, allChunks),
    0
  );
}

function countTermInChunk(text, term) {
  const tokens = text.toLowerCase().split(/\s+/);
  const q = term.toLowerCase();

  let count = 0;
  for (const token of tokens) {
    if (token.includes(q)) {
      count++;
    }
  }
  return count;
}

export async function normalizeSemanticResults(semanticResults, chunks) {
  return semanticResults
    .map((result) => {
      const chunk = chunks.find((c) => c.id === result.chunk_id);

      if (!chunk) {
        console.warn(`Chunk ${result.chunk_id} not found`);
        return null;
      }

      return {
        chunk_id: result.chunk_id,
        chunk_index: result.chunk_index,
        file_name: chunk.source.file,
        page_number: chunk.source.page_number,
        score: result.score || 0,
        source: "semantic",
        text: chunk.text,
        text_spans: chunk.text_spans || [],
        rects: [],
        metadata: {},
      };
    })
    .filter((r) => r !== null);
}
