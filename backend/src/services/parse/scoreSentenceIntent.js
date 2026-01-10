const INTENT_PATTERNS = {
  definition: {
    patterns: [
      /\b(is|are|refers? to|means?|defined as|known as|called)\b/i,
      /\b(definition|term|concept|notion)\b/i,
      /\b(essentially|basically|simply put)\b/i,
    ],
    weight: 1.3,
  },
  importance: {
    patterns: [
      /\b(important|critical|essential|crucial|vital|significant|key)\b/i,
      /\b(because|since|as|due to|owing to)\b/i,
      /\b(impact|effect|influence|consequence|result)\b/i,
      /\b(benefit|advantage|value|worth|merit)\b/i,
      /\b(without|lacking|absence of)\b/i,
    ],
    weight: 1.4,
  },
  procedural: {
    patterns: [
      /\b(step|first|second|third|next|then|finally|lastly)\b/i,
      /\b(how to|process|procedure|method|approach|technique)\b/i,
      /\b(should|must|need to|have to|required to)\b/i,
      /\b(begin|start|initiate|commence|proceed)\b/i,
    ],
    weight: 1.35,
  },
  comparison: {
    patterns: [
      /\b(versus|vs\.?|compared to|in contrast|unlike|whereas)\b/i,
      /\b(difference|similar|alike|distinct|divergent)\b/i,
      /\b(better|worse|more|less|superior|inferior)\b/i,
      /\b(both|either|neither|while|although)\b/i,
    ],
    weight: 1.3,
  },
  evidence: {
    patterns: [
      /\b(study|research|experiment|investigation|analysis)\b/i,
      /\b(found|discovered|showed|demonstrated|revealed)\b/i,
      /\b(data|evidence|findings|results|statistics)\b/i,
      /\b(according to|based on|suggests|indicates)\b/i,
      /\b(significant|correlation|relationship|association)\b/i,
    ],
    weight: 1.35,
  },
  factual: {
    patterns: [
      /\b(when|where|who|what|which)\b/i,
      /\b(date|year|time|period|era)\b/i,
      /\b(location|place|region|area)\b/i,
      /\b(person|people|individual|group)\b/i,
    ],
    weight: 1.2,
  },
  example: {
    patterns: [
      /\b(example|instance|case|illustration|demonstration)\b/i,
      /\b(such as|like|including|for instance|e\.?g\.?)\b/i,
      /\b(specifically|particularly|notably)\b/i,
    ],
    weight: 1.25,
  },
};

function detectQueryIntent(query) {
  const q = query.toLowerCase().trim();

  if (q.startsWith("what is") || q.startsWith("define")) {
    if (q.includes("importance") || q.includes("why")) {
      return "importance";
    }
    return "definition";
  }

  if (
    q.includes("why") ||
    q.includes("importance") ||
    q.includes("benefits") ||
    q.includes("significance")
  ) {
    return "importance";
  }

  if (
    q.startsWith("how to") ||
    q.startsWith("how do") ||
    q.includes("steps") ||
    q.includes("process") ||
    q.includes("procedure")
  ) {
    return "procedural";
  }

  if (
    q.includes(" vs ") ||
    q.includes(" vs. ") ||
    q.includes("difference between") ||
    q.includes("compare") ||
    q.includes("versus")
  ) {
    return "comparison";
  }

  if (
    q.includes("study") ||
    q.includes("research") ||
    q.includes("evidence") ||
    q.includes("findings") ||
    q.includes("results")
  ) {
    return "evidence";
  }

  if (q.startsWith("when") || q.startsWith("where") || q.startsWith("who")) {
    return "factual";
  }

  if (
    q.includes("example") ||
    q.includes("instance") ||
    q.includes("demonstrate")
  ) {
    return "example";
  }

  return "definition";
}

function splitIntoSentences(text) {
  if (!text || typeof text !== "string") return [];

  const cleaned = text.replace(/\s+/g, " ").trim();
  const sentences = cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z])/g)
    .filter((s) => s.trim().length > 15);

  return sentences;
}

function scoreSentenceForIntent(sentence, intent) {
  if (!sentence || !intent || !INTENT_PATTERNS[intent]) {
    return 0;
  }

  const intentConfig = INTENT_PATTERNS[intent];
  let matchCount = 0;

  for (const pattern of intentConfig.patterns) {
    if (pattern.test(sentence)) {
      matchCount++;
    }
  }

  return matchCount;
}

function calculateIntentAlignment(chunkText, queryIntent) {
  const sentences = splitIntoSentences(chunkText);

  if (sentences.length === 0) {
    return {
      alignment: 0,
      matchingSentences: 0,
      totalSentences: 0,
      avgMatchScore: 0,
    };
  }

  let totalMatches = 0;
  let matchingSentences = 0;

  for (const sentence of sentences) {
    const score = scoreSentenceForIntent(sentence, queryIntent);
    if (score > 0) {
      totalMatches += score;
      matchingSentences++;
    }
  }

  const alignment = matchingSentences / sentences.length;
  const avgMatchScore =
    matchingSentences > 0 ? totalMatches / matchingSentences : 0;

  return {
    alignment,
    matchingSentences,
    totalSentences: sentences.length,
    avgMatchScore,
  };
}

function computeBoostWeight(alignment, avgMatchScore, queryIntent) {
  if (alignment === 0) {
    return 0.9;
  }

  const intentConfig = INTENT_PATTERNS[queryIntent];
  const baseWeight = intentConfig?.weight || 1.0;

  let boost = 1.0;

  if (alignment < 0.2) {
    boost = 0.95;
  } else if (alignment < 0.4) {
    boost = 1.0 + (alignment - 0.2) * 0.5;
  } else if (alignment < 0.6) {
    boost = 1.1 + (alignment - 0.4) * 0.75;
  } else if (alignment < 0.8) {
    boost = 1.25 + (alignment - 0.6) * 1.0;
  } else {
    boost = 1.45 + (alignment - 0.8) * 0.75;
  }

  if (avgMatchScore >= 3) {
    boost *= 1.15;
  } else if (avgMatchScore >= 2) {
    boost *= 1.1;
  } else if (avgMatchScore >= 1.5) {
    boost *= 1.05;
  }

  const finalBoost = Math.min(boost * baseWeight, 2.0);

  return finalBoost;
}

export function analyzeAndBoost(chunkId, query, chunkText, originalScore) {
  if (
    !chunkText ||
    typeof chunkText !== "string" ||
    chunkText.trim().length === 0
  ) {
    return {
      chunkId,
      new_score: originalScore,
      boostWeight: 1.0,
      intent: null,
      alignment: 0,
      reason: "Empty or invalid chunk text",
    };
  }

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return {
      chunkId,
      new_score: originalScore,
      boostWeight: 1.0,
      intent: null,
      alignment: 0,
      reason: "Empty or invalid query",
    };
  }

  const queryIntent = detectQueryIntent(query);
  const analysis = calculateIntentAlignment(chunkText, queryIntent);
  const boostWeight = computeBoostWeight(
    analysis.alignment,
    analysis.avgMatchScore,
    queryIntent
  );

  const newScore = originalScore * boostWeight;

  return {
    chunkId,
    new_score: newScore,
    boostWeight,
    intent: queryIntent,
    alignment: analysis.alignment,
    matchingSentences: analysis.matchingSentences,
    totalSentences: analysis.totalSentences,
    avgMatchScore: analysis.avgMatchScore,
  };
}
