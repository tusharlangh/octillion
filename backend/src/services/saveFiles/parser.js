import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { AppError } from "../../middleware/errorHandler.js";

function formatResponse(res) {
  return res
    .toLowerCase()
    .replace(/[^a-z0-9 ]/gi, "")
    .trim()
    .replace(/\s+/g, " ");
}

export async function extractPagesContent(links, files) {
  let pagesContent = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    let pdf = null;

    try {
      if (!link) {
        continue;
      }

      let loadingTask;

      try {
        loadingTask = pdfjs.getDocument(link);
        pdf = await loadingTask.promise;
      } catch {
        pagesContent.push({
          id: `${i + 1}.error`,
          name: files[i].originalname || `Document ${i + 1}`,
          error: "Failed to load PDF",
          site_content: "",
          total_words: 0,
          mapping: [],
        });
        continue;
      }

      if (!pdf || !pdf.numPages) {
        pagesContent.push({
          id: `${i + 1}.error`,
          name: files[i].originalname || `Document ${i + 1}`,
          error: "Invalid pdf data",
          site_content: "",
          total_words: 0,
          mapping: [],
        });
        continue;
      }

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          let site_content = "";
          let new_map = new Map();

          const page = await pdf.getPage(pageNum);

          if (!page) {
            pagesContent.push({
              id: `${i + 1}.${pageNum}`,
              name: files[i]?.originalname || `Document ${i + 1}`,
              error: "Page not found",
              site_content: "",
              total_words: 0,
              mapping: [],
            });
            continue;
          }

          const content = await page.getTextContent();

          if (!content || !content.items) {
            pagesContent.push({
              id: `${i + 1}.${pageNum}`,
              name: files[i]?.originalname || `Document ${i + 1}`,
              site_content: "",
              total_words: 0,
              mapping: [],
            });
            continue;
          }

          content.items.forEach((item) => {
            try {
              if (!item || !item.str || !item.transform) {
                return;
              }

              const words = item.str.split(/\s+/);
              const [, , , , x, y] = item.transform;

              const roundedY = Math.round(y);

              words.forEach((word) => {
                if (word && word.trim().length > 0) {
                  word.split(/[ -]+/).map((text) => {
                    if (text.trim().length === 0) {
                      return;
                    }

                    if (!new_map.has(roundedY)) {
                      new_map.set(roundedY, []);
                    }

                    new_map.get(roundedY).push({
                      word: text.toLowerCase(),
                      x,
                      y: roundedY,
                    });
                  });
                }
              });
            } catch {}
          });

          const sortedMapping = Array.from(new_map.entries())
            .sort((a, b) => b[0] - a[0])
            .map(([y, words]) => {
              const sortedWords = words.sort((a, b) => a.x - b.x);
              return [y, sortedWords];
            });

          const orderedText = sortedMapping
            .map(([, words]) => words.map((w) => w.word).join(" "))
            .join(" ");

          try {
            site_content = formatResponse(orderedText);
          } catch {
            site_content = orderedText;
          }

          pagesContent.push({
            id: `${i + 1}.${pageNum}`,
            name: files[i].originalname,
            site_content,
            total_words: site_content.split(" ").length,
            mapping: sortedMapping,
          });
        } catch {
          pagesContent.push({
            id: `${i + 1}.${pageNum}`,
            name: files[i]?.originalname || `Document ${i + 1}`,
            error: `Failed to process page ${pageNum}`,
            site_content: "",
            total_words: 0,
            mapping: [],
          });
        }
      }
    } catch {
      throw new AppError(
        "Failed to process documents",
        500,
        "DOCUMENT_FAILED_ERROR"
      );
    }
  }

  const errorPages = pagesContent.filter((page) => page.error);
  const totalPages = files.length + errorPages.length;

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
