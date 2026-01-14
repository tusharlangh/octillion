"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse_v2 = parse_v2;
var _client = _interopRequireDefault(require("../utils/supabase/client.js"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _qdrantService = require("./qdrantService.js");
var _upload = require("./saveFiles/upload.js");
var _errorHandler = require("../middleware/errorHandler.js");
var _searchIndex = require("./parse/searchIndex.js");
var _callToEmbed = require("../utils/callsAi/callToEmbed.js");
var _resultNormalizer = require("./parse/resultNormalizer.js");
var _stopwords = require("../utils/stopwords.js");
var _searchMetrics = require("../utils/searchMetrics.js");
var queryIntent = _interopRequireWildcard(require("./queryIntent.js"));
var _scoreSentenceIntent = require("./parse/scoreSentenceIntent.js");
var _sentenceReRanker = require("./parse/sentenceReRanker.js");
var _queryAnalysisCache = require("../utils/callsCache/queryAnalysisCache.js");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t4 in e) "default" !== _t4 && {}.hasOwnProperty.call(e, _t4) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t4)) && (i.get || i.set) ? o(f, _t4, i) : f[_t4] = e[_t4]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
_dotenv["default"].config();
function getFileMapping(_x) {
  return _getFileMapping.apply(this, arguments);
}
function _getFileMapping() {
  _getFileMapping = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(files) {
    var mapping, results;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          mapping = {};
          if (!(!files || !Array.isArray(files))) {
            _context2.n = 1;
            break;
          }
          return _context2.a(2, mapping);
        case 1:
          _context2.n = 2;
          return Promise.all(files.map(/*#__PURE__*/function () {
            var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(file) {
              var res, _t;
              return _regenerator().w(function (_context) {
                while (1) switch (_context.p = _context.n) {
                  case 0:
                    _context.p = 0;
                    _context.n = 1;
                    return (0, _upload.createPresignedUrl)(file);
                  case 1:
                    res = _context.v;
                    return _context.a(2, res);
                  case 2:
                    _context.p = 2;
                    _t = _context.v;
                    console.error("Failed to create presigned URL for ".concat(file.file_name, ":"), _t);
                    return _context.a(2, null);
                }
              }, _callee, null, [[0, 2]]);
            }));
            return function (_x32) {
              return _ref.apply(this, arguments);
            };
          }()));
        case 2:
          results = _context2.v;
          results.filter(Boolean).forEach(function (res, index) {
            mapping[res.file_name] = res.presignedUrl;
            mapping["Document ".concat(index + 1)] = res.presignedUrl;
          });
          return _context2.a(2, mapping);
      }
    }, _callee2);
  }));
  return _getFileMapping.apply(this, arguments);
}
function parse_v2(_x2, _x3, _x4) {
  return _parse_v.apply(this, arguments);
}
function _parse_v() {
  _parse_v = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(id, search, userId) {
    var options,
      _yield$supabase$from$,
      data,
      error,
      d,
      fileMapping,
      pagesContent,
      inverted,
      chunks,
      _yield$hybridSearch,
      _yield$hybridSearch2,
      hybridSearchResults,
      type,
      _args3 = arguments,
      _t2;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          options = _args3.length > 3 && _args3[3] !== undefined ? _args3[3] : {};
          _context3.p = 1;
          if (!(!search || search.length === 0)) {
            _context3.n = 2;
            break;
          }
          throw new _errorHandler.AppError("Rewriting search came out empty", 500, "REWRITE_SEARCH_ERROR");
        case 2:
          _context3.n = 3;
          return _client["default"].from("files").select("*").eq("user_id", userId).eq("parse_id", id);
        case 3:
          _yield$supabase$from$ = _context3.v;
          data = _yield$supabase$from$.data;
          error = _yield$supabase$from$.error;
          if (!error) {
            _context3.n = 4;
            break;
          }
          throw new _errorHandler.AppError("Failed to fetch files: ".concat(error.message), 500, "SUPABASE_ERROR");
        case 4:
          if (!(!data || data.length === 0)) {
            _context3.n = 5;
            break;
          }
          return _context3.a(2, {
            success: true,
            result: [],
            fileMapping: {}
          });
        case 5:
          d = data[0];
          if (!(!d || !d.pages_metadata || !d.inverted_index)) {
            _context3.n = 6;
            break;
          }
          throw new _errorHandler.AppError("Invalid or incomplete data row", 500, "INVALID_DATA_ROW");
        case 6:
          _context3.n = 7;
          return getFileMapping(d.files);
        case 7:
          fileMapping = _context3.v;
          pagesContent = d.pages_metadata;
          inverted = d.inverted_index;
          chunks = d.chunks_metadata;
          if (!(pagesContent && pagesContent.s3Key)) {
            _context3.n = 9;
            break;
          }
          _context3.n = 8;
          return (0, _upload.getJsonFromS3)(pagesContent.s3Key);
        case 8:
          pagesContent = _context3.v;
        case 9:
          if (!(inverted && inverted.s3Key)) {
            _context3.n = 11;
            break;
          }
          _context3.n = 10;
          return (0, _upload.getJsonFromS3)(inverted.s3Key);
        case 10:
          inverted = _context3.v;
        case 11:
          if (!(chunks && chunks.s3Key)) {
            _context3.n = 13;
            break;
          }
          _context3.n = 12;
          return (0, _upload.getJsonFromS3)(chunks.s3Key);
        case 12:
          chunks = _context3.v;
        case 13:
          if (!(!pagesContent || pagesContent.length === 0)) {
            _context3.n = 14;
            break;
          }
          throw new _errorHandler.AppError("Pages content is empty", 500, "EMPTY_PAGES_CONTENT");
        case 14:
          if (!(!inverted || _typeof(inverted) !== "object" || Object.keys(inverted).length === 0)) {
            _context3.n = 15;
            break;
          }
          throw new _errorHandler.AppError("Inverted index is empty or invalid", 500, "EMPTY_INVERTED_INDEX");
        case 15:
          _context3.n = 16;
          return hybridSearch(id, userId, search, pagesContent, inverted, fileMapping, chunks);
        case 16:
          _yield$hybridSearch = _context3.v;
          _yield$hybridSearch2 = _slicedToArray(_yield$hybridSearch, 2);
          hybridSearchResults = _yield$hybridSearch2[0];
          type = _yield$hybridSearch2[1];
          return _context3.a(2, {
            success: true,
            result: hybridSearchResults,
            fileMapping: fileMapping
          });
        case 17:
          _context3.p = 17;
          _t2 = _context3.v;
          if (!_t2.isOperational) {
            _context3.n = 18;
            break;
          }
          throw _t2;
        case 18:
          throw new _errorHandler.AppError("System error: ".concat(_t2.message), 500, "SYSTEM_ERROR");
        case 19:
          return _context3.a(2);
      }
    }, _callee3, null, [[1, 17]]);
  }));
  return _parse_v.apply(this, arguments);
}
function rawSemanticSearch(_x5, _x6, _x7) {
  return _rawSemanticSearch.apply(this, arguments);
}
function _rawSemanticSearch() {
  _rawSemanticSearch = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(search, id, userId) {
    var options,
      topK,
      cachedEmbedding,
      embeddingsTimer,
      embeddings,
      embeddingsTimerLatency,
      searchQdrantTimer,
      result,
      searchQdrantLatency,
      _args4 = arguments,
      _t3;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          options = _args4.length > 3 && _args4[3] !== undefined ? _args4[3] : {};
          topK = options.topK, cachedEmbedding = options.cachedEmbedding;
          embeddingsTimer = new _searchMetrics.SearchTimer("Embeddings");
          _t3 = cachedEmbedding;
          if (_t3) {
            _context4.n = 2;
            break;
          }
          _context4.n = 1;
          return (0, _callToEmbed.callToEmbed)(search);
        case 1:
          _t3 = _context4.v;
        case 2:
          embeddings = _t3;
          embeddingsTimerLatency = embeddingsTimer.stop();
          searchQdrantTimer = new _searchMetrics.SearchTimer("Search Qdrant");
          _context4.n = 3;
          return (0, _qdrantService.searchQdrant)(id, userId, embeddings, {
            topK: topK
          });
        case 3:
          result = _context4.v;
          searchQdrantLatency = searchQdrantTimer.stop();
          console.log("\n    searchQdrantLatency: ".concat(searchQdrantLatency, "\n    embeddingsTimerLatency: ").concat(embeddingsTimerLatency, "\n  "));
          return _context4.a(2, {
            result: result,
            embedding: embeddings
          });
      }
    }, _callee4);
  }));
  return _rawSemanticSearch.apply(this, arguments);
}
function rawKeywordSearch(_x8, _x9, _x0, _x1, _x10, _x11) {
  return _rawKeywordSearch.apply(this, arguments);
}
function _rawKeywordSearch() {
  _rawKeywordSearch = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(search, pagesContent, inverted, fileMapping, parseId, userId) {
    var options,
      _options$topK,
      topK,
      searchContentTimer,
      scores,
      searchContentLatency,
      searchBuildIndexTimer,
      result,
      searchBuildIndexLatency,
      _args5 = arguments;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          options = _args5.length > 6 && _args5[6] !== undefined ? _args5[6] : {};
          _options$topK = options.topK, topK = _options$topK === void 0 ? 10 : _options$topK;
          searchContentTimer = new _searchMetrics.SearchTimer("Search Content");
          _context5.n = 1;
          return (0, _searchIndex.searchContent_v2)(pagesContent, inverted, search);
        case 1:
          scores = _context5.v;
          searchContentLatency = searchContentTimer.stop();
          if (scores.results && scores.results.length > topK * 2) {
            scores.results = scores.results.slice(0, topK * 2);
          }
          searchBuildIndexTimer = new _searchMetrics.SearchTimer("Search Build Index");
          _context5.n = 2;
          return (0, _searchIndex.searchBuildIndex_v2)(scores, fileMapping);
        case 2:
          result = _context5.v;
          searchBuildIndexLatency = searchBuildIndexTimer.stop();
          console.log("\n    searchContentLatency: ".concat(searchContentLatency, "\n    searchBuildIndexLatency: ").concat(searchBuildIndexLatency, "\n  "));
          return _context5.a(2, result);
      }
    }, _callee5);
  }));
  return _rawKeywordSearch.apply(this, arguments);
}
function executeKeywordFlow(_x12, _x13, _x14, _x15, _x16, _x17, _x18, _x19) {
  return _executeKeywordFlow.apply(this, arguments);
}
function _executeKeywordFlow() {
  _executeKeywordFlow = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(query, pagesContent, inverted, fileMapping, parseId, userId, topK, chunks) {
    var rawResults, results;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.n) {
        case 0:
          _context6.n = 1;
          return rawKeywordSearch(query, pagesContent, inverted, fileMapping, parseId, userId, {
            topK: topK * 2
          });
        case 1:
          rawResults = _context6.v;
          _context6.n = 2;
          return (0, _resultNormalizer.normalizeKeywordResults)(rawResults, chunks);
        case 2:
          results = _context6.v;
          results.sort(function (a, b) {
            return b.score - a.score;
          });
          results = results.map(function (result, index) {
            return _objectSpread(_objectSpread({}, result), {}, {
              rank: index
            });
          });
          return _context6.a(2, results);
      }
    }, _callee6);
  }));
  return _executeKeywordFlow.apply(this, arguments);
}
function executeSemanticFlow(_x20, _x21, _x22, _x23, _x24) {
  return _executeSemanticFlow.apply(this, arguments);
}
function _executeSemanticFlow() {
  _executeSemanticFlow = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(query, parseId, userId, topK, chunks) {
    var cachedEmbedding,
      _yield$rawSemanticSea,
      rawResults,
      embedding,
      results,
      _args7 = arguments;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.n) {
        case 0:
          cachedEmbedding = _args7.length > 5 && _args7[5] !== undefined ? _args7[5] : null;
          _context7.n = 1;
          return rawSemanticSearch(query, parseId, userId, {
            topK: topK * 2,
            cachedEmbedding: cachedEmbedding
          });
        case 1:
          _yield$rawSemanticSea = _context7.v;
          rawResults = _yield$rawSemanticSea.result;
          embedding = _yield$rawSemanticSea.embedding;
          _context7.n = 2;
          return (0, _resultNormalizer.normalizeSemanticResults)(rawResults, chunks);
        case 2:
          results = _context7.v;
          results = results.map(function (result) {
            var chunk = chunks.find(function (c) {
              return c.id === result.chunk_id;
            });
            if (chunk) {
              var intentBoost = (0, _scoreSentenceIntent.analyzeAndBoost)(result.chunk_id, query, chunk.text, result.score);
              return _objectSpread(_objectSpread({}, result), {}, {
                score: intentBoost.new_score,
                metadata: _objectSpread(_objectSpread({}, result.metadata), {}, {
                  intent_boost: intentBoost.boostWeight
                })
              });
            }
            return result;
          });
          if (!(results.length > 0)) {
            _context7.n = 4;
            break;
          }
          _context7.n = 3;
          return (0, _sentenceReRanker.sentenceLevelReRanking)(results, query);
        case 3:
          results = results.map(function (r) {
            if (r.rrf_score !== undefined) {
              r.score = r.rrf_score;
            }
            return r;
          });
        case 4:
          results = results.map(function (result) {
            var bboxes = result.rects || [];
            if (result.text && result.best_sentence) {
              var startChar = result.text.indexOf(result.best_sentence);
              if (startChar !== -1) {
                var endChar = startChar + result.best_sentence.length;
                var calculatedBBoxes = mapCharsToBBoxes(result.text_spans, result.text, startChar, endChar);
                if (calculatedBBoxes.length > 0) {
                  bboxes = calculatedBBoxes;
                }
              }
            }
            return _objectSpread(_objectSpread({}, result), {}, {
              rects: bboxes
            });
          });
          results.sort(function (a, b) {
            return b.score - a.score;
          });
          results = results.map(function (result, index) {
            return _objectSpread(_objectSpread({}, result), {}, {
              rank: index
            });
          });
          return _context7.a(2, {
            results: results,
            embedding: embedding
          });
      }
    }, _callee7);
  }));
  return _executeSemanticFlow.apply(this, arguments);
}
function hybridSearch(_x25, _x26, _x27, _x28, _x29, _x30, _x31) {
  return _hybridSearch.apply(this, arguments);
}
function _hybridSearch() {
  _hybridSearch = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(parseId, userId, query, pagesContent, inverted, fileMapping, chunks) {
    var options,
      _options$topK2,
      topK,
      _options$k,
      k,
      overallTimer,
      analysis,
      intentAnalysis,
      legacyAnalysis,
      keywordQuery,
      primarySemanticQuery,
      finalResults,
      keywordResultsForMetrics,
      semanticResultsForMetrics,
      queryEmbedding,
      _yield$executeSemanti,
      results,
      _yield$Promise$all,
      _yield$Promise$all2,
      kwRanked,
      semRankedData,
      semRanked,
      rrfScores,
      finalResultsSliced,
      resultsFormatted,
      totalLatency,
      _args8 = arguments;
    return _regenerator().w(function (_context8) {
      while (1) switch (_context8.n) {
        case 0:
          options = _args8.length > 7 && _args8[7] !== undefined ? _args8[7] : {};
          _options$topK2 = options.topK, topK = _options$topK2 === void 0 ? 10 : _options$topK2, _options$k = options.k, k = _options$k === void 0 ? 60 : _options$k;
          overallTimer = new _searchMetrics.SearchTimer("Overall Search");
          _context8.n = 1;
          return (0, _queryAnalysisCache.getQueryAnalysis)(query);
        case 1:
          analysis = _context8.v;
          if (!analysis) {
            intentAnalysis = queryIntent.analyzeQuery(query);
            legacyAnalysis = (0, _stopwords.analyzeQuery)(query);
            analysis = _objectSpread(_objectSpread({}, legacyAnalysis), {}, {
              intent: intentAnalysis.intent,
              semanticWeight: intentAnalysis.semanticWeight,
              keywordWeight: intentAnalysis.keywordWeight,
              expansions: intentAnalysis.expansions
            });
            (0, _queryAnalysisCache.setQueryAnalysis)(query, analysis)["catch"](console.error);
          }
          console.log("\nQUERY ANALYSIS:");
          console.log("  Original: \"".concat(query, "\""));
          console.log("  Intent: ".concat(analysis.intent.toUpperCase()));
          console.log("  Content words: ".concat(analysis.contentWords.join(", ")));
          console.log("  Type: ".concat(analysis.queryType.toUpperCase()));
          (0, _searchMetrics.trackQueryAnalysis)({
            query: query,
            queryType: analysis.queryType,
            intent: analysis.intent,
            contentWords: analysis.contentWords,
            semanticWeight: analysis.semanticWeight,
            keywordWeight: analysis.keywordWeight,
            userId: userId
          });
          keywordQuery = analysis.contentWords.join(" ") || query;
          primarySemanticQuery = query;
          finalResults = [];
          keywordResultsForMetrics = [];
          semanticResultsForMetrics = [];
          _context8.n = 2;
          return (0, _callToEmbed.callToEmbed)(primarySemanticQuery);
        case 2:
          queryEmbedding = _context8.v;
          if (!(analysis.queryType === "keyword")) {
            _context8.n = 4;
            break;
          }
          _context8.n = 3;
          return executeKeywordFlow(keywordQuery, pagesContent, inverted, fileMapping, parseId, userId, topK, chunks);
        case 3:
          finalResults = _context8.v;
          keywordResultsForMetrics = finalResults;
          _context8.n = 8;
          break;
        case 4:
          if (!(analysis.queryType === "semantic")) {
            _context8.n = 6;
            break;
          }
          _context8.n = 5;
          return executeSemanticFlow(primarySemanticQuery, parseId, userId, topK, chunks, queryEmbedding);
        case 5:
          _yield$executeSemanti = _context8.v;
          results = _yield$executeSemanti.results;
          finalResults = results;
          semanticResultsForMetrics = finalResults;
          _context8.n = 8;
          break;
        case 6:
          _context8.n = 7;
          return Promise.all([executeKeywordFlow(keywordQuery, pagesContent, inverted, fileMapping, parseId, userId, topK, chunks), executeSemanticFlow(primarySemanticQuery, parseId, userId, topK, chunks, queryEmbedding)]);
        case 7:
          _yield$Promise$all = _context8.v;
          _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 2);
          kwRanked = _yield$Promise$all2[0];
          semRankedData = _yield$Promise$all2[1];
          semRanked = semRankedData.results;
          keywordResultsForMetrics = kwRanked;
          semanticResultsForMetrics = semRanked;
          rrfScores = new Map();
          kwRanked.forEach(function (result) {
            var key = "".concat(result.chunk_id);
            var rrfScore = analysis.keywordWeight * (1 / (k + result.rank));
            if (!rrfScores.has(key)) {
              rrfScores.set(key, _objectSpread(_objectSpread({}, result), {}, {
                rrf_score: 0,
                keyword_rank: null,
                semantic_rank: null
              }));
            }
            var entry = rrfScores.get(key);
            entry.rrf_score += rrfScore;
            entry.keyword_rank = result.rank;
            entry.keyword_score = result.score;
          });
          semRanked.forEach(function (result) {
            var key = "".concat(result.chunk_id);
            var rrfScore = analysis.semanticWeight * (1 / (k + result.rank));
            if (!rrfScores.has(key)) {
              rrfScores.set(key, _objectSpread(_objectSpread({}, result), {}, {
                rrf_score: 0,
                keyword_rank: null,
                semantic_rank: null
              }));
            }
            var entry = rrfScores.get(key);
            entry.rrf_score += rrfScore;
            entry.semantic_rank = result.rank;
            entry.semantic_score = result.score;
            if (result.rects && result.rects.length > 0) {
              entry.rects = result.rects;
            }
            if (result.best_sentence) {
              entry.best_sentence = result.best_sentence;
            }
            entry.text = result.text;
          });
          finalResults = Array.from(rrfScores.values());
          finalResults.sort(function (a, b) {
            return b.rrf_score - a.rrf_score;
          });
        case 8:
          finalResultsSliced = finalResults.slice(0, topK);
          resultsFormatted = finalResultsSliced.map(function (result) {
            var _result$metadata, _result$metadata2, _result$metadata3, _result$metadata4;
            var finalScore = result.rrf_score !== undefined ? result.rrf_score : result.score;
            return {
              chunk_id: result.chunk_id,
              file_name: result.file_name,
              page_number: result.page_number,
              score: finalScore,
              source: result.source,
              text: result.text,
              rects: result.rects || [],
              rank: result.rank,
              metadata: _objectSpread(_objectSpread(_objectSpread(_objectSpread(_objectSpread({
                intent_boost: (_result$metadata = result.metadata) === null || _result$metadata === void 0 ? void 0 : _result$metadata.intent_boost,
                best_sentence: result.best_sentence,
                texts_span: result.text_spans
              }, ((_result$metadata2 = result.metadata) === null || _result$metadata2 === void 0 ? void 0 : _result$metadata2.terms) && {
                terms: result.metadata.terms
              }), ((_result$metadata3 = result.metadata) === null || _result$metadata3 === void 0 ? void 0 : _result$metadata3.match_count) !== undefined && {
                match_count: result.metadata.match_count
              }), ((_result$metadata4 = result.metadata) === null || _result$metadata4 === void 0 ? void 0 : _result$metadata4.term_breakdown) && {
                term_breakdown: result.metadata.term_breakdown
              }), result.keyword_rank !== undefined && {
                keyword_rank: result.keyword_rank
              }), result.semantic_rank !== undefined && {
                semantic_rank: result.semantic_rank
              })
            };
          });
          totalLatency = overallTimer.stop();
          (0, _searchMetrics.trackSearchMetrics)({
            query: query,
            queryType: analysis.queryType,
            userId: userId,
            parseId: parseId,
            totalResults: resultsFormatted.length,
            keywordResultCount: keywordResultsForMetrics.length,
            semanticResultCount: semanticResultsForMetrics.length,
            mergedResultCount: resultsFormatted.length,
            totalLatency: totalLatency,
            keywordLatency: 0,
            semanticLatency: 0,
            contentWords: analysis.contentWords,
            semanticWeight: analysis.semanticWeight,
            keywordWeight: analysis.keywordWeight,
            hasResults: resultsFormatted.length > 0,
            scoreDistribution: null
          });
          if (resultsFormatted.length === 0) {
            (0, _searchMetrics.trackZeroResults)({
              query: query,
              queryType: analysis.queryType,
              userId: userId,
              parseId: parseId,
              contentWords: analysis.contentWords,
              totalLatency: totalLatency
            });
          }
          return _context8.a(2, [resultsFormatted, analysis.queryType]);
      }
    }, _callee8);
  }));
  return _hybridSearch.apply(this, arguments);
}
function mapCharsToBBoxes(textSpans, chunkText, startChar, endChar) {
  if (!textSpans || textSpans.length === 0) {
    return [];
  }
  var charPosition = 0;
  var spanRanges = [];
  var _iterator = _createForOfIteratorHelper(textSpans),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var span = _step.value;
      var spanText = span.span;
      var spanStart = charPosition;
      var spanEnd = charPosition + spanText.length;
      spanRanges.push({
        span_text_id: span.span_text_id,
        span: spanText,
        span_bbox: span.span_bbox,
        startChar: spanStart,
        endChar: spanEnd
      });
      charPosition = spanEnd + 1;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var relevantSpans = spanRanges.filter(function (spanRange) {
    return spanRange.endChar > startChar && spanRange.startChar < endChar;
  });
  return relevantSpans.map(function (spanRange) {
    return spanRange.span_bbox;
  });
}