import dotenv from "dotenv";
dotenv.config();

export async function sentenceLevelReRanking(items, query) {
  try {
    if (!items || items.length === 0 || !query) {
      return items;
    }

    const allSentences = [];
    const sentenceMap = [];

    items.forEach((item, itemIndex) => {
      const text = item.text || "";
      const sentences = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [text];

      sentences.forEach((sentence) => {
        const cleaned = sentence.trim();
        if (cleaned) {
          allSentences.push(cleaned);
          sentenceMap.push(itemIndex);
        }
      });
    });

    if (allSentences.length === 0) {
      return items;
    }

    const scores = await callMain(query, allSentences);

    if (!Array.isArray(scores) || scores.length !== allSentences.length) {
      return items;
    }

    const itemBestScores = new Map();

    scores.forEach((score, index) => {
      const itemIndex = sentenceMap[index];
      const sentence = allSentences[index];

      if (!itemBestScores.has(itemIndex)) {
        itemBestScores.set(itemIndex, { score: -Infinity, sentence: "" });
      }

      const current = itemBestScores.get(itemIndex);
      if (score > current.score) {
        current.score = score;
        current.sentence = sentence;
      }
    });

    items.forEach((item, index) => {
      if (itemBestScores.has(index)) {
        const best = itemBestScores.get(index);
        item.rrf_score = best.score;
        item.best_sentence = best.sentence;
      }
    });

    return items;
  } catch (error) {
    return items;
  }
}

async function callMain(query, passages) {
  /*
  const cached = await getCachedReranker(query, passages);
  if (cached) {
    return cached;
  }
  */

  const response = await fetch("http://127.0.0.1:8000/sentence_level_ranking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      passages,
    }),
  });

  const scores = await response.json();

  /*
  setCacheReranker(query, passages, scores).catch((err) =>
    console.error("Failed to cache reranker scores:", err)
  );
  */

  return scores;
}
