import supabase from "../utils/supabase/client.js";
import dotenv from "dotenv";

dotenv.config();

export async function parse(id, search, userId) {
  if (!search.trim()) {
    return {
      success: false,
      searchResults: [],
      error: `failed since the search is empty`,
    };
  }

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

  const d = data[0];

  const pagesContent = d.pages_metadata;

  const inverted = d.inverted_index;
  const buildIndex = d.build_index;

  const scores = await searchContent(pagesContent, inverted, search);

  const topPages = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5) // top 10 pages
    .map(([id]) => id);

  if (inverted.size === 0 || Object.keys(scores).length === 0) {
    return {
      success: false,
      searchResults: [],
      error: "word trie or inverted or scores failed.",
    };
  }

  const searchResults = searchBuildIndex(
    buildIndex,
    search,
    pagesContent,
    topPages
  );

  if (searchResults.length === 0) {
    return {
      success: false,
      searchResults: [],
      error: "failed search results",
    };
  }

  //console.log(searchResults);

  return { success: true, searchResults, error: null };
}

function searchBuildIndex(buildIndex, searchTerms, pagesContent, topPageIds) {
  const terms = searchTerms.toLowerCase().split(/\s+/);

  const pageSet = new Set(topPageIds);
  const sentenceMap = new Map();

  const pageMappings = new Map();
  for (let page of pagesContent) {
    if (pageSet.has(page.id)) {
      pageMappings.set(page.id, new Map(page.mapping));
    }
  }

  for (const term of terms) {
    const normalizedTerm = term.replace(/[.,;:!?'"()[\]{}]+/g, "");

    const positions = buildIndex[normalizedTerm[0].toLowerCase()] || [];

    for (const pos of positions) {
      const mapping = pageMappings.get(pos.pageId);
      if (!mapping) continue;

      const row = mapping.get(pos.y);
      if (!row) continue;

      if (
        pos.word === normalizedTerm ||
        pos.word.startsWith(normalizedTerm) ||
        pos.word.endsWith(normalizedTerm) ||
        pos.word.includes(normalizedTerm)
      ) {
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
  }

  return [...sentenceMap.values()];
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
        inverted[term] && inverted[term][id] ? inverted[term][id] : 0;

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

  //console.log("TF–IDF Scores:", scores, "for search: ", search);
  return scores;
}
