"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.callToOverview = callToOverview;
var _dotenv = _interopRequireDefault(require("dotenv"));
var _processMetrics = require("../processMetrics.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
_dotenv["default"].config();
var groqApiKey = process.env.GROQ_API_KEY;
var openaiApiKey = process.env.OPENAI_API_KEY;
function callToOverview(_x) {
  return _callToOverview.apply(this, arguments);
}
function _callToOverview() {
  _callToOverview = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(messages) {
    var model,
      temperature,
      maxTokens,
      userId,
      startTime,
      _data$usage,
      _data$usage2,
      _data$usage3,
      response,
      _errorData$error,
      _errorData$error2,
      errorData,
      _latency,
      _openaiData$usage,
      _openaiData$usage2,
      _openaiData$usage3,
      fallbackStartTime,
      openaiResponse,
      _openaiErrorData$erro,
      _openaiErrorData$erro2,
      openaiErrorData,
      _fallbackLatency,
      openaiData,
      fallbackLatency,
      _raw,
      _promptTokens,
      _completionTokens,
      _totalTokens,
      data,
      latency,
      raw,
      promptTokens,
      completionTokens,
      totalTokens,
      _args = arguments,
      _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          model = _args.length > 1 && _args[1] !== undefined ? _args[1] : "llama-3.3-70b-versatile";
          temperature = _args.length > 2 && _args[2] !== undefined ? _args[2] : 0.7;
          maxTokens = _args.length > 3 && _args[3] !== undefined ? _args[3] : 1000;
          userId = _args.length > 4 && _args[4] !== undefined ? _args[4] : null;
          startTime = Date.now();
          _context.p = 1;
          _context.n = 2;
          return fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: "Bearer ".concat(groqApiKey),
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: model,
              messages: messages,
              temperature: temperature,
              max_tokens: maxTokens
            })
          });
        case 2:
          response = _context.v;
          if (response.ok) {
            _context.n = 9;
            break;
          }
          _context.n = 3;
          return response.json()["catch"](function () {
            return {};
          });
        case 3:
          errorData = _context.v;
          _latency = Date.now() - startTime;
          if (!(response.status === 429 && model === "llama-3.3-70b-versatile")) {
            _context.n = 8;
            break;
          }
          (0, _processMetrics.trackLLMPerformance)({
            userId: userId,
            modelUsed: model,
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            latency: _latency,
            temperature: temperature,
            maxTokens: maxTokens,
            success: false,
            errorMessage: "Groq API rate limit: ".concat(response.status, " - Falling back to openai-4o-mini")
          });
          fallbackStartTime = Date.now();
          _context.n = 4;
          return fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: "Bearer ".concat(openaiApiKey),
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: messages,
              temperature: temperature,
              max_tokens: maxTokens
            })
          });
        case 4:
          openaiResponse = _context.v;
          if (openaiResponse.ok) {
            _context.n = 6;
            break;
          }
          _context.n = 5;
          return openaiResponse.json()["catch"](function () {
            return {};
          });
        case 5:
          openaiErrorData = _context.v;
          _fallbackLatency = Date.now() - fallbackStartTime;
          (0, _processMetrics.trackLLMPerformance)({
            userId: userId,
            modelUsed: "gpt-4o-mini",
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            latency: _fallbackLatency,
            temperature: temperature,
            maxTokens: maxTokens,
            success: false,
            errorMessage: "OpenAI API error: ".concat(openaiResponse.status, " - ").concat(((_openaiErrorData$erro = openaiErrorData.error) === null || _openaiErrorData$erro === void 0 ? void 0 : _openaiErrorData$erro.message) || openaiResponse.statusText)
          });
          throw new Error("OpenAI API error: ".concat(openaiResponse.status, " - ").concat(((_openaiErrorData$erro2 = openaiErrorData.error) === null || _openaiErrorData$erro2 === void 0 ? void 0 : _openaiErrorData$erro2.message) || openaiResponse.statusText));
        case 6:
          _context.n = 7;
          return openaiResponse.json();
        case 7:
          openaiData = _context.v;
          fallbackLatency = Date.now() - fallbackStartTime;
          _raw = openaiData.choices[0].message.content;
          _promptTokens = ((_openaiData$usage = openaiData.usage) === null || _openaiData$usage === void 0 ? void 0 : _openaiData$usage.prompt_tokens) || 0;
          _completionTokens = ((_openaiData$usage2 = openaiData.usage) === null || _openaiData$usage2 === void 0 ? void 0 : _openaiData$usage2.completion_tokens) || 0;
          _totalTokens = ((_openaiData$usage3 = openaiData.usage) === null || _openaiData$usage3 === void 0 ? void 0 : _openaiData$usage3.total_tokens) || 0;
          (0, _processMetrics.trackLLMPerformance)({
            userId: userId,
            modelUsed: "gpt-4o-mini",
            promptTokens: _promptTokens,
            completionTokens: _completionTokens,
            totalTokens: _totalTokens,
            latency: fallbackLatency,
            temperature: temperature,
            maxTokens: maxTokens,
            success: true,
            errorMessage: null
          });
          return _context.a(2, _raw);
        case 8:
          (0, _processMetrics.trackLLMPerformance)({
            userId: userId,
            modelUsed: model,
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            latency: _latency,
            temperature: temperature,
            maxTokens: maxTokens,
            success: false,
            errorMessage: "Groq API error: ".concat(response.status, " - ").concat(((_errorData$error = errorData.error) === null || _errorData$error === void 0 ? void 0 : _errorData$error.message) || response.statusText)
          });
          throw new Error("Groq API error: ".concat(response.status, " - ").concat(((_errorData$error2 = errorData.error) === null || _errorData$error2 === void 0 ? void 0 : _errorData$error2.message) || response.statusText));
        case 9:
          _context.n = 10;
          return response.json();
        case 10:
          data = _context.v;
          latency = Date.now() - startTime;
          raw = data.choices[0].message.content;
          promptTokens = ((_data$usage = data.usage) === null || _data$usage === void 0 ? void 0 : _data$usage.prompt_tokens) || 0;
          completionTokens = ((_data$usage2 = data.usage) === null || _data$usage2 === void 0 ? void 0 : _data$usage2.completion_tokens) || 0;
          totalTokens = ((_data$usage3 = data.usage) === null || _data$usage3 === void 0 ? void 0 : _data$usage3.total_tokens) || 0;
          (0, _processMetrics.trackLLMPerformance)({
            userId: userId,
            modelUsed: model,
            promptTokens: promptTokens,
            completionTokens: completionTokens,
            totalTokens: totalTokens,
            latency: latency,
            temperature: temperature,
            maxTokens: maxTokens,
            success: true,
            errorMessage: null
          });
          return _context.a(2, raw);
        case 11:
          _context.p = 11;
          _t = _context.v;
          console.error("Error calling Groq API:", _t);
          throw _t;
        case 12:
          return _context.a(2);
      }
    }, _callee, null, [[1, 11]]);
  }));
  return _callToOverview.apply(this, arguments);
}