"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.chat = chat;
var _callToChat = require("../utils/callsAi/callToChat.js");
var _errorHandler = require("../middleware/errorHandler.js");
var _systemPrompt = require("./chat/systemPrompt.js");
var _parse = require("./parse.js");
var _contextBuilder = require("./chat/contextBuilder.js");
var _processMetrics = require("../utils/processMetrics.js");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function chat(_x, _x2, _x3) {
  return _chat.apply(this, arguments);
}
function _chat() {
  _chat = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(id, search, userId) {
    var chatStartTime, searchLatency, contextBuildLatency, llmLatency, searchStartTime, parsedResult, hybridResults, scores, avgScore, topScore, contextBuildStartTime, context, messages, aiResponse, llmStartTime, totalLatency, _totalLatency, _t, _t2;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          chatStartTime = Date.now();
          searchLatency = 0;
          contextBuildLatency = 0;
          llmLatency = 0;
          _context.p = 1;
          if (!(!id || typeof id !== "string")) {
            _context.n = 2;
            break;
          }
          throw new _errorHandler.ValidationError("Parse ID is required");
        case 2:
          if (!(!search || typeof search !== "string" || !search.trim())) {
            _context.n = 3;
            break;
          }
          throw new _errorHandler.ValidationError("Search query is required");
        case 3:
          if (!(!userId || typeof userId !== "string")) {
            _context.n = 4;
            break;
          }
          throw new _errorHandler.ValidationError("User ID is required");
        case 4:
          searchStartTime = Date.now();
          _context.n = 5;
          return (0, _parse.parse_v2)(id, search, userId);
        case 5:
          parsedResult = _context.v;
          searchLatency = Date.now() - searchStartTime;
          if (parsedResult.success) {
            _context.n = 6;
            break;
          }
          throw new _errorHandler.AppError("failed to generate parsedResult");
        case 6:
          hybridResults = parsedResult.result;
          if (!(hybridResults.length === 0)) {
            _context.n = 7;
            break;
          }
          throw new _errorHandler.AppError("Hybrid results are empty");
        case 7:
          scores = hybridResults.map(function (r) {
            return r.rrf_score || 0;
          });
          avgScore = scores.reduce(function (sum, score) {
            return sum + score;
          }, 0) / scores.length;
          topScore = Math.max.apply(Math, _toConsumableArray(scores));
          contextBuildStartTime = Date.now();
          context = (0, _contextBuilder.buildContext)(hybridResults);
          contextBuildLatency = Date.now() - contextBuildStartTime;
          if (!(!context || typeof context !== "string" || !context.trim())) {
            _context.n = 8;
            break;
          }
          throw new _errorHandler.AppError("Failed to generate context", 500, "CONTEXT_GENERATION_ERROR");
        case 8:
          (0, _processMetrics.trackRAGRetrieval)({
            userId: userId,
            parseId: id,
            query: search,
            retrievedChunks: hybridResults.length,
            avgRelevanceScore: avgScore,
            topScore: topScore,
            contextLength: context.length,
            retrievalLatency: searchLatency + contextBuildLatency
          });
          messages = [{
            role: "system",
            content: (0, _systemPrompt.createSystemPrompt)()
          }, {
            role: "user",
            content: "Context:\n".concat(context, "\n\nQ: ").concat(search)
          }];
          llmStartTime = Date.now();
          _context.p = 9;
          _context.n = 10;
          return (0, _callToChat.callToChat)(messages, "llama-3.3-70b-versatile", 0.7, 1000, userId);
        case 10:
          aiResponse = _context.v;
          llmLatency = Date.now() - llmStartTime;
          _context.n = 13;
          break;
        case 11:
          _context.p = 11;
          _t = _context.v;
          llmLatency = Date.now() - llmStartTime;
          if (!_t.isOperational) {
            _context.n = 12;
            break;
          }
          throw _t;
        case 12:
          throw new _errorHandler.AppError("Failed to get AI response: ".concat(_t.message), 500, "AI_RESPONSE_ERROR");
        case 13:
          if (!(!aiResponse || typeof aiResponse !== "string")) {
            _context.n = 14;
            break;
          }
          throw new _errorHandler.AppError("Invalid AI response", 500, "INVALID_AI_RESPONSE");
        case 14:
          console.log("here is the ai response: ", aiResponse);
          totalLatency = Date.now() - chatStartTime;
          (0, _processMetrics.trackChatMetrics)({
            userId: userId,
            parseId: id,
            query: search,
            queryLength: search.length,
            totalLatency: totalLatency,
            searchLatency: searchLatency,
            contextBuildLatency: contextBuildLatency,
            llmLatency: llmLatency,
            contextLength: context.length,
            contextChunkCount: hybridResults.length,
            responseLength: aiResponse.length,
            modelUsed: "llama-3.3-70b-versatile",
            success: true,
            errorMessage: null
          });
          return _context.a(2, {
            success: true,
            response: aiResponse
          });
        case 15:
          _context.p = 15;
          _t2 = _context.v;
          _totalLatency = Date.now() - chatStartTime;
          (0, _processMetrics.trackChatMetrics)({
            userId: userId,
            parseId: id,
            query: search,
            queryLength: search.length,
            totalLatency: _totalLatency,
            searchLatency: searchLatency,
            contextBuildLatency: contextBuildLatency,
            llmLatency: llmLatency,
            contextLength: 0,
            contextChunkCount: 0,
            responseLength: 0,
            modelUsed: "llama-3.3-70b-versatile",
            success: false,
            errorMessage: _t2.message
          });
          if (!_t2.isOperational) {
            _context.n = 16;
            break;
          }
          throw _t2;
        case 16:
          throw new _errorHandler.AppError("Chat error: ".concat(_t2.message), 500, "CHAT_ERROR");
        case 17:
          return _context.a(2);
      }
    }, _callee, null, [[9, 11], [1, 15]]);
  }));
  return _chat.apply(this, arguments);
}