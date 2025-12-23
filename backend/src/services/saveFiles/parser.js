import { AppError } from "../../middleware/errorHandler.js";
import { PDFExtract } from "pdf.js-extract";

function formatResponse(res) {
  return res
    .toLowerCase()
    .replace(/[^a-z0-9 ]/gi, "")
    .trim()
    .replace(/\s+/g, " ");
}

async function processSinglePage(page, pageNum, fileIndex, fileName) {
  try {
    const new_map = new Map();
    for (const content of page.content) {
      if (
        !content.str ||
        typeof content.x !== "number" ||
        typeof content.y !== "number"
      )
        continue;
      const words = content.str.split(/\s+/);
      const x = content.x;
      const y = Math.round(content.y);
      const height = content.height || 0;
      const totalWidth = content.width;
      const totalLength = content.str.length;

      const safeWidth =
        typeof totalWidth === "number" && totalWidth > 0
          ? totalWidth
          : totalLength * 5;
      const avgCharWidth = safeWidth / (totalLength || 1);

      let currentXOffset = 0;

      for (const word of words) {
        if (!word || word.trim().length === 0) continue;

        const subWords = word.split(/[ -]+/);
        let positionInWord = 0;

        for (const text of subWords) {
          if (text.trim().length === 0) continue;

          const segmentX = x + (positionInWord + currentXOffset) * avgCharWidth;

          if (!new_map.has(y)) new_map.set(y, []);
          new_map.get(y).push({
            word: text.toLowerCase(),
            x: segmentX,
            y,
            height,
            width: text.length * avgCharWidth,
          });

          positionInWord += text.length + 1;
        }

        currentXOffset += word.length + 1;
      }
    }
    const sortedMapping = Array.from(new_map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([y, words]) => [y, words.sort((a, b) => a.x - b.x)]);
    const orderedText = sortedMapping
      .map(([, words]) => words.map((w) => w.word).join(" "))
      .join(" ");
    const site_content = formatResponse(orderedText);
    return {
      id: `${fileIndex + 1}.${pageNum}`,
      name: fileName,
      site_content,
      total_words: site_content.split(" ").length,
      mapping: sortedMapping,
    };
  } catch (err) {
    return {
      id: `${fileIndex + 1}.${pageNum}`,
      name: fileName,
      error: `Failed to process page ${pageNum}`,
      site_content: "",
      total_words: 0,
      mapping: [],
    };
  }
}

async function processSinglePDF(link, fileIndex, fileName, file) {
  const results = [];
  if (!link) {
    return [
      {
        id: `${fileIndex + 1}.error`,
        name: fileName,
        error: "No link provided",
        site_content: "",
        total_words: 0,
        mapping: [],
      },
    ];
  }

  let pdfBuffer;
  try {
    if (file && file.buffer) {
      pdfBuffer = file.buffer;
    } else if (link.startsWith("http://") || link.startsWith("https://")) {
      const res = await fetch(link);
      pdfBuffer = Buffer.from(await res.arrayBuffer());
    } else {
      const fs = await import("fs/promises");
      pdfBuffer = await fs.readFile(link);
    }
  } catch (err) {
    return [
      {
        id: `${fileIndex + 1}.error`,
        name: fileName,
        error: "Failed to load PDF",
        site_content: "",
        total_words: 0,
        mapping: [],
      },
    ];
  }
  const pdfExtract = new PDFExtract();
  const options = {
    disableCombineTextItems: true,
  };
  let data;
  try {
    data = await new Promise((resolve, reject) => {
      pdfExtract.extractBuffer(pdfBuffer, options, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  } catch (err) {
    return [
      {
        id: `${fileIndex + 1}.error`,
        name: fileName,
        error: "Failed to extract PDF",
        site_content: "",
        total_words: 0,
        mapping: [],
      },
    ];
  }

  const pagePromises = data.pages.map((page, i) =>
    processSinglePage(page, i + 1, fileIndex, fileName)
  );
  const pageResults = await Promise.all(pagePromises);
  results.push(...pageResults);

  pdfBuffer = null;
  return results;
}

export async function extractPagesContent(links, files) {
  let pagesContent = [];
  let BATCH_SIZE = 2;
  for (let i = 0; i < links.length; i += BATCH_SIZE) {
    const batch = links.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map((link, batchIndex) => {
      const fileIndex = i + batchIndex;
      const fileName =
        files[fileIndex]?.file_name || `Document ${fileIndex + 1}`;
      const file = files[fileIndex];
      return processSinglePDF(link, fileIndex, fileName, file);
    });
    try {
      const batchResults = await Promise.all(batchPromises);
      for (const result of batchResults) {
        pagesContent.push(...result);
      }
    } catch (err) {
      throw new AppError(
        "Failed to process documents",
        500,
        "DOCUMENT_FAILED_ERROR",
        {
          originalError: err.message,
          stack: err.stack,
          fileIndex: i,
          filesBatch: batch.map((b, idx) => files[i + idx]?.originalname),
        }
      );
    }
  }
  const errorPages = pagesContent.filter((page) => page.error);
  const totalPages = pagesContent.length;
  if (totalPages === 0) {
    throw new AppError(
      "Pages content is empty",
      500,
      "EMPTY_PAGES_CONTENT_ERROR"
    );
  }
  const errorRate = errorPages.length / totalPages;
  if (errorRate > 0.5) {
    throw new AppError(
      `Failed to process ${
        errorPages.length
      } out of ${totalPages} pages (${Math.round(
        errorRate * 100
      )}% failure rate)`,
      500,
      "HIGH_FAILURE_RATE_ERROR"
    );
  }
  pagesContent = pagesContent.filter((page) => !page.error);

  if (pagesContent.length === 0) {
    throw new AppError(
      `Pages content is empty`,
      500,
      "EMPTY_PAGE_CONTENT_ERROR"
    );
  }
  return pagesContent;
}
