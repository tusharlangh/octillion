"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.overview = overview;
var _callToOverview = require("../utils/callsAi/callToOverview.js");
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
function overview(_x, _x2) {
  return _overview.apply(this, arguments);
}
function _overview() {
  _overview = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(hybridSearchResults, search) {
    var userId,
      context,
      scores,
      avgScore,
      topScore,
      prompt,
      messages,
      _args = arguments,
      _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          userId = _args.length > 2 && _args[2] !== undefined ? _args[2] : null;
          context = hybridSearchResults.map(function (result, idx) {
            return "SOURCE [".concat(idx + 1, "]: ").concat(result.file_name, " (Page ").concat(result.page_number, ")\nRELEVANCE: ").concat((result.rrf_score * 100).toFixed(1), "%\nTEXT: ").concat(result.text);
          }).join("\n\n---\n\n");
          scores = hybridSearchResults.map(function (r) {
            return r.rrf_score || 0;
          });
          avgScore = scores.reduce(function (sum, score) {
            return sum + score;
          }, 0) / scores.length;
          topScore = Math.max.apply(Math, _toConsumableArray(scores));
          (0, _processMetrics.trackRAGRetrieval)({
            userId: userId,
            parseId: null,
            query: search,
            retrievedChunks: hybridSearchResults.length,
            avgRelevanceScore: avgScore,
            topScore: topScore,
            contextLength: context.length,
            retrievalLatency: 0
          });
          prompt = "You are a highly accurate AI assistant powering an enterprise search system. Your role is to generate concise, trustworthy overviews from document search results.\nSEARCH RESULTS FOR: \"".concat(search, "\"\n").concat(context, "\nGENERATION GUIDELINES:\n**Primary Objective:** Give users the answer they need without requiring them to read full documents.\n**Answer Format:**\n1. **Opening Statement** (required): Direct answer to the query in 1-2 clear sentences\n2. **Supporting Details** (if relevant): Expand on the answer with key facts, context, or explanation\n3. **Additional Context** (if helpful): Related information that enhances understanding\n**Citation Rules:**\n- Every factual claim MUST have a citation: [1], [2], etc.\n- Multiple sources for the same point: [1][2]\n- Place citation at the end of the sentence or claim\n- Example: \"The revenue grew 25% year-over-year [1], driven primarily by international expansion [2].\"\n**Confidence Indicators:**\n- High confidence: State facts directly (\"The deadline is March 15 [1]\")\n- Medium confidence: Use qualifiers (\"The documents suggest...\" or \"According to [1]...\")\n- Low confidence: Be explicit (\"The available information doesn't fully address this, but [1] mentions...\")\n**When Information is Missing:**\n\"I found information about [what you found], but the documents don't contain details about [what's missing]. Here's what I can tell you: [partial answer with citations].\"\n**Formatting Best Practices:**\n- Use **bold** for critical information (dates, numbers, key decisions)\n- Use bullet points when presenting 3+ related items:\n  - Item one [1]\n  - Item two [2]\n  - Item three [3]\n- Use short paragraphs (2-4 sentences)\n- Add line breaks between distinct topics\n**Strict Rules:**\n\u26A0\uFE0F NEVER invent information not in the sources\n\u26A0\uFE0F NEVER use general knowledge - ONLY use provided context\n\u26A0\uFE0F NEVER say \"I don't know\" - instead say \"The documents don't contain information about X\"\n\u26A0\uFE0F NEVER exceed 250 words\n**Tone:** Professional, confident, helpful, and precise.\nGenerate the AI Overview now:");
          messages = [{
            role: "system",
            content: prompt
          }, {
            role: "user",
            content: "Context:\n".concat(context, "\n\nQ: ").concat(search)
          }];
          _context.n = 1;
          return (0, _callToOverview.callToOverview)(messages, "llama-3.3-70b-versatile", 0.7, 1000, userId);
        case 1:
          _t = _context.v;
          return _context.a(2, {
            success: true,
            response: _t
          });
      }
    }, _callee);
  }));
  return _overview.apply(this, arguments);
}