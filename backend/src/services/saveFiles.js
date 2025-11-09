import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../utils/aws/s3Client.js";
import dotenv from "dotenv";
import supabase from "../utils/supabase/client.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import { generateEmbedding, createContextualChunks } from "./parse.js";
import { OptimizedKeywordIndex } from "../utils/OptimizedKeywordIndex.js";

dotenv.config();

async function uploadToS3(id, index, file) {
  const key = `${id}-${index}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3.send(command);

  return { key: key, file_name: file.originalname, file_type: file.mimetype };
}

export async function saveFiles(id, files, userId) {
  const keys = await Promise.all(
    files.map((file, i) => uploadToS3(id, i, file))
  );

  const urls = [];

  for (let i = 0; i < keys.length; i++) {
    const link = keys[i];

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
  }

  const links = urls.map((url, i) => url.presignedUrl);

  let pagesContent = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    const loadingTask = pdfjs.getDocument(link);
    const pdf = await loadingTask.promise;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      let site_content = "";
      let new_map = new Map();

      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      content.items.forEach((item) => {
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

      site_content = formatResponse(orderedText);

      pagesContent.push({
        id: `${i + 1}.${pageNum}`,
        name: files[i].originalname,
        site_content,
        total_words: site_content.split(" ").length,
        mapping: sortedMapping,
      });
    }
  }

  const invertedIndex = createInvertedSearch(pagesContent);

  const keywordIndex = buildOptimizedIndex(pagesContent);

  const build_index = keywordIndex.toJSON();

  pagesContent = await generateAndStoreEmbeddings(pagesContent);

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
    console.error("error occured saving files inside supabase", error);
  } else {
    console.log("everything worked and the data is saved. Check db");
  }

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
  const inverted = {};

  for (const { id, site_content } of sitesContent) {
    for (const word of site_content.split(" ")) {
      if (!inverted[word]) inverted[word] = {};
      const termMap = inverted[word];
      termMap[id] = (termMap[id] || 0) + 1;
    }
  }

  return inverted;
}

function buildOptimizedIndex(pagesContent) {
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

  // Sort arrays for binary search
  index.finalize();

  return index;
}

/**
 * Generate and store embeddings for all pages and chunks
 * This pre-computes embeddings during file save to avoid regeneration during search
 */
async function generateAndStoreEmbeddings(pagesContent) {
  const BATCH_SIZE = 10;

  for (const page of pagesContent) {
    try {
      const pageText = page.mapping
        .flatMap((row) => row.map((w) => w.word))
        .join(" ");

      page.embedding = await generateEmbedding(pageText);

      const chunks = createContextualChunks(page.mapping);
      page.chunks = chunks;

      const chunkEmbeddings = [];
      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        const batchEmbeddings = await Promise.all(
          batch.map((chunk) => generateEmbedding(chunk.text))
        );
        chunkEmbeddings.push(...batchEmbeddings);
      }

      page.chunk_embeddings = chunkEmbeddings;
    } catch (error) {
      console.error(`Error generating embeddings for page ${page.id}:`, error);
      page.embedding = null;
      page.chunks = [];
      page.chunk_embeddings = [];
    }
  }

  return pagesContent;
}
