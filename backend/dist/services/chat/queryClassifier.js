"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.classifyQuery = classifyQuery;
var _callToChat = require("../../utils/openAi/callToChat.js");
var _errorHandler = require("../../middleware/errorHandler.js");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function classifyQuery(_x) {
  return _classifyQuery.apply(this, arguments);
}
function _classifyQuery() {
  _classifyQuery = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(query) {
    var directQueryPatterns, _i, _directQueryPatterns, pattern, classificationPrompt, messages, response, classification, _t, _t2;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          _context.p = 0;
          if (!(!query || typeof query !== "string" || !query.trim())) {
            _context.n = 1;
            break;
          }
          throw new _errorHandler.ValidationError("Query is required");
        case 1:
          directQueryPatterns = [/^(give me|provide|show me|tell me).*(summary|summarize|overview|overview of|summary of)/i, /^(what is|what's).*(this document|this file|this).*(about|contain)/i, /^(summarize|summary|overview|explain this document|what are the key takeaways)/i, /^(can you|could you).*(summarize|give.*summary|provide.*summary)/i, /^(what does|what do).*(this|the document).*(contain|cover|discuss)/i];
          _i = 0, _directQueryPatterns = directQueryPatterns;
        case 2:
          if (!(_i < _directQueryPatterns.length)) {
            _context.n = 4;
            break;
          }
          pattern = _directQueryPatterns[_i];
          if (!pattern.test(query)) {
            _context.n = 3;
            break;
          }
          return _context.a(2, "direct");
        case 3:
          _i++;
          _context.n = 2;
          break;
        case 4:
          classificationPrompt = "Classify the following user query into one of two categories:\n\n1. \"search\" - The query requires searching through specific documents to find information (e.g., \"What is the budget for Q3?\", \"Find mentions of marketing strategy\", \"What does the document say about X?\", \"When was project Y completed?\")\n\n2. \"direct\" - The query is a general question, request for summary/overview, or can be answered using the full document context without targeted search (e.g., \"Give me a summary\", \"What is this document about?\", \"Summarize the main points\", \"Explain this document\", \"What are the key takeaways?\", \"What topics are covered?\")\n\nUser query: \"".concat(query, "\"\n\nRespond with ONLY one word: either \"search\" or \"direct\".");
          messages = [{
            role: "system",
            content: "You are a query classification assistant. Respond with only one word: 'search' or 'direct'."
          }, {
            role: "user",
            content: classificationPrompt
          }];
          _context.p = 5;
          _context.n = 6;
          return (0, _callToChat.callToChat)(messages, "gpt-4o-mini", 0.1, 10);
        case 6:
          response = _context.v;
          _context.n = 9;
          break;
        case 7:
          _context.p = 7;
          _t = _context.v;
          if (!_t.isOperational) {
            _context.n = 8;
            break;
          }
          throw _t;
        case 8:
          throw new _errorHandler.AppError("Failed to classify query: ".concat(_t.message), 500, "CLASSIFY_QUERY_ERROR");
        case 9:
          if (response) {
            _context.n = 10;
            break;
          }
          throw new _errorHandler.AppError("Invalid classification response", 500, "INVALID_CLASSIFICATION_RESPONSE");
        case 10:
          classification = response.trim().toLowerCase();
          console.log(classification === "direct" ? "direct" : "search");
          return _context.a(2, classification === "direct" ? "direct" : "search");
        case 11:
          _context.p = 11;
          _t2 = _context.v;
          if (!_t2.isOperational) {
            _context.n = 12;
            break;
          }
          throw _t2;
        case 12:
          throw new _errorHandler.AppError("Failed to classify query: ".concat(_t2.message), 500, "CLASSIFY_QUERY_ERROR");
        case 13:
          return _context.a(2);
      }
    }, _callee, null, [[5, 7], [0, 11]]);
  }));
  return _classifyQuery.apply(this, arguments);
}