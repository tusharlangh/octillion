import { OptimizedKeywordIndex } from "./OptimizedKeywordIndex.js";
import { MinHeap } from "./MinHeap.js";
import { retry } from "./retry.js";
import { describe, jest } from "@jest/globals";
import { AppError } from "../middleware/errorHandler.js";

describe("OptimizedKeywordIndex", () => {
  let index;

  beforeEach(() => {
    index = new OptimizedKeywordIndex();
  });

  describe("constructor", () => {
    test("initializes empty data structures", () => {
      expect(index.prefixIndex).toEqual({});
      expect(index.suffixIndex).toEqual({});
      expect(index.ngramIndex).toBeInstanceOf(Map);
      expect(index.wordPositions).toBeInstanceOf(Map);
      expect(index.seen).toBeInstanceOf(Set);
      expect(index.ngramIndex.size).toBe(0);
    });
  });

  describe("add", () => {
    test("adds a word to prefix and suffix indexes", () => {
      index.add("hello", 1, 100);

      expect(index.prefixIndex["h"]).toContainEqual(["hello", 1, 100]);
      expect(index.suffixIndex["o"]).toContainEqual(["hello", 1, 100]);
    });

    test("normalizes words to lowercase", () => {
      index.add("HELLO", 1, 100);

      expect(index.prefixIndex["h"]).toContainEqual(["hello", 1, 100]);
    });

    test("removes non-alphabetic characters", () => {
      index.add("hello-world!", 1, 100);

      expect(index.prefixIndex["h"]).toContainEqual(["helloworld", 1, 100]);
    });

    test("ignores empty strings", () => {
      index.add("", 1, 100);

      expect(Object.keys(index.prefixIndex)).toHaveLength(0);
    });

    test("ignores strings with only non-alphabetic characters", () => {
      index.add("123!@#", 1, 100);

      expect(Object.keys(index.prefixIndex)).toHaveLength(0);
    });

    test("prevents duplicate entries with same word, pageId, and y", () => {
      index.add("hello", 1, 100);
      index.add("hello", 1, 100);

      expect(index.prefixIndex["h"].length).toBe(1);
      expect(index.seen.size).toBe(1);
    });

    test("allows duplicate words with different pageId", () => {
      index.add("hello", 1, 100);
      index.add("hello", 2, 100);

      expect(index.prefixIndex["h"].length).toBe(2);
    });

    test("allows duplicate words with different y coordinate", () => {
      index.add("hello", 1, 100);
      index.add("hello", 1, 200);

      expect(index.prefixIndex["h"].length).toBe(2);
    });

    test("creates n-grams for words with 3+ characters", () => {
      index.add("hello", 1, 100);

      expect(index.ngramIndex.has("hel")).toBe(true);
      expect(index.ngramIndex.has("ell")).toBe(true);
      expect(index.ngramIndex.has("llo")).toBe(true);
    });

    test("stores short words (< 3 chars) in wordPositions", () => {
      index.add("ab", 1, 100);

      expect(index.wordPositions.has("ab")).toBe(true);
      expect(index.wordPositions.get("ab").has("1:100")).toBe(true);
    });

    test("handles single character words", () => {
      index.add("a", 1, 100);

      expect(index.prefixIndex["a"]).toContainEqual(["a", 1, 100]);
      expect(index.suffixIndex["a"]).toContainEqual(["a", 1, 100]);
      expect(index.wordPositions.has("a")).toBe(true);
    });

    test("handles null or undefined words", () => {
      expect(() => index.add(null, 1, 100)).not.toThrow();
      expect(() => index.add(undefined, 1, 100)).not.toThrow();
    });
  });

  describe("finalize", () => {
    test("sorts prefix index entries", () => {
      index.add("zebra", 1, 100);
      index.add("zoo", 1, 150);
      index.add("banana", 1, 200);
      index.add("apple", 1, 300);

      index.finalize();

      expect(index.prefixIndex["b"][0][0]).toBe("banana");
      expect(index.prefixIndex["z"][0][0]).toBe("zebra");
      expect(index.prefixIndex["a"][0][0]).toBe("apple");
    });

    test("sorts suffix index entries", () => {
      index.add("zebra", 1, 100);
      index.add("area", 1, 150);
      index.add("extra", 1, 200);

      index.finalize();

      expect(index.suffixIndex["a"][0][0]).toBe("area");
      expect(index.suffixIndex["a"][1][0]).toBe("extra");
      expect(index.suffixIndex["a"][2][0]).toBe("zebra");
    });

    test("handle empty index", () => {
      index.finalize();
      expect(() => index.finalize()).not.toThrow();
    });
  });

  describe("search prefix", () => {
    beforeEach(() => {
      index.add("hello", 1, 100);
      index.add("help", 1, 200);
      index.add("helicopter", 2, 300);
      index.add("world", 3, 400);
      index.finalize();
    });

    test("find all words with matching prefix", () => {
      const result = index.search("hel", "prefix");

      expect(result).toHaveLength(3);
      expect(result.map((v) => v[0])).toContain("hello");
      expect(result.map((v) => v[0])).toContain("help");
      expect(result.map((v) => v[0])).toContain("helicopter");
    });

    test("exact searches", () => {
      const result = index.search("hello", "prefix");
      expect(result).toHaveLength(1);
      expect(result[0][0]).toContain("hello");
    });

    test("returns empty array for non-matching prefix", () => {
      const result = index.search("xyz", "prefix");

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    test("handles single character prefix", () => {
      const result = index.search("h", "prefix");

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((v) => v[0].startsWith("h"))).toBe(true);
    });

    test("normalizes search pattern", () => {
      const result = index.search("HEL", "prefix");

      expect(result).toHaveLength(3);
    });
  });

  describe("search suffix", () => {
    beforeEach(() => {
      index.add("hello", 1, 100);
      index.add("jello", 1, 200);
      index.add("world", 2, 300);
      index.add("old", 3, 400);
      index.finalize();
    });

    test("find all words with matching suffix", () => {
      const result = index.search("llo", "suffix");

      expect(result).toHaveLength(2);
      expect(result.map((v) => v[0])).toContain("hello");
      expect(result.map((v) => v[0])).toContain("jello");
    });

    test("finds words ending with pattern", () => {
      const result = index.search("ld", "suffix");

      expect(result).toHaveLength(2);
      expect(result.map((v) => v[0])).toContain("world");
      expect(result.map((v) => v[0])).toContain("old");
    });

    test("returns empty array for non-matching suffix", () => {
      const result = index.search("xyz", "suffix");

      expect(result).toEqual([]);
    });
  });

  describe("search infix", () => {
    beforeEach(() => {
      index.add("hello", 1, 100);
      index.add("shell", 1, 200);
      index.add("bella", 2, 300);
      index.add("world", 3, 400);
      index.finalize();
    });

    test("finds words containing pattern in the middle", () => {
      const result = index.search("ell", "infix");

      expect(result).toHaveLength(3);
      expect(result.map((r) => r[0])).toContain("hello");
      expect(result.map((r) => r[0])).toContain("shell");
      expect(result.map((r) => r[0])).toContain("bella");
    });

    test("handles pattern at end of word", () => {
      const result = index.search("rld", "infix");

      expect(result).toHaveLength(1);
      expect(result[0][0]).toBe("world");
    });

    test("returns empty array when n-gram not found", () => {
      const result = index.search("xyz", "infix");

      expect(result).toEqual([]);
    });

    test("handles short patterns less than 3 chars using wordPositions", () => {
      index.add("ab", 4, 500);
      index.add("abc", 5, 600);

      const result = index.search("ab", "infix");

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some((r) => r[0] === "ab")).toBe(true);
    });
  });

  describe("search all match types", () => {
    beforeEach(() => {
      index.add("hello", 1, 100);
      index.add("shell", 1, 200);
      index.add("help", 2, 300);
      index.finalize();
    });

    test("combines results from all match types", () => {
      const result = index.search("hel", "all");

      expect(result.length).toBeGreaterThanOrEqual(3);
    });

    test("removes duplicates across match types", () => {
      const result = index.search("hel", "all");

      const uniqueKeys = new Set(result.map((v) => `${v[0]}:${v[1]}:${v[2]}`));
      expect(uniqueKeys.size).toBe(result.length);
    });

    test('defaults to "all" match type', () => {
      const resultsAll = index.search("hel", "all");
      const resultsDefault = index.search("hel");

      expect(resultsDefault).toEqual(resultsAll);
    });
  });

  describe("search edge cases", () => {
    test("handles empty search pattern", () => {
      index.add("hello", 1, 100);

      const results = index.search("");

      expect(results).toEqual([]);
    });

    test("handles search with non-alphabetic characters", () => {
      index.add("hello", 1, 100);

      const results = index.search("he!!o", "all");

      expect(results).toEqual([]);
    });

    test("returns empty array when searching empty index", () => {
      const results = index.search("hello", "all");

      expect(results).toEqual([]);
    });
  });

  describe("toJSON and fromJSON", () => {
    beforeEach(() => {
      index.add("hello", 1, 100);
      index.add("world", 2, 200);
      index.add("test", 3, 300);
      index.finalize();
    });

    test("serializes index to JSON object", () => {
      const json = index.toJSON();

      expect(json).toHaveProperty("prefixIndex");
      expect(json).toHaveProperty("suffixIndex");
      expect(json).toHaveProperty("ngramIndex");
      expect(json).toHaveProperty("wordPositions");
    });

    test("converts Maps and Sets to arrays", () => {
      const json = index.toJSON();

      expect(Array.isArray(json.ngramIndex.hel)).toBe(true);
      expect(typeof json.ngramIndex).toBe("object");
    });

    test("deserializes from JSON correctly", () => {
      const json = index.toJSON();
      const restored = OptimizedKeywordIndex.fromJSON(json);

      expect(restored.prefixIndex).toEqual(index.prefixIndex);
      expect(restored.suffixIndex).toEqual(index.suffixIndex);
    });

    test("maintains search functionality after deserialization", () => {
      const json = index.toJSON();
      const restored = OptimizedKeywordIndex.fromJSON(json);

      const originalResults = index.search("hel", "all");
      const restoredResults = restored.search("hel", "all");

      expect(restoredResults).toEqual(originalResults);
    });

    test("handles empty index serialization", () => {
      const emptyIndex = new OptimizedKeywordIndex();
      const json = emptyIndex.toJSON();
      const restored = OptimizedKeywordIndex.fromJSON(json);

      expect(restored.prefixIndex).toEqual({});
      expect(restored.ngramIndex.size).toBe(0);
    });

    test("sorts indexes after deserialization", () => {
      const json = index.toJSON();
      const restored = OptimizedKeywordIndex.fromJSON(json);

      restored.add("hero", 4, 400);

      const hWords = restored.prefixIndex["h"];
      for (let i = 0; i < hWords.length - 1; i++) {
        expect(
          hWords[i][0].localeCompare(hWords[i + 1][0])
        ).toBeLessThanOrEqual(0);
      }
    });
  });

  describe("integration tests", () => {
    test("handles large dataset efficiently", () => {
      const words = [
        "apple",
        "application",
        "apply",
        "banana",
        "band",
        "bandana",
      ];

      words.forEach((word, i) => {
        index.add(word, i, i * 100);
      });

      index.finalize();

      const results = index.search("app", "prefix");
      expect(results).toHaveLength(3);
    });

    test("maintains data integrity through add, serialize, deserialize cycle", () => {
      index.add("testing", 1, 100);
      index.add("test", 2, 200);
      index.add("testimony", 3, 300);
      index.finalize();

      const json = index.toJSON();
      const jsonString = JSON.stringify(json);
      const parsed = JSON.parse(jsonString);
      const restored = OptimizedKeywordIndex.fromJSON(parsed);

      const original = index.search("test", "all");
      const restoredSearch = restored.search("test", "all");

      expect(restoredSearch.length).toBe(original.length);
    });

    test("handles special characters and maintains search accuracy", () => {
      index.add("café", 1, 100);
      index.add("naïve", 2, 200);
      index.add("résumé", 3, 300);
      index.finalize();

      const results = index.search("caf", "prefix");
      expect(results.some((r) => r[0] === "caf")).toBe(true);
    });

    test("complex multi-criteria search scenario", () => {
      const testData = [
        { word: "development", page: 1, y: 100 },
        { word: "developer", page: 1, y: 150 },
        { word: "envelope", page: 2, y: 200 },
        { word: "deployment", page: 3, y: 300 },
      ];

      testData.forEach((item) => index.add(item.word, item.page, item.y));
      index.finalize();

      const prefixResults = index.search("dev", "prefix");
      const infixResults = index.search("elop", "infix");
      const suffixResults = index.search("ment", "suffix");

      expect(prefixResults.length).toBeGreaterThan(0);
      expect(infixResults.length).toBeGreaterThan(0);
      expect(suffixResults.length).toBeGreaterThan(0);
    });
  });
});

