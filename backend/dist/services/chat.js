"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.chat = chat;
var _client = _interopRequireDefault(require("../utils/supabase/client.js"));
var _parse = require("./parse.js");
var _callToChat = require("../utils/openAi/callToChat.js");
var _errorHandler = require("../middleware/errorHandler.js");
var _queryClassifier = require("./chat/queryClassifier.js");
var _contextBuilder = require("./chat/contextBuilder.js");
var _systemPrompt = require("./chat/systemPrompt.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function chat(_x, _x2, _x3) {
  return _chat.apply(this, arguments);
}
function _chat() {
  _chat = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(id, search, userId) {
    var _yield$supabase$from$, data, error, fileData, pagesContent, queryType, context, searchResults, uniquePageIds, _iterator, _step, result, matchedPages, messages, temperature, maxTokens, aiResponse, _t, _t2, _t3, _t4, _t5, _t6;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.p = 0;
          if (!(!id || typeof id !== "string")) {
            _context.n = 1;
            break;
          }
          throw new _errorHandler.ValidationError("Parse ID is required");
        case 1:
          if (!(!search || typeof search !== "string" || !search.trim())) {
            _context.n = 2;
            break;
          }
          throw new _errorHandler.ValidationError("Search query is required");
        case 2:
          if (!(!userId || typeof userId !== "string")) {
            _context.n = 3;
            break;
          }
          throw new _errorHandler.ValidationError("User ID is required");
        case 3:
          _context.n = 4;
          return _client["default"].from("files").select("*").eq("user_id", userId).eq("parse_id", id);
        case 4:
          _yield$supabase$from$ = _context.v;
          data = _yield$supabase$from$.data;
          error = _yield$supabase$from$.error;
          if (!error) {
            _context.n = 5;
            break;
          }
          throw new _errorHandler.AppError("Failed to fetch files: ".concat(error.message), 500, "SUPABASE_ERROR");
        case 5:
          if (!(!data || data.length === 0)) {
            _context.n = 6;
            break;
          }
          throw new _errorHandler.AppError("No files found for the given parse ID", 404, "NO_FILES_FOUND");
        case 6:
          fileData = data[0];
          if (fileData) {
            _context.n = 7;
            break;
          }
          throw new _errorHandler.AppError("Invalid file data", 500, "INVALID_FILE_DATA");
        case 7:
          pagesContent = fileData.pages_metadata;
          if (!(!pagesContent || pagesContent.length === 0)) {
            _context.n = 8;
            break;
          }
          throw new _errorHandler.AppError("Pages metadata is empty", 500, "EMPTY_PAGES_METADATA");
        case 8:
          _context.p = 8;
          _context.n = 9;
          return (0, _queryClassifier.classifyQuery)(search);
        case 9:
          queryType = _context.v;
          _context.n = 12;
          break;
        case 10:
          _context.p = 10;
          _t = _context.v;
          if (!_t.isOperational) {
            _context.n = 11;
            break;
          }
          throw _t;
        case 11:
          throw new _errorHandler.AppError("Failed to classify query: ".concat(_t.message), 500, "CLASSIFY_QUERY_ERROR");
        case 12:
          if (!(!queryType || queryType !== "direct" && queryType !== "search")) {
            _context.n = 13;
            break;
          }
          throw new _errorHandler.AppError("Invalid query type", 500, "INVALID_QUERY_TYPE");
        case 13:
          if (!(queryType === "direct")) {
            _context.n = 18;
            break;
          }
          _context.p = 14;
          context = (0, _contextBuilder.buildFullContext)(pagesContent);
          _context.n = 17;
          break;
        case 15:
          _context.p = 15;
          _t2 = _context.v;
          if (!_t2.isOperational) {
            _context.n = 16;
            break;
          }
          throw _t2;
        case 16:
          throw new _errorHandler.AppError("Failed to build full context: ".concat(_t2.message), 500, "BUILD_FULL_CONTEXT_ERROR");
        case 17:
          _context.n = 28;
          break;
        case 18:
          _context.p = 18;
          _context.n = 19;
          return (0, _parse.parse)(id, search, userId, {
            searchMode: "hybrid",
            topK: 7
          });
        case 19:
          searchResults = _context.v;
          _context.n = 22;
          break;
        case 20:
          _context.p = 20;
          _t3 = _context.v;
          if (!_t3.isOperational) {
            _context.n = 21;
            break;
          }
          throw _t3;
        case 21:
          throw new _errorHandler.AppError("Failed to parse search: ".concat(_t3.message), 500, "PARSE_SEARCH_ERROR");
        case 22:
          if (!(!searchResults || !searchResults.success || !searchResults.searchResults || searchResults.searchResults.length === 0)) {
            _context.n = 23;
            break;
          }
          throw new _errorHandler.AppError("No search results found", 404, "NO_SEARCH_RESULTS");
        case 23:
          uniquePageIds = new Set();
          _iterator = _createForOfIteratorHelper(searchResults.searchResults);
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              result = _step.value;
              if (result && result.pageId) {
                uniquePageIds.add(result.pageId);
              }
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
          if (!(uniquePageIds.size === 0)) {
            _context.n = 24;
            break;
          }
          throw new _errorHandler.AppError("No valid page IDs in search results", 500, "NO_VALID_PAGE_IDS");
        case 24:
          matchedPages = pagesContent.filter(function (page) {
            return page && page.id && uniquePageIds.has(page.id);
          });
          if (!(matchedPages.length === 0)) {
            _context.n = 25;
            break;
          }
          throw new _errorHandler.AppError("No matching pages found", 404, "NO_MATCHING_PAGES");
        case 25:
          _context.p = 25;
          context = (0, _contextBuilder.buildContext)(searchResults.searchResults, matchedPages);
          _context.n = 28;
          break;
        case 26:
          _context.p = 26;
          _t4 = _context.v;
          if (!_t4.isOperational) {
            _context.n = 27;
            break;
          }
          throw _t4;
        case 27:
          throw new _errorHandler.AppError("Failed to build context: ".concat(_t4.message), 500, "BUILD_CONTEXT_ERROR");
        case 28:
          if (!(!context || typeof context !== "string" || !context.trim())) {
            _context.n = 29;
            break;
          }
          throw new _errorHandler.AppError("Failed to generate context", 500, "CONTEXT_GENERATION_ERROR");
        case 29:
          messages = [{
            role: "system",
            content: (0, _systemPrompt.createSystemPrompt)(queryType)
          }, {
            role: "user",
            content: "Context:\n".concat(context, "\n\nQ: ").concat(search)
          }];
          temperature = queryType === "direct" ? 0.4 : 0.3;
          maxTokens = queryType === "direct" ? 1200 : 800;
          _context.p = 30;
          _context.n = 31;
          return (0, _callToChat.callToChat)(messages, "gpt-4o-mini", temperature, maxTokens);
        case 31:
          aiResponse = _context.v;
          _context.n = 34;
          break;
        case 32:
          _context.p = 32;
          _t5 = _context.v;
          if (!_t5.isOperational) {
            _context.n = 33;
            break;
          }
          throw _t5;
        case 33:
          throw new _errorHandler.AppError("Failed to get AI response: ".concat(_t5.message), 500, "AI_RESPONSE_ERROR");
        case 34:
          if (!(!aiResponse || typeof aiResponse !== "string")) {
            _context.n = 35;
            break;
          }
          throw new _errorHandler.AppError("Invalid AI response", 500, "INVALID_AI_RESPONSE");
        case 35:
          console.log("here is the ai response: ", aiResponse);
          return _context.a(2, {
            success: true,
            response: aiResponse
          });
        case 36:
          _context.p = 36;
          _t6 = _context.v;
          if (!_t6.isOperational) {
            _context.n = 37;
            break;
          }
          throw _t6;
        case 37:
          throw new _errorHandler.AppError("Chat error: ".concat(_t6.message), 500, "CHAT_ERROR");
        case 38:
          return _context.a(2);
      }
    }, _callee, null, [[30, 32], [25, 26], [18, 20], [14, 15], [8, 10], [0, 36]]);
  }));
  return _chat.apply(this, arguments);
}