"use strict";

var _globals = require("@jest/globals");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
_globals.jest.unstable_mockModule("./saveFiles/upload.js", function () {
  return {
    uploadFilesToS3: _globals.jest.fn(),
    createPresignedUrls: _globals.jest.fn()
  };
});
_globals.jest.unstable_mockModule("./saveFiles/parser.js", function () {
  return {
    extractPagesContent: _globals.jest.fn()
  };
});
_globals.jest.unstable_mockModule("./saveFiles/indexing.js", function () {
  return {
    createInvertedSearch: _globals.jest.fn(),
    buildOptimizedIndex: _globals.jest.fn(),
    generateChunks: _globals.jest.fn()
  };
});
_globals.jest.unstable_mockModule("./saveFiles/embeddings.js", function () {
  return {
    generateAndUploadEmbeddings: _globals.jest.fn()
  };
});
_globals.jest.unstable_mockModule("./saveFiles/persist.js", function () {
  return {
    saveFilesRecord: _globals.jest.fn()
  };
});
var _await$import = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./saveFiles/upload.js"));
  }),
  uploadFilesToS3 = _await$import.uploadFilesToS3,
  createPresignedUrls = _await$import.createPresignedUrls;
var _await$import2 = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./saveFiles/parser.js"));
  }),
  extractPagesContent = _await$import2.extractPagesContent;
var _await$import3 = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./saveFiles/indexing.js"));
  }),
  createInvertedSearch = _await$import3.createInvertedSearch,
  buildOptimizedIndex = _await$import3.buildOptimizedIndex,
  generateChunks = _await$import3.generateChunks;
var _await$import4 = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./saveFiles/embeddings.js"));
  }),
  generateAndUploadEmbeddings = _await$import4.generateAndUploadEmbeddings;
var _await$import5 = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./saveFiles/persist.js"));
  }),
  saveFilesRecord = _await$import5.saveFilesRecord;
var _await$import6 = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("./saveFiles.js"));
  }),
  saveFiles = _await$import6.saveFiles;
var _await$import7 = await Promise.resolve().then(function () {
    return _interopRequireWildcard(require("../middleware/errorHandler.js"));
  }),
  AppError = _await$import7.AppError;
