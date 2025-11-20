"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractPagesContent = extractPagesContent;
var _errorHandler = require("../../middleware/errorHandler.js");
var _pdf = require("pdf.js-extract");
function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t9 in e) "default" !== _t9 && {}.hasOwnProperty.call(e, _t9) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t9)) && (i.get || i.set) ? o(f, _t9, i) : f[_t9] = e[_t9]); return f; })(e, t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function formatResponse(res) {
  return res.toLowerCase().replace(/[^a-z0-9 ]/gi, "").trim().replace(/\s+/g, " ");
}
function processSinglePage(_x, _x2, _x3, _x4) {
  return _processSinglePage.apply(this, arguments);
}
function _processSinglePage() {
  _processSinglePage = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(page, pageNum, fileIndex, fileName) {
    var new_map, _iterator, _step, content, words, x, y, _iterator2, _step2, word, subWords, _iterator3, _step3, text, sortedMapping, orderedText, site_content, _t, _t2, _t3, _t4;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.p = 0;
          new_map = new Map();
          _iterator = _createForOfIteratorHelper(page.content);
          _context.p = 1;
          _iterator.s();
        case 2:
          if ((_step = _iterator.n()).done) {
            _context.n = 19;
            break;
          }
          content = _step.value;
          if (!(!content.str || typeof content.x !== "number" || typeof content.y !== "number")) {
            _context.n = 3;
            break;
          }
          return _context.a(3, 18);
        case 3:
          words = content.str.split(/\s+/);
          x = content.x;
          y = Math.round(content.y);
          _iterator2 = _createForOfIteratorHelper(words);
          _context.p = 4;
          _iterator2.s();
        case 5:
          if ((_step2 = _iterator2.n()).done) {
            _context.n = 15;
            break;
          }
          word = _step2.value;
          if (!(!word || word.trim().length === 0)) {
            _context.n = 6;
            break;
          }
          return _context.a(3, 14);
        case 6:
          subWords = word.split(/[ -]+/);
          _iterator3 = _createForOfIteratorHelper(subWords);
          _context.p = 7;
          _iterator3.s();
        case 8:
          if ((_step3 = _iterator3.n()).done) {
            _context.n = 11;
            break;
          }
          text = _step3.value;
          if (!(text.trim().length === 0)) {
            _context.n = 9;
            break;
          }
          return _context.a(3, 10);
        case 9:
          if (!new_map.has(y)) new_map.set(y, []);
          new_map.get(y).push({
            word: text.toLowerCase(),
            x: x,
            y: y
          });
        case 10:
          _context.n = 8;
          break;
        case 11:
          _context.n = 13;
          break;
        case 12:
          _context.p = 12;
          _t = _context.v;
          _iterator3.e(_t);
        case 13:
          _context.p = 13;
          _iterator3.f();
          return _context.f(13);
        case 14:
          _context.n = 5;
          break;
        case 15:
          _context.n = 17;
          break;
        case 16:
          _context.p = 16;
          _t2 = _context.v;
          _iterator2.e(_t2);
        case 17:
          _context.p = 17;
          _iterator2.f();
          return _context.f(17);
        case 18:
          _context.n = 2;
          break;
        case 19:
          _context.n = 21;
          break;
        case 20:
          _context.p = 20;
          _t3 = _context.v;
          _iterator.e(_t3);
        case 21:
          _context.p = 21;
          _iterator.f();
          return _context.f(21);
        case 22:
          sortedMapping = Array.from(new_map.entries()).sort(function (a, b) {
            return b[0] - a[0];
          }).map(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
              y = _ref2[0],
              words = _ref2[1];
            return [y, words.sort(function (a, b) {
              return a.x - b.x;
            })];
          });
          orderedText = sortedMapping.map(function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2),
              words = _ref4[1];
            return words.map(function (w) {
              return w.word;
            }).join(" ");
          }).join(" ");
          site_content = formatResponse(orderedText);
          return _context.a(2, {
            id: "".concat(fileIndex + 1, ".").concat(pageNum),
            name: fileName,
            site_content: site_content,
            total_words: site_content.split(" ").length,
            mapping: sortedMapping
          });
        case 23:
          _context.p = 23;
          _t4 = _context.v;
          return _context.a(2, {
            id: "".concat(fileIndex + 1, ".").concat(pageNum),
            name: fileName,
            error: "Failed to process page ".concat(pageNum),
            site_content: "",
            total_words: 0,
            mapping: []
          });
      }
    }, _callee, null, [[7, 12, 13, 14], [4, 16, 17, 18], [1, 20, 21, 22], [0, 23]]);
  }));
  return _processSinglePage.apply(this, arguments);
}
function processSinglePDF(_x5, _x6, _x7) {
  return _processSinglePDF.apply(this, arguments);
}
function _processSinglePDF() {
  _processSinglePDF = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(link, fileIndex, fileName) {
    var results, pdfBuffer, res, fs, pdfExtract, options, data, i, page, pageResult, _t5, _t6, _t7;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          results = [];
          if (link) {
            _context2.n = 1;
            break;
          }
          return _context2.a(2, [{
            id: "".concat(fileIndex + 1, ".error"),
            name: fileName,
            error: "No link provided",
            site_content: "",
            total_words: 0,
            mapping: []
          }]);
        case 1:
          _context2.p = 1;
          if (!(link.startsWith("http://") || link.startsWith("https://"))) {
            _context2.n = 4;
            break;
          }
          _context2.n = 2;
          return fetch(link);
        case 2:
          res = _context2.v;
          _t5 = Buffer;
          _context2.n = 3;
          return res.arrayBuffer();
        case 3:
          pdfBuffer = _t5.from.call(_t5, _context2.v);
          _context2.n = 7;
          break;
        case 4:
          _context2.n = 5;
          return Promise.resolve().then(function () {
            return _interopRequireWildcard(require("fs/promises"));
          });
        case 5:
          fs = _context2.v;
          _context2.n = 6;
          return fs.readFile(link);
        case 6:
          pdfBuffer = _context2.v;
        case 7:
          _context2.n = 9;
          break;
        case 8:
          _context2.p = 8;
          _t6 = _context2.v;
          return _context2.a(2, [{
            id: "".concat(fileIndex + 1, ".error"),
            name: fileName,
            error: "Failed to load PDF",
            site_content: "",
            total_words: 0,
            mapping: []
          }]);
        case 9:
          pdfExtract = new _pdf.PDFExtract();
          options = {};
          _context2.p = 10;
          _context2.n = 11;
          return new Promise(function (resolve, reject) {
            pdfExtract.extractBuffer(pdfBuffer, options, function (err, data) {
              if (err) return reject(err);
              resolve(data);
            });
          });
        case 11:
          data = _context2.v;
          _context2.n = 13;
          break;
        case 12:
          _context2.p = 12;
          _t7 = _context2.v;
          return _context2.a(2, [{
            id: "".concat(fileIndex + 1, ".error"),
            name: fileName,
            error: "Failed to extract PDF",
            site_content: "",
            total_words: 0,
            mapping: []
          }]);
        case 13:
          i = 0;
        case 14:
          if (!(i < data.pages.length)) {
            _context2.n = 17;
            break;
          }
          page = data.pages[i];
          _context2.n = 15;
          return processSinglePage(page, i + 1, fileIndex, fileName);
        case 15:
          pageResult = _context2.v;
          results.push(pageResult);
        case 16:
          i++;
          _context2.n = 14;
          break;
        case 17:
          return _context2.a(2, results);
      }
    }, _callee2, null, [[10, 12], [1, 8]]);
  }));
  return _processSinglePDF.apply(this, arguments);
}
function extractPagesContent(_x8, _x9) {
  return _extractPagesContent.apply(this, arguments);
}
function _extractPagesContent() {
  _extractPagesContent = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(links, files) {
    var pagesContent, _loop, i, errorPages, totalPages, errorRate;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          pagesContent = [];
          _loop = /*#__PURE__*/_regenerator().m(function _loop(i) {
            var batch, batchPromises, batchResults, _iterator4, _step4, _pagesContent, result, _t8;
            return _regenerator().w(function (_context3) {
              while (1) switch (_context3.p = _context3.n) {
                case 0:
                  batch = links.slice(i, i + 1);
                  batchPromises = batch.map(function (link, batchIndex) {
                    var _files$fileIndex;
                    var fileIndex = i + batchIndex;
                    var fileName = ((_files$fileIndex = files[fileIndex]) === null || _files$fileIndex === void 0 ? void 0 : _files$fileIndex.originalname) || "Document ".concat(fileIndex + 1);
                    return processSinglePDF(link, fileIndex, fileName);
                  });
                  _context3.p = 1;
                  _context3.n = 2;
                  return Promise.all(batchPromises);
                case 2:
                  batchResults = _context3.v;
                  _iterator4 = _createForOfIteratorHelper(batchResults);
                  try {
                    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                      result = _step4.value;
                      (_pagesContent = pagesContent).push.apply(_pagesContent, _toConsumableArray(result));
                    }
                  } catch (err) {
                    _iterator4.e(err);
                  } finally {
                    _iterator4.f();
                  }
                  _context3.n = 4;
                  break;
                case 3:
                  _context3.p = 3;
                  _t8 = _context3.v;
                  throw new _errorHandler.AppError("Failed to process documents", 500, "DOCUMENT_FAILED_ERROR", {
                    originalError: _t8.message,
                    stack: _t8.stack,
                    fileIndex: i,
                    filesBatch: batch.map(function (b, idx) {
                      var _files;
                      return (_files = files[i + idx]) === null || _files === void 0 ? void 0 : _files.originalname;
                    })
                  });
                case 4:
                  _context3.n = 5;
                  return new Promise(function (resolve) {
                    return setTimeout(resolve, 100);
                  });
                case 5:
                  return _context3.a(2);
              }
            }, _loop, null, [[1, 3]]);
          });
          i = 0;
        case 1:
          if (!(i < links.length)) {
            _context4.n = 3;
            break;
          }
          return _context4.d(_regeneratorValues(_loop(i)), 2);
        case 2:
          i += 1;
          _context4.n = 1;
          break;
        case 3:
          errorPages = pagesContent.filter(function (page) {
            return page.error;
          });
          totalPages = pagesContent.length;
          if (!(totalPages === 0)) {
            _context4.n = 4;
            break;
          }
          throw new _errorHandler.AppError("Pages content is empty", 500, "EMPTY_PAGES_CONTENT_ERROR");
        case 4:
          errorRate = errorPages.length / totalPages;
          if (!(errorRate > 0.5)) {
            _context4.n = 5;
            break;
          }
          throw new _errorHandler.AppError("Failed to process ".concat(errorPages.length, " out of ").concat(totalPages, " pages (").concat(Math.round(errorRate * 100), "% failure rate)"), 500, "HIGH_FAILURE_RATE_ERROR");
        case 5:
          pagesContent = pagesContent.filter(function (page) {
            return !page.error;
          });
          if (!(pagesContent.length === 0)) {
            _context4.n = 6;
            break;
          }
          throw new _errorHandler.AppError("Pages content is empty", 500, "EMPTY_PAGE_CONTENT_ERROR");
        case 6:
          return _context4.a(2, pagesContent);
      }
    }, _callee3);
  }));
  return _extractPagesContent.apply(this, arguments);
}