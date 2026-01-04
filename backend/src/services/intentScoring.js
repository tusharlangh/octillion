import { detectIntent } from "./queryIntent.js";

export function scoreChunkByIntent(chunk, query, baseScore) {
  const intent = detectIntent(query);
  const signals = chunk.staticSignals;

  if (!signals) return baseScore;

  let boost = 1.0;

  switch (intent) {
    case "definition":
      if (signals.hasDefinitionLanguage) boost += 0.3;
      if (signals.sectionType === "intro") boost += 0.15;
      if (signals.avgSentenceLength < 100) boost += 0.1;
      break;

    case "importance":
      if (signals.hasCausalLanguage) boost += 0.35;
      if (signals.hasDefinitionLanguage) boost += 0.2;
      if (
        signals.sectionType === "intro" ||
        signals.sectionType === "conclusion"
      )
        boost += 0.15;
      break;

    case "procedural":
      if (signals.hasProceduralLanguage) boost += 0.4;
      if (chunk.structure?.contains_list) boost += 0.2;
      if (signals.sectionType === "body") boost += 0.1;
      break;

    case "comparison":
      if (signals.hasComparativeLanguage) boost += 0.4;
      if (signals.sectionType === "body") boost += 0.15;
      if (signals.sentenceCount > 3) boost += 0.1;
      break;

    case "evidence":
      if (signals.citationDensity > 0.05) boost += 0.4;
      if (signals.sectionType === "body") boost += 0.2;
      if (signals.citationDensity > 0.1) boost += 0.15;
      break;

    case "factual":
      if (signals.avgSentenceLength < 80) boost += 0.2;
      if (signals.hasDefinitionLanguage) boost += 0.15;
      if (signals.sectionType === "intro") boost += 0.1;
      break;

    case "example":
      if (chunk.structure?.contains_list) boost += 0.25;
      if (signals.sectionType === "body") boost += 0.15;
      if (signals.hasProceduralLanguage) boost += 0.1;
      break;
  }

  if (signals.sectionType === "reference") boost *= 0.3;

  return baseScore * boost;
}
