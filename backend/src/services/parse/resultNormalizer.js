import {
  buildChunkPageMap,
  getChunksForPage,
} from "../../utils/chunkPageMapper.js";

export async function normalizeKeywordResults(keywordResults, chunks) {
  const chunkPageMap = buildChunkPageMap(chunks);
  const normalizedResults = [];

  for (const [fileName, fileData] of Object.entries(keywordResults)) {
    for (const pageResult of fileData.result) {
      const pageNum = parseInt(pageResult.page.replace("p", ""));

      const chunksOnPage = getChunksForPage(chunkPageMap, fileName, pageNum);

      if (chunksOnPage.length === 0) {
        console.warn(`No chunks found for ${fileName} page ${pageNum}`);
        continue;
      }

      for (const chunk of chunksOnPage) {
        normalizedResults.push({
          chunk_id: chunk.chunk_id,
          chunk_index: chunk.chunk_index,
          file_name: fileName,
          page_number: pageNum,
          score: fileData.score,
          source: "keyword",
          match_count: pageResult.total,
          rects: pageResult.rects,
        });
      }
    }
  }

  return normalizedResults;
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
      };
    })
    .filter((r) => r !== null);
}
