"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildOptimizedIndex = buildOptimizedIndex;
exports.createInvertedSearch = createInvertedSearch;
exports.generateChunks = generateChunks;
var _errorHandler = require("../../middleware/errorHandler.js");
var _OptimizedKeywordIndex = require("../../utils/OptimizedKeywordIndex.js");
var _parse = require("../parse.js");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function createInvertedSearch(pagesContent) {
  try {
    var inverted = {};
    var _iterator = _createForOfIteratorHelper(pagesContent),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _step$value = _step.value,
          id = _step$value.id,
          site_content = _step$value.site_content;
        var _iterator2 = _createForOfIteratorHelper(site_content.split(" ")),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var word = _step2.value;
            if (!inverted[word]) {
              inverted[word] = {};
            }
            var termMap = inverted[word];
            termMap[id] = (termMap[id] || 0) + 1;
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
    return inverted;
  } catch (_unused) {
    throw new _errorHandler.AppError("Building Inverted index failed", 500, "INVERTED_INDEX_FAILED_ERROR");
  }
}
function buildOptimizedIndex(pagesContent) {
  try {
    var index = new _OptimizedKeywordIndex.OptimizedKeywordIndex();
    var _iterator3 = _createForOfIteratorHelper(pagesContent),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var page = _step3.value;
        var pageId = page.id;
        var mapping = new Map(page.mapping);
        var _iterator4 = _createForOfIteratorHelper(mapping),
          _step4;
        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var _step4$value = _slicedToArray(_step4.value, 2),
              y = _step4$value[0],
              row = _step4$value[1];
            var _iterator5 = _createForOfIteratorHelper(row),
              _step5;
            try {
              for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                var wordObj = _step5.value;
                var word = wordObj.word;
                if (word) {
                  index.add(word, pageId, y);
                }
              }
            } catch (err) {
              _iterator5.e(err);
            } finally {
              _iterator5.f();
            }
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
    if (index.getStorageSize && index.getStorageSize() === 0) {
      throw new _errorHandler.AppError("Keyword index is empty", 500, "EMPTY_KEYWORD_INDEX_ERROR", {
        pagesContent: pagesContent,
        index: index.toJSON
      });
    }
    index.finalize();
    return index;
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }
    throw new _errorHandler.AppError("Building keyword index failed: ".concat(error), 500, "KEYWORD_INDEX_FAILED_ERROR");
  }
}
function generateChunks(_x) {
  return _generateChunks.apply(this, arguments);
}
function _generateChunks() {
  _generateChunks = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(pagesContent) {
    var _iterator6, _step6, page, chunks, _t, _t2, _t3;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.p = 0;
          _iterator6 = _createForOfIteratorHelper(pagesContent);
          _context.p = 1;
          _iterator6.s();
        case 2:
          if ((_step6 = _iterator6.n()).done) {
            _context.n = 7;
            break;
          }
          page = _step6.value;
          _context.p = 3;
          chunks = (0, _parse.createContextualChunks)(page.mapping);
          page.chunks = chunks;
          _context.n = 6;
          break;
        case 4:
          _context.p = 4;
          _t = _context.v;
          if (!_t.isOperational) {
            _context.n = 5;
            break;
          }
          throw _t;
        case 5:
          throw new _errorHandler.AppError("Failed generating chunks for page id: ".concat(page.id), 500, "FAILED_CHUNKS_ERROR");
        case 6:
          _context.n = 2;
          break;
        case 7:
          _context.n = 9;
          break;
        case 8:
          _context.p = 8;
          _t2 = _context.v;
          _iterator6.e(_t2);
        case 9:
          _context.p = 9;
          _iterator6.f();
          return _context.f(9);
        case 10:
          return _context.a(2, pagesContent);
        case 11:
          _context.p = 11;
          _t3 = _context.v;
          if (!_t3.isOperational) {
            _context.n = 12;
            break;
          }
          throw _t3;
        case 12:
          throw new _errorHandler.AppError("Failed generating chunks", 500, "FAILED_CHUNKS_ERROR");
        case 13:
          return _context.a(2);
      }
    }, _callee, null, [[3, 4], [1, 8, 9, 10], [0, 11]]);
  }));
  return _generateChunks.apply(this, arguments);
}