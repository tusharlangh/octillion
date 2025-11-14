import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../utils/aws/s3Client.js";
import dotenv from "dotenv";
import supabase from "../utils/supabase/client.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { generateEmbedding, createContextualChunks } from "./parse.js";
import { OptimizedKeywordIndex } from "../utils/OptimizedKeywordIndex.js";
import { uploadChunksToQdrant } from "./qdrantService.js";
import {
  AppError,
  ValidationError,
  NotFoundError,
} from "../middleware/errorHandler.js";
dotenv.config();

async function uploadToS3(id, index, file) {
  try {
    if (!file || !file.buffer || !file.originalname) {
      throw new AppError(`Invalid file at index ${index}`, 400, "INVALID_FILE");
    }

    const key = `${id}-${index}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3.send(command);

    return { key: key, file_name: file.originalname, file_type: file.mimetype };
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    const errorCode = error?.$metadata?.httpStatusCode || error?.name;

    if (errorCode === "NoSuchBucket") {
      throw new AppError(
        "S3 bucket does not exist",
        500,
        "S3_BUCKET_NOT_FOUND"
      );
    }

    if (errorCode === 403 || errorCode === "AccessDenied") {
      throw new AppError("Access denied to S3 bucket", 403, "S3_ACCESS_DENIED");
    }

    throw new AppError(
      `Failed to upload file: ${file?.originalname || `index ${index}`}`,
      500,
      "S3_UPLOAD_FAILED"
    );
  }
}

export async function saveFiles(id, files, userId) {
  const keys = await Promise.all(
    files.map((file, i) => uploadToS3(id, i, file))
  );

  const urls = [];

  for (let i = 0; i < keys.length; i++) {
    const link = keys[i];

    if (!link) continue;

    try {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: link.key,
      });

      const url = await getSignedUrl(s3, command, {
        expiresIn: 60 * 60 * 24 * 1, //1 day
      });

      urls.push({
        file_name: link.file_name,
        file_type: link.mimetype,
        presignedUrl: url,
      });
    } catch (s3Error) {
      const errorCode = s3Error?.$metadata?.httpStatusCode || s3Error?.code;

      if (errorCode === 404 || errorCode === "NoSuchKey") {
        throw new NotFoundError(`S3 object not found: ${link.key}`);
      } else if (errorCode === 403 || errorCode === "AccessDenied") {
        throw new AppError(
          `Access denied to file: ${link.file_name || link.key}`,
          403,
          "S3_ACCESS_DENIED"
        );
      } else {
        throw new AppError(
          `Failed to generate presigned URL for file: ${
            link.file_name || link.key
          }. ${s3Error.message}`,
          500,
          "S3_ERROR"
        );
      }
    }
  }

  const links = urls.map((url, i) => url.presignedUrl);

  if (!links || links.length === 0) {
    throw new AppError(
      "No valid file URLs generated",
      500,
      "NO_URLS_GENERATED_ERROR"
    );
  }

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
      } catch (error) {
        console.error(`failed to load pdf for ${i} link`);

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

          console.log(content);

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
              const [a, b, c, d, x, y] = item.transform;

              const roundedY = Math.round(y);

              words.forEach((word) => {
                if (word && word.trim().length > 0) {
                  if (!new_map.has(roundedY)) {
                    new_map.set(roundedY, []);
                  }

                  new_map.get(roundedY).push({
                    word: word.toLowerCase(),
                    x: x,
                    y: roundedY,
                  });
                }
              });
            } catch (error) {
              console.warn(`Error processing content item: ${error.message}`);
            }
          });

          const sortedMapping = Array.from(new_map.entries())
            .sort((a, b) => b[0] - a[0]) //[y, words]
            .map(([y, words]) => {
              const sortedWords = words.sort((a, b) => a.x - b.x);
              return [y, sortedWords];
            });

          const orderedText = sortedMapping
            .map(([y, words]) => words.map((w) => w.word).join(" "))
            .join(" ");

          try {
            site_content = formatResponse(orderedText);
          } catch (error) {
            site_content = orderedText;
          }

          pagesContent.push({
            id: `${i + 1}.${pageNum}`,
            name: files[i].originalname,
            site_content,
            total_words: site_content.split(" ").length,
            mapping: sortedMapping,
          });
        } catch (error) {
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
    } catch (error) {
      throw new AppError(
        `Failed to process documents`,
        500,
        "DOCUMENT_FAILED_ERROR"
      );
    }
  }

  const errorPages = pagesContent.filter((page) => page.error);
  const totalPages = files.length + errorPages.length;

  if (totalPages === 0) {
    throw new AppError(
      `Pages content is empty`,
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

  let invertedIndex;
  try {
    invertedIndex = createInvertedSearch(pagesContent);
  } catch (error) {
    throw new AppError(
      `Failed to get inverted index`,
      500,
      "FAILED_INVERTED_INDEX_ERROR"
    );
  }

  let keywordIndex;

  try {
    keywordIndex = buildOptimizedIndex(pagesContent);
  } catch (error) {
    throw new AppError(
      `Failed to build optimized index`,
      500,
      "FAILED_OPTIMIZED_INDEX_ERROR"
    );
  }

  const build_index = keywordIndex.toJSON();

  try {
    pagesContent = await generateChunks(pagesContent);
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(`Failed to build chunks`, 500, "FAILED_CHUNKS_ERROR");
  }

  try {
    const chunksData = [];
    const BATCH_SIZE = 10;
    const embedErrors = [];

    for (const page of pagesContent) {
      if (page.chunks && page.chunks.length > 0) {
        for (let i = 0; i < page.chunks.length; i += BATCH_SIZE) {
          const batch = page.chunks.slice(i, i + BATCH_SIZE);
          let batchEmbeddings;

          batchEmbeddings = await Promise.all(
            batch.map(async (chunk, index) => {
              try {
                return await generateEmbedding(chunk.text);
              } catch (error) {
                embedErrors.push({
                  pageId: page.id,
                  error: `Chunk embeddings failed for page: ${page.id}`,
                });
                return null;
              }
            })
          );

          for (let j = 0; j < batch.length; j++) {
            const embedding = batchEmbeddings[j];
            const chunk = batch[j];

            if (!embedding || !chunk) {
              continue;
            }

            chunksData.push({
              embedding: embedding,
              pageId: page.id,
              file_name: page.name,
              startY: chunk.startY,
              endY: chunk.endY,
              text: chunk.text,
              wordCount: chunk.wordCount,
            });
          }
        }
      }
    }

    if (chunksData.length === 0) {
      throw new AppError("Empty chunks data", 500, "EMPTY_CHUNKS_FAILED");
    }

    const errorRate =
      embedErrors.length / (chunksData.length + embedErrors.length);

    if (errorRate > 0.3) {
      throw new AppError(
        `Too many embedding failures: ${embedErrors.length} out of ${
          chunksData.length + embedErrors.length
        } chunks failed`,
        500,
        "HIGH_EMBEDDING_FAILURE_RATE"
      );
    }

    try {
      await uploadChunksToQdrant(id, userId, chunksData);
    } catch (error) {
      throw new AppError(
        "Failed to upload embeddings to vector database",
        500,
        "QDRANT_UPLOAD_FAILED"
      );
    }
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    throw new AppError(
      "Failed to generate and upload embeddings",
      500,
      "EMBEDDING_PROCESS_FAILED"
    );
  }

  const { data, error } = await supabase.from("files").insert([
    {
      user_id: userId,
      parse_id: id,
      files: keys,
      build_index: build_index,
      inverted_index: invertedIndex,
      pages_metadata: pagesContent,
    },
  ]);

  if (error) {
    throw new AppError(
      `Failed to save files: ${error.message}`,
      500,
      "SUPABASE_ERROR"
    );
  }

  console.log("everything worked and the data is saved. Check db");

  return data;
}

function formatResponse(res) {
  return res
    .toLowerCase()
    .replace(/[^a-z0-9 ]/gi, "")
    .trim()
    .replace(/\s+/g, " ");
}

function createInvertedSearch(sitesContent) {
  try {
    const inverted = {};

    for (const { id, site_content } of sitesContent) {
      for (const word of site_content.split(" ")) {
        if (!inverted[word]) inverted[word] = {};
        const termMap = inverted[word];
        termMap[id] = (termMap[id] || 0) + 1;
      }
    }

    return inverted;
  } catch (error) {
    throw new AppError(
      "Building Inverted index failed",
      500,
      "INVERTED_INDEX_FAILED_ERROR"
    );
  }
}

function buildOptimizedIndex(pagesContent) {
  try {
    const index = new OptimizedKeywordIndex();

    for (const page of pagesContent) {
      const pageId = page.id;
      const mapping = new Map(page.mapping);

      for (const [y, row] of mapping) {
        for (const wordObj of row) {
          const word = wordObj.word;
          if (word) {
            index.add(word, pageId, y);
          }
        }
      }
    }

    if (index.getStorageSize && index.getStorageSize() === 0) {
      throw new AppError(
        `Keyword index is empty`,
        500,
        "EMPTY_KEYWORD_INDEX_ERROR"
      );
    }

    index.finalize();

    return index;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    throw new AppError(
      `Building keyword index failed: ${error}`,
      500,
      "KEYWORD_INDEX_FAILED_ERROR"
    );
  }
}

async function generateChunks(pagesContent) {
  try {
    for (const page of pagesContent) {
      try {
        const chunks = createContextualChunks(page.mapping);
        page.chunks = chunks;
      } catch (error) {
        if (error.isOperational) {
          throw error;
        }
        throw new AppError(
          `Failed generating chunks for page id: ${page.id}`,
          500,
          "FAILED_CHUNKS_ERROR"
        );
      }
    }
    return pagesContent;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new AppError(`Failed generating chunks`, 500, "FAILED_CHUNKS_ERROR");
  }
}
