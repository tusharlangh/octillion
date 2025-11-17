import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { AppError } from "../../middleware/errorHandler.js";

pdfjs.GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.mjs";

function formatResponse(res) {
  return res
    .toLowerCase()
    .replace(/[^a-z0-9 ]/gi, "")
    .trim()
    .replace(/\s+/g, " ");
}

async function processSinglePage(pdf, pageNum, fileIndex, fileName) {
  let page = null;

  try {
    page = await pdf.getPage(pageNum);

    if (!page) {
      return {
        id: `${fileIndex + 1}.${pageNum}`,
        name: fileName,
        error: "Page not found",
        site_content: "",
        total_words: 0,
        mapping: [],
      };
    }

    const content = await page.getTextContent();

    if (!content || !content.items) {
      return {
        id: `${fileIndex + 1}.${pageNum}`,
        name: fileName,
        site_content: "",
        total_words: 0,
        mapping: [],
      };
    }

    const new_map = new Map();

    for (const item of content.items) {
      try {
        if (!item?.str || !item?.transform) continue;

        const words = item.str.split(/\s+/);
        const [, , , , x, y] = item.transform;
        const roundedY = Math.round(y);

        for (const word of words) {
          if (!word || word.trim().length === 0) continue;

          const subWords = word.split(/[ -]+/);
          for (const text of subWords) {
            if (text.trim().length === 0) continue;

            if (!new_map.has(roundedY)) {
              new_map.set(roundedY, []);
            }

            new_map.get(roundedY).push({
              word: text.toLowerCase(),
              x,
              y: roundedY,
            });
          }
        }
      } catch (err) {
        continue;
      }
    }

    const sortedMapping = Array.from(new_map.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([y, words]) => {
        const sortedWords = words.sort((a, b) => a.x - b.x);
        return [y, sortedWords];
      });

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
  } finally {
    if (page) {
      try {
        if (page.cleanup) page.cleanup();
      } catch {}
      try {
        if (page.destroy) await page.destroy();
      } catch {}
      page = null;
    }
  }
}

async function processSinglePDF(link, fileIndex, fileName) {
  let pdf = null;
  const results = [];

  try {
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

    const loadingTask = pdfjs.getDocument({
      url: link,
      disableFontFace: true,
      stopAtErrors: false,
    });

    try {
      pdf = await loadingTask.promise;
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

    if (!pdf || !pdf.numPages) {
      return [
        {
          id: `${fileIndex + 1}.error`,
          name: fileName,
          error: "Invalid pdf data",
          site_content: "",
          total_words: 0,
          mapping: [],
        },
      ];
    }

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const pageResult = await processSinglePage(
        pdf,
        pageNum,
        fileIndex,
        fileName
      );
      results.push(pageResult);

      if (global.gc) {
        global.gc();
      }
    }

    return results;
  } finally {
    if (pdf) {
      try {
        if (pdf.cleanup) pdf.cleanup();
      } catch {}
      try {
        if (pdf.destroy) await pdf.destroy();
      } catch {}
      pdf = null;
    }
  }
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
        "DOCUMENT_FAILED_ERROR"
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
