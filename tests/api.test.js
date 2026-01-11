const { callGeminiAPI, APICache } = require("../src/api");
const { UrlFetchApp, Utilities } = require("../test-utils/gas-mocks");

describe("callGeminiAPI", () => {
  const apiKey = "test-key";
  const model = "gemini-2.5-flash";
  const text = "test comment";

  beforeEach(() => {
    jest.clearAllMocks();
    global.UrlFetchApp = UrlFetchApp;
    global.Utilities = Utilities;
    APICache.clear();
  });

  test("successful API call", () => {
    UrlFetchApp.fetch.mockReturnValue({
      getContentText: () =>
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: "Polished text" }] } }],
        }),
    });

    const result = callGeminiAPI(text, model, apiKey);
    expect(result).toBe("Polished text");
    expect(UrlFetchApp.fetch).toHaveBeenCalled();
  });

  test("caches successful responses", () => {
    UrlFetchApp.fetch.mockReturnValue({
      getContentText: () =>
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: "Polished text" }] } }],
        }),
    });

    const result1 = callGeminiAPI(text, model, apiKey);
    const result2 = callGeminiAPI(text, model, apiKey);

    expect(result1).toBe("Polished text");
    expect(result2).toBe("Polished text");
    // Should only call fetch once due to caching
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(1);
  });

  test("retries on 429 quota error (up to 3 times)", () => {
    // All 3 retries return 429
    UrlFetchApp.fetch.mockReturnValue({
      getContentText: () =>
        JSON.stringify({
          error: { code: 429, message: "Quota exhausted" },
        }),
    });

    expect(() => callGeminiAPI(text, model, apiKey)).toThrow(
      "(429): Quota exhausted"
    );
    // Should retry 3 times plus initial call = 4 total
    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(4);
    // Should have slept between retries (3 times)
    expect(Utilities.sleep).toHaveBeenCalledTimes(3);
  });

  test("handles missing candidates", () => {
    UrlFetchApp.fetch.mockReturnValue({
      getContentText: () => JSON.stringify({ candidates: [] }),
    });

    expect(() => callGeminiAPI(text, model, apiKey)).toThrow(
      "Content blocked or no response."
    );
  });

  test("throws error when API key is missing", () => {
    expect(() => callGeminiAPI(text, model, "")).toThrow("API Key is missing.");
  });
});
