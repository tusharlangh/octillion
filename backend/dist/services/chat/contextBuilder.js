"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildContext = buildContext;
function buildContext(hybridSearchResults) {
  var context = hybridSearchResults.map(function (result, idx) {
    return "".concat(result.file_name, " (Page ").concat(result.page_number, ")\nRELEVANCE: ").concat((result.rrf_score * 100).toFixed(1), "%\nTEXT: ").concat(result.text);
  }).join("\n\n---\n\n");
  return context;
}