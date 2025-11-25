import { jest } from "@jest/globals";

jest.unstable_mockModule("./saveFiles/upload.js", () => ({
  uploadFilesToS3: jest.fn(),
  createPresignedUrls: jest.fn(),
  uploadJsonToS3: jest.fn(),
}));

jest.unstable_mockModule("./saveFiles/parser.js", () => ({
  extractPagesContent: jest.fn(),
}));

jest.unstable_mockModule("./saveFiles/indexing.js", () => ({
  createInvertedSearch: jest.fn(),
  buildOptimizedIndex: jest.fn(),
  generateChunks: jest.fn(),
}));

jest.unstable_mockModule("./saveFiles/embeddings.js", () => ({
  generateAndUploadEmbeddings: jest.fn(),
}));

jest.unstable_mockModule("./saveFiles/persist.js", () => ({
  saveFilesRecord: jest.fn(),
}));

const { uploadFilesToS3, createPresignedUrls, uploadJsonToS3 } = await import(
  "./saveFiles/upload.js"
);
const { extractPagesContent } = await import("./saveFiles/parser.js");
const { createInvertedSearch, buildOptimizedIndex, generateChunks } =
  await import("./saveFiles/indexing.js");
const { generateAndUploadEmbeddings } = await import(
  "./saveFiles/embeddings.js"
);
const { saveFilesRecord } = await import("./saveFiles/persist.js");
const { saveFiles } = await import("./saveFiles.js");
const { AppError } = await import("../middleware/errorHandler.js");

