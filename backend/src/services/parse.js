import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import supabase from "../utils/supabase/client.js";
import dotenv from "dotenv";

dotenv.config();

export async function parse(id, search) {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("parse_id", id);

  if (error) {
    console.error(error);
    return { message: "error" };
  }

  const links = data.map((row) => row.files);

  let pagesContent = [];

  for (let i = 0; i < links[0].length; i++) {
    const link = links[0][i].presignedUrl;

    const loadingTask = pdfjs.getDocument(link);
    const pdf = await loadingTask.promise;

    let site_content = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      let pageText = content.items.map((item) => item.str).join(" ");
      pageText = formatResponse(pageText);
      site_content += " " + pageText;
    }

    pagesContent.push({
      id: i + 1,
      name: link,
      site_content,
      total_words: site_content.split(" ").length,
    });
  }

  const inverted = await createInvertedSearch(pagesContent);

  await searchContent(pagesContent, inverted, search);

  return pagesContent;
}

function formatResponse(res) {
  return res
    .toLowerCase()
    .replace(/[^a-z0-9 ]/gi, "")
    .trim()
    .replace(/\s+/g, " ");
}

async function createInvertedSearch(sitesContent) {
  const inverted = new Map();

  for (const { id, site_content } of sitesContent) {
    for (const word of site_content.split(" ")) {
      if (!inverted.has(word)) inverted.set(word, new Map());
      const termMap = inverted.get(word);
      termMap.set(id, (termMap.get(id) || 0) + 1);
    }
  }

  return inverted;
}

async function searchContent(sitesContent, inverted, search) {
  const terms = search.toLowerCase().replace(/[.,]/g, "").split(/\s+/);
  const N = sitesContent.length;

  const appearance = {}; //space = search length
  const TF = []; //space = search length

  for (const { id, total_words } of sitesContent) {
    //n * t
    for (const term of terms) {
      const counts =
        inverted.has(term) && inverted.get(term).has(id)
          ? inverted.get(term).get(id)
          : 0;

      if (counts > 0) {
        if (!appearance[term]) appearance[term] = new Set();
        appearance[term].add(id);
      }

      TF.push({ id, term, tf: counts / total_words });
    }
  }

  const IDF = {};
  for (const term of terms) {
    //t
    const df = appearance[term] ? appearance[term].size : 0;

    IDF[term] = df === 0 ? 0 : Math.log((N + 1) / (df + 1)) + 1;
  }

  const scores = {};
  for (const { id, term, tf } of TF) {
    //t
    if (!scores[id]) scores[id] = 0;
    scores[id] += tf * IDF[term];
  }

  console.log("TF–IDF Scores:", scores);
  return scores;
}
