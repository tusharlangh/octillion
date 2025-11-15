import { AppError } from "../../middleware/errorHandler.js";

export function createContextualChunks(
  sortedMapping,
  chunkSizeInWords = 80,
  overlapWords = 20
) {
  if (!sortedMapping || sortedMapping.length === 0) {
    return "";
  }

  try {
    const chunks = [];
    let currentWords = [];
    let currentYRange = [];

    for (const [y, row] of sortedMapping) {
      const words = row.map((w) => w.word);

      if (!words || words.length === 0) continue;

      currentWords.push(...words);
      currentYRange.push(y);

      if (currentWords.length >= chunkSizeInWords) {
        const chunkText = currentWords.join(" ");

        chunks.push({
          text: chunkText,
          startY: currentYRange[0],
          endY: currentYRange[currentYRange.length - 1],
          wordCount: currentWords.length,
        });

        currentWords = currentWords.slice(-overlapWords);
        currentYRange = currentYRange.slice(-overlapWords);
      }
    }

    if (currentWords.length > 30) {
      chunks.push({
        text: currentWords.join(" "),
        startY: currentYRange[0],
        endY: currentYRange[currentYRange.length - 1],
        wordCount: currentWords.length,
      });
    }

    return chunks;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    throw new AppError("Failed building chunks", 500, "BUILDING_CHUNKS_ERROR");
  }
}
