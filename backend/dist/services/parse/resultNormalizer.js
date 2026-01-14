"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeKeywordResults = normalizeKeywordResults;
exports.normalizeSemanticResults = normalizeSemanticResults;
var _chunkPageMapper = require("../../utils/chunkPageMapper.js");
function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function normalizeKeywordResults(_x, _x2) {
  return _normalizeKeywordResults.apply(this, arguments);
}
function _normalizeKeywordResults() {
  _normalizeKeywordResults = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(keywordResults, chunks) {
    var chunkPageMap, chunkMap, _i, _Object$entries, _Object$entries$_i, fileName, fileData, _iterator3, _step3, _loop, _ret, allChunks, _loop2, _i2, _allChunks, pageMap, _i3, _allChunks2, chunk, pageKey, _existing$rects, _existing$text_spans, existing, _iterator6, _step6, _term, _i4, _Object$entries2, _Object$entries2$_i, term, breakdown, _existing$metadata$te, _existing$metadata$te2, pageResults, _i5, _pageResults, page, _term2, _t;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          chunkPageMap = (0, _chunkPageMapper.buildChunkPageMap)(chunks);
          chunkMap = new Map();
          _i = 0, _Object$entries = Object.entries(keywordResults);
        case 1:
          if (!(_i < _Object$entries.length)) {
            _context3.n = 10;
            break;
          }
          _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2), fileName = _Object$entries$_i[0], fileData = _Object$entries$_i[1];
          _iterator3 = _createForOfIteratorHelper(fileData.result);
          _context3.p = 2;
          _loop = /*#__PURE__*/_regenerator().m(function _loop() {
            var pageResult, pageNum, term, chunksOnPage, chunksWithTerm, _iterator4, _step4, chunk, key, entry, _entry$rects, _entry$text_spans;
            return _regenerator().w(function (_context) {
              while (1) switch (_context.n) {
                case 0:
                  pageResult = _step3.value;
                  if (!(!pageResult || !pageResult.page)) {
                    _context.n = 1;
                    break;
                  }
                  console.warn("Invalid pageResult:", pageResult);
                  return _context.a(2, 0);
                case 1:
                  pageNum = typeof pageResult.page === 'string' ? parseInt(pageResult.page.replace("p", "")) : parseInt(pageResult.page);
                  term = pageResult.query;
                  chunksOnPage = (0, _chunkPageMapper.getChunksForPage)(chunkPageMap, fileName, pageNum);
                  if (!(chunksOnPage.length === 0)) {
                    _context.n = 2;
                    break;
                  }
                  console.warn("No chunks found for ".concat(fileName, " page ").concat(pageNum));
                  return _context.a(2, 0);
                case 2:
                  chunksWithTerm = chunksOnPage.filter(function (chunk) {
                    return chunk.text.toLowerCase().includes(term.toLowerCase());
                  });
                  _iterator4 = _createForOfIteratorHelper(chunksWithTerm);
                  try {
                    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                      chunk = _step4.value;
                      key = chunk.chunk_id;
                      if (!chunkMap.has(key)) {
                        chunkMap.set(key, {
                          chunk_id: chunk.chunk_id,
                          chunk_index: chunk.chunk_index,
                          file_name: fileName,
                          page_number: pageNum,
                          score: 0,
                          source: "keyword",
                          text: chunk.text,
                          text_spans: [],
                          rects: [],
                          metadata: {
                            terms: [],
                            match_count: 0,
                            term_breakdown: {}
                          }
                        });
                      }
                      entry = chunkMap.get(key);
                      if (!entry.metadata.terms.includes(term)) {
                        entry.metadata.terms.push(term);
                      }
                      if (pageResult.rects && Array.isArray(pageResult.rects)) {
                        (_entry$rects = entry.rects).push.apply(_entry$rects, _toConsumableArray(pageResult.rects));
                      }
                      if (pageResult.text_spans && Array.isArray(pageResult.text_spans)) {
                        (_entry$text_spans = entry.text_spans).push.apply(_entry$text_spans, _toConsumableArray(pageResult.text_spans));
                      }
                      entry.metadata.term_breakdown[term] = {
                        count: 0,
                        score: 0,
                        rects: pageResult.rects || [],
                        text_spans: pageResult.text_spans || []
                      };
                    }
                  } catch (err) {
                    _iterator4.e(err);
                  } finally {
                    _iterator4.f();
                  }
                case 3:
                  return _context.a(2);
              }
            }, _loop);
          });
          _iterator3.s();
        case 3:
          if ((_step3 = _iterator3.n()).done) {
            _context3.n = 6;
            break;
          }
          return _context3.d(_regeneratorValues(_loop()), 4);
        case 4:
          _ret = _context3.v;
          if (!(_ret === 0)) {
            _context3.n = 5;
            break;
          }
          return _context3.a(3, 5);
        case 5:
          _context3.n = 3;
          break;
        case 6:
          _context3.n = 8;
          break;
        case 7:
          _context3.p = 7;
          _t = _context3.v;
          _iterator3.e(_t);
        case 8:
          _context3.p = 8;
          _iterator3.f();
          return _context3.f(8);
        case 9:
          _i++;
          _context3.n = 1;
          break;
        case 10:
          allChunks = Array.from(chunkMap.values());
          _loop2 = /*#__PURE__*/_regenerator().m(function _loop2() {
            var chunk, queryTerms, totalScore, _iterator5, _step5, term, termScore, termCount;
            return _regenerator().w(function (_context2) {
              while (1) switch (_context2.n) {
                case 0:
                  chunk = _allChunks[_i2];
                  queryTerms = chunk.metadata.terms;
                  totalScore = calculateMultiTermBM25(chunk, queryTerms, allChunks);
                  chunk.score = totalScore;
                  _iterator5 = _createForOfIteratorHelper(queryTerms);
                  try {
                    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                      term = _step5.value;
                      termScore = calculateChunkBM25(chunk, term, allChunks);
                      termCount = countTermInChunk(chunk.text, term);
                      chunk.metadata.term_breakdown[term].score = termScore;
                      chunk.metadata.term_breakdown[term].count = termCount;
                    }
                  } catch (err) {
                    _iterator5.e(err);
                  } finally {
                    _iterator5.f();
                  }
                  chunk.metadata.match_count = queryTerms.reduce(function (sum, term) {
                    return sum + chunk.metadata.term_breakdown[term].count;
                  }, 0);
                case 1:
                  return _context2.a(2);
              }
            }, _loop2);
          });
          _i2 = 0, _allChunks = allChunks;
        case 11:
          if (!(_i2 < _allChunks.length)) {
            _context3.n = 13;
            break;
          }
          return _context3.d(_regeneratorValues(_loop2()), 12);
        case 12:
          _i2++;
          _context3.n = 11;
          break;
        case 13:
          pageMap = new Map();
          for (_i3 = 0, _allChunks2 = allChunks; _i3 < _allChunks2.length; _i3++) {
            chunk = _allChunks2[_i3];
            pageKey = "".concat(chunk.file_name, "_p").concat(chunk.page_number);
            if (!pageMap.has(pageKey)) {
              pageMap.set(pageKey, _objectSpread(_objectSpread({}, chunk), {}, {
                aggregated_chunks: [chunk.chunk_id],
                best_chunk_score: chunk.score
              }));
            } else {
              existing = pageMap.get(pageKey);
              existing.aggregated_chunks.push(chunk.chunk_id);
              if (chunk.score > existing.best_chunk_score) {
                existing.best_chunk_score = chunk.score;
                existing.chunk_id = chunk.chunk_id;
                existing.chunk_index = chunk.chunk_index;
              }
              existing.score += chunk.score;
              (_existing$rects = existing.rects).push.apply(_existing$rects, _toConsumableArray(chunk.rects));
              (_existing$text_spans = existing.text_spans).push.apply(_existing$text_spans, _toConsumableArray(chunk.text_spans));
              _iterator6 = _createForOfIteratorHelper(chunk.metadata.terms);
              try {
                for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                  _term = _step6.value;
                  if (!existing.metadata.terms.includes(_term)) {
                    existing.metadata.terms.push(_term);
                  }
                }
              } catch (err) {
                _iterator6.e(err);
              } finally {
                _iterator6.f();
              }
              existing.metadata.match_count += chunk.metadata.match_count;
              for (_i4 = 0, _Object$entries2 = Object.entries(chunk.metadata.term_breakdown); _i4 < _Object$entries2.length; _i4++) {
                _Object$entries2$_i = _slicedToArray(_Object$entries2[_i4], 2), term = _Object$entries2$_i[0], breakdown = _Object$entries2$_i[1];
                if (existing.metadata.term_breakdown[term]) {
                  existing.metadata.term_breakdown[term].count += breakdown.count;
                  existing.metadata.term_breakdown[term].score += breakdown.score;
                  (_existing$metadata$te = existing.metadata.term_breakdown[term].rects).push.apply(_existing$metadata$te, _toConsumableArray(breakdown.rects));
                  (_existing$metadata$te2 = existing.metadata.term_breakdown[term].text_spans).push.apply(_existing$metadata$te2, _toConsumableArray(breakdown.text_spans));
                } else {
                  existing.metadata.term_breakdown[term] = breakdown;
                }
              }
              if (existing.text.length < 500) {
                existing.text = "".concat(existing.text, "\n\n").concat(chunk.text);
              }
            }
          }
          pageResults = Array.from(pageMap.values());
          for (_i5 = 0, _pageResults = pageResults; _i5 < _pageResults.length; _i5++) {
            page = _pageResults[_i5];
            page.rects = dedupeByCoordinates(page.rects);
            page.text_spans = dedupeByCoordinates(page.text_spans);
            for (_term2 in page.metadata.term_breakdown) {
              page.metadata.term_breakdown[_term2].rects = dedupeByCoordinates(page.metadata.term_breakdown[_term2].rects);
              page.metadata.term_breakdown[_term2].text_spans = dedupeByCoordinates(page.metadata.term_breakdown[_term2].text_spans);
            }
          }
          return _context3.a(2, pageResults);
      }
    }, _callee, null, [[2, 7, 8, 9]]);
  }));
  return _normalizeKeywordResults.apply(this, arguments);
}
function dedupeByCoordinates(items) {
  if (!items || items.length === 0) return items;
  var map = new Map();
  var _iterator = _createForOfIteratorHelper(items),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var item = _step.value;
      if (!item) continue;
      var key = "".concat(item.x, "|").concat(item.y, "|").concat(item.width, "|").concat(item.height);
      if (!map.has(key)) {
        map.set(key, item);
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return Array.from(map.values());
}
function calculateChunkBM25(chunk, term, allChunks) {
  var k1 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1.2;
  var b = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0.75;
  var N = allChunks.length;
  var tf = countTermInChunk(chunk.text, term);
  var chunkLength = chunk.text.trim().split(/\s+/).length;
  var avgChunkLength = allChunks.reduce(function (sum, c) {
    return sum + c.text.trim().split(/\s+/).length;
  }, 0) / N;
  var chunksWithTerm = allChunks.filter(function (c) {
    return c.text.toLowerCase().includes(term.toLowerCase());
  }).length;
  var idf = Math.log(1 + (N - chunksWithTerm + 0.5) / (chunksWithTerm + 0.5));
  var numerator = tf * (k1 + 1);
  var denominator = tf + k1 * (1 - b + b * (chunkLength / avgChunkLength));
  return idf * (numerator / denominator);
}
function calculateMultiTermBM25(chunk, queryTerms, allChunks) {
  return queryTerms.reduce(function (totalScore, term) {
    return totalScore + calculateChunkBM25(chunk, term, allChunks);
  }, 0);
}
function countTermInChunk(text, term) {
  var tokens = text.toLowerCase().split(/\s+/);
  var q = term.toLowerCase();
  var count = 0;
  var _iterator2 = _createForOfIteratorHelper(tokens),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var token = _step2.value;
      if (token.includes(q)) {
        count++;
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
  return count;
}
function normalizeSemanticResults(_x3, _x4) {
  return _normalizeSemanticResults.apply(this, arguments);
}
function _normalizeSemanticResults() {
  _normalizeSemanticResults = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(semanticResults, chunks) {
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          return _context4.a(2, semanticResults.map(function (result) {
            var chunk = chunks.find(function (c) {
              return c.id === result.chunk_id;
            });
            if (!chunk) {
              console.warn("Chunk ".concat(result.chunk_id, " not found"));
              return null;
            }
            return {
              chunk_id: result.chunk_id,
              chunk_index: result.chunk_index,
              file_name: chunk.source.file,
              page_number: chunk.source.page_number,
              score: result.score || 0,
              source: "semantic",
              text: chunk.text,
              text_spans: chunk.text_spans || [],
              rects: [],
              metadata: {}
            };
          }).filter(function (r) {
            return r !== null;
          }));
      }
    }, _callee2);
  }));
  return _normalizeSemanticResults.apply(this, arguments);
}