export function buildContext(hybridSearchResults) {
  const context = hybridSearchResults
    .map((result, idx) => {
      return `${result.file_name} (Page ${result.page_number})
RELEVANCE: ${(result.rrf_score * 100).toFixed(1)}%
TEXT: ${result.text}`;
    })
    .join("\n\n---\n\n");

  return context;
}
