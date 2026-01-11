# Api.gs

```javascript
/**
 * Calls the Gemini API to polish text with a strict character limit.
 */
function callGeminiAPI(text) {
  if (!API_KEY) throw new Error("API Key is missing in Config.gs");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

  // Added strict character limit constraint to the prompt
  const prompt = `Fix all grammar, punctuation, and capitalization errors in this teacher's report card comment. 
  Ensure pronouns match the student's name mentioned. 
  STRICT CONSTRAINT: The final response MUST NOT exceed 280 characters. 
  Return ONLY the corrected text. Do not explain anything. 
  Comment: "${text}"`;

  const payload = { "contents": [{ "parts": [{ "text": prompt }] }] };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());

  if (json.error) {
    throw new Error(`(${json.error.code}): ${json.error.message}`);
  }

  if (!json.candidates || json.candidates.length === 0 || !json.candidates[0].content) {
    throw new Error("Content blocked or no response.");
  }

  return json.candidates[0].content.parts[0].text.trim();
}
```