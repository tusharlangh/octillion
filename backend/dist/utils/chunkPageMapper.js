"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildChunkPageMap = buildChunkPageMap;
exports.getChunksForPage = getChunksForPage;
function buildChunkPageMap(chunks) {
  var chunkPageMap = new Map();
  chunks.forEach(function (chunk) {
    var key = "".concat(chunk.source.file, "_p").concat(chunk.source.page_number);
    if (!chunkPageMap.has(key)) {
      chunkPageMap.set(key, []);
    }
    chunkPageMap.get(key).push({
      chunk_id: chunk.id,
      chunk_index: chunk.stats.chunk_index,
      text: chunk.text
    });
  });
  return chunkPageMap;
}
function getChunksForPage(chunkPageMap, fileName, pageNumber) {
  var key = "".concat(fileName, "_p").concat(pageNumber);
  return chunkPageMap.get(key) || [];
}