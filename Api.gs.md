# Api.gs

```javascript
// Cache for avoiding duplicate API calls
const APICache = {
  cache: {},

  get: function (text) {
    return this.cache[text];
  },

  set: function (text, result) {
    this.cache[text] = result;
  },

  clear: function () {
    this.cache = {};
  },
};

/**
 * Calls Gemini API with exponential backoff retry logic (3 attempts)
 * @param {string} text - Text to process
 * @param {string} model - Model name
 * @param {string} apiKey - API key
 * @param {number} retryCount - Current retry attempt (internal use)
 * @returns {string} Processed text
 */
function callGeminiAPI(text, model, apiKey, retryCount = 0) {
  if (!apiKey) throw new Error("API Key is missing.");

  // Check cache first
  const cached = APICache.get(text);
  if (cached) return cached;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `Fix all grammar, punctuation, and capitalization errors in this teacher's report card comment. 
Ensure pronouns match the student's name mentioned. 
Return ONLY the corrected text. Do not explain anything. 
Comment: "${text}"`;

  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());

    if (json.error) {
      const code = json.error.code;
      const message = json.error.message;

      // Retry on 429 (quota) or 500+ (server errors)
      if ((code === 429 || code >= 500) && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        Utilities.sleep(delay);
        return callGeminiAPI(text, model, apiKey, retryCount + 1);
      }

      throw new Error(`(${code}): ${message}`);
    }

    if (
      !json.candidates ||
      json.candidates.length === 0 ||
      !json.candidates[0].content
    ) {
      throw new Error("Content blocked or no response.");
    }

    const result = json.candidates[0].content.parts[0].text.trim();
    APICache.set(text, result); // Cache successful result
    return result;
  } catch (e) {
    // Retry on network errors (non-API errors) if retries remain
    if (retryCount < 3 && e.message.indexOf("(") === -1) {
      const delay = Math.pow(2, retryCount) * 1000;
      Utilities.sleep(delay);
      return callGeminiAPI(text, model, apiKey, retryCount + 1);
    }
    throw e;
  }
}
```

## Improvements in this version:

1. **Exponential Backoff Retry Logic** - Automatically retries failed API calls with delays (1s, 2s, 4s)
2. **API Response Caching** - Avoids duplicate API calls for identical text
3. **Smart Error Handling** - Distinguishes between API errors (429, 500+) and network errors
4. **Performance Optimization** - Reduces API quota usage and improves speed for repeated text
