import { jest } from "@jest/globals";

jest.unstable_mockModule("../utils/supabase/client.js", () => ({
  __esModule: true,
  default: { from: jest.fn() },
}));

jest.unstable_mockModule("./parse.js", () => ({
  __esModule: true,
  parse: jest.fn(),
}));

jest.unstable_mockModule("./chat/queryClassifier.js", () => ({
  __esModule: true,
  classifyQuery: jest.fn(),
}));

jest.unstable_mockModule("./chat/contextBuilder.js", () => ({
  __esModule: true,
  buildContext: jest.fn(),
  buildFullContext: jest.fn(),
}));

jest.unstable_mockModule("../utils/openAi/callToChat.js", () => ({
  __esModule: true,
  callToChat: jest.fn(),
}));

jest.unstable_mockModule("./chat/systemPrompt.js", () => ({
  __esModule: true,
  createSystemPrompt: jest.fn(),
}));

const supabase = (await import("../utils/supabase/client.js")).default;
const { parse } = await import("./parse.js");
const { classifyQuery } = await import("./chat/queryClassifier.js");
const { buildContext, buildFullContext } = await import(
  "./chat/contextBuilder.js"
);
const { callToChat } = await import("../utils/openAi/callToChat.js");
const { createSystemPrompt } = await import("./chat/systemPrompt.js");
const { chat } = await import("./chat.js");
import { AppError, ValidationError } from "../middleware/errorHandler.js";

describe("chat function - production level tests", () => {
  const mockId = "parse-id";
  const mockSearch = "search query";
  const mockUserId = "user-123";

  const mockPages = [
    { id: "page1", content: "Page 1" },
    { id: "page2", content: "Page 2" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    const eq2 = jest.fn().mockResolvedValue({
      data: [{ pages_metadata: mockPages }],
      error: null,
    });
    const eq1 = jest.fn().mockReturnValue({ eq: eq2 });
    const select = jest.fn().mockReturnValue({ eq: eq1 });
    supabase.from.mockReturnValue({ select });

    classifyQuery.mockResolvedValue("search");
    parse.mockResolvedValue({
      success: true,
      searchResults: [{ pageId: "page1", score: 0.9, startY: 0, endY: 100 }],
    });
    buildContext.mockReturnValue("mock context");
    buildFullContext.mockReturnValue("full context");
    createSystemPrompt.mockReturnValue("system prompt");
    callToChat.mockResolvedValue("AI response");
  });

  test("returns AI response for valid search query", async () => {
    const result = await chat(mockId, mockSearch, mockUserId);

    expect(result).toEqual({ success: true, response: "AI response" });
    expect(supabase.from).toHaveBeenCalledWith("files");
    expect(classifyQuery).toHaveBeenCalledWith(mockSearch);
    expect(parse).toHaveBeenCalledWith(mockId, mockSearch, mockUserId, {
      searchMode: "hybrid",
      topK: 7,
    });
    expect(buildContext).toHaveBeenCalled();
    expect(callToChat).toHaveBeenCalled();
  });

  test("uses full context for direct query type", async () => {
    classifyQuery.mockResolvedValue("direct");

    const result = await chat(mockId, mockSearch, mockUserId);

    expect(buildFullContext).toHaveBeenCalledWith(mockPages);
    expect(result.response).toBe("AI response");
  });

  test("throws ValidationError for missing parse ID", async () => {
    await expect(chat("", mockSearch, mockUserId)).rejects.toThrow(
      ValidationError
    );
  });

  test("throws ValidationError for empty search", async () => {
    await expect(chat(mockId, "   ", mockUserId)).rejects.toThrow(
      ValidationError
    );
  });

  test("throws ValidationError for missing user ID", async () => {
    await expect(chat(mockId, mockSearch, "")).rejects.toThrow(ValidationError);
  });

  test("throws AppError when no files found", async () => {
    const eq2 = jest.fn().mockResolvedValue({ data: [], error: null });
    const eq1 = jest.fn().mockReturnValue({ eq: eq2 });
    const select = jest.fn().mockReturnValue({ eq: eq1 });
    supabase.from.mockReturnValue({ select });

    await expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(
      AppError
    );
  });

  test("throws AppError on Supabase error", async () => {
    const eq2 = jest
      .fn()
      .mockResolvedValue({ data: null, error: new Error("DB failure") });
    const eq1 = jest.fn().mockReturnValue({ eq: eq2 });
    const select = jest.fn().mockReturnValue({ eq: eq1 });
    supabase.from.mockReturnValue({ select });

    await expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(
      AppError
    );
  });

  test("throws AppError when classifyQuery fails", async () => {
    classifyQuery.mockRejectedValue(new Error("classifier failure"));

    await expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(
      AppError
    );
  });

  test("throws AppError for invalid queryType", async () => {
    classifyQuery.mockResolvedValue("unknown");

    await expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(
      AppError
    );
  });

  test("throws AppError when parse fails", async () => {
    parse.mockRejectedValue(new Error("parse failure"));

    await expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(
      AppError
    );
  });

  test("throws AppError when parse returns empty results", async () => {
    parse.mockResolvedValue({ success: true, searchResults: [] });

    await expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(
      AppError
    );
  });

  test("throws AppError when buildContext fails", async () => {
    buildContext.mockImplementation(() => {
      throw new Error("context fail");
    });

    await expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(
      AppError
    );
  });

  test("throws AppError when buildFullContext fails", async () => {
    classifyQuery.mockResolvedValue("direct");
    buildFullContext.mockImplementation(() => {
      throw new Error("full context fail");
    });

    await expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(
      AppError
    );
  });

  test("throws AppError when callToChat fails", async () => {
    callToChat.mockRejectedValue(new Error("AI fail"));

    await expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(
      AppError
    );
  });

  test("throws AppError when AI response is invalid", async () => {
    callToChat.mockResolvedValue(null);

    await expect(chat(mockId, mockSearch, mockUserId)).rejects.toThrow(
      AppError
    );
  });
});