describe("saveFiles", function () {
  var mockId = "parse-id-123";
  var mockUserId = "user-456";
  var mockFiles = [{
    originalname: "file1.pdf",
    buffer: Buffer.from("pdf1")
  }, {
    originalname: "file2.pdf",
    buffer: Buffer.from("pdf2")
  }];
  var mockS3Keys = [{
    key: "files/parse-id-123/0/file1.pdf",
    file_name: "file1.pdf",
    mimetype: "application/pdf"
  }, {
    key: "files/parse-id-123/1/file2.pdf",
    file_name: "file2.pdf",
    mimetype: "application/pdf"
  }];
  var mockPresignedUrls = [{
    file_name: "file1.pdf",
    file_type: "application/pdf",
    presignedUrl: "https://example.com/file1.pdf"
  }, {
    file_name: "file2.pdf",
    file_type: "application/pdf",
    presignedUrl: "https://example.com/file2.pdf"
  }];
  var mockPagesContent = [{
    id: "1.1",
    name: "file1.pdf",
    site_content: "hello world",
    total_words: 2,
    mapping: []
  }, {
    id: "2.1",
    name: "file2.pdf",
    site_content: "another document",
    total_words: 2,
    mapping: []
  }];
  var mockPagesWithChunks = mockPagesContent.map(function (page) {
    return _objectSpread(_objectSpread({}, page), {}, {
      chunks: [{
        text: page.site_content,
        startY: 200,
        endY: 180,
        wordCount: page.total_words
      }]
    });
  });
  var mockInvertedIndex = {
    hello: ["1.1"],
    world: ["1.1"]
  };
  var mockOptimizedIndex = {
    toJSON: function toJSON() {
      return {
        keywords: ["hello", "world"],
        frequencies: {
          hello: 1,
          world: 1
        }
      };
    }
  };
  beforeEach(function () {
    _globals.jest.clearAllMocks();
  });
  var setupHappyPathMocks = function setupHappyPathMocks() {
    uploadFilesToS3.mockResolvedValue(mockS3Keys);
    createPresignedUrls.mockResolvedValue(mockPresignedUrls);
    extractPagesContent.mockResolvedValue(mockPagesContent);
    createInvertedSearch.mockReturnValue(mockInvertedIndex);
    buildOptimizedIndex.mockReturnValue(mockOptimizedIndex);
    generateChunks.mockResolvedValue(mockPagesWithChunks);
    generateAndUploadEmbeddings.mockResolvedValue(true);
    saveFilesRecord.mockResolvedValue([{
      id: 1,
      parse_id: mockId
    }]);
  };
  describe("happy path", function () {
    test("successfully processes files, builds indexes, and persists data", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var result;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            setupHappyPathMocks();
            _context.n = 1;
            return saveFiles(mockId, mockFiles, mockUserId);
          case 1:
            result = _context.v;
            expect(uploadFilesToS3).toHaveBeenCalledWith(mockId, mockFiles);
            expect(createPresignedUrls).toHaveBeenCalledWith(mockS3Keys);
            expect(extractPagesContent).toHaveBeenCalledWith(mockPresignedUrls.map(function (u) {
              return u.presignedUrl;
            }), mockFiles);
            expect(createInvertedSearch).toHaveBeenCalledWith(mockPagesContent);
            expect(buildOptimizedIndex).toHaveBeenCalledWith(mockPagesContent);
            expect(generateChunks).toHaveBeenCalledWith(mockPagesContent);
            expect(generateAndUploadEmbeddings).toHaveBeenCalledWith(mockId, mockUserId, mockPagesWithChunks);
            expect(saveFilesRecord).toHaveBeenCalledWith({
              id: mockId,
              userId: mockUserId,
              keys: mockS3Keys,
              buildIndex: mockOptimizedIndex.toJSON(),
              invertedIndex: mockInvertedIndex,
              pagesContent: mockPagesWithChunks
            });
            expect(result).toEqual([{
              id: 1,
              parse_id: mockId
            }]);
          case 2:
            return _context.a(2);
        }
      }, _callee);
    })));
  });
  describe("URL generation and validation", function () {
    test("throws AppError when no valid URLs are generated", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            setupHappyPathMocks();
            createPresignedUrls.mockResolvedValue([]);
            _context2.n = 1;
            return expect(saveFiles(mockId, mockFiles, mockUserId)).rejects.toThrow("No valid file URLs generated");
          case 1:
            _context2.n = 2;
            return expect(saveFiles(mockId, mockFiles, mockUserId)).rejects.toBeInstanceOf(AppError);
          case 2:
            return _context2.a(2);
        }
      }, _callee2);
    })));
  });
  describe("indexing failures", function () {
    test("throws AppError when createInvertedSearch fails", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.n) {
          case 0:
            setupHappyPathMocks();
            createInvertedSearch.mockImplementation(function () {
              throw new Error("inverted index failure");
            });
            _context3.n = 1;
            return expect(saveFiles(mockId, mockFiles, mockUserId)).rejects.toThrow("Failed to get inverted index");
          case 1:
            _context3.n = 2;
            return expect(saveFiles(mockId, mockFiles, mockUserId)).rejects.toBeInstanceOf(AppError);
          case 2:
            return _context3.a(2);
        }
      }, _callee3);
    })));
    test("throws AppError when buildOptimizedIndex fails", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.n) {
          case 0:
            setupHappyPathMocks();
            buildOptimizedIndex.mockImplementation(function () {
              throw new Error("optimized index failure");
            });
            _context4.n = 1;
            return expect(saveFiles(mockId, mockFiles, mockUserId)).rejects.toThrow("Failed to build optimized index");
          case 1:
            _context4.n = 2;
            return expect(saveFiles(mockId, mockFiles, mockUserId)).rejects.toBeInstanceOf(AppError);
          case 2:
            return _context4.a(2);
        }
      }, _callee4);
    })));
  });
  describe("chunk generation failures", function () {
    test("rethrows operational errors from generateChunks", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
      var operationalError;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.n) {
          case 0:
            setupHappyPathMocks();
            operationalError = new AppError("Chunking failed", 500, "CHUNK_ERROR");
            operationalError.isOperational = true;
            generateChunks.mockRejectedValue(operationalError);
            _context5.n = 1;
            return expect(saveFiles(mockId, mockFiles, mockUserId)).rejects.toBe(operationalError);
          case 1:
            return _context5.a(2);
        }
      }, _callee5);
    })));
    test("wraps non-operational errors from generateChunks in AppError", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.n) {
          case 0:
            setupHappyPathMocks();
            generateChunks.mockRejectedValue(new Error("some low-level error"));
            _context6.n = 1;
            return expect(saveFiles(mockId, mockFiles, mockUserId)).rejects.toThrow("Failed to build chunks");
          case 1:
            _context6.n = 2;
            return expect(saveFiles(mockId, mockFiles, mockUserId)).rejects.toBeInstanceOf(AppError);
          case 2:
            return _context6.a(2);
        }
      }, _callee6);
    })));
  });
});