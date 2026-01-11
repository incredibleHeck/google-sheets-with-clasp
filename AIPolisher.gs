// ==========================================
//      TOOL 2: AI POLISHER (Gemini 2.0 Lite)
// ==========================================

function polishSelectedCells() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const selection = sheet.getActiveRange();
  const data = selection.getValues();
  
  // FORCE LITE MODEL
  const MODEL_NAME = "gemini-2.0-flash-lite"; 

  SpreadsheetApp.getActiveSpreadsheet().toast(`Powering up HeckTeck AI (Lite)...`, "HeckTeck", 60);

  let originalValues = []; 
  let changesCount = 0;
  let errorMsg = "";

  const polishedData = data.map((row, rIndex) => {
    return row.map((cellValue, cIndex) => {
      if (!originalValues[rIndex]) originalValues[rIndex] = [];
      originalValues[rIndex][cIndex] = cellValue;

      if (!cellValue || typeof cellValue !== 'string' || cellValue.length < 3) return cellValue;

      try {
        const polished = callGeminiAPI(cellValue, MODEL_NAME);
        let cleanPolished = polished.replace(/^"|"$/g, '').trim(); 
        
        if (cleanPolished !== cellValue) {
          changesCount++;
          return cleanPolished;
        }
        return cellValue;
      } catch (e) {
        errorMsg = e.message;
        return cellValue; 
      }
    });
  });

  if (errorMsg) {
    ui.alert("❌ AI Error", "Google says: " + errorMsg, ui.ButtonSet.OK);
    return;
  }

  if (changesCount > 0) {
    PROPS.setProperty('AI_LAST_RANGE', selection.getA1Notation());
    PROPS.setProperty('AI_LAST_SHEET', sheet.getName());
    PROPS.setProperty('AI_HISTORY_VALUES', JSON.stringify(originalValues));
    
    selection.setValues(polishedData);
    selection.setFontColor('#1155CC'); // Change text to Blue
    selection.setFontWeight('bold');   // Make it bold
    SpreadsheetApp.getActiveSpreadsheet().toast(`✨ Polished ${changesCount} comments!`, "HeckTeck AI");
  } else {
    ui.alert("✅ AI says this text is already grammatically perfect!");
  }
}

function callGeminiAPI(text, model) {
  if (!API_KEY) throw new Error("API Key is missing in Menu.gs");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
  
  const prompt = `Fix all grammar, punctuation, and capitalization errors in this teacher's report card comment. Ensure pronouns match the student's name mentioned. Return ONLY the corrected text. Do not explain anything. Comment: "${text}"`;
  
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

  if (!json.candidates || !json.candidates[0].content) {
    throw new Error("Content blocked or no response.");
  }

  return json.candidates[0].content.parts[0].text.trim();
}