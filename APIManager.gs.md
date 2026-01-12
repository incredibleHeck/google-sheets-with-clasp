// Centralized API Management - SuperBatch with Retry Logic
// 110 lines

/\*\*

- Calls Gemini API with Batching AND Exponential Backoff.
- Features:
- 1.  Speed: Processes multiple texts in one HTTP request.
- 2.  Reliability: Retries automatically if Google is busy (Error 429/500).
- 3.  JSON Safety: robust parsing to handle AI formatting quirks.
      function callGeminiBatchAPI(textArray, model, key, retryCount = 0) {

// 1. Validation
if (!textArray || textArray.length === 0) return [];
if (!key) throw new Error("API Key is missing.");

const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

// 2. Prompt Engineering (The "Balanced" Approach)
const prompt = `
You are a helpful writing assistant. I will provide a JSON array of text strings.
Your task for each string: 1. Fix all grammar, spelling, and punctuation errors. 2. Improve the sentence flow and clarity slightly, but **do not** change the tone to be overly formal. 3. Keep the original meaning exactly the same. 4. Return ONLY a valid JSON Array of strings. 5. The output array MUST have exactly the same number of items as the input array.

    Input Array:
    ${JSON.stringify(textArray)}

`;

const payload = {
contents: [{ parts: [{ text: prompt }] }],
generationConfig: { temperature: 0.5 }
};

const options = {
method: 'post',
contentType: 'application/json',
payload: JSON.stringify(payload),
muteHttpExceptions: true
};

try {
// 3. The Fetch
const response = UrlFetchApp.fetch(url, options);
const statusCode = response.getResponseCode();
const contentText = response.getContentText();
let json;

    try {
      json = JSON.parse(contentText);
    } catch (e) {
      throw new Error(`Invalid JSON response from Google. Status: ${statusCode}`);
    }

    // 4. Error Handling (The "Sniper" Logic)
    if (json.error || statusCode >= 400) {
      const errorCode = json.error ? json.error.code : statusCode;
      const errorMessage = json.error ? json.error.message : contentText;

      // RETRY LOGIC: If server is busy (429) or crashed (500+), wait and try again.
      if ((errorCode === 429 || errorCode >= 500) && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s... 2s... 4s...
        console.warn(`Batch API Busy (${errorCode}). Retrying in ${delay}ms...`);
        Utilities.sleep(delay);
        return callGeminiBatchAPI(textArray, model, key, retryCount + 1);
      }

      throw new Error(`API Error (${errorCode}): ${errorMessage}`);
    }

    // 5. Response Parsing
    let rawContent = json.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      throw new Error("Gemini returned an empty response.");
    }

    // Clean up Markdown (sometimes AI wraps output in ```json ... ```)
    rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();

    const result = JSON.parse(rawContent);

    // Final Safety Check: Did we get the right amount of answers?
    if (!Array.isArray(result) || result.length !== textArray.length) {
      throw new Error(`Mismatch: Sent ${textArray.length} items, received ${result ? result.length : 0}.`);
    }

    return result;

} catch (e) {
// 6. Network/Unknown Error Retry
// If the internet blipped but we have retries left, try again.
if (retryCount < 3) {
const delay = Math.pow(2, retryCount) \* 1000;
console.warn(`Network glitch: ${e.message}. Retrying...`);
Utilities.sleep(delay);
return callGeminiBatchAPI(textArray, model, key, retryCount + 1);
}

    // If all retries fail, LOG it and return ORIGINAL text to prevent crash
    console.error("Critical Batch Failure:", e);
    SpreadsheetApp.getActiveSpreadsheet().toast("AI connection failed. No changes made.", "HeckTeck");
    return textArray; // Fallback so user loses nothing

}
}

// Future API Batch Functions:
// - callGeminiBatchAnalyze() - For classification/analysis tasks
// - callGeminiBatchTranslate() - For language translation
// - callGeminiBatchExtract() - For data extraction from text
