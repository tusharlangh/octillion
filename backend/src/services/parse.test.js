import { jest } from "@jest/globals";

jest.unstable_mockModule("./searchRewrite.js", () => ({
  __esModule: true,
  SearchRewrite: jest.fn(),
}));

jest.unstable_mockModule("../utils/supabase/client.js", () => ({
  __esModule: true,
  default: {
    from: jest.fn(),
  },
}));

jest.unstable_mockModule("./qdrantService.js", () => ({
  __esModule: true,
  searchQdrant: jest.fn(),
}));

jest.unstable_mockModule("../utils/MinHeap.js", () => ({
  __esModule: true,
  MinHeap: jest.fn().mockImplementation(() => ({
    push: jest.fn(),
    toArray: jest.fn().mockReturnValue([]),
  })),
}));

jest.unstable_mockModule("./parse/embedding.js", () => ({
  __esModule: true,
  generateEmbedding: jest.fn(),
}));

jest.unstable_mockModule("./parse/searchIndex.js", () => ({
  __esModule: true,
  searchBuildIndex: jest.fn(),
  searchContent: jest.fn(),
}));

jest.unstable_mockModule("./parse/chunks.js", () => ({
  __esModule: true,
  createContextualChunks: jest.fn(),
}));

const { SearchRewrite } = await import("./searchRewrite.js");
const supabase = (await import("../utils/supabase/client.js")).default;
const { searchQdrant } = await import("./qdrantService.js");
const { MinHeap } = await import("../utils/MinHeap.js");
const { generateEmbedding } = await import("./parse/embedding.js");
const { searchBuildIndex, searchContent } = await import(
  "./parse/searchIndex.js"
);

const { parse } = await import("./parse.js");

const mockId = "file123";
const mockUser = "user123";
const mockSearchText = "hello world";

const mockRow = {
  pages_metadata: [{ id: "1", content: "abc" }],
  inverted_index: { hello: [0] },
  build_index: { 1: { chunks: [] } },
};

function mockSupabase(data = [mockRow], error = null) {
  const eq2 = jest.fn().mockResolvedValue({ data, error });
  const id = jest.fn().mockReturnValue({ eq: eq2 });
  const select = jest.fn().mockReturnValue({ eq: id });
  supabase.from.mockReturnValue({ select });
}

describe("parse()", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase();

    SearchRewrite.mockImplementation(() => ({
      process: () => ["hello", "world"],
    }));
  });

  test("throws when rewrite returns empty string", async () => {
    SearchRewrite.mockImplementation(() => ({
      process: () => "",
    }));

    await expect(parse(mockId, mockSearchText, mockUser)).rejects.toThrow(
      "Rewriting search came out empty"
    );
  });

  test("throws when rewrite returns empty array", async () => {
    SearchRewrite.mockImplementation(() => ({
      process: () => [],
    }));

    await expect(parse(mockId, mockSearchText, mockUser)).rejects.toThrow(
      "Rewriting search came out empty"
    );
  });

  test("throws Supabase error when supabase returns error", async () => {
    mockSupabase(null, { message: "db broken" });

    await expect(parse(mockId, mockSearchText, mockUser)).rejects.toThrow(
      "Failed to fetch files: db broken"
    );
  });

  test("returns success empty array when supabase returns no rows", async () => {
    mockSupabase([]);

    const res = await parse(mockId, mockSearchText, mockUser);

    expect(res).toEqual({
      success: true,
      searchResults: [],
    });
  });

  test("throws when row missing metadata/index", async () => {
    mockSupabase([{ pages_metadata: null }]);

    await expect(parse(mockId, mockSearchText, mockUser)).rejects.toThrow(
      "Invalid or incomplete data row"
    );
  });

  test("semantic: returns empty when embedding empty", async () => {
    generateEmbedding.mockResolvedValue([]);

    const res = await parse(mockId, mockSearchText, mockUser, {
      searchMode: "semantic",
    });

    expect(res.success).toBe(true);
    expect(res.searchResults).toEqual([]);
  });

  test("semantic: returns semantic results", async () => {
    generateEmbedding.mockResolvedValue([0.1, 0.2]);
    searchQdrant.mockResolvedValue([
      { pageId: "1", score: 0.9, startY: 0, endY: 0 },
    ]);

    const res = await parse(mockId, mockSearchText, mockUser, {
      searchMode: "semantic",
    });

    expect(res.success).toBe(true);
    expect(res.searchResults.length).toBe(1);
  });

  test("tfidf: empty keyword scores → returns empty", async () => {
    searchContent.mockResolvedValue({});

    const res = await parse(mockId, mockSearchText, mockUser, {
      searchMode: "tfidf",
    });

    expect(res.searchResults).toEqual([]);
  });

  test("tfidf: returns keyword results", async () => {
    searchContent.mockResolvedValue({ 1: 5 });
    searchBuildIndex.mockReturnValue([{ pageId: "1", y: 10, score: 5 }]);

    const res = await parse(mockId, mockSearchText, mockUser, {
      searchMode: "tfidf",
    });

    expect(res.searchResults.length).toBe(1);
  });

  test("hybrid: both semantic + keyword empty → empty results", async () => {
    generateEmbedding.mockResolvedValue([0.2]);
    searchQdrant.mockResolvedValue([]);
    searchContent.mockResolvedValue({});
    searchBuildIndex.mockReturnValue([]);

    const res = await parse(mockId, mockSearchText, mockUser, {
      searchMode: "hybrid",
    });

    expect(res.searchResults).toEqual([]);
  });

  test("hybrid: merges keyword + semantic results", async () => {
    generateEmbedding.mockResolvedValue([0.2]);

    searchQdrant.mockResolvedValue([
      { pageId: "1", score: 0.9, startY: 0, endY: 0 },
    ]);

    searchContent.mockResolvedValue({ 1: 5 });

    searchBuildIndex.mockReturnValue([{ pageId: "1", y: 0, score: 5 }]);

    MinHeap.mockImplementation(() => ({
      push: jest.fn(),
      toArray: () => [{ pageId: "1", score: 0.7, startY: 0, endY: 0 }],
    }));

    const res = await parse(mockId, mockSearchText, mockUser, {
      searchMode: "hybrid",
      topK: 5,
    });

    expect(res.success).toBe(true);
    expect(res.searchResults.length).toBe(1);
  });

  test("wraps unknown errors in SYSTEM_ERROR", async () => {
    SearchRewrite.mockImplementation(() => {
      throw new Error("boom");
    });

    await expect(parse(mockId, mockSearchText, mockUser)).rejects.toThrow(
      "System error: boom"
    );
  });
});
