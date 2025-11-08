import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../utils/aws/s3Client.js";
import dotenv from "dotenv";
import supabase from "../utils/supabase/client.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

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

        words.forEach((word, index) => {
          if (word !== "" || word.length !== 0) {
            if (!new_map.has(y)) {
              new_map.set(y, []);
            }

            new_map.get(y).push({
              word: word.toLowerCase(),
              y: y,
            });
          }
        });
      });

      let pageText = content.items.map((item) => item.str).join(" ");
      pageText = formatResponse(pageText);
      site_content = pageText;

      pagesContent.push({
        id: `${i + 1}.${pageNum}`,
        name: files[i].originalname,
        site_content,
        total_words: site_content.split(" ").length,
        mapping: Array.from(new_map.entries()),
      });
    }
  }

  const invertedIndex = createInvertedSearch(pagesContent);
  const build_index = buildIndex(pagesContent);

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

function buildIndex(pagesContent) {
  let buildIndex = {
    a: [],
    b: [],
    c: [],
    d: [],
    e: [],
    f: [],
    g: [],
    h: [],
    i: [],
    j: [],
    k: [],
    l: [],
    m: [],
    n: [],
    o: [],
    p: [],
    q: [],
    r: [],
    s: [],
    t: [],
    u: [],
    v: [],
    w: [],
    x: [],
    y: [],
    z: [],
  };

  for (let page of pagesContent) {
    const pageId = page.id;
    const mapping = new Map(page.mapping);

    for (let [y, row] of mapping) {
      for (let wordObj of row) {
        const word = wordObj.word.toLowerCase().replace(/[^a-z]/g, "");

        if (!word) continue;

        let seen = new Set();

        for (let char of word) {
          if (buildIndex[char] && !seen.has(char)) {
            seen.add(char);
            buildIndex[char].push({
              word: word,
              pageId: pageId,
              y: y,
            });
          }
        }
      }
    }
  }

  return buildIndex;
}
