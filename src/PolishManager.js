// Grammar/Tone Polishing - Batch API Optimized - 89 lines
// Uses APIManager for centralized API calls

const PolishManager = {
process: function() {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
const selection = sheet.getActiveRange();

    const range = RangeValidator.getValidDataRange(selection);
    if (!range) return;

    StateManager.saveForUndo(range);
    const data = range.getValues();
    const backgrounds = range.getBackgrounds();
    const highlightColor = "#fff2cc"; // HeckTeck style

    // 1. Collect Valid Inputs
    // Store the text AND where it came from (row, col)
    let batchRequest = [];

    for (let r = 0; r < data.length; r++) {
      for (let c = 0; c < data[0].length; c++) {
        const val = data[r][c];
        // Filter: Strings only, longer than 3 chars
        if (typeof val === 'string' && val.trim().length > 3) {
          batchRequest.push({
            originalText: val,
            rowIndex: r,
            colIndex: c
          });
        }
      }
    }

    if (batchRequest.length === 0) {
      SpreadsheetApp.getActiveSpreadsheet().toast("No valid text found to polish.", "HeckTeck");
      return;
    }

    SpreadsheetApp.getActiveSpreadsheet().toast(`Batch polishing ${batchRequest.length} cells...`, "HeckTeck");

    try {
      // 2. The Batch API Call (Delegated to APIManager)
      // Extract just the strings to send to AI
      const textsToSend = batchRequest.map(item => item.originalText);

      // Call the batch API function from APIManager
      const polishedTexts = callGeminiBatchAPI(textsToSend, Config.MODEL_NAME, Config.API_KEY);

      // 3. Map Results Back
      // Safety check: Ensure AI returned the same amount of items
      if (!polishedTexts || polishedTexts.length !== textsToSend.length) {
        throw new Error("AI returned a mismatched number of responses.");
      }

      let changesCount = 0;

      // Loop through our original request list and apply changes
      batchRequest.forEach((req, index) => {
        const original = req.originalText;
        const newText = polishedTexts[index];

        // Only update if it actually changed
        if (newText && newText !== original) {
          data[req.rowIndex][req.colIndex] = newText;          // Update data array
          backgrounds[req.rowIndex][req.colIndex] = highlightColor; // Update color array
          changesCount++;
        }
      });

      // 4. Bulk Write to Sheet
      if (changesCount > 0) {
        range.setValues(data);
        range.setBackgrounds(backgrounds);
        SpreadsheetApp.getActiveSpreadsheet().toast(`✨ Successfully polished ${changesCount} cells!`, "HeckTeck");
      } else {
        SpreadsheetApp.getActiveSpreadsheet().toast("No changes were necessary.", "HeckTeck");
      }

    } catch (e) {
      console.error("Batch Polish Failed:", e);
      SpreadsheetApp.getActiveSpreadsheet().toast("Error: " + e.message, "HeckTeck");
      StateManager.undo();
    }

}
};
