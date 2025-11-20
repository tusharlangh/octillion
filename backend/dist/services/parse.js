"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "createContextualChunks", {
  enumerable: true,
  get: function get() {
    return _chunks.createContextualChunks;
  }
});
Object.defineProperty(exports, "generateEmbedding", {
  enumerable: true,
  get: function get() {
    return _embedding.generateEmbedding;
  }
});
exports.parse = parse;
var _client = _interopRequireDefault(require("../utils/supabase/client.js"));
var _dotenv = _interopRequireDefault(require("dotenv"));
var _qdrantService = require("./qdrantService.js");
var _MinHeap = require("../utils/MinHeap.js");
var _errorHandler = require("../middleware/errorHandler.js");
var _searchRewrite = require("./searchRewrite.js");
var _embedding = require("./parse/embedding.js");
var _searchIndex = require("./parse/searchIndex.js");
var _chunks = require("./parse/chunks.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
_dotenv["default"].config();
function parse(_x, _x2, _x3) {
  return _parse.apply(this, arguments);
}
function _parse() {
  _parse = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(id, search, userId) {
    var options,
      searchMode,
      _options$topK,
      topK,
      searchRewrite,
      _yield$supabase$from$,
      data,
      error,
      d,
      pagesContent,
      inverted,
      buildIndex,
      searchResults,
      topPages,
      _yield$Promise$all,
      _yield$Promise$all2,
      semanticResults,
      keywordResults,
      normalize,
      getMinMax,
      semanticRange,
      keywordRange,
      resultMap,
      _iterator,
      _step,
      result,
      key,
      _iterator2,
      _step2,
      _result,
      _key,
      existing,
      heap,
      _iterator3,
      _step3,
      _result2,
      queryEmbedding,
      scores,
      _args3 = arguments,
      _t3,
      _t4,
      _t5,
      _t6,
      _t7;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          options = _args3.length > 3 && _args3[3] !== undefined ? _args3[3] : {};
          searchMode = options.searchMode, _options$topK = options.topK, topK = _options$topK === void 0 ? 10 : _options$topK;
          _context3.p = 1;
          searchRewrite = new _searchRewrite.SearchRewrite(search);
          search = searchRewrite.process();
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
            searchResults: []
          });
        case 5:
          d = data[0];
          if (!(!d || !d.pages_metadata || !d.inverted_index || !d.build_index)) {
            _context3.n = 6;
            break;
          }
          throw new _errorHandler.AppError("Invalid or incomplete data row", 500, "INVALID_DATA_ROW");
        case 6:
          pagesContent = d.pages_metadata;
          inverted = d.inverted_index;
          buildIndex = d.build_index;
          if (!(!pagesContent || pagesContent.length === 0)) {
            _context3.n = 7;
            break;
          }
          throw new _errorHandler.AppError("Pages content is empty", 500, "EMPTY_PAGES_CONTENT");
        case 7:
          if (!(!inverted || _typeof(inverted) !== "object" || Object.keys(inverted).length === 0)) {
            _context3.n = 8;
            break;
          }
          throw new _errorHandler.AppError("Inverted index is empty or invalid", 500, "EMPTY_INVERTED_INDEX");
        case 8:
          if (!(!buildIndex || _typeof(buildIndex) !== "object" || Object.keys(buildIndex).length === 0)) {
            _context3.n = 9;
            break;
          }
          throw new _errorHandler.AppError("Build index is empty or invalid", 500, "EMPTY_BUILD_INDEX");
        case 9:
          _context3.p = 9;
          if (!(searchMode === "hybrid")) {
            _context3.n = 17;
            break;
          }
          _context3.p = 10;
          _context3.n = 11;
          return Promise.all([_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
            var queryEmbedding, results, _t;
            return _regenerator().w(function (_context) {
              while (1) switch (_context.p = _context.n) {
                case 0:
                  _context.p = 0;
                  _context.n = 1;
                  return (0, _embedding.generateEmbedding)(search);
                case 1:
                  queryEmbedding = _context.v;
                  if (!(!queryEmbedding || queryEmbedding.length === 0)) {
                    _context.n = 2;
                    break;
                  }
                  return _context.a(2, []);
                case 2:
                  _context.n = 3;
                  return (0, _qdrantService.searchQdrant)(id, userId, queryEmbedding, {
                    topK: topK * 2,
                    scoreThreshold: 0.2
                  });
                case 3:
                  results = _context.v;
                  if (!(!results || results.length === 0)) {
                    _context.n = 4;
                    break;
                  }
                  return _context.a(2, []);
                case 4:
                  return _context.a(2, results);
                case 5:
                  _context.p = 5;
                  _t = _context.v;
                  if (!_t.isOperational) {
                    _context.n = 6;
                    break;
                  }
                  throw _t;
                case 6:
                  throw new _errorHandler.AppError("Semantic search failed: ".concat(_t.message), 500, "SEMANTIC_SEARCH_ERROR");
                case 7:
                  return _context.a(2);
              }
            }, _callee, null, [[0, 5]]);
          }))(), _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
            var scores, _topPages, results, _t2;
            return _regenerator().w(function (_context2) {
              while (1) switch (_context2.p = _context2.n) {
                case 0:
                  _context2.p = 0;
                  _context2.n = 1;
                  return (0, _searchIndex.searchContent)(pagesContent, inverted, search);
                case 1:
                  scores = _context2.v;
                  if (!(Object.keys(scores || {}).length === 0)) {
                    _context2.n = 2;
                    break;
                  }
                  return _context2.a(2, []);
                case 2:
                  _topPages = Object.entries(scores).sort(function (_ref3, _ref4) {
                    var _ref5 = _slicedToArray(_ref3, 2),
                      a = _ref5[1];
                    var _ref6 = _slicedToArray(_ref4, 2),
                      b = _ref6[1];
                    return b - a;
                  }).slice(0, topK * 2).map(function (_ref7) {
                    var _ref8 = _slicedToArray(_ref7, 1),
                      id = _ref8[0];
                    return id;
                  });
                  results = (0, _searchIndex.searchBuildIndex)(buildIndex, search, pagesContent, _topPages);
                  if (!(results.length === 0)) {
                    _context2.n = 3;
                    break;
                  }
                  return _context2.a(2, []);
                case 3:
                  return _context2.a(2, results.map(function (result) {
                    return _objectSpread(_objectSpread({}, result), {}, {
                      score: scores[result.pageId],
                      startY: result.y,
                      endY: result.y
                    });
                  }));
                case 4:
                  _context2.p = 4;
                  _t2 = _context2.v;
                  if (!_t2.isOperational) {
                    _context2.n = 5;
                    break;
                  }
                  throw _t2;
                case 5:
                  throw new _errorHandler.AppError("Keyword search failed: ".concat(_t2.message), 500, "KEYWORD_SEARCH_ERROR");
                case 6:
                  return _context2.a(2);
              }
            }, _callee2, null, [[0, 4]]);
          }))()]);
        case 11:
          _yield$Promise$all = _context3.v;
          _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 2);
          semanticResults = _yield$Promise$all2[0];
          keywordResults = _yield$Promise$all2[1];
          if (!(semanticResults.length === 0 && keywordResults.length === 0)) {
            _context3.n = 12;
            break;
          }
          return _context3.a(2, {
            success: true,
            searchResults: []
          });
        case 12:
          normalize = function normalize(x, min, max) {
            var range = max - min;
            if (range === 0) return 0.5;
            return (x - min) / range;
          };
          getMinMax = function getMinMax(arr) {
            if (arr.length === 0) return {
              min: 0,
              max: 1
            };
            var scores = arr.map(function (item) {
              return item.score || 0;
            });
            return {
              min: Math.min.apply(Math, _toConsumableArray(scores)),
              max: Math.max.apply(Math, _toConsumableArray(scores))
            };
          };
          semanticRange = getMinMax(semanticResults);
          keywordRange = getMinMax(keywordResults);
          semanticResults.forEach(function (item) {
            item.score = normalize(item.score || 0, semanticRange.min, semanticRange.max);
            item.source = "semantic";
          });
          keywordResults.forEach(function (item) {
            item.score = normalize(item.score || 0, keywordRange.min, keywordRange.max);
            item.source = "keyword";
          });
          resultMap = new Map();
          _iterator = _createForOfIteratorHelper(semanticResults);
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              result = _step.value;
              key = "".concat(result.pageId, "-").concat(result.startY, "-").concat(result.endY);
              resultMap.set(key, result);
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
          _iterator2 = _createForOfIteratorHelper(keywordResults);
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              _result = _step2.value;
              _key = "".concat(_result.pageId, "-").concat(_result.startY, "-").concat(_result.endY);
              if (resultMap.has(_key)) {
                existing = resultMap.get(_key);
                existing.score = (existing.score + _result.score) / 2;
              } else {
                resultMap.set(_key, _result);
              }
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
          heap = new _MinHeap.MinHeap(topK);
          _iterator3 = _createForOfIteratorHelper(resultMap.values());
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              _result2 = _step3.value;
              heap.push(_result2);
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
          if (heap) {
            _context3.n = 13;
            break;
          }
          throw new _errorHandler.AppError("Failed to create heap", 500, "HEAP_CREATION_ERROR");
        case 13:
          searchResults = heap.toArray();
          if (!(!searchResults || searchResults.length === 0)) {
            _context3.n = 14;
            break;
          }
          return _context3.a(2, {
            success: true,
            searchResults: []
          });
        case 14:
          return _context3.a(2, {
            success: true,
            searchResults: searchResults,
            metadata: {
              searchMode: searchMode,
              totalResults: searchResults.length,
              semanticCount: semanticResults.length,
              keywordCount: keywordResults.length,
              uniqueResults: resultMap.size
            }
          });
        case 15:
          _context3.p = 15;
          _t3 = _context3.v;
          if (!_t3.isOperational) {
            _context3.n = 16;
            break;
          }
          throw _t3;
        case 16:
          throw new _errorHandler.AppError("Hybrid search failed: ".concat(_t3.message), 500, "FAILED_HYBRID_SEARCH_ERROR");
        case 17:
          if (!(searchMode === "semantic")) {
            _context3.n = 26;
            break;
          }
          _context3.p = 18;
          _context3.n = 19;
          return (0, _embedding.generateEmbedding)(search);
        case 19:
          queryEmbedding = _context3.v;
          if (!(!queryEmbedding || queryEmbedding.length === 0)) {
            _context3.n = 20;
            break;
          }
          return _context3.a(2, {
            success: true,
            searchResults: []
          });
        case 20:
          _context3.n = 21;
          return (0, _qdrantService.searchQdrant)(id, userId, queryEmbedding, {
            topK: topK,
            scoreThreshold: 0.3
          });
        case 21:
          searchResults = _context3.v;
          if (!(searchResults.length === 0)) {
            _context3.n = 22;
            break;
          }
          return _context3.a(2, {
            success: true,
            searchResults: []
          });
        case 22:
          _context3.n = 25;
          break;
        case 23:
          _context3.p = 23;
          _t4 = _context3.v;
          if (!_t4.isOperational) {
            _context3.n = 24;
            break;
          }
          throw _t4;
        case 24:
          throw new _errorHandler.AppError("Semantic search failed: ".concat(_t4.message), 500, "FAILED_SEMANTIC_SEARCH_ERROR");
        case 25:
          _context3.n = 33;
          break;
        case 26:
          if (!(searchMode === "tfidf")) {
            _context3.n = 33;
            break;
          }
          _context3.p = 27;
          _context3.n = 28;
          return (0, _searchIndex.searchContent)(pagesContent, inverted, search);
        case 28:
          scores = _context3.v;
          topPages = Object.entries(scores).sort(function (_ref9, _ref0) {
            var _ref1 = _slicedToArray(_ref9, 2),
              a = _ref1[1];
            var _ref10 = _slicedToArray(_ref0, 2),
              b = _ref10[1];
            return b - a;
          }).slice(0, topK).map(function (_ref11) {
            var _ref12 = _slicedToArray(_ref11, 1),
              id = _ref12[0];
            return id;
          });
          if (!(Object.keys(scores || {}).length === 0)) {
            _context3.n = 29;
            break;
          }
          return _context3.a(2, {
            success: true,
            searchResults: []
          });
        case 29:
          searchResults = (0, _searchIndex.searchBuildIndex)(buildIndex, search, pagesContent, topPages);
          if (!(!searchResults || searchResults.length === 0)) {
            _context3.n = 30;
            break;
          }
          return _context3.a(2, {
            success: true,
            searchResults: []
          });
        case 30:
          _context3.n = 33;
          break;
        case 31:
          _context3.p = 31;
          _t5 = _context3.v;
          if (!_t5.isOperational) {
            _context3.n = 32;
            break;
          }
          throw _t5;
        case 32:
          throw new _errorHandler.AppError("Keyword search failed: ".concat(_t5.message), 500, "FAILED_KEYWORD_SEARCH_ERROR");
        case 33:
          _context3.n = 36;
          break;
        case 34:
          _context3.p = 34;
          _t6 = _context3.v;
          if (!_t6.isOperational) {
            _context3.n = 35;
            break;
          }
          throw _t6;
        case 35:
          throw new _errorHandler.AppError("Failed searching: ".concat(_t6.message), 500, "FAILED_SEARCH_ERROR");
        case 36:
          if (!(!searchResults || searchResults.length === 0)) {
            _context3.n = 37;
            break;
          }
          return _context3.a(2, {
            success: true,
            searchResults: []
          });
        case 37:
          return _context3.a(2, {
            success: true,
            searchResults: searchResults
          });
        case 38:
          _context3.p = 38;
          _t7 = _context3.v;
          if (!_t7.isOperational) {
            _context3.n = 39;
            break;
          }
          throw _t7;
        case 39:
          throw new _errorHandler.AppError("System error: ".concat(_t7.message), 500, "SYSTEM_ERROR");
        case 40:
          return _context3.a(2);
      }
    }, _callee3, null, [[27, 31], [18, 23], [10, 15], [9, 34], [1, 38]]);
  }));
  return _parse.apply(this, arguments);
}