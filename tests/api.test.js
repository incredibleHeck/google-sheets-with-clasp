const { callGeminiAPI } = require('../src/api');
const { UrlFetchApp } = require('../test-utils/gas-mocks');

describe('callGeminiAPI', () => {
  const apiKey = 'test-key';
  const model = 'gemini-1.5-flash';
  const text = 'test comment';

  beforeEach(() => {
    jest.clearAllMocks();
    global.UrlFetchApp = UrlFetchApp;
  });

  test('successful API call', () => {
    UrlFetchApp.fetch.mockReturnValue({
      getContentText: () => JSON.stringify({
        candidates: [{ content: { parts: [{ text: 'Polished text' }] } }]
      })
    });

    const result = callGeminiAPI(text, model, apiKey);
    expect(result).toBe('Polished text');
    expect(UrlFetchApp.fetch).toHaveBeenCalled();
  });

  test('handles 429 quota error', () => {
    UrlFetchApp.fetch.mockReturnValue({
      getContentText: () => JSON.stringify({
        error: { code: 429, message: 'Quota exhausted' }
      })
    });

    expect(() => callGeminiAPI(text, model, apiKey)).toThrow('(429): Quota exhausted');
  });

  test('handles missing candidates', () => {
    UrlFetchApp.fetch.mockReturnValue({
      getContentText: () => JSON.stringify({ candidates: [] })
    });

    expect(() => callGeminiAPI(text, model, apiKey)).toThrow('Content blocked or no response.');
  });
});
