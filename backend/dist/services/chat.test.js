"use strict";

var _globals = require("@jest/globals");
var _errorHandler = require("../middleware/errorHandler.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
_globals.jest.unstable_mockModule("../utils/supabase/client.js", function () {
  return {
    __esModule: true,
    "default": {
      from: _globals.jest.fn()
    }
  };
});
_globals.jest.unstable_mockModule("./parse.js", function () {
  return {
    __esModule: true,
    parse: _globals.jest.fn()
  };
});
_globals.jest.unstable_mockModule("./chat/queryClassifier.js", function () {
  return {
    __esModule: true,
    classifyQuery: _globals.jest.fn()
  };
});
_globals.jest.unstable_mockModule("./chat/contextBuilder.js", function () {
  return {
    __esModule: true,
    buildContext: _globals.jest.fn(),
    buildFullContext: _globals.jest.fn()
  };
});
_globals.jest.unstable_mockModule("../utils/openAi/callToChat.js", function () {
  return {
    __esModule: true,
    callToChat: _globals.jest.fn()
  };
});
_globals.jest.unstable_mockModule("./chat/systemPrompt.js", function () {
  return {
    __esModule: true,
    createSystemPrompt: _globals.jest.fn()
  };
});
var supabase = (await Promise.resolve().then(function () {
  return _interopRequireWildcard(require("../utils/supabase/client.js"));
}))["default"];
var _await$import = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./parse.js"));
  }),
  parse = _await$import.parse;
var _await$import2 = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./chat/queryClassifier.js"));
  }),
  classifyQuery = _await$import2.classifyQuery;
var _await$import3 = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./chat/contextBuilder.js"));
  }),
  buildContext = _await$import3.buildContext,
  buildFullContext = _await$import3.buildFullContext;
var _await$import4 = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("../utils/openAi/callToChat.js"));
  }),
  callToChat = _await$import4.callToChat;
var _await$import5 = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./chat/systemPrompt.js"));
  }),
  createSystemPrompt = _await$import5.createSystemPrompt;
var _await$import6 = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./chat.js"));
  }),
  chat = _await$import6.chat;
