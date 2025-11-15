import { AppError } from "../../middleware/errorHandler.js";

function extractPageNumber(pageId) {
  try {
    const parts = pageId.split(".");
    if (parts.length < 2 || !parts[1]) {
      throw new AppError(
        "Invalid pageId format",
        500,
        "INVALID_PAGE_ID_FORMAT"
      );
    }

    return parts[1];
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to extract page number: ${error.message}`,
      500,
      "EXTRACT_PAGE_NUMBER_ERROR"
    );
  }
}

export function buildContext(searchResults, pagesContent) {
  try {
    if (!searchResults || searchResults.length === 0) {
      throw new AppError(
        "Search results are empty",
        500,
        "EMPTY_SEARCH_RESULTS"
      );
    }

    if (!pagesContent) {
      throw new AppError(
        "Pages content is invalid",
        500,
        "INVALID_PAGES_CONTENT"
      );
    }

    const pageMap = new Map();

    for (const result of searchResults) {
      if (!result || !result.pageId) {
        continue;
      }

      if (!pageMap.has(result.pageId)) {
        try {
          pageMap.set(result.pageId, {
            pageId: result.pageId,
            fileName: result.file_name || "Unknown",
            pageNumber: extractPageNumber(result.pageId),
            sentences: [],
          });
        } catch (error) {
          continue;
        }
      }

      if (
        result.sentence &&
        !pageMap.get(result.pageId).sentences.includes(result.sentence)
      ) {
        pageMap.get(result.pageId).sentences.push(result.sentence);
      }
    }

    if (pageMap.size === 0) {
      throw new AppError(
        "No valid pages found in search results",
        500,
        "NO_VALID_PAGES"
      );
    }

    const contextParts = [];

    for (const [pageId, pageData] of pageMap) {
      const page = pagesContent.find((p) => p && p.id === pageId);
      const pageRef = `[${pageData.fileName}, Page ${pageData.pageNumber}]`;

      if (page && page.site_content) {
        contextParts.push(`${pageRef}\n${page.site_content}`);
      } else if (pageData.sentences.length > 0) {
        contextParts.push(`${pageRef}\n${pageData.sentences.join(" ")}`);
      }
    }

    if (contextParts.length === 0) {
      throw new AppError(
        "No context content available",
        500,
        "NO_CONTEXT_CONTENT"
      );
    }

    return contextParts.join("\n\n");
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to build context: ${error.message}`,
      500,
      "BUILD_CONTEXT_ERROR"
    );
  }
}

export function buildFullContext(pagesContent) {
  try {
    if (!pagesContent || pagesContent.length === 0) {
      throw new AppError("Pages content is empty", 500, "EMPTY_PAGES_CONTENT");
    }

    const contextParts = [];

    for (const page of pagesContent) {
      if (!page || !page.id) {
        continue;
      }

      try {
        const fileName = page.file_name || "Document";
        const pageNumber = extractPageNumber(page.id);
        const pageRef = `[${fileName}, Page ${pageNumber}]`;

        if (page.site_content) {
          contextParts.push(`${pageRef}\n${page.site_content}`);
        }
      } catch (error) {
        continue;
      }
    }

    if (contextParts.length === 0) {
      throw new AppError(
        "No document content found",
        500,
        "NO_DOCUMENT_CONTENT"
      );
    }

    return contextParts.join("\n\n");
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(
      `Failed to build full context: ${error.message}`,
      500,
      "BUILD_FULL_CONTEXT_ERROR"
    );
  }
}


