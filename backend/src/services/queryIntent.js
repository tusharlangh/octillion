export function detectIntent(query) {
  const q = query.toLowerCase().trim();

  if (q.startsWith("what is") || q.startsWith("define")) {
    if (q.includes("importance") || q.includes("why")) {
      return "importance";
    }
    return "definition";
  }

  if (q.includes("why") || q.includes("importance") || q.includes("benefits") || q.includes("significance")) {
    return "importance";
  }

  if (q.startsWith("how to") || q.startsWith("how do") || q.includes("steps") || q.includes("process") || q.includes("procedure")) {
    return "procedural";
  }

  if (q.includes(" vs ") || q.includes(" vs. ") || q.includes("difference between") || q.includes("compare") || q.includes("versus")) {
    return "comparison";
  }

  if (q.includes("study") || q.includes("research") || q.includes("evidence") || q.includes("findings") || q.includes("results")) {
    return "evidence";
  }

  if (q.startsWith("when") || q.startsWith("where") || q.startsWith("who")) {
    return "factual";
  }

  if (q.includes("example") || q.includes("instance") || q.includes("demonstrate")) {
    return "example";
  }

  return "definition";
}

export function getIntentWeights(intent) {
  const weights = {
    importance: { semantic: 0.7, keyword: 0.3 },
    definition: { semantic: 0.6, keyword: 0.4 },
    procedural: { semantic: 0.7, keyword: 0.3 },
    comparison: { semantic: 0.65, keyword: 0.35 },
    evidence: { semantic: 0.5, keyword: 0.5 },
    factual: { semantic: 0.4, keyword: 0.6 },
    example: { semantic: 0.6, keyword: 0.4 },
  };

  return weights[intent] || { semantic: 0.5, keyword: 0.5 };
}

export function expandQuery(query, intent) {
  const q = query.toLowerCase();
  const expansions = [query];

  const acronyms = {
    'api': 'application programming interface',
    'ml': 'machine learning',
    'ai': 'artificial intelligence',
    'nlp': 'natural language processing',
    'sql': 'structured query language',
    'rest': 'representational state transfer',
    'http': 'hypertext transfer protocol',
    'json': 'javascript object notation',
  };

  for (const [acronym, expansion] of Object.entries(acronyms)) {
    if (q.includes(acronym)) {
      expansions.push(query.replace(new RegExp(`\\b${acronym}\\b`, 'gi'), expansion));
    }
  }

  if (intent === 'importance') {
    if (!q.includes('why')) expansions.push(`why ${query}`);
    if (!q.includes('importance')) expansions.push(`importance of ${query}`);
  }

  if (intent === 'procedural') {
    if (!q.startsWith('how')) expansions.push(`how to ${query}`);
  }

  return expansions;
}

export function analyzeQuery(query) {
  const intent = detectIntent(query);
  const weights = getIntentWeights(intent);
  const expansions = expandQuery(query, intent);

  return {
    intent,
    semanticWeight: weights.semantic,
    keywordWeight: weights.keyword,
    expansions,
  };
}
