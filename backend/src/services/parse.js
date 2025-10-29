import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import supabase from "../utils/supabase/client.js";
import dotenv from "dotenv";
import { getFiles } from "./getFiles.js";

dotenv.config();

class TrieNode {
  constructor() {
    this.children = new Map();
    this.positions = [];
  }
}

class Trie {
  constructor() {
    this.trie = new TrieNode();
  }

  insert(word, position) {
    let node = this.trie;

    for (let char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }

    node.positions.push(position);
  }

  searchPrefix(prefix) {
    let node = this.trie;

    for (let char of prefix) {
      if (!node.children.has(char)) {
        return [];
      }
      node = node.children.get(char);
    }

    return this.collectAllPositions(node);
  }

  collectAllPositions(node) {
    const results = [...node.positions];
    for (let child of node.children.values()) {
      results.push(...this.collectAllPositions(child));
    }

    return results;
  }
}

const wordTrie = new Trie();

export async function parse(id, search, userId) {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", userId)
    .eq("parse_id", id);

  if (error) {
    console.error(error);
    return {
      success: false,
      searchResults: [],
      error: `failed extracting files`,
    };
  }

  const urls = await getFiles(id, userId);
  const links = urls.map((url, i) => url.presignedUrl);

  let pagesContent = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    const loadingTask = pdfjs.getDocument(link);
    const pdf = await loadingTask.promise;

    let site_content = "";
    let new_map = new Map();

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      content.items.forEach((item) => {
        const words = item.str.split(/\s+/);
        const [a, b, c, d, x, y] = item.transform;
        const widthPerWord = item.width / words.length;
        const height = item.height;

        words.forEach((word, index) => {
          const wordX = x + index * widthPerWord;

          if (word !== "" || word.length !== 0) {
            if (!new_map.has(y)) {
              new_map.set(y, []);
            }

            new_map.get(y).push({
              word: word.toLowerCase(),
              x: wordX,
              y: y,
              width: widthPerWord,
              height: height,
            });
          }
        });
      });

      let pageText = content.items.map((item) => item.str).join(" ");
      pageText = formatResponse(pageText);
      site_content += " " + pageText;
    }

    pagesContent.push({
      id: i + 1,
      name: link,
      site_content,
      total_words: site_content.split(" ").length,
      mapping: new_map,
    });
  }

  buildWordIndex(pagesContent);
  const inverted = await createInvertedSearch(pagesContent);
  const scores = await searchContent(pagesContent, inverted, search);

  const topPages = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5) // top 10 pages
    .map(([id]) => parseInt(id));

  if (inverted.size === 0 || Object.keys(scores).length === 0) {
    return {
      success: false,
      searchResults: [],
      error: "word trie or inverted or scores failed.",
    };
  }

  const searchResults = searchWordFast(pagesContent, search, topPages);

  if (searchResults.length === 0) {
    return {
      success: false,
      searchResults: [],
      error: "failed search results",
    };
  }

  console.log(searchResults);

  return { success: true, searchResults, error: null };
}

function buildWordIndex(pagesContent) {
  for (const page of pagesContent) {
    for (const [y, row] of page.mapping) {
      for (const wordObj of row) {
        const word = wordObj.word.toLowerCase();
        const normalizedWord = word
          .toLowerCase()
          .replace(/[.,;:!?'"()[\]{}]+/g, "");

        if (!normalizedWord) continue;

        const position = {
          pageId: page.id,
          x: wordObj.x,
          y: wordObj.y,
          width: wordObj.width,
          height: wordObj.height,
          hasPunctuation: word !== normalizedWord,
        };

        wordTrie.insert(normalizedWord, position);
      }
    }
  }
}

function searchWordFast(pagesContent, searchTerms, topPageIds) {
  const results = [];
  const terms = searchTerms.toLowerCase().split(/\s+/);

  const pageSet = new Set(topPageIds);
  const sentenceMap = new Map();

  for (const term of terms) {
    const normalizedTerm = term.replace(/[.,;:!?'"()[\]{}]+/g, "");
    const searchHasPunctuation = term !== normalizedTerm;

    const positions = wordTrie.searchPrefix(normalizedTerm);

    const matchingPositions = searchHasPunctuation
      ? positions.filter((p) => p.hasPunctuation)
      : positions.filter((p) => !p.hasPunctuation);

    const relevantPositions = matchingPositions.filter((p) =>
      pageSet.has(p.pageId)
    );

    for (const pos of relevantPositions) {
      const page = pagesContent.find((p) => p.id === pos.pageId);
      if (!page) continue;

      const row = page.mapping.get(pos.y);
      if (!row) continue;

      const key = `${pos.pageId}-${pos.y}`;
      if (!sentenceMap.has(key)) {
        sentenceMap.set(key, {
          pageId: pos.pageId,
          y: pos.y,
          sentence: row.map((w) => w.word).join(" "),
        });
      }
    }
  }

  results.push(...sentenceMap.values());

  return results;
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

  console.log("TF–IDF Scores:", scores, "for search: ", search);
  return scores;
}
