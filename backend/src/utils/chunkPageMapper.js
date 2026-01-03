export function buildChunkPageMap(chunks) {
  const chunkPageMap = new Map();

  chunks.forEach((chunk) => {
    const key = `${chunk.source.file}_p${chunk.source.page_number}`;

    if (!chunkPageMap.has(key)) {
      chunkPageMap.set(key, []);
    }

    chunkPageMap.get(key).push({
      chunk_id: chunk.id,
      chunk_index: chunk.stats.chunk_index,
      text: chunk.text,
    });
  });

  return chunkPageMap;
}

export function getChunksForPage(chunkPageMap, fileName, pageNumber) {
  const key = `${fileName}_p${pageNumber}`;
  return chunkPageMap.get(key) || [];
}