describe("MinHeap", () => {
  test("push inserts items and keeps min at root", () => {
    const heap = new MinHeap(10);

    heap.push({ score: 5 });
    heap.push({ score: 3 });
    heap.push({ score: 8 });

    expect(heap.peek().score).toBe(3);
    expect(heap.size()).toBe(3);
  });

  test("heap does not exceed maxSize", () => {
    const heap = new MinHeap(2);

    heap.push({ score: 10 });
    heap.push({ score: 20 });
    heap.push({ score: 30 });

    expect(heap.size()).toBe(2);
  });

  test("push replaces root when heap is full and new item has higher score", () => {
    const heap = new MinHeap(2);

    heap.push({ score: 10 });
    heap.push({ score: 20 });
    heap.push({ score: 15 });

    expect(heap.peek().score).toBe(15);
    expect(heap.size()).toBe(2);
  });

  test("push does NOT replace root when new item has lower score", () => {
    const heap = new MinHeap(2);

    heap.push({ score: 10 });
    heap.push({ score: 20 });
    heap.push({ score: 5 });

    expect(heap.peek().score).toBe(10);
    expect(heap.size()).toBe(2);
  });

  test("heapify maintains valid heap structure", () => {
    const heap = new MinHeap(10);
    const scores = [9, 4, 7, 1, 5, 3];

    scores.forEach((score) => heap.push({ score }));

    expect(heap.peek().score).toBe(Math.min(...scores));
  });

  test("toArray returns items sorted by descending score", () => {
    const heap = new MinHeap(10);

    heap.push({ score: 5 });
    heap.push({ score: 9 });
    heap.push({ score: 1 });
    heap.push({ score: 7 });

    const arr = heap.toArray().map((x) => x.score);
    expect(arr).toEqual([9, 7, 5, 1]);
  });

  test("size returns current number of items", () => {
    const heap = new MinHeap(3);

    heap.push({ score: 10 });
    heap.push({ score: 20 });

    expect(heap.size()).toBe(2);
  });

  test("peek returns undefined when heap is empty", () => {
    const heap = new MinHeap(3);
    expect(heap.peek()).toBeUndefined();
  });
});

describe("Retry", () => {
  jest.useFakeTimers();

  test("returns immediately if fn succeeds on first try", async () => {
    const fn = jest.fn().mockResolvedValue("success");

    const result = await retry(fn);

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("retries when fn throws a retryable network error", async () => {
    const error = { code: "ECONNRESET" };
    const fn = jest
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce("ok");

    const promise = retry(fn, { maxRetries: 2 });

    await jest.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test("retries retryable HTTP status errors (429, 500, 408)", async () => {
    const error = { response: { status: 500 } };

    const fn = jest
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce("ok");

    const promise = retry(fn, { maxRetries: 2 });

    await jest.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test("throws AppError if non-retryable error occurs", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("fatal"));

    try {
      await retry(fn);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(fn).toHaveBeenCalledTimes(1);
    }
  });

  test("calls onRetry callback on each retry", async () => {
    const error = { code: "ECONNRESET" };

    const fn = jest
      .fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValue("ok");

    const onRetry = jest.fn();

    const promise = retry(fn, { maxRetries: 3, onRetry });

    await jest.runAllTimersAsync();
    await promise;

    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledWith(error, 2);
  });
});