describe("saveFiles", () => {
  const mockId = "parse-id-123";
  const mockUserId = "user-456";

  const mockFiles = [
    { originalname: "file1.pdf", buffer: Buffer.from("pdf1") },
    { originalname: "file2.pdf", buffer: Buffer.from("pdf2") },
  ];

  const mockS3Keys = [
    {
      key: "files/parse-id-123/0/file1.pdf",
      file_name: "file1.pdf",
      mimetype: "application/pdf",
    },
    {
      key: "files/parse-id-123/1/file2.pdf",
      file_name: "file2.pdf",
      mimetype: "application/pdf",
    },
  ];

  const mockPresignedUrls = [
    {
      file_name: "file1.pdf",
      file_type: "application/pdf",
      presignedUrl: "https://example.com/file1.pdf",
    },
    {
      file_name: "file2.pdf",
      file_type: "application/pdf",
      presignedUrl: "https://example.com/file2.pdf",
    },
  ];

  const mockPagesContent = [
    {
      id: "1.1",
      name: "file1.pdf",
      site_content: "hello world",
      total_words: 2,
      mapping: [],
    },
    {
      id: "2.1",
      name: "file2.pdf",
      site_content: "another document",
      total_words: 2,
      mapping: [],
    },
  ];

  const mockPagesWithChunks = mockPagesContent.map((page) => ({
    ...page,
    chunks: [
      {
        text: page.site_content,
        startY: 200,
        endY: 180,
        wordCount: page.total_words,
      },
    ],
  }));

  const mockInvertedIndex = {
    hello: ["1.1"],
    world: ["1.1"],
  };

  const mockOptimizedIndex = {
    toJSON: () => ({
      dictionary: ["hello", "world"],
      postings: { 0: [[1, 100]], 1: [[1, 200]] },
      ngramIndex: {},
      prefixIndex: {},
      suffixIndex: {},
    }),
  };

  const mockS3JsonKeys = {
    pagesContent: "parse-id-123-pages_content.json",
    invertedIndex: "parse-id-123-inverted_index.json",
    buildIndex: "parse-id-123-build_index.json",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupHappyPathMocks = () => {
    uploadFilesToS3.mockResolvedValue(mockS3Keys);
    createPresignedUrls.mockResolvedValue(mockPresignedUrls);
    extractPagesContent.mockResolvedValue(mockPagesContent);
    createInvertedSearch.mockReturnValue(mockInvertedIndex);
    buildOptimizedIndex.mockReturnValue(mockOptimizedIndex);
    generateChunks.mockResolvedValue(mockPagesWithChunks);
    generateAndUploadEmbeddings.mockResolvedValue(true);

    uploadJsonToS3.mockImplementation((id, name) => {
      const keyMap = {
        pages_content: mockS3JsonKeys.pagesContent,
        inverted_index: mockS3JsonKeys.invertedIndex,
        build_index: mockS3JsonKeys.buildIndex,
      };
      return Promise.resolve({ s3Key: keyMap[name] });
    });

    saveFilesRecord.mockResolvedValue([{ id: 1, parse_id: mockId }]);
  };

  describe("happy path", () => {
    test("successfully processes files, builds indexes, and persists data", async () => {
      setupHappyPathMocks();

      const result = await saveFiles(mockId, mockFiles, mockUserId);

      expect(uploadFilesToS3).toHaveBeenCalledWith(mockId, mockFiles);
      expect(createPresignedUrls).toHaveBeenCalledWith(mockS3Keys);

      expect(extractPagesContent).toHaveBeenCalledWith(
        mockPresignedUrls.map((u) => u.presignedUrl),
        mockFiles
      );

      expect(createInvertedSearch).toHaveBeenCalledWith(mockPagesContent);
      expect(buildOptimizedIndex).toHaveBeenCalledWith(mockPagesContent);
      expect(generateChunks).toHaveBeenCalledWith(mockPagesContent);

      expect(generateAndUploadEmbeddings).toHaveBeenCalledWith(
        mockId,
        mockUserId,
        mockPagesWithChunks
      );

      expect(uploadJsonToS3).toHaveBeenCalledWith(
        mockId,
        "pages_content",
        mockPagesWithChunks
      );
      expect(uploadJsonToS3).toHaveBeenCalledWith(
        mockId,
        "inverted_index",
        mockInvertedIndex
      );
      expect(uploadJsonToS3).toHaveBeenCalledWith(
        mockId,
        "build_index",
        mockOptimizedIndex.toJSON()
      );

      expect(saveFilesRecord).toHaveBeenCalledWith({
        id: mockId,
        userId: mockUserId,
        keys: mockS3Keys,
        buildIndex: { s3Key: mockS3JsonKeys.buildIndex },
        invertedIndex: { s3Key: mockS3JsonKeys.invertedIndex },
        pagesContent: { s3Key: mockS3JsonKeys.pagesContent },
      });

      expect(result).toEqual([{ id: 1, parse_id: mockId }]);
    });
  });

  describe("URL generation and validation", () => {
    test("throws AppError when no valid URLs are generated", async () => {
      setupHappyPathMocks();
      createPresignedUrls.mockResolvedValue([]);

      await expect(saveFiles(mockId, mockFiles, mockUserId)).rejects.toThrow(
        "No valid file URLs generated"
      );
      await expect(
        saveFiles(mockId, mockFiles, mockUserId)
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe("indexing failures", () => {
    test("throws AppError when createInvertedSearch fails", async () => {
      setupHappyPathMocks();
      createInvertedSearch.mockImplementation(() => {
        throw new Error("inverted index failure");
      });

      await expect(saveFiles(mockId, mockFiles, mockUserId)).rejects.toThrow(
        "Failed to get inverted index"
      );
      await expect(
        saveFiles(mockId, mockFiles, mockUserId)
      ).rejects.toBeInstanceOf(AppError);
    });

    test("throws AppError when buildOptimizedIndex fails", async () => {
      setupHappyPathMocks();
      buildOptimizedIndex.mockImplementation(() => {
        throw new Error("optimized index failure");
      });

      await expect(saveFiles(mockId, mockFiles, mockUserId)).rejects.toThrow(
        "Failed to build optimized index"
      );
      await expect(
        saveFiles(mockId, mockFiles, mockUserId)
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe("chunk generation failures", () => {
    test("rethrows operational errors from generateChunks", async () => {
      setupHappyPathMocks();

      const operationalError = new AppError(
        "Chunking failed",
        500,
        "CHUNK_ERROR"
      );
      operationalError.isOperational = true;

      generateChunks.mockRejectedValue(operationalError);

      await expect(saveFiles(mockId, mockFiles, mockUserId)).rejects.toBe(
        operationalError
      );
    });

    test("wraps non-operational errors from generateChunks in AppError", async () => {
      setupHappyPathMocks();
      generateChunks.mockRejectedValue(new Error("some low-level error"));

      await expect(saveFiles(mockId, mockFiles, mockUserId)).rejects.toThrow(
        "Failed to build chunks"
      );
      await expect(
        saveFiles(mockId, mockFiles, mockUserId)
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe("high mb files timing", () => {
    const highMbMockFiles = [
      {
        originalname: "file1.pdf",
        buffer: Buffer.alloc(15 * 1024 * 1024, "a"),
      },
      {
        originalname: "file2.pdf",
        buffer: Buffer.alloc(15 * 1024 * 1024, "b"),
      },
    ];

    test("30mb timing", async () => {
      setupHappyPathMocks();

      const start = performance.now();
      const result = await saveFiles(mockId, highMbMockFiles, mockUserId);
      const end = performance.now();

      console.log("saveFiles 30MB test took:", (end - start).toFixed(2), "ms");

      expect(uploadFilesToS3).toHaveBeenCalledWith(mockId, highMbMockFiles);
      expect(createPresignedUrls).toHaveBeenCalledWith(mockS3Keys);

      expect(extractPagesContent).toHaveBeenCalledWith(
        mockPresignedUrls.map((u) => u.presignedUrl),
        highMbMockFiles
      );

      expect(createInvertedSearch).toHaveBeenCalledWith(mockPagesContent);
      expect(buildOptimizedIndex).toHaveBeenCalledWith(mockPagesContent);
      expect(generateChunks).toHaveBeenCalledWith(mockPagesContent);

      expect(generateAndUploadEmbeddings).toHaveBeenCalledWith(
        mockId,
        mockUserId,
        mockPagesWithChunks
      );

      expect(uploadJsonToS3).toHaveBeenCalledWith(
        mockId,
        "pages_content",
        mockPagesWithChunks
      );
      expect(uploadJsonToS3).toHaveBeenCalledWith(
        mockId,
        "inverted_index",
        mockInvertedIndex
      );
      expect(uploadJsonToS3).toHaveBeenCalledWith(
        mockId,
        "build_index",
        mockOptimizedIndex.toJSON()
      );

      expect(saveFilesRecord).toHaveBeenCalledWith({
        id: mockId,
        userId: mockUserId,
        keys: mockS3Keys,
        buildIndex: { s3Key: mockS3JsonKeys.buildIndex },
        invertedIndex: { s3Key: mockS3JsonKeys.invertedIndex },
        pagesContent: { s3Key: mockS3JsonKeys.pagesContent },
      });

      expect(result).toEqual([{ id: 1, parse_id: mockId }]);
    });
  });
});
