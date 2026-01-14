"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.searchBuildIndex_v2 = searchBuildIndex_v2;
exports.searchContent_v2 = searchContent_v2;
var _errorHandler = require("../../middleware/errorHandler.js");
var _pLimit = _interopRequireDefault(require("p-limit"));
var _geometryClient = require("../../utils/geometryClient.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
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
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function searchBuildIndex_v2(_x, _x2) {
  return _searchBuildIndex_v.apply(this, arguments);
}
function _searchBuildIndex_v() {
  _searchBuildIndex_v = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(scores, fileMapping) {
    var results, geometryBatchMap, limit, _iterator, _step, result, url, score, fileEntry, _i, _Object$keys, term, pages, _loop, _i2, _Object$entries, geometryCalls, geometryResults, _t, _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          _context2.p = 0;
          results = {};
          geometryBatchMap = new Map();
          limit = (0, _pLimit["default"])(50);
          _iterator = _createForOfIteratorHelper(scores.results);
          _context2.p = 1;
          _iterator.s();
        case 2:
          if ((_step = _iterator.n()).done) {
            _context2.n = 9;
            break;
          }
          result = _step.value;
          url = fileMapping[result.fileName];
          score = result.score;
          if (!geometryBatchMap.has(result.fileName)) {
            geometryBatchMap.set(result.fileName, {
              fileName: result.fileName,
              url: url,
              score: score,
              pages: []
            });
          }
          fileEntry = geometryBatchMap.get(result.fileName);
          _i = 0, _Object$keys = Object.keys(result.terms);
        case 3:
          if (!(_i < _Object$keys.length)) {
            _context2.n = 7;
            break;
          }
          term = _Object$keys[_i];
          pages = result.terms[term].pages;
          _loop = /*#__PURE__*/_regenerator().m(function _loop() {
            var _metadata$matches;
            var _Object$entries$_i, pageNo, metadata, pageEntry;
            return _regenerator().w(function (_context) {
              while (1) switch (_context.n) {
                case 0:
                  _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2), pageNo = _Object$entries$_i[0], metadata = _Object$entries$_i[1];
                  pageEntry = fileEntry.pages.find(function (p) {
                    return p.page === pageNo;
                  });
                  if (!pageEntry) {
                    pageEntry = {
                      page: pageNo,
                      terms: [],
                      matchCount: 0
                    };
                    fileEntry.pages.push(pageEntry);
                  }
                  pageEntry.terms.push({
                    term: term,
                    matches: metadata.matches
                  });
                  pageEntry.matchCount += ((_metadata$matches = metadata.matches) === null || _metadata$matches === void 0 ? void 0 : _metadata$matches.length) || 0;
                case 1:
                  return _context.a(2);
              }
            }, _loop);
          });
          _i2 = 0, _Object$entries = Object.entries(pages);
        case 4:
          if (!(_i2 < _Object$entries.length)) {
            _context2.n = 6;
            break;
          }
          return _context2.d(_regeneratorValues(_loop()), 5);
        case 5:
          _i2++;
          _context2.n = 4;
          break;
        case 6:
          _i++;
          _context2.n = 3;
          break;
        case 7:
          // Optimization: For huge documents, only fetch geometry for the Top 20 most relevant pages
          if (fileEntry.pages.length > 20) {
            fileEntry.pages.sort(function (a, b) {
              return b.matchCount - a.matchCount;
            });
            fileEntry.pages = fileEntry.pages.slice(0, 20);
          }
        case 8:
          _context2.n = 2;
          break;
        case 9:
          _context2.n = 11;
          break;
        case 10:
          _context2.p = 10;
          _t = _context2.v;
          _iterator.e(_t);
        case 11:
          _context2.p = 11;
          _iterator.f();
          return _context2.f(11);
        case 12:
          geometryCalls = _toConsumableArray(geometryBatchMap.values()).map(function (batch) {
            return {
              run: function run() {
                return callMainBatch(batch);
              },
              fileName: batch.fileName,
              score: batch.score
            };
          });
          _context2.n = 13;
          return Promise.all(geometryCalls.map(function (c) {
            return limit(function () {
              return c.run();
            });
          }));
        case 13:
          geometryResults = _context2.v;
          geometryResults.forEach(function (batchResult, idx) {
            var _geometryCalls$idx = geometryCalls[idx],
              fileName = _geometryCalls$idx.fileName,
              score = _geometryCalls$idx.score;
            if (!results[fileName]) {
              results[fileName] = {
                result: [],
                score: 0
              };
            }
            if (batchResult.results && Array.isArray(batchResult.results)) {
              var _iterator2 = _createForOfIteratorHelper(batchResult.results),
                _step2;
              try {
                for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                  var pageResult = _step2.value;
                  var page = pageResult.page;
                  if (pageResult.results && Array.isArray(pageResult.results)) {
                    var _iterator3 = _createForOfIteratorHelper(pageResult.results),
                      _step3;
                    try {
                      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                        var termResult = _step3.value;
                        results[fileName].result.push({
                          file_name: fileName,
                          page: page,
                          query: termResult.term,
                          rects: termResult.rects,
                          total: termResult.total
                        });
                      }
                    } catch (err) {
                      _iterator3.e(err);
                    } finally {
                      _iterator3.f();
                    }
                  }
                }
              } catch (err) {
                _iterator2.e(err);
              } finally {
                _iterator2.f();
              }
            }
            results[fileName].score = score;
          });
          return _context2.a(2, results);
        case 14:
          _context2.p = 14;
          _t2 = _context2.v;
          if (!_t2.isOperational) {
            _context2.n = 15;
            break;
          }
          throw _t2;
        case 15:
          throw new _errorHandler.AppError("Failed to search build index: ".concat(_t2.message), 500, "SEARCH_BUILD_INDEX_ERROR");
        case 16:
          return _context2.a(2);
      }
    }, _callee, null, [[1, 10, 11, 12], [0, 14]]);
  }));
  return _searchBuildIndex_v.apply(this, arguments);
}
function callMainBatch(_x3) {
  return _callMainBatch.apply(this, arguments);
}
function _callMainBatch() {
  _callMainBatch = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(_ref) {
    var fileName, url, pages, data;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          fileName = _ref.fileName, url = _ref.url, pages = _ref.pages;
          _context3.n = 1;
          return (0, _geometryClient.invokeGeometry)("/geometry_v2/batch", {
            file_name: fileName,
            url: url,
            pages: pages
          });
        case 1:
          data = _context3.v;
          return _context3.a(2, data);
      }
    }, _callee2);
  }));
  return _callMainBatch.apply(this, arguments);
}
function searchContent_v2(_x4, _x5, _x6) {
  return _searchContent_v.apply(this, arguments);
}
function _searchContent_v() {
  _searchContent_v = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(sitesContent, inverted, search) {
    var queryTerms, k1, b, docLengths, totalWords, docCount, _iterator4, _step4, site, _iterator8, _step8, page, fileName, _iterator9, _step9, block, _iterator0, _step0, line, _iterator1, _step1, span, _i3, _Object$values, len, avgdl, N, matchingTermsMap, _iterator5, _step5, queryTerm, matches, _i5, _Object$keys2, indexedTerm, IDF, _iterator6, _step6, _queryTerm, matchingTerms, docsWithTerm, _iterator10, _step10, term, termEntry, _i6, _Object$keys3, _fileName, n_q, fileResults, _iterator7, _step7, _loop2, _i4, _Object$values2, result, matchedTerms, totalOccurrences, rankedResults, _t4, _t5, _t6, _t7, _t8;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.p = _context6.n) {
        case 0:
          _context6.p = 0;
          if (!(!Array.isArray(sitesContent) || sitesContent.length === 0)) {
            _context6.n = 1;
            break;
          }
          throw new _errorHandler.AppError("Sites content invalid", 500);
        case 1:
          if (!(!inverted || _typeof(inverted) !== "object")) {
            _context6.n = 2;
            break;
          }
          throw new _errorHandler.AppError("Inverted index invalid", 500);
        case 2:
          if (!(!search || typeof search !== "string")) {
            _context6.n = 3;
            break;
          }
          throw new _errorHandler.ValidationError("Search query required");
        case 3:
          queryTerms = search.toLowerCase().split(/\s+/).filter(Boolean);
          if (!(queryTerms.length === 0)) {
            _context6.n = 4;
            break;
          }
          return _context6.a(2, {});
        case 4:
          k1 = 1.2;
          b = 0.75;
          docLengths = {};
          totalWords = 0;
          docCount = 0;
          _iterator4 = _createForOfIteratorHelper(sitesContent);
          _context6.p = 5;
          _iterator4.s();
        case 6:
          if ((_step4 = _iterator4.n()).done) {
            _context6.n = 23;
            break;
          }
          site = _step4.value;
          if (Array.isArray(site.pages)) {
            _context6.n = 7;
            break;
          }
          return _context6.a(3, 22);
        case 7:
          _iterator8 = _createForOfIteratorHelper(site.pages);
          _context6.p = 8;
          _iterator8.s();
        case 9:
          if ((_step8 = _iterator8.n()).done) {
            _context6.n = 19;
            break;
          }
          page = _step8.value;
          fileName = page.file_name;
          if (fileName) {
            _context6.n = 10;
            break;
          }
          return _context6.a(3, 18);
        case 10:
          if (!docLengths[fileName]) {
            docLengths[fileName] = 0;
            docCount++;
          }
          _iterator9 = _createForOfIteratorHelper(page.blocks || []);
          _context6.p = 11;
          _iterator9.s();
        case 12:
          if ((_step9 = _iterator9.n()).done) {
            _context6.n = 15;
            break;
          }
          block = _step9.value;
          if (!(block.type !== "text")) {
            _context6.n = 13;
            break;
          }
          return _context6.a(3, 14);
        case 13:
          _iterator0 = _createForOfIteratorHelper(block.lines || []);
          try {
            for (_iterator0.s(); !(_step0 = _iterator0.n()).done;) {
              line = _step0.value;
              _iterator1 = _createForOfIteratorHelper(line.spans || []);
              try {
                for (_iterator1.s(); !(_step1 = _iterator1.n()).done;) {
                  span = _step1.value;
                  if (typeof span.text === "string") {
                    docLengths[fileName] += span.text.trim().split(/\s+/).length;
                  }
                }
              } catch (err) {
                _iterator1.e(err);
              } finally {
                _iterator1.f();
              }
            }
          } catch (err) {
            _iterator0.e(err);
          } finally {
            _iterator0.f();
          }
        case 14:
          _context6.n = 12;
          break;
        case 15:
          _context6.n = 17;
          break;
        case 16:
          _context6.p = 16;
          _t4 = _context6.v;
          _iterator9.e(_t4);
        case 17:
          _context6.p = 17;
          _iterator9.f();
          return _context6.f(17);
        case 18:
          _context6.n = 9;
          break;
        case 19:
          _context6.n = 21;
          break;
        case 20:
          _context6.p = 20;
          _t5 = _context6.v;
          _iterator8.e(_t5);
        case 21:
          _context6.p = 21;
          _iterator8.f();
          return _context6.f(21);
        case 22:
          _context6.n = 6;
          break;
        case 23:
          _context6.n = 25;
          break;
        case 24:
          _context6.p = 24;
          _t6 = _context6.v;
          _iterator4.e(_t6);
        case 25:
          _context6.p = 25;
          _iterator4.f();
          return _context6.f(25);
        case 26:
          for (_i3 = 0, _Object$values = Object.values(docLengths); _i3 < _Object$values.length; _i3++) {
            len = _Object$values[_i3];
            totalWords += len;
          }
          avgdl = docCount > 0 ? totalWords / docCount : 0;
          N = docCount;
          matchingTermsMap = {};
          _iterator5 = _createForOfIteratorHelper(queryTerms);
          try {
            for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
              queryTerm = _step5.value;
              matches = [];
              for (_i5 = 0, _Object$keys2 = Object.keys(inverted); _i5 < _Object$keys2.length; _i5++) {
                indexedTerm = _Object$keys2[_i5];
                if (indexedTerm.includes(queryTerm)) {
                  matches.push(indexedTerm);
                }
              }
              matchingTermsMap[queryTerm] = matches;
            }
          } catch (err) {
            _iterator5.e(err);
          } finally {
            _iterator5.f();
          }
          IDF = {};
          _iterator6 = _createForOfIteratorHelper(queryTerms);
          try {
            for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
              _queryTerm = _step6.value;
              matchingTerms = matchingTermsMap[_queryTerm];
              docsWithTerm = new Set();
              _iterator10 = _createForOfIteratorHelper(matchingTerms);
              try {
                for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
                  term = _step10.value;
                  termEntry = inverted[term] || {};
                  for (_i6 = 0, _Object$keys3 = Object.keys(termEntry); _i6 < _Object$keys3.length; _i6++) {
                    _fileName = _Object$keys3[_i6];
                    docsWithTerm.add(_fileName);
                  }
                }
              } catch (err) {
                _iterator10.e(err);
              } finally {
                _iterator10.f();
              }
              n_q = docsWithTerm.size;
              IDF[_queryTerm] = Math.log(1 + (N - n_q + 0.5) / (n_q + 0.5));
            }
          } catch (err) {
            _iterator6.e(err);
          } finally {
            _iterator6.f();
          }
          fileResults = {};
          _iterator7 = _createForOfIteratorHelper(queryTerms);
          _context6.p = 27;
          _loop2 = /*#__PURE__*/_regenerator().m(function _loop2() {
            var queryTerm, matchingTerms, idf, _iterator11, _step11, _loop3, _t3;
            return _regenerator().w(function (_context5) {
              while (1) switch (_context5.p = _context5.n) {
                case 0:
                  queryTerm = _step7.value;
                  matchingTerms = matchingTermsMap[queryTerm];
                  idf = IDF[queryTerm];
                  _iterator11 = _createForOfIteratorHelper(matchingTerms);
                  _context5.p = 1;
                  _loop3 = /*#__PURE__*/_regenerator().m(function _loop3() {
                    var term, termFiles, _i7, _Object$entries2, _Object$entries2$_i, _fileName2, pages, tf, _i8, _Object$entries3, _fileResults$_fileNam, _Object$entries3$_i, pageNo, hits, _i9, _Object$entries4, _Object$entries4$_i, _fileName3, _result, _tf, dl, bm25;
                    return _regenerator().w(function (_context4) {
                      while (1) switch (_context4.n) {
                        case 0:
                          term = _step11.value;
                          termFiles = inverted[term];
                          if (termFiles) {
                            _context4.n = 1;
                            break;
                          }
                          return _context4.a(2, 1);
                        case 1:
                          _i7 = 0, _Object$entries2 = Object.entries(termFiles);
                        case 2:
                          if (!(_i7 < _Object$entries2.length)) {
                            _context4.n = 9;
                            break;
                          }
                          _Object$entries2$_i = _slicedToArray(_Object$entries2[_i7], 2), _fileName2 = _Object$entries2$_i[0], pages = _Object$entries2$_i[1];
                          if (!fileResults[_fileName2]) {
                            fileResults[_fileName2] = {
                              fileName: _fileName2,
                              score: 0,
                              coverage: {
                                matchedTerms: 0,
                                totalOccurrences: 0
                              },
                              terms: {}
                            };
                          }
                          if (!fileResults[_fileName2].terms[queryTerm]) {
                            fileResults[_fileName2].terms[queryTerm] = {
                              score: 0,
                              occurrences: 0,
                              pages: {},
                              matchedVariants: []
                            };
                          }
                          tf = 0;
                          _i8 = 0, _Object$entries3 = Object.entries(pages);
                        case 3:
                          if (!(_i8 < _Object$entries3.length)) {
                            _context4.n = 6;
                            break;
                          }
                          _Object$entries3$_i = _slicedToArray(_Object$entries3[_i8], 2), pageNo = _Object$entries3$_i[0], hits = _Object$entries3$_i[1];
                          if (Array.isArray(hits)) {
                            _context4.n = 4;
                            break;
                          }
                          return _context4.a(3, 5);
                        case 4:
                          tf += hits.length;
                          if (!fileResults[_fileName2].terms[queryTerm].pages[pageNo]) {
                            fileResults[_fileName2].terms[queryTerm].pages[pageNo] = {
                              count: 0,
                              matches: []
                            };
                          }
                          fileResults[_fileName2].terms[queryTerm].pages[pageNo].count += hits.length;
                          (_fileResults$_fileNam = fileResults[_fileName2].terms[queryTerm].pages[pageNo].matches).push.apply(_fileResults$_fileNam, _toConsumableArray(hits.map(function (h) {
                            return {
                              bbox: h.lineBBox,
                              surface: h.surface,
                              base: term,
                              query: queryTerm
                            };
                          })));
                        case 5:
                          _i8++;
                          _context4.n = 3;
                          break;
                        case 6:
                          if (!(tf === 0)) {
                            _context4.n = 7;
                            break;
                          }
                          return _context4.a(3, 8);
                        case 7:
                          if (!fileResults[_fileName2].terms[queryTerm].matchedVariants.includes(term)) {
                            fileResults[_fileName2].terms[queryTerm].matchedVariants.push(term);
                          }
                          fileResults[_fileName2].terms[queryTerm].occurrences += tf;
                        case 8:
                          _i7++;
                          _context4.n = 2;
                          break;
                        case 9:
                          for (_i9 = 0, _Object$entries4 = Object.entries(fileResults); _i9 < _Object$entries4.length; _i9++) {
                            _Object$entries4$_i = _slicedToArray(_Object$entries4[_i9], 2), _fileName3 = _Object$entries4$_i[0], _result = _Object$entries4$_i[1];
                            if (_result.terms[queryTerm]) {
                              _tf = _result.terms[queryTerm].occurrences;
                              dl = docLengths[_fileName3] || 0;
                              if (dl > 0 && _tf > 0) {
                                bm25 = idf * (_tf * (k1 + 1) / (_tf + k1 * (1 - b + b * (dl / avgdl))));
                                _result.terms[queryTerm].score = bm25;
                                _result.score += bm25;
                              }
                            }
                          }
                        case 10:
                          return _context4.a(2);
                      }
                    }, _loop3);
                  });
                  _iterator11.s();
                case 2:
                  if ((_step11 = _iterator11.n()).done) {
                    _context5.n = 5;
                    break;
                  }
                  return _context5.d(_regeneratorValues(_loop3()), 3);
                case 3:
                  if (!_context5.v) {
                    _context5.n = 4;
                    break;
                  }
                  return _context5.a(3, 4);
                case 4:
                  _context5.n = 2;
                  break;
                case 5:
                  _context5.n = 7;
                  break;
                case 6:
                  _context5.p = 6;
                  _t3 = _context5.v;
                  _iterator11.e(_t3);
                case 7:
                  _context5.p = 7;
                  _iterator11.f();
                  return _context5.f(7);
                case 8:
                  return _context5.a(2);
              }
            }, _loop2, null, [[1, 6, 7, 8]]);
          });
          _iterator7.s();
        case 28:
          if ((_step7 = _iterator7.n()).done) {
            _context6.n = 30;
            break;
          }
          return _context6.d(_regeneratorValues(_loop2()), 29);
        case 29:
          _context6.n = 28;
          break;
        case 30:
          _context6.n = 32;
          break;
        case 31:
          _context6.p = 31;
          _t7 = _context6.v;
          _iterator7.e(_t7);
        case 32:
          _context6.p = 32;
          _iterator7.f();
          return _context6.f(32);
        case 33:
          for (_i4 = 0, _Object$values2 = Object.values(fileResults); _i4 < _Object$values2.length; _i4++) {
            result = _Object$values2[_i4];
            matchedTerms = Object.keys(result.terms).length;
            totalOccurrences = Object.values(result.terms).reduce(function (sum, term) {
              return sum + term.occurrences;
            }, 0);
            result.coverage.matchedTerms = matchedTerms;
            result.coverage.totalOccurrences = totalOccurrences;
          }
          rankedResults = Object.values(fileResults).sort(function (a, b) {
            return b.score - a.score;
          }).map(function (r, idx) {
            return _objectSpread(_objectSpread({}, r), {}, {
              rank: idx + 1
            });
          });
          return _context6.a(2, {
            meta: {
              query: search,
              terms: queryTerms,
              totalDocsMatched: rankedResults.length,
              avgDocLength: avgdl
            },
            results: rankedResults
          });
        case 34:
          _context6.p = 34;
          _t8 = _context6.v;
          if (!_t8.isOperational) {
            _context6.n = 35;
            break;
          }
          throw _t8;
        case 35:
          throw new _errorHandler.AppError("Search failed: ".concat(_t8.message), 500, "SEARCH_CONTENT_ERROR");
        case 36:
          return _context6.a(2);
      }
    }, _callee3, null, [[27, 31, 32, 33], [11, 16, 17, 18], [8, 20, 21, 22], [5, 24, 25, 26], [0, 34]]);
  }));
  return _searchContent_v.apply(this, arguments);
}