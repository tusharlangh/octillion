"use strict";

var _globals = require("@jest/globals");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
_globals.jest.unstable_mockModule("./searchRewrite.js", function () {
  return {
    __esModule: true,
    SearchRewrite: _globals.jest.fn()
  };
});
_globals.jest.unstable_mockModule("../utils/supabase/client.js", function () {
  return {
    __esModule: true,
    "default": {
      from: _globals.jest.fn()
    }
  };
});
_globals.jest.unstable_mockModule("./qdrantService.js", function () {
  return {
    __esModule: true,
    searchQdrant: _globals.jest.fn()
  };
});
_globals.jest.unstable_mockModule("../utils/MinHeap.js", function () {
  return {
    __esModule: true,
    MinHeap: _globals.jest.fn().mockImplementation(function () {
      return {
        push: _globals.jest.fn(),
        toArray: _globals.jest.fn().mockReturnValue([])
      };
    })
  };
});
_globals.jest.unstable_mockModule("./parse/embedding.js", function () {
  return {
    __esModule: true,
    generateEmbedding: _globals.jest.fn()
  };
});
_globals.jest.unstable_mockModule("./parse/searchIndex.js", function () {
  return {
    __esModule: true,
    searchBuildIndex: _globals.jest.fn(),
    searchContent: _globals.jest.fn()
  };
});
_globals.jest.unstable_mockModule("./parse/chunks.js", function () {
  return {
    __esModule: true,
    createContextualChunks: _globals.jest.fn()
  };
});
var _await$import = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./searchRewrite.js"));
  }),
  SearchRewrite = _await$import.SearchRewrite;
var supabase = (await Promise.resolve().then(function () {
  return _interopRequireWildcard(require("../utils/supabase/client.js"));
}))["default"];
var _await$import2 = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./qdrantService.js"));
  }),
  searchQdrant = _await$import2.searchQdrant;
var _await$import3 = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("../utils/MinHeap.js"));
  }),
  MinHeap = _await$import3.MinHeap;
var _await$import4 = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./parse/embedding.js"));
  }),
  generateEmbedding = _await$import4.generateEmbedding;
var _await$import5 = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./parse/searchIndex.js"));
  }),
  searchBuildIndex = _await$import5.searchBuildIndex,
  searchContent = _await$import5.searchContent;
var _await$import6 = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./parse.js"));
  }),
  parse = _await$import6.parse;
