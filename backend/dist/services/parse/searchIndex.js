"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.searchBuildIndex = searchBuildIndex;
exports.searchContent = searchContent;
var _OptimizedKeywordIndex = require("../../utils/OptimizedKeywordIndex.js");
var _errorHandler = require("../../middleware/errorHandler.js");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
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
function searchBuildIndex(buildIndex, searchTerms, pagesContent, topPageIds) {
  try {
    var getSentences = function getSentences(y, mapping, sentenceSeen, pageId) {
      var keys = Array.from(mapping.keys()).sort(function (a, b) {
        return b - a;
      });
      var pos = keys.indexOf(y);
      if (pos === -1) return null;
      var startIndex = Math.max(0, pos - 2);
      var endIndex = Math.min(keys.length - 1, pos + 2);
      var needed = keys.slice(startIndex, endIndex + 1);
      if (needed.length === 0) {
        return null;
      }
      var parts = [];
      var _iterator2 = _createForOfIteratorHelper(needed),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var key = _step2.value;
          if (sentenceSeen.has("".concat(pageId, "-").concat(key))) continue;
          sentenceSeen.add("".concat(pageId, "-").concat(key));
          var row = mapping.get(key);
          if (!row) continue;
          var text = row.filter(function (w) {
            return w && w.word;
          }).map(function (w) {
            return w.word;
          }).join(" ");
          parts.push(text);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return parts.join(" ").trim();
    };
    var terms = searchTerms.toLowerCase().split(/\s+/);
    var pageSet = new Set(topPageIds);
    var sentenceMap = new Map();
    var pageMappings = new Map();
    var _iterator = _createForOfIteratorHelper(pagesContent),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var page = _step.value;
        if (!page || !page.id) {
          continue;
        }
        if (pageSet.has(page.id)) {
          if (!page.mapping) {
            continue;
          }
          pageMappings.set(page.id, new Map(page.mapping));
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    var isOptimizedFormat = buildIndex.prefixIndex !== undefined || buildIndex.suffixIndex !== undefined || buildIndex.ngramIndex !== undefined;
    if (isOptimizedFormat) {
      var index;
      try {
        index = _OptimizedKeywordIndex.OptimizedKeywordIndex.fromJSON(buildIndex);
      } catch (error) {
        throw new _errorHandler.AppError("Failed to parse optimized index: ".concat(error.message), 500, "INDEX_PARSE_ERROR");
      }
      var _iterator3 = _createForOfIteratorHelper(terms),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var term = _step3.value;
          var normalizedTerm = term.replace(/[.,;:!?'"()[\]{}]+/g, "");
          if (!normalizedTerm) continue;
          var matches = void 0;
          try {
            matches = index.search(normalizedTerm, "all");
            console.log(matches.length);
          } catch (error) {
            continue;
          }
          var sentenceSeen = new Set();
          var _iterator4 = _createForOfIteratorHelper(matches),
            _step4;
          try {
            var _loop = function _loop() {
                var _step4$value = _slicedToArray(_step4.value, 3),
                  word = _step4$value[0],
                  pageId = _step4$value[1],
                  y = _step4$value[2];
                if (!pageSet.has(pageId)) return 0; // continue
                var mapping = pageMappings.get(pageId);
                if (!mapping) return 0; // continue
                if (sentenceSeen.has("".concat(pageId, "-").concat(y))) return 0; // continue
                var sentence = getSentences(y, mapping, sentenceSeen, pageId);
                var key = "".concat(pageId, "-").concat(y);
                if (!sentenceMap.has(key)) {
                  var _pagesContent$find;
                  sentenceMap.set(key, {
                    file_name: ((_pagesContent$find = pagesContent.find(function (p) {
                      return p.id === pageId;
                    })) === null || _pagesContent$find === void 0 ? void 0 : _pagesContent$find.name) || "Unknown",
                    pageId: pageId,
                    y: y,
                    sentence: sentence || mapping.get(y).filter(function (w) {
                      return w && w.word;
                    }).map(function (w) {
                      return w.word;
                    }).join(" ")
                  });
                }
              },
              _ret;
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              _ret = _loop();
              if (_ret === 0) continue;
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    } else {
      var _iterator5 = _createForOfIteratorHelper(terms),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _normalizedTerm$;
          var _term = _step5.value;
          var _normalizedTerm = _term.replace(/[.,;:!?'"()[\]{}]+/g, "");
          var firstChar = (_normalizedTerm$ = _normalizedTerm[0]) === null || _normalizedTerm$ === void 0 ? void 0 : _normalizedTerm$.toLowerCase();
          if (!firstChar) continue;
          var positions = buildIndex[firstChar] || [];
          if (!Array.isArray(positions)) {
            continue;
          }
          var _iterator6 = _createForOfIteratorHelper(positions),
            _step6;
          try {
            var _loop2 = function _loop2() {
                var pos = _step6.value;
                var word = Array.isArray(pos) ? pos[0] : pos.word;
                var pageId = Array.isArray(pos) ? pos[1] : pos.pageId;
                var y = Array.isArray(pos) ? pos[2] : pos.y;
                if (!pageSet.has(pageId)) return 0; // continue
                var mapping = pageMappings.get(pageId);
                if (!mapping) return 0; // continue
                var row = mapping.get(y);
                if (!row || !Array.isArray(row)) return 0; // continue
                if (word === _normalizedTerm || word.startsWith(_normalizedTerm) || word.endsWith(_normalizedTerm) || word.includes(_normalizedTerm)) {
                  var key = "".concat(pageId, "-").concat(y);
                  if (!sentenceMap.has(key)) {
                    var _pagesContent$find2;
                    sentenceMap.set(key, {
                      file_name: ((_pagesContent$find2 = pagesContent.find(function (p) {
                        return p.id === pageId;
                      })) === null || _pagesContent$find2 === void 0 ? void 0 : _pagesContent$find2.name) || "Unknown",
                      pageId: pageId,
                      y: y,
                      sentence: getSentences(y, mapping)
                    });
                  }
                }
              },
              _ret2;
            for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
              _ret2 = _loop2();
              if (_ret2 === 0) continue;
            }
          } catch (err) {
            _iterator6.e(err);
          } finally {
            _iterator6.f();
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    }
    return _toConsumableArray(sentenceMap.values());
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new _errorHandler.AppError("Failed to search build index: ".concat(error.message), 500, "SEARCH_BUILD_INDEX_ERROR");
  }
}
function searchContent(_x, _x2, _x3) {
  return _searchContent.apply(this, arguments);
}
function _searchContent() {
  _searchContent = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(sitesContent, inverted, search) {
    var terms, N, appearance, TF, _iterator7, _step7, page, _iterator9, _step9, _term2, counts, IDF, _iterator8, _step8, _term3, df, scores, _i, _TF, _TF$_i, id, term, tf, _t, _t2;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.p = 0;
          if (!(!sitesContent || !Array.isArray(sitesContent) || sitesContent.length === 0)) {
            _context.n = 1;
            break;
          }
          throw new _errorHandler.AppError("Sites content is empty or invalid", 500, "INVALID_SITES_CONTENT");
        case 1:
          if (!(!inverted || _typeof(inverted) !== "object")) {
            _context.n = 2;
            break;
          }
          throw new _errorHandler.AppError("Inverted index is invalid", 500, "INVALID_INVERTED_INDEX");
        case 2:
          if (!(!search || typeof search !== "string" || !search.trim())) {
            _context.n = 3;
            break;
          }
          throw new _errorHandler.ValidationError("Search query is required");
        case 3:
          terms = search.toLowerCase().replace(/[.,]/g, "").split(/\s+/).filter(function (t) {
            return t.length > 0;
          });
          if (!(terms.length === 0)) {
            _context.n = 4;
            break;
          }
          return _context.a(2, {});
        case 4:
          N = sitesContent.length;
          appearance = {};
          TF = [];
          _iterator7 = _createForOfIteratorHelper(sitesContent);
          _context.p = 5;
          _iterator7.s();
        case 6:
          if ((_step7 = _iterator7.n()).done) {
            _context.n = 9;
            break;
          }
          page = _step7.value;
          if (!(!page || !page.id || typeof page.total_words !== "number")) {
            _context.n = 7;
            break;
          }
          return _context.a(3, 8);
        case 7:
          _iterator9 = _createForOfIteratorHelper(terms);
          try {
            for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
              _term2 = _step9.value;
              counts = inverted[_term2] && inverted[_term2][page.id] ? inverted[_term2][page.id] : 0;
              if (counts > 0) {
                if (!appearance[_term2]) appearance[_term2] = new Set();
                appearance[_term2].add(page.id);
              }
              if (page.total_words > 0) {
                TF.push({
                  id: page.id,
                  term: _term2,
                  tf: counts / page.total_words
                });
              }
            }
          } catch (err) {
            _iterator9.e(err);
          } finally {
            _iterator9.f();
          }
        case 8:
          _context.n = 6;
          break;
        case 9:
          _context.n = 11;
          break;
        case 10:
          _context.p = 10;
          _t = _context.v;
          _iterator7.e(_t);
        case 11:
          _context.p = 11;
          _iterator7.f();
          return _context.f(11);
        case 12:
          IDF = {};
          _iterator8 = _createForOfIteratorHelper(terms);
          try {
            for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
              _term3 = _step8.value;
              df = appearance[_term3] ? appearance[_term3].size : 0;
              IDF[_term3] = df === 0 ? 0 : Math.log((N + 1) / (df + 1)) + 1;
            }
          } catch (err) {
            _iterator8.e(err);
          } finally {
            _iterator8.f();
          }
          scores = {};
          for (_i = 0, _TF = TF; _i < _TF.length; _i++) {
            _TF$_i = _TF[_i], id = _TF$_i.id, term = _TF$_i.term, tf = _TF$_i.tf;
            if (!scores[id]) scores[id] = 0;
            scores[id] += tf * IDF[term];
          }
          return _context.a(2, scores);
        case 13:
          _context.p = 13;
          _t2 = _context.v;
          if (!_t2.isOperational) {
            _context.n = 14;
            break;
          }
          throw _t2;
        case 14:
          throw new _errorHandler.AppError("Failed to search content: ".concat(_t2.message), 500, "SEARCH_CONTENT_ERROR");
        case 15:
          return _context.a(2);
      }
    }, _callee, null, [[5, 10, 11, 12], [0, 13]]);
  }));
  return _searchContent.apply(this, arguments);
}