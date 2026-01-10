const EXPLANATION_MARKERS = [
  { phrase: "because", weight: 2.0 },
  { phrase: "without", weight: 1.8 },
  { phrase: "therefore", weight: 1.8 },
  { phrase: "thus", weight: 1.5 },
  { phrase: "as a result", weight: 2.0 },
  { phrase: "consequently", weight: 1.8 },
  { phrase: "leads to", weight: 1.5 },
  { phrase: "results in", weight: 1.5 },
  { phrase: "causes", weight: 2.0 },
  { phrase: "due to", weight: 1.8 },
  { phrase: "necessary", weight: 1.6 },
  { phrase: "essential", weight: 1.6 },
  { phrase: "important", weight: 1.4 },
  { phrase: "critical", weight: 1.6 },
  { phrase: "depends on", weight: 1.7 },
  { phrase: "allows", weight: 1.3 },
  { phrase: "enables", weight: 1.3 },
  { phrase: "ensures", weight: 1.4 },
  { phrase: "since", weight: 1.8 },
  { phrase: "so that", weight: 1.6 },
  { phrase: "in order to", weight: 1.5 },
  { phrase: "this means", weight: 1.4 },
  { phrase: "which means", weight: 1.4 },
];

function splitIntoSentences(text) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const sentences = cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .filter((s) => s.trim().length > 0);
  return sentences;
}

function detectExplanationDensity(sentence) {
  if (sentence.length < 20) return 0;

  const s = sentence.toLowerCase();
  let score = 0;

  for (let marker of EXPLANATION_MARKERS) {
    const re = new RegExp(`\\b${marker.phrase}\\b`, "i");
    if (re.test(s)) {
      score += marker.weight;
    }
  }

  return score;
}

function classifyDensity(chunkText) {
  const sentences = splitIntoSentences(chunkText);
  if (sentences.length === 0) {
    return { density: 0, raw_score: 0, contributing: 0, total: 0 };
  }

  let totalScore = 0;
  let contributingSentences = 0;

  for (let sentence of sentences) {
    const score = detectExplanationDensity(sentence);
    if (score > 0) {
      totalScore += score;
      contributingSentences++;
    }
  }

  return {
    density: contributingSentences / sentences.length,
    raw_score: totalScore,
    contributing: contributingSentences,
    total: sentences.length,
  };
}

function explanationMultiplier(density, rawScore) {
  if (density === 0) return 0.85;

  if (density < 0.25) return 0.95;
  if (density < 0.4) return 1.05;
  if (density < 0.6) return 1.15;
  if (density < 0.75) return 1.25;

  if (rawScore > 8) return 1.4;
  return 1.3;
}

function shouldApplyExplanationBoost(queryIntent) {
  const explanatoryIntents = ["IMPORTANCE", "PROCEDURAL", "EVIDENCE"];
  return explanatoryIntents.includes(queryIntent);
}

export function explanationDensityBoost(
  chunkId,
  chunkText,
  originalScore,
  queryIntent = null
) {
  if (queryIntent && !shouldApplyExplanationBoost(queryIntent)) {
    return {
      chunkId: chunkId,
      new_score: originalScore,
      explanation: {
        density: 0,
        raw_score: 0,
        boost: 1.0,
        applied: false,
        reason: `Not applicable for ${queryIntent} queries`,
      },
    };
  }

  const explanation = classifyDensity(chunkText);
  const boost = explanationMultiplier(
    explanation.density,
    explanation.raw_score
  );

  return {
    chunkId: chunkId,
    new_score: originalScore * boost,
    explanation: {
      density: explanation.density,
      raw_score: explanation.raw_score,
      contributing_sentences: explanation.contributing,
      total_sentences: explanation.total,
      boost,
      applied: true,
    },
  };
}
