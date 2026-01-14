"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createContextualChunks_v2 = createContextualChunks_v2;
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function createContextualChunks_v2(sitesContent) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$maxWords = options.maxWords,
    maxWords = _options$maxWords === void 0 ? 300 : _options$maxWords,
    _options$overlapSente = options.overlapSentences,
    overlapSentences = _options$overlapSente === void 0 ? 1 : _options$overlapSente;
  var chunks = [];
  var chunkIndex = 0;
  var _iterator = _createForOfIteratorHelper(sitesContent),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var site = _step.value;
      var _iterator2 = _createForOfIteratorHelper(site.pages),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var page = _step2.value;
          var pageRects = extractPageText(page);
          console.log(pageRects);
          var previousSentences = [];
          var currentChunk = "";
          var currentWords = 0;
          var currentTextSpans = [];
          var spanIdCounter = 0;
          var _iterator3 = _createForOfIteratorHelper(pageRects),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var rect = _step3.value;
              var para = rect.block;
              var paraWords = para.trim().split(/\s+/).length;
              if (currentWords + paraWords <= maxWords) {
                var _previousSentences;
                if (currentChunk) currentChunk += "\n\n";
                currentChunk += para.trim();
                currentWords += paraWords;
                var sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
                (_previousSentences = previousSentences).push.apply(_previousSentences, _toConsumableArray(sentences.map(function (s) {
                  return s.trim();
                })));
                previousSentences = previousSentences.slice(-overlapSentences);
                var _iterator4 = _createForOfIteratorHelper(rect.lines),
                  _step4;
                try {
                  for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                    var line = _step4.value;
                    currentTextSpans.push({
                      span_text_id: spanIdCounter++,
                      span: line.text,
                      span_bbox: line.bbox
                    });
                  }
                } catch (err) {
                  _iterator4.e(err);
                } finally {
                  _iterator4.f();
                }
              } else {
                if (currentChunk) {
                  var _chunkSentences = currentChunk.match(/[^.!?]+[.!?]+/g) || [currentChunk];
                  chunks.push({
                    id: chunks.length + 1,
                    text: currentChunk,
                    stats: {
                      word_count: currentWords,
                      sentence_count: _chunkSentences.length,
                      chunk_index: chunkIndex++
                    },
                    source: {
                      file: page.file_name,
                      page_number: page.page_number
                    },
                    structure: {
                      type: detectStructureType(currentChunk),
                      starts_with_header: startsWithHeader(currentChunk),
                      contains_list: containsList(currentChunk)
                    },
                    text_spans: currentTextSpans,
                    staticSignals: computeStaticSignals(currentChunk)
                  });
                }
                currentTextSpans = [];
                spanIdCounter = 0;
                if (paraWords > maxWords) {
                  var paraChunks = splitLargeParagraph(para, maxWords, previousSentences, overlapSentences, page.file_name, page.page_number, chunkIndex, rect.lines);
                  chunks.push.apply(chunks, _toConsumableArray(paraChunks));
                  chunkIndex += paraChunks.length;
                  var paraSentences = para.match(/[^.!?]+[.!?]+/g) || [para];
                  previousSentences = paraSentences.slice(-overlapSentences).map(function (s) {
                    return s.trim();
                  });
                  currentChunk = "";
                  currentWords = 0;
                } else {
                  var overlap = previousSentences.slice(-overlapSentences);
                  currentChunk = overlap.join(" ");
                  if (currentChunk) currentChunk += " ";
                  currentChunk += para.trim();
                  currentWords = currentChunk.split(/\s+/).length;
                  var _paraSentences = para.match(/[^.!?]+[.!?]+/g) || [para];
                  previousSentences = _paraSentences.map(function (s) {
                    return s.trim();
                  });
                }
              }
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
          if (currentChunk) {
            var chunkSentences = currentChunk.match(/[^.!?]+[.!?]+/g) || [currentChunk];
            chunks.push({
              id: chunks.length + 1,
              text: currentChunk,
              stats: {
                word_count: currentWords,
                sentence_count: chunkSentences.length,
                chunk_index: chunkIndex++
              },
              source: {
                file: page.file_name,
                page_number: page.page_number
              },
              structure: {
                type: detectStructureType(currentChunk),
                starts_with_header: startsWithHeader(currentChunk),
                contains_list: containsList(currentChunk)
              },
              text_spans: currentTextSpans,
              staticSignals: computeStaticSignals(currentChunk)
            });
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return chunks;
}
function extractPageText(page) {
  var rects = [];
  var _iterator5 = _createForOfIteratorHelper(page.blocks || []),
    _step5;
  try {
    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
      var block = _step5.value;
      var blockText = "";
      var lines = [];
      var _iterator6 = _createForOfIteratorHelper(block.lines || []),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var line = _step6.value;
          var _line$bbox = _slicedToArray(line.bbox, 4),
            x0 = _line$bbox[0],
            y0 = _line$bbox[1],
            x1 = _line$bbox[2],
            y1 = _line$bbox[3];
          var lineText = "";
          var _iterator7 = _createForOfIteratorHelper(line.spans || []),
            _step7;
          try {
            for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
              var span = _step7.value;
              lineText += span.text;
            }
          } catch (err) {
            _iterator7.e(err);
          } finally {
            _iterator7.f();
          }
          lines.push({
            text: lineText,
            bbox: {
              x: x0,
              y: y0,
              width: x1 - x0,
              height: y1 - y0
            }
          });
          blockText += lineText + "\n";
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
      blockText = blockText.trim();
      if (blockText !== "") {
        rects.push({
          block: blockText,
          lines: lines
        });
      }
    }
  } catch (err) {
    _iterator5.e(err);
  } finally {
    _iterator5.f();
  }
  return rects;
}
function splitLargeParagraph(paragraph, maxWords) {
  var previousSentences = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var overlapSentences = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
  var file_name = arguments.length > 4 ? arguments[4] : undefined;
  var page_number = arguments.length > 5 ? arguments[5] : undefined;
  var startIndex = arguments.length > 6 ? arguments[6] : undefined;
  var lines = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : [];
  var sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
  var chunks = [];
  var chunkIndex = startIndex;
  var overlap = previousSentences.slice(-overlapSentences);
  var chunk = overlap.join(" ");
  var words = chunk ? chunk.split(/\s+/).length : 0;
  var _iterator8 = _createForOfIteratorHelper(sentences),
    _step8;
  try {
    for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
      var sent = _step8.value;
      var sentWords = sent.trim().split(/\s+/).length;
      if (words + sentWords <= maxWords) {
        if (chunk) chunk += " ";
        chunk += sent.trim();
        words += sentWords;
        overlap.push(sent.trim());
        overlap = overlap.slice(-overlapSentences);
      } else {
        if (chunk) {
          var _chunkSentences2 = chunk.match(/[^.!?]+[.!?]+/g) || [chunk];
          chunks.push({
            id: chunks.length + 1,
            text: chunk.trim(),
            stats: {
              word_count: words,
              sentence_count: _chunkSentences2.length,
              chunk_index: chunkIndex++
            },
            source: {
              file: file_name,
              page_number: page_number
            },
            structure: {
              type: detectStructureType(chunk),
              starts_with_header: startsWithHeader(chunk),
              contains_list: containsList(chunk)
            },
            text_spans: [],
            staticSignals: computeStaticSignals(chunk.trim())
          });
        }
        overlap = overlap.slice(-overlapSentences);
        chunk = overlap.join(" ");
        if (chunk) chunk += " ";
        chunk += sent.trim();
        words = chunk.split(/\s+/).length;
        overlap = [sent.trim()];
      }
    }
  } catch (err) {
    _iterator8.e(err);
  } finally {
    _iterator8.f();
  }
  if (chunk) {
    var chunkSentences = chunk.match(/[^.!?]+[.!?]+/g) || [chunk];
    chunks.push({
      id: chunks.length + 1,
      text: chunk.trim(),
      stats: {
        word_count: words,
        sentence_count: chunkSentences.length,
        chunk_index: chunkIndex++
      },
      source: {
        file: file_name,
        page_number: page_number
      },
      structure: {
        type: detectStructureType(chunk),
        starts_with_header: startsWithHeader(chunk),
        contains_list: containsList(chunk)
      },
      text_spans: []
    });
  }
  if (chunks.length > 0 && lines.length > 0) {
    var spanIdCounter = 0;
    var totalTextLength = chunks.reduce(function (sum, c) {
      return sum + c.text.length;
    }, 0);
    var lineStartIdx = 0;
    chunks.forEach(function (chunk, idx) {
      var chunkProportion = chunk.text.length / totalTextLength;
      var numLines = idx === chunks.length - 1 ? lines.length - lineStartIdx : Math.max(1, Math.round(lines.length * chunkProportion));
      var lineEndIdx = Math.min(lineStartIdx + numLines, lines.length);
      chunk.text_spans = lines.slice(lineStartIdx, lineEndIdx).map(function (line) {
        return {
          span_text_id: spanIdCounter++,
          span: line.text,
          span_bbox: line.bbox
        };
      });
      lineStartIdx = lineEndIdx;
    });
  }
  return chunks;
}
function splitSentences(text) {
  return text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+/g) || [];
}
function computeStaticSignals(text) {
  var sentences = splitSentences(text);
  var sentenceCount = sentences.length;
  var avgSentenceLength = computeAvgSentenceWordLength(sentences);
  var definitionScore = detectDefinitionScore(text);
  var causalScore = detectCausalScore(text);
  var proceduralScore = detectProceduralScore(text);
  var comparativeScore = detectComparativeScore(text);
  var citationDensity = computeCitationDensity(text);
  var sectionType = detectSectionType(text);
  return {
    sentenceCount: sentenceCount,
    avgSentenceLength: avgSentenceLength,
    hasDefinitionLanguage: definitionScore >= 2,
    hasCausalLanguage: causalScore >= 2,
    hasProceduralLanguage: proceduralScore >= 2,
    hasComparativeLanguage: comparativeScore >= 2,
    definitionScore: definitionScore,
    causalScore: causalScore,
    proceduralScore: proceduralScore,
    comparativeScore: comparativeScore,
    citationDensity: citationDensity,
    sectionType: sectionType
  };
}
function computeAvgSentenceWordLength(sentences) {
  if (!sentences.length) return 0;
  var totalWords = sentences.reduce(function (sum, s) {
    return sum + s.split(/\s+/).filter(Boolean).length;
  }, 0);
  return Math.round(totalWords / sentences.length);
}
function detectDefinitionScore(text) {
  var score = 0;
  var strongPatterns = [/\b(is defined as|refers to|means that|is the process of|is how)\b/i, /\b(can be defined as|is known as)\b/i];
  var weakPatterns = [/\b(is a|are a)\s+\w+/i];
  strongPatterns.forEach(function (p) {
    return p.test(text) && (score += 2);
  });
  weakPatterns.forEach(function (p) {
    return p.test(text) && (score += 1);
  });
  return score;
}
function detectCausalScore(text) {
  var score = 0;
  var strongPatterns = [/\b(because|therefore|thus|hence|consequently)\b/i, /\b(as a result|leads to|results in|causes)\b/i];
  var weakPatterns = [/\b(due to|since)\b/i];
  strongPatterns.forEach(function (p) {
    return p.test(text) && (score += 2);
  });
  weakPatterns.forEach(function (p) {
    return p.test(text) && (score += 1);
  });
  return score;
}
function detectProceduralScore(text) {
  var score = 0;
  var strongPatterns = [/\b(step\s+\d+|step by step)\b/i, /\b(how to|instructions for|procedure for)\b/i];
  var weakPatterns = [/\b(first|second|third|finally|next|then)\b/i, /\b(begin by|start by|complete the process)\b/i];
  strongPatterns.forEach(function (p) {
    return p.test(text) && (score += 2);
  });
  weakPatterns.forEach(function (p) {
    return p.test(text) && (score += 1);
  });
  return score;
}
function detectComparativeScore(text) {
  var score = 0;
  var strongPatterns = [/\b(compared to|in contrast to|as opposed to)\b/i, /\b(more|less|better|worse)\b.*\bthan\b/i];
  var weakPatterns = [/\b(whereas|however|on the other hand)\b/i];
  strongPatterns.forEach(function (p) {
    return p.test(text) && (score += 2);
  });
  weakPatterns.forEach(function (p) {
    return p.test(text) && (score += 1);
  });
  return score;
}
function computeCitationDensity(text) {
  var citationPatterns = [/\[\d+\]/g, /\(\d{4}\)/g, /\bet al\.\b/gi];
  var citationCount = 0;
  citationPatterns.forEach(function (p) {
    var matches = text.match(p);
    if (matches) citationCount += matches.length;
  });
  var words = text.split(/\s+/).filter(Boolean).length;
  return words > 0 ? citationCount / words : 0;
}
function detectSectionType(text) {
  var _lines$;
  var lines = text.split("\n").map(function (l) {
    return l.trim();
  }).filter(Boolean);
  var firstLine = ((_lines$ = lines[0]) === null || _lines$ === void 0 ? void 0 : _lines$.toLowerCase()) || "";
  var lower = text.toLowerCase();
  if (/\b(introduction|background|overview|abstract)\b/.test(firstLine)) {
    return "intro";
  }
  if (/\b(reference|bibliography|works cited)\b/.test(firstLine) || lines.filter(function (l) {
    return /\[\d+\]/.test(l);
  }).length >= 3) {
    return "reference";
  }
  if (/\b(conclusion|summary|discussion|future work)\b/.test(firstLine) || /\b(in conclusion|to summarize|in summary)\b/.test(lower)) {
    return "conclusion";
  }
  if (lines.some(function (l) {
    return /^[A-Z][A-Za-z\s]{3,}:$/.test(l);
  })) {
    return "mixed";
  }
  return "body";
}
function detectStructureType(text) {
  if (containsList(text)) return "list";
  if (startsWithHeader(text)) return "header";
  return "paragraph";
}
function startsWithHeader(text) {
  var headerPattern = /^(#{1,6}\s|[A-Z][^.!?]{5,50}:|\d+\.\s+[A-Z])/;
  return headerPattern.test(text.trim());
}
function containsList(text) {
  var listPattern = /(^|\n)\s*(?:[-*•●]|\d+\.)\s+/;
  return listPattern.test(text);
}