var mockId = "file123";
var mockUser = "user123";
var mockSearchText = "hello world";
var mockRow = {
  pages_metadata: [{
    id: "1",
    content: "abc"
  }],
  inverted_index: {
    hello: [0]
  },
  build_index: {
    1: {
      chunks: []
    }
  }
};
function mockSupabase() {
  var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [mockRow];
  var error = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var eq2 = _globals.jest.fn().mockResolvedValue({
    data: data,
    error: error
  });
  var id = _globals.jest.fn().mockReturnValue({
    eq: eq2
  });
  var select = _globals.jest.fn().mockReturnValue({
    eq: id
  });
  supabase.from.mockReturnValue({
    select: select
  });
}
describe("parse()", function () {
  beforeEach(function () {
    _globals.jest.clearAllMocks();
    mockSupabase();
    SearchRewrite.mockImplementation(function () {
      return {
        process: function process() {
          return ["hello", "world"];
        }
      };
    });
  });
  test("throws when rewrite returns empty string", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          SearchRewrite.mockImplementation(function () {
            return {
              process: function process() {
                return "";
              }
            };
          });
          _context.n = 1;
          return expect(parse(mockId, mockSearchText, mockUser)).rejects.toThrow("Rewriting search came out empty");
        case 1:
          return _context.a(2);
      }
    }, _callee);
  })));
  test("throws when rewrite returns empty array", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          SearchRewrite.mockImplementation(function () {
            return {
              process: function process() {
                return [];
              }
            };
          });
          _context2.n = 1;
          return expect(parse(mockId, mockSearchText, mockUser)).rejects.toThrow("Rewriting search came out empty");
        case 1:
          return _context2.a(2);
      }
    }, _callee2);
  })));
  test("throws Supabase error when supabase returns error", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          mockSupabase(null, {
            message: "db broken"
          });
          _context3.n = 1;
          return expect(parse(mockId, mockSearchText, mockUser)).rejects.toThrow("Failed to fetch files: db broken");
        case 1:
          return _context3.a(2);
      }
    }, _callee3);
  })));
  test("returns success empty array when supabase returns no rows", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
    var res;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          mockSupabase([]);
          _context4.n = 1;
          return parse(mockId, mockSearchText, mockUser);
        case 1:
          res = _context4.v;
          expect(res).toEqual({
            success: true,
            searchResults: []
          });
        case 2:
          return _context4.a(2);
      }
    }, _callee4);
  })));
  test("throws when row missing metadata/index", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          mockSupabase([{
            pages_metadata: null
          }]);
          _context5.n = 1;
          return expect(parse(mockId, mockSearchText, mockUser)).rejects.toThrow("Invalid or incomplete data row");
        case 1:
          return _context5.a(2);
      }
    }, _callee5);
  })));
  test("semantic: returns empty when embedding empty", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
    var res;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.n) {
        case 0:
          generateEmbedding.mockResolvedValue([]);
          _context6.n = 1;
          return parse(mockId, mockSearchText, mockUser, {
            searchMode: "semantic"
          });
        case 1:
          res = _context6.v;
          expect(res.success).toBe(true);
          expect(res.searchResults).toEqual([]);
        case 2:
          return _context6.a(2);
      }
    }, _callee6);
  })));
  test("semantic: returns semantic results", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
    var res;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.n) {
        case 0:
          generateEmbedding.mockResolvedValue([0.1, 0.2]);
          searchQdrant.mockResolvedValue([{
            pageId: "1",
            score: 0.9,
            startY: 0,
            endY: 0
          }]);
          _context7.n = 1;
          return parse(mockId, mockSearchText, mockUser, {
            searchMode: "semantic"
          });
        case 1:
          res = _context7.v;
          expect(res.success).toBe(true);
          expect(res.searchResults.length).toBe(1);
        case 2:
          return _context7.a(2);
      }
    }, _callee7);
  })));
  test("tfidf: empty keyword scores → returns empty", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8() {
    var res;
    return _regenerator().w(function (_context8) {
      while (1) switch (_context8.n) {
        case 0:
          searchContent.mockResolvedValue({});
          _context8.n = 1;
          return parse(mockId, mockSearchText, mockUser, {
            searchMode: "tfidf"
          });
        case 1:
          res = _context8.v;
          expect(res.searchResults).toEqual([]);
        case 2:
          return _context8.a(2);
      }
    }, _callee8);
  })));
  test("tfidf: returns keyword results", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
    var res;
    return _regenerator().w(function (_context9) {
      while (1) switch (_context9.n) {
        case 0:
          searchContent.mockResolvedValue({
            1: 5
          });
          searchBuildIndex.mockReturnValue([{
            pageId: "1",
            y: 10,
            score: 5
          }]);
          _context9.n = 1;
          return parse(mockId, mockSearchText, mockUser, {
            searchMode: "tfidf"
          });
        case 1:
          res = _context9.v;
          expect(res.searchResults.length).toBe(1);
        case 2:
          return _context9.a(2);
      }
    }, _callee9);
  })));
  test("hybrid: both semantic + keyword empty → empty results", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0() {
    var res;
    return _regenerator().w(function (_context0) {
      while (1) switch (_context0.n) {
        case 0:
          generateEmbedding.mockResolvedValue([0.2]);
          searchQdrant.mockResolvedValue([]);
          searchContent.mockResolvedValue({}); //returns promise due to async
          searchBuildIndex.mockReturnValue([]); //returns actual value
          _context0.n = 1;
          return parse(mockId, mockSearchText, mockUser, {
            searchMode: "hybrid"
          });
        case 1:
          res = _context0.v;
          expect(res.searchResults).toEqual([]);
        case 2:
          return _context0.a(2);
      }
    }, _callee0);
  })));
  test("hybrid: merges keyword + semantic results", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1() {
    var res;
    return _regenerator().w(function (_context1) {
      while (1) switch (_context1.n) {
        case 0:
          generateEmbedding.mockResolvedValue([0.2]);
          searchQdrant.mockResolvedValue([{
            pageId: "1",
            score: 0.9,
            startY: 0,
            endY: 0
          }]);
          searchContent.mockResolvedValue({
            1: 5
          });
          searchBuildIndex.mockReturnValue([{
            pageId: "1",
            y: 0,
            score: 5
          }]);
          MinHeap.mockImplementation(function () {
            return {
              push: _globals.jest.fn(),
              toArray: function toArray() {
                return [{
                  pageId: "1",
                  score: 0.7,
                  startY: 0,
                  endY: 0
                }];
              }
            };
          });
          _context1.n = 1;
          return parse(mockId, mockSearchText, mockUser, {
            searchMode: "hybrid",
            topK: 5
          });
        case 1:
          res = _context1.v;
          expect(res.success).toBe(true);
          expect(res.searchResults.length).toBe(1);
        case 2:
          return _context1.a(2);
      }
    }, _callee1);
  })));
  test("wraps unknown errors in SYSTEM_ERROR", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10() {
    return _regenerator().w(function (_context10) {
      while (1) switch (_context10.n) {
        case 0:
          SearchRewrite.mockImplementation(function () {
            throw new Error("boom");
          });
          _context10.n = 1;
          return expect(parse(mockId, mockSearchText, mockUser)).rejects.toThrow("System error: boom");
        case 1:
          return _context10.a(2);
      }
    }, _callee10);
  })));
});