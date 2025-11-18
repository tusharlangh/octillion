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

      for (const word of words) {
        if (!word || word.trim().length === 0) continue;
        const subWords = word.split(/[ -]+/);
        for (const text of subWords) {
          if (text.trim().length === 0) continue;
          if (!new_map.has(y)) new_map.set(y, []);
          new_map.get(y).push({ word: text.toLowerCase(), x, y });
        }
      }
    }
    const sortedMapping = Array.from(new_map.entries())
      .sort((a, b) => b[0] - a[0])
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

async function processSinglePDF(link, fileIndex, fileName) {
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
    if (link.startsWith("http://") || link.startsWith("https://")) {
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
  const options = {};
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
  // For each page
  for (let i = 0; i < data.pages.length; i++) {
    const page = data.pages[i];
    const pageResult = await processSinglePage(
      page,
      i + 1,
      fileIndex,
      fileName
    );
    results.push(pageResult);
  }
  return results;
}

export async function extractPagesContent(links, files) {
  let pagesContent = [];
  for (let i = 0; i < links.length; i += 1) {
    const batch = links.slice(i, i + 1);
    const batchPromises = batch.map((link, batchIndex) => {
      const fileIndex = i + batchIndex;
      const fileName =
        files[fileIndex]?.originalname || `Document ${fileIndex + 1}`;
      return processSinglePDF(link, fileIndex, fileName);
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
    await new Promise((resolve) => setTimeout(resolve, 100));
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
  return pagesContent;
}
