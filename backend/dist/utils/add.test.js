"use strict";

var _OptimizedKeywordIndex = require("./OptimizedKeywordIndex.js");
var _MinHeap = require("./MinHeap.js");
var _callToChat = require("./openAi/callToChat.js");
var _retry = require("./retry.js");
var _globals = require("@jest/globals");
var _errorHandler = require("../middleware/errorHandler.js");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
describe("OptimizedKeywordIndex", function () {
  var index;
  beforeEach(function () {
    index = new _OptimizedKeywordIndex.OptimizedKeywordIndex();
  });
  describe("constructor", function () {
    test("initializes empty data structures", function () {
      expect(index.prefixIndex).toEqual({});
      expect(index.suffixIndex).toEqual({});
      expect(index.ngramIndex).toBeInstanceOf(Map);
      expect(index.wordPositions).toBeInstanceOf(Map);
      expect(index.seen).toBeInstanceOf(Set);
      expect(index.ngramIndex.size).toBe(0);
    });
  });
  describe("add", function () {
    test("adds a word to prefix and suffix indexes", function () {
      index.add("hello", 1, 100);
      expect(index.prefixIndex["h"]).toContainEqual(["hello", 1, 100]);
      expect(index.suffixIndex["o"]).toContainEqual(["hello", 1, 100]);
    });
    test("normalizes words to lowercase", function () {
      index.add("HELLO", 1, 100);
      expect(index.prefixIndex["h"]).toContainEqual(["hello", 1, 100]);
    });
    test("removes non-alphabetic characters", function () {
      index.add("hello-world!", 1, 100);
      expect(index.prefixIndex["h"]).toContainEqual(["helloworld", 1, 100]);
    });
    test("ignores empty strings", function () {
      index.add("", 1, 100);
      expect(Object.keys(index.prefixIndex)).toHaveLength(0);
    });
    test("ignores strings with only non-alphabetic characters", function () {
      index.add("123!@#", 1, 100);
      expect(Object.keys(index.prefixIndex)).toHaveLength(0);
    });
    test("prevents duplicate entries with same word, pageId, and y", function () {
      index.add("hello", 1, 100);
      index.add("hello", 1, 100);
      expect(index.prefixIndex["h"].length).toBe(1);
      expect(index.seen.size).toBe(1);
    });
    test("allows duplicate words with different pageId", function () {
      index.add("hello", 1, 100);
      index.add("hello", 2, 100);
      expect(index.prefixIndex["h"].length).toBe(2);
    });
    test("allows duplicate words with different y coordinate", function () {
      index.add("hello", 1, 100);
      index.add("hello", 1, 200);
      expect(index.prefixIndex["h"].length).toBe(2);
    });
    test("creates n-grams for words with 3+ characters", function () {
      index.add("hello", 1, 100);
      expect(index.ngramIndex.has("hel")).toBe(true);
      expect(index.ngramIndex.has("ell")).toBe(true);
      expect(index.ngramIndex.has("llo")).toBe(true);
    });
    test("stores short words (< 3 chars) in wordPositions", function () {
      index.add("ab", 1, 100);
      expect(index.wordPositions.has("ab")).toBe(true);
      expect(index.wordPositions.get("ab").has("1:100")).toBe(true);
    });
    test("handles single character words", function () {
      index.add("a", 1, 100);
      expect(index.prefixIndex["a"]).toContainEqual(["a", 1, 100]);
      expect(index.suffixIndex["a"]).toContainEqual(["a", 1, 100]);
      expect(index.wordPositions.has("a")).toBe(true);
    });
    test("handles null or undefined words", function () {
      expect(function () {
        return index.add(null, 1, 100);
      }).not.toThrow();
      expect(function () {
        return index.add(undefined, 1, 100);
      }).not.toThrow();
    });
  });
  describe("finalize", function () {
    test("sorts prefix index entries", function () {
      index.add("zebra", 1, 100);
      index.add("zoo", 1, 150);
      index.add("banana", 1, 200);
      index.add("apple", 1, 300);
      index.finalize();
      expect(index.prefixIndex["b"][0][0]).toBe("banana");
      expect(index.prefixIndex["z"][0][0]).toBe("zebra");
      expect(index.prefixIndex["a"][0][0]).toBe("apple");
    });
    test("sorts suffix index entries", function () {
      index.add("zebra", 1, 100);
      index.add("area", 1, 150);
      index.add("extra", 1, 200);
      index.finalize();
      expect(index.suffixIndex["a"][0][0]).toBe("area");
      expect(index.suffixIndex["a"][1][0]).toBe("extra");
      expect(index.suffixIndex["a"][2][0]).toBe("zebra");
    });
    test("handle empty index", function () {
      index.finalize();
      expect(function () {
        return index.finalize();
      }).not.toThrow();
    });
  });
  describe("search prefix", function () {
    beforeEach(function () {
      index.add("hello", 1, 100);
      index.add("help", 1, 200);
      index.add("helicopter", 2, 300);
      index.add("world", 3, 400);
      index.finalize();
    });
    test("find all words with matching prefix", function () {
      var result = index.search("hel", "prefix");
      expect(result).toHaveLength(3);
      expect(result.map(function (v) {
        return v[0];
      })).toContain("hello");
      expect(result.map(function (v) {
        return v[0];
      })).toContain("help");
      expect(result.map(function (v) {
        return v[0];
      })).toContain("helicopter");
    });
    test("exact searches", function () {
      var result = index.search("hello", "prefix");
      expect(result).toHaveLength(1);
      expect(result[0][0]).toContain("hello");
    });
    test("returns empty array for non-matching prefix", function () {
      var result = index.search("xyz", "prefix");
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });
    test("handles single character prefix", function () {
      var result = index.search("h", "prefix");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(function (v) {
        return v[0].startsWith("h");
      })).toBe(true);
    });
    test("normalizes search pattern", function () {
      var result = index.search("HEL", "prefix");
      expect(result).toHaveLength(3);
    });
  });
  describe("search suffix", function () {
    beforeEach(function () {
      index.add("hello", 1, 100);
      index.add("jello", 1, 200);
      index.add("world", 2, 300);
      index.add("old", 3, 400);
      index.finalize();
    });
    test("find all words with matching suffix", function () {
      var result = index.search("llo", "suffix");
      expect(result).toHaveLength(2);
      expect(result.map(function (v) {
        return v[0];
      })).toContain("hello");
      expect(result.map(function (v) {
        return v[0];
      })).toContain("jello");
    });
    test("finds words ending with pattern", function () {
      var result = index.search("ld", "suffix");
      expect(result).toHaveLength(2);
      expect(result.map(function (v) {
        return v[0];
      })).toContain("world");
      expect(result.map(function (v) {
        return v[0];
      })).toContain("old");
    });
    test("returns empty array for non-matching suffix", function () {
      var result = index.search("xyz", "suffix");
      expect(result).toEqual([]);
    });
  });
  describe("search infix", function () {
    beforeEach(function () {
      index.add("hello", 1, 100);
      index.add("shell", 1, 200);
      index.add("bella", 2, 300);
      index.add("world", 3, 400);
      index.finalize();
    });
    test("finds words containing pattern in the middle", function () {
      var result = index.search("ell", "infix");
      expect(result).toHaveLength(3);
      expect(result.map(function (r) {
        return r[0];
      })).toContain("hello");
      expect(result.map(function (r) {
        return r[0];
      })).toContain("shell");
      expect(result.map(function (r) {
        return r[0];
      })).toContain("bella");
    });
    test("handles pattern at end of word", function () {
      var result = index.search("rld", "infix");
      expect(result).toHaveLength(1);
      expect(result[0][0]).toBe("world");
    });
    test("returns empty array when n-gram not found", function () {
      var result = index.search("xyz", "infix");
      expect(result).toEqual([]);
    });
    test("handles short patterns less than 3 chars using wordPositions", function () {
      index.add("ab", 4, 500);
      index.add("abc", 5, 600);
      var result = index.search("ab", "infix");
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some(function (r) {
        return r[0] === "ab";
      })).toBe(true);
    });
  });
  describe("search all match types", function () {
    beforeEach(function () {
      index.add("hello", 1, 100);
      index.add("shell", 1, 200);
      index.add("help", 2, 300);
      index.finalize();
    });
    test("combines results from all match types", function () {
      var result = index.search("hel", "all");
      expect(result.length).toBeGreaterThanOrEqual(3);
    });
    test("removes duplicates across match types", function () {
      var result = index.search("hel", "all");
      var uniqueKeys = new Set(result.map(function (v) {
        return "".concat(v[0], ":").concat(v[1], ":").concat(v[2]);
      }));
      expect(uniqueKeys.size).toBe(result.length);
    });
    test('defaults to "all" match type', function () {
      var resultsAll = index.search("hel", "all");
      var resultsDefault = index.search("hel");
      expect(resultsDefault).toEqual(resultsAll);
    });
  });
  describe("search edge cases", function () {
    test("handles empty search pattern", function () {
      index.add("hello", 1, 100);
      var results = index.search("");
      expect(results).toEqual([]);
    });
    test("handles search with non-alphabetic characters", function () {
      index.add("hello", 1, 100);
      var results = index.search("he!!o", "all");
      expect(results).toEqual([]);
    });
    test("returns empty array when searching empty index", function () {
      var results = index.search("hello", "all");
      expect(results).toEqual([]);
    });
  });
  describe("toJSON and fromJSON", function () {
    beforeEach(function () {
      index.add("hello", 1, 100);
      index.add("world", 2, 200);
      index.add("test", 3, 300);
      index.finalize();
    });
    test("serializes index to JSON object", function () {
      var json = index.toJSON();
      expect(json).toHaveProperty("prefixIndex");
      expect(json).toHaveProperty("suffixIndex");
      expect(json).toHaveProperty("ngramIndex");
      expect(json).toHaveProperty("wordPositions");
    });
    test("converts Maps and Sets to arrays", function () {
      var json = index.toJSON();
      expect(Array.isArray(json.ngramIndex.hel)).toBe(true);
      expect(_typeof(json.ngramIndex)).toBe("object");
    });
    test("deserializes from JSON correctly", function () {
      var json = index.toJSON();
      var restored = _OptimizedKeywordIndex.OptimizedKeywordIndex.fromJSON(json);
      expect(restored.prefixIndex).toEqual(index.prefixIndex);
      expect(restored.suffixIndex).toEqual(index.suffixIndex);
    });
    test("maintains search functionality after deserialization", function () {
      var json = index.toJSON();
      var restored = _OptimizedKeywordIndex.OptimizedKeywordIndex.fromJSON(json);
      var originalResults = index.search("hel", "all");
      var restoredResults = restored.search("hel", "all");
      expect(restoredResults).toEqual(originalResults);
    });
    test("handles empty index serialization", function () {
      var emptyIndex = new _OptimizedKeywordIndex.OptimizedKeywordIndex();
      var json = emptyIndex.toJSON();
      var restored = _OptimizedKeywordIndex.OptimizedKeywordIndex.fromJSON(json);
      expect(restored.prefixIndex).toEqual({});
      expect(restored.ngramIndex.size).toBe(0);
    });
    test("sorts indexes after deserialization", function () {
      var json = index.toJSON();
      var restored = _OptimizedKeywordIndex.OptimizedKeywordIndex.fromJSON(json);
      restored.add("hero", 4, 400);
      var hWords = restored.prefixIndex["h"];
      for (var i = 0; i < hWords.length - 1; i++) {
        expect(hWords[i][0].localeCompare(hWords[i + 1][0])).toBeLessThanOrEqual(0);
      }
    });
  });
  describe("integration tests", function () {
    test("handles large dataset efficiently", function () {
      var words = ["apple", "application", "apply", "banana", "band", "bandana"];
      words.forEach(function (word, i) {
        index.add(word, i, i * 100);
      });
      index.finalize();
      var results = index.search("app", "prefix");
      expect(results).toHaveLength(3);
    });
    test("maintains data integrity through add, serialize, deserialize cycle", function () {
      index.add("testing", 1, 100);
      index.add("test", 2, 200);
      index.add("testimony", 3, 300);
      index.finalize();
      var json = index.toJSON();
      var jsonString = JSON.stringify(json);
      var parsed = JSON.parse(jsonString);
      var restored = _OptimizedKeywordIndex.OptimizedKeywordIndex.fromJSON(parsed);
      var original = index.search("test", "all");
      var restoredSearch = restored.search("test", "all");
      expect(restoredSearch.length).toBe(original.length);
    });
    test("handles special characters and maintains search accuracy", function () {
      index.add("café", 1, 100);
      index.add("naïve", 2, 200);
      index.add("résumé", 3, 300);
      index.finalize();
      var results = index.search("caf", "prefix");
      expect(results.some(function (r) {
        return r[0] === "caf";
      })).toBe(true);
    });
    test("complex multi-criteria search scenario", function () {
      var testData = [{
        word: "development",
        page: 1,
        y: 100
      }, {
        word: "developer",
        page: 1,
        y: 150
      }, {
        word: "envelope",
        page: 2,
        y: 200
      }, {
        word: "deployment",
        page: 3,
        y: 300
      }];
      testData.forEach(function (item) {
        return index.add(item.word, item.page, item.y);
      });
      index.finalize();
      var prefixResults = index.search("dev", "prefix");
      var infixResults = index.search("elop", "infix");
      var suffixResults = index.search("ment", "suffix");
      expect(prefixResults.length).toBeGreaterThan(0);
      expect(infixResults.length).toBeGreaterThan(0);
      expect(suffixResults.length).toBeGreaterThan(0);
    });
  });
});
describe("MinHeap", function () {
  test("push inserts items and keeps min at root", function () {
    var heap = new _MinHeap.MinHeap(10);
    heap.push({
      score: 5
    });
    heap.push({
      score: 3
    });
    heap.push({
      score: 8
    });
    expect(heap.peek().score).toBe(3);
    expect(heap.size()).toBe(3);
  });
  test("heap does not exceed maxSize", function () {
    var heap = new _MinHeap.MinHeap(2);
    heap.push({
      score: 10
    });
    heap.push({
      score: 20
    });
    heap.push({
      score: 30
    });
    expect(heap.size()).toBe(2);
  });
  test("push replaces root when heap is full and new item has higher score", function () {
    var heap = new _MinHeap.MinHeap(2);
    heap.push({
      score: 10
    });
    heap.push({
      score: 20
    });
    heap.push({
      score: 15
    });
    expect(heap.peek().score).toBe(15);
    expect(heap.size()).toBe(2);
  });
  test("push does NOT replace root when new item has lower score", function () {
    var heap = new _MinHeap.MinHeap(2);
    heap.push({
      score: 10
    });
    heap.push({
      score: 20
    });
    heap.push({
      score: 5
    });
    expect(heap.peek().score).toBe(10);
    expect(heap.size()).toBe(2);
  });
  test("heapify maintains valid heap structure", function () {
    var heap = new _MinHeap.MinHeap(10);
    var scores = [9, 4, 7, 1, 5, 3];
    scores.forEach(function (score) {
      return heap.push({
        score: score
      });
    });
    expect(heap.peek().score).toBe(Math.min.apply(Math, scores));
  });
  test("toArray returns items sorted by descending score", function () {
    var heap = new _MinHeap.MinHeap(10);
    heap.push({
      score: 5
    });
    heap.push({
      score: 9
    });
    heap.push({
      score: 1
    });
    heap.push({
      score: 7
    });
    var arr = heap.toArray().map(function (x) {
      return x.score;
    });
    expect(arr).toEqual([9, 7, 5, 1]);
  });
  test("size returns current number of items", function () {
    var heap = new _MinHeap.MinHeap(3);
    heap.push({
      score: 10
    });
    heap.push({
      score: 20
    });
    expect(heap.size()).toBe(2);
  });
  test("peek returns undefined when heap is empty", function () {
    var heap = new _MinHeap.MinHeap(3);
    expect(heap.peek()).toBeUndefined();
  });
});
describe("Retry", function () {
  _globals.jest.useFakeTimers();
  test("returns immediately if fn succeeds on first try", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var fn, result;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          fn = _globals.jest.fn().mockResolvedValue("success");
          _context.n = 1;
          return (0, _retry.retry)(fn);
        case 1:
          result = _context.v;
          expect(result).toBe("success");
          expect(fn).toHaveBeenCalledTimes(1);
        case 2:
          return _context.a(2);
      }
    }, _callee);
  })));
  test("retries when fn throws a retryable network error", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var error, fn, promise, result;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          error = {
            code: "ECONNRESET"
          };
          fn = _globals.jest.fn().mockRejectedValueOnce(error).mockResolvedValueOnce("ok");
          promise = (0, _retry.retry)(fn, {
            maxRetries: 2
          });
          _context2.n = 1;
          return _globals.jest.runAllTimersAsync();
        case 1:
          _context2.n = 2;
          return promise;
        case 2:
          result = _context2.v;
          expect(result).toBe("ok");
          expect(fn).toHaveBeenCalledTimes(2);
        case 3:
          return _context2.a(2);
      }
    }, _callee2);
  })));
  test("retries retryable HTTP status errors (429, 500, 408)", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
    var error, fn, promise, result;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          error = {
            response: {
              status: 500
            }
          };
          fn = _globals.jest.fn().mockRejectedValueOnce(error).mockResolvedValueOnce("ok");
          promise = (0, _retry.retry)(fn, {
            maxRetries: 2
          });
          _context3.n = 1;
          return _globals.jest.runAllTimersAsync();
        case 1:
          _context3.n = 2;
          return promise;
        case 2:
          result = _context3.v;
          expect(result).toBe("ok");
          expect(fn).toHaveBeenCalledTimes(2);
        case 3:
          return _context3.a(2);
      }
    }, _callee3);
  })));
  test("throws AppError if non-retryable error occurs", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
    var fn, _t;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.p = _context4.n) {
        case 0:
          fn = _globals.jest.fn().mockRejectedValue(new Error("fatal"));
          _context4.p = 1;
          _context4.n = 2;
          return (0, _retry.retry)(fn);
        case 2:
          _context4.n = 4;
          break;
        case 3:
          _context4.p = 3;
          _t = _context4.v;
          expect(_t).toBeInstanceOf(_errorHandler.AppError);
          expect(fn).toHaveBeenCalledTimes(1);
        case 4:
          return _context4.a(2);
      }
    }, _callee4, null, [[1, 3]]);
  })));
  test("calls onRetry callback on each retry", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
    var error, fn, onRetry, promise;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          error = {
            code: "ECONNRESET"
          };
          fn = _globals.jest.fn().mockRejectedValueOnce(error).mockRejectedValueOnce(error).mockResolvedValue("ok");
          onRetry = _globals.jest.fn();
          promise = (0, _retry.retry)(fn, {
            maxRetries: 3,
            onRetry: onRetry
          });
          _context5.n = 1;
          return _globals.jest.runAllTimersAsync();
        case 1:
          _context5.n = 2;
          return promise;
        case 2:
          expect(onRetry).toHaveBeenCalledTimes(2);
          expect(onRetry).toHaveBeenCalledWith(error, 2);
        case 3:
          return _context5.a(2);
      }
    }, _callee5);
  })));
});
describe("Call Chat", function () {
  global.fetch = _globals.jest.fn();
  test("returns AI response on successful API call", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
    var mockResponse, result;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.n) {
        case 0:
          mockResponse = {
            choices: [{
              message: {
                content: "Hello!"
              }
            }]
          };
          fetch.mockResolvedValueOnce({
            ok: true,
            json: function () {
              var _json = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
                return _regenerator().w(function (_context6) {
                  while (1) switch (_context6.n) {
                    case 0:
                      return _context6.a(2, mockResponse);
                  }
                }, _callee6);
              }));
              function json() {
                return _json.apply(this, arguments);
              }
              return json;
            }()
          });
          _context7.n = 1;
          return (0, _callToChat.callToChat)("Hi");
        case 1:
          result = _context7.v;
          expect(result).toBe("Hello!");
        case 2:
          return _context7.a(2);
      }
    }, _callee7);
  })));
  test("throws error when API returns error status", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
    return _regenerator().w(function (_context9) {
      while (1) switch (_context9.n) {
        case 0:
          fetch.mockResolvedValueOnce({
            ok: false,
            status: 429,
            json: function () {
              var _json2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8() {
                return _regenerator().w(function (_context8) {
                  while (1) switch (_context8.n) {
                    case 0:
                      return _context8.a(2, {
                        error: {
                          message: "Rate limit exceeded"
                        }
                      });
                  }
                }, _callee8);
              }));
              function json() {
                return _json2.apply(this, arguments);
              }
              return json;
            }()
          });
          _context9.n = 1;
          return expect((0, _callToChat.callToChat)("Hi")).rejects.toThrow("OpenAI API error: 429 - Rate limit exceeded");
        case 1:
          return _context9.a(2);
      }
    }, _callee9);
  })));
  test("handles malformed error response without error.message", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1() {
    return _regenerator().w(function (_context1) {
      while (1) switch (_context1.n) {
        case 0:
          fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
            json: function () {
              var _json3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0() {
                return _regenerator().w(function (_context0) {
                  while (1) switch (_context0.n) {
                    case 0:
                      return _context0.a(2, {});
                  }
                }, _callee0);
              }));
              function json() {
                return _json3.apply(this, arguments);
              }
              return json;
            }()
          });
          _context1.n = 1;
          return expect((0, _callToChat.callToChat)("hi")).rejects.toThrow("OpenAI API error: 500 - Internal Server Error");
        case 1:
          return _context1.a(2);
      }
    }, _callee1);
  })));
  test("handles invalid JSON in error response", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11() {
    return _regenerator().w(function (_context11) {
      while (1) switch (_context11.n) {
        case 0:
          fetch.mockResolvedValueOnce({
            ok: false,
            status: 503,
            statusText: "Service Unavailable",
            json: function () {
              var _json4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10() {
                return _regenerator().w(function (_context10) {
                  while (1) switch (_context10.n) {
                    case 0:
                      throw new Error("Invalid JSON");
                    case 1:
                      return _context10.a(2);
                  }
                }, _callee10);
              }));
              function json() {
                return _json4.apply(this, arguments);
              }
              return json;
            }()
          });
          _context11.n = 1;
          return expect((0, _callToChat.callToChat)("hi")).rejects.toThrow("OpenAI API error: 503 - Service Unavailable");
        case 1:
          return _context11.a(2);
      }
    }, _callee11);
  })));
  test("handles network error", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12() {
    return _regenerator().w(function (_context12) {
      while (1) switch (_context12.n) {
        case 0:
          fetch.mockRejectedValueOnce(new Error("Network failure"));
          _context12.n = 1;
          return expect((0, _callToChat.callToChat)("hi")).rejects.toThrow("Network failure");
        case 1:
          return _context12.a(2);
      }
    }, _callee12);
  })));
});