describe("chat function - production level tests", function () {
  var mockId = "parse-id";
  var mockSearch = "search query";
  var mockUserId = "user-123";
  var mockPages = [{
    id: "page1",
    content: "Page 1"
  }, {
    id: "page2",
    content: "Page 2"
  }];
  beforeEach(function () {
    _globals.jest.clearAllMocks();
    var eq2 = _globals.jest.fn().mockResolvedValue({
      data: [{
        pages_metadata: mockPages
      }],
      error: null
    });
    var eq1 = _globals.jest.fn().mockReturnValue({
      eq: eq2
    });
    var select = _globals.jest.fn().mockReturnValue({
      eq: eq1
    });
    supabase.from.mockReturnValue({
      select: select
    });
    classifyQuery.mockResolvedValue("search");
    parse.mockResolvedValue({
      success: true,
      searchResults: [{
        pageId: "page1",
        score: 0.9,
        startY: 0,
        endY: 100
      }]
    });
    buildContext.mockReturnValue("mock context");
    buildFullContext.mockReturnValue("full context");
    createSystemPrompt.mockReturnValue("system prompt");
    callToChat.mockResolvedValue("AI response");
  });
  test("returns AI response for valid search query", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var result;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          _context.n = 1;
          return chat(mockId, mockSearch, mockUserId);
        case 1:
          result = _context.v;
          expect(result).toEqual({
            success: true,
            response: "AI response"
          });
          expect(supabase.from).toHaveBeenCalledWith("files");
          expect(classifyQuery).toHaveBeenCalledWith(mockSearch);
          expect(parse).toHaveBeenCalledWith(mockId, mockSearch, mockUserId, {
            searchMode: "hybrid",
            topK: 7
          });
          expect(buildContext).toHaveBeenCalled();
          expect(callToChat).toHaveBeenCalled();
        case 2:
          return _context.a(2);
      }
    }, _callee);
  })));
  test("uses full context for direct query type", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var result;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          classifyQuery.mockResolvedValue("direct");
          _context2.n = 1;
          return chat(mockId, mockSearch, mockUserId);
        case 1:
          result = _context2.v;
          expect(buildFullContext).toHaveBeenCalledWith(mockPages);
          expect(result.response).toBe("AI response");
        case 2:
          return _context2.a(2);
      }
    }, _callee2);
  })));
  test("throws ValidationError for missing parse ID", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          _context3.n = 1;
          return expect(chat("", mockSearch, mockUserId)).rejects.toThrow(_errorHandler.ValidationError);
        case 1:
          return _context3.a(2);
      }
    }, _callee3);
  })));
  test("throws ValidationError for empty search", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          _context4.n = 1;
          return expect(chat(mockId, "   ", mockUserId)).rejects.toThrow(_errorHandler.ValidationError);
        case 1:
          return _context4.a(2);
      }
    }, _callee4);
  })));
  test("throws ValidationError for missing user ID", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          _context5.n = 1;
          return expect(chat(mockId, mockSearch, "")).rejects.toThrow(_errorHandler.ValidationError);
        case 1:
          return _context5.a(2);
      }
    }, _callee5);
  })));
  test("throws AppError when no files found", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
    var eq2, eq1, select;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.n) {
        case 0:
          eq2 = _globals.jest.fn().mockResolvedValue({
            data: [],
            error: null
          });
          eq1 = _globals.jest.fn().mockReturnValue({
            eq: eq2
          });
          select = _globals.jest.fn().mockReturnValue({
            eq: eq1
          });
          supabase.from.mockReturnValue({
            select: select
          });
          _context6.n = 1;
          return expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(_errorHandler.AppError);
        case 1:
          return _context6.a(2);
      }
    }, _callee6);
  })));
  test("throws AppError on Supabase error", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
    var eq2, eq1, select;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.n) {
        case 0:
          eq2 = _globals.jest.fn().mockResolvedValue({
            data: null,
            error: new Error("DB failure")
          });
          eq1 = _globals.jest.fn().mockReturnValue({
            eq: eq2
          });
          select = _globals.jest.fn().mockReturnValue({
            eq: eq1
          });
          supabase.from.mockReturnValue({
            select: select
          });
          _context7.n = 1;
          return expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(_errorHandler.AppError);
        case 1:
          return _context7.a(2);
      }
    }, _callee7);
  })));
  test("throws AppError when classifyQuery fails", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8() {
    return _regenerator().w(function (_context8) {
      while (1) switch (_context8.n) {
        case 0:
          classifyQuery.mockRejectedValue(new Error("classifier failure"));
          _context8.n = 1;
          return expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(_errorHandler.AppError);
        case 1:
          return _context8.a(2);
      }
    }, _callee8);
  })));
  test("throws AppError for invalid queryType", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
    return _regenerator().w(function (_context9) {
      while (1) switch (_context9.n) {
        case 0:
          classifyQuery.mockResolvedValue("unknown");
          _context9.n = 1;
          return expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(_errorHandler.AppError);
        case 1:
          return _context9.a(2);
      }
    }, _callee9);
  })));
  test("throws AppError when parse fails", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0() {
    return _regenerator().w(function (_context0) {
      while (1) switch (_context0.n) {
        case 0:
          parse.mockRejectedValue(new Error("parse failure"));
          _context0.n = 1;
          return expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(_errorHandler.AppError);
        case 1:
          return _context0.a(2);
      }
    }, _callee0);
  })));
  test("throws AppError when parse returns empty results", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1() {
    return _regenerator().w(function (_context1) {
      while (1) switch (_context1.n) {
        case 0:
          parse.mockResolvedValue({
            success: true,
            searchResults: []
          });
          _context1.n = 1;
          return expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(_errorHandler.AppError);
        case 1:
          return _context1.a(2);
      }
    }, _callee1);
  })));
  test("throws AppError when buildContext fails", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10() {
    return _regenerator().w(function (_context10) {
      while (1) switch (_context10.n) {
        case 0:
          buildContext.mockImplementation(function () {
            throw new Error("context fail");
          });
          _context10.n = 1;
          return expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(_errorHandler.AppError);
        case 1:
          return _context10.a(2);
      }
    }, _callee10);
  })));
  test("throws AppError when buildFullContext fails", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11() {
    return _regenerator().w(function (_context11) {
      while (1) switch (_context11.n) {
        case 0:
          classifyQuery.mockResolvedValue("direct");
          buildFullContext.mockImplementation(function () {
            throw new Error("full context fail");
          });
          _context11.n = 1;
          return expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(_errorHandler.AppError);
        case 1:
          return _context11.a(2);
      }
    }, _callee11);
  })));
  test("throws AppError when callToChat fails", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12() {
    return _regenerator().w(function (_context12) {
      while (1) switch (_context12.n) {
        case 0:
          callToChat.mockRejectedValue(new Error("AI fail"));
          _context12.n = 1;
          return expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(_errorHandler.AppError);
        case 1:
          return _context12.a(2);
      }
    }, _callee12);
  })));
  test("throws AppError when AI response is invalid", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13() {
    return _regenerator().w(function (_context13) {
      while (1) switch (_context13.n) {
        case 0:
          callToChat.mockResolvedValue(null);
          _context13.n = 1;
          return expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(_errorHandler.AppError);
        case 1:
          return _context13.a(2);
      }
    }, _callee13);
  })));
});