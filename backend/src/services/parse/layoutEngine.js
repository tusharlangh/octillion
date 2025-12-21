import { AppError } from "../../middleware/errorHandler.js";

export function identifyBlocks(mapping) {
  if (!mapping || !(mapping instanceof Map)) {
    throw new AppError(
      "Creating blocks failed due to mapping being empty or not a Map",
      500,
      "FAILED_CREATING_BLOCKS"
    );
  }

  if (mapping.size === 0) {
    throw new AppError(
      "Creating blocks failed due to mapping being empty",
      500,
      "FAILED_CREATING_BLOCKS"
    );
  }

  const words = [];
  for (const [y, wordsOnLine] of mapping.entries()) {
    words.push(...wordsOnLine);
  }

  if (words.length === 0) {
    throw new AppError(
      "Creating blocks failed due to words being empty",
      500,
      "FAILED_CREATING_BLOCKS"
    );
  }

  const ROW_TOLERANCE = 5;
  const COLUMN_GAP_THRESHOLD = 50;
  const VERTICAL_SORT_THRESHOLD = 200;

  words.sort((a, b) => {
    if (Math.abs(a.y - b.y) < ROW_TOLERANCE) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  const blocks = [];
  let currentBlock = [words[0]];

  for (let i = 1; i < words.length; i++) {
    const currentWord = words[i];
    const previousWord = words[i - 1];

    const verticalGap = currentWord.y - previousWord.y;
    const averageHeight = (currentWord.height + previousWord.height) / 2 || 12;
    const maxRowGap = averageHeight * 2;

    const isSameLine = Math.abs(verticalGap) < ROW_TOLERANCE;
    const isNextLine = verticalGap > 0 && verticalGap < maxRowGap;
    const isColumnBreak =
      isSameLine && currentWord.x - previousWord.x > COLUMN_GAP_THRESHOLD;

    if (!isColumnBreak && (isSameLine || isNextLine)) {
      currentBlock.push(currentWord);
    } else {
      blocks.push(currentBlock);
      currentBlock = [currentWord];
    }
  }

  blocks.push(currentBlock);

  blocks.sort((blockA, blockB) => {
    const startA = blockA[0];
    const startB = blockB[0];

    if (Math.abs(startA.y - startB.y) > VERTICAL_SORT_THRESHOLD) {
      return startA.y - startB.y;
    }
    return startA.x - startB.x;
  });

  return blocks.map((block) => {
    const text = block.map((w) => w.word).join(" ");
    const startY = Math.min(...block.map((w) => w.y));
    const endY = Math.max(...block.map((w) => w.y));

    return {
      text,
      words: block,
      startY,
      endY,
      wordCount: block.length,
    };
  });
}
