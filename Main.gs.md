# Main.gs

```javascript
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("HeckTeck Tools")
    .addItem("⚡ Auto-Fix Pronouns (Sea Blue Text)", "fixPronouns")
    .addItem("✨ AI Polish (Grammar & Tone)", "polishSelectedCells")
    .addSeparator()
    .addItem("↩️ Undo Last Action", "undoLastAction")
    .addItem("✅ Finalize/Approve All Changes", "finalizeChanges")
    .addItem("🔍 Detect Base Styles", "detectBaseStyles")
    .addToUi();
}

/**
 * Saves the current state of a range before a tool modifies it.
 * @param {GoogleAppsScript.Spreadsheet.Range} range
 */
function saveStateForUndo(range) {
  const state = {
    rangeA1: range.getA1Notation(),
    values: range.getValues(),
    colors: range.getFontColors(),
    weights: range.getFontWeights(),
    sheetName: range.getSheet().getName(),
  };
  const props = PropertiesService.getScriptProperties();
  props.setProperty("LAST_UNDO_STATE", JSON.stringify(state));
}

/**
 * Reverts the last tool action (Pronouns or AI Polish).
 */
function undoLastAction() {
  const props = PropertiesService.getScriptProperties();
  const stateStr = props.getProperty("LAST_UNDO_STATE");

  if (!stateStr) {
    SpreadsheetApp.getUi().alert("No recent changes found to undo.");
    return;
  }

  try {
    const state = JSON.parse(stateStr);
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(state.sheetName);

    if (!sheet) {
      SpreadsheetApp.getUi().alert(`Sheet '${state.sheetName}' not found.`);
      return;
    }

    const range = sheet.getRange(state.rangeA1);
    range.setValues(state.values);
    range.setFontColors(state.colors);
    range.setFontWeights(state.weights);

    // Clear undo state after reverting
    props.deleteProperty("LAST_UNDO_STATE");

    SpreadsheetApp.getActiveSpreadsheet().toast(
      "Last action reverted.",
      "HeckTeck"
    );
  } catch (e) {
    console.error("Undo failed:", e);
    SpreadsheetApp.getUi().alert(
      "Failed to undo last action. State may be corrupted."
    );
  }
}

function finalizeChanges() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const selection = sheet.getActiveRange();
  const colors = selection.getFontColors();
  const weights = selection.getFontWeights();
  const props = PropertiesService.getScriptProperties();

  const baseColor = props.getProperty("BASE_TEXT_COLOR") || "#ffffff";
  const baseWeight = props.getProperty("BASE_FONT_WEIGHT") || "normal";

  const newColors = colors.map((row) =>
    row.map((color) =>
      color === StyleManager.ACTIVE_COLOR ? baseColor : color
    )
  );
  const newWeights = weights.map((row) =>
    row.map((weight) =>
      weight === StyleManager.ACTIVE_WEIGHT ? baseWeight : weight
    )
  );

  selection.setFontColors(newColors);
  selection.setFontWeights(newWeights);
  SpreadsheetApp.getActiveSpreadsheet().toast(
    "All changes finalized!",
    "HeckTeck"
  );
}

function detectBaseStyles() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const selection = sheet.getActiveRange();
  const cell = selection.getCell(1, 1);
  const color = cell.getFontColor();
  const weight = cell.getFontWeight();

  const props = PropertiesService.getScriptProperties();
  props.setProperty("BASE_TEXT_COLOR", color);
  props.setProperty("BASE_FONT_WEIGHT", weight);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `Base style detected: ${color}, ${weight}`,
    "HeckTeck"
  );
}

function polishSelectedCells() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const selection = sheet.getActiveRange();
  const data = selection.getValues();
  let changesCount = 0;
  let errorCount = 0;
  const errors = [];

  // Save state for undo
  saveStateForUndo(selection);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Polishing selected cells...",
    "HeckTeck AI"
  );

  const processedData = SelectionProcessor.processData(data, (text, rowIdx) => {
    try {
      const polished = callGeminiAPI(text, Config.MODEL_NAME, Config.API_KEY);
      if (polished !== text) {
        changesCount++;
        return polished;
      }
      return text;
    } catch (e) {
      errorCount++;
      errors.push(`Row ${selection.getRow() + rowIdx}: ${e.message}`);
      console.error(
        `Polishing error at row ${selection.getRow() + rowIdx}:`,
        e
      );
      return text;
    }
  });

  if (changesCount > 0) {
    selection.setValues(processedData);
    StyleManager.applyActiveStyle(selection);
  }

  // Provide detailed feedback
  let toastMessage = "";
  if (changesCount > 0 && errorCount === 0) {
    toastMessage = `✓ Polished ${changesCount} cells!`;
  } else if (changesCount > 0 && errorCount > 0) {
    toastMessage = `⚠ Polished ${changesCount} cells. ${errorCount} errors - check logs.`;
  } else if (errorCount > 0) {
    toastMessage = `✗ ${errorCount} errors occurred. No changes made.`;
  } else {
    toastMessage = "No changes needed.";
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(toastMessage, "HeckTeck AI");

  if (errors.length > 0 && errors.length <= 5) {
    console.warn("Polishing errors:", errors.join("\n"));
  }
}

function fixPronouns() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const selection = sheet.getActiveRange();
  const data = selection.getValues();
  const startRow = selection.getRow();

  // 1. Get Classlist Data
  let classListSheet;
  try {
    classListSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
      Config.CLASSLIST_SHEET_NAME
    );
    if (!classListSheet) {
      SpreadsheetApp.getUi().alert(
        `Error: Sheet '${Config.CLASSLIST_SHEET_NAME}' not found.`
      );
      return;
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert(`Error accessing classlist: ${e.message}`);
    return;
  }

  const classData = classListSheet.getDataRange().getValues();
  const studentGenderMap = new Map();

  // Skip header
  for (let i = 1; i < classData.length; i++) {
    const name = classData[i][Config.CLASSLIST_NAME_COL - 1]; // 0-based index
    const gender = classData[i][Config.CLASSLIST_GENDER_COL - 1];
    if (name) {
      // Normalize gender: "M"/"Male"/"MALE" -> "male", "F"/"Female"/"FEMALE" -> "female"
      const normalizedGender = normalizeGender(gender);
      if (normalizedGender) {
        studentGenderMap.set(name.trim().toLowerCase(), normalizedGender);
      }
    }
  }

  // Save state for undo
  saveStateForUndo(selection);

  let changesCount = 0;
  let skippedCount = 0;

  const processedData = SelectionProcessor.processData(data, (text, rIndex) => {
    const currentRow = startRow + rIndex;
    if (currentRow < Config.DATA_START_ROW) {
      skippedCount++;
      return text;
    }

    try {
      // Get Student Name from Report Sheet (Col A)
      const nameCell = sheet.getRange(currentRow, Config.REPORT_NAME_COL);
      const studentName = nameCell.getValue();

      if (!studentName) return text;

      const gender = studentGenderMap.get(studentName.trim().toLowerCase());
      if (!gender) return text; // Student not found in classlist or no gender set

      let newText = text;

      if (gender === "male") {
        newText = newText
          .replace(/\bShe\b/g, "He")
          .replace(/\bshe\b/g, "he")
          .replace(/\bHer\b/g, "His")
          .replace(/\bher\b/g, "his")
          .replace(/\bHers\b/g, "His")
          .replace(/\bhers\b/g, "his");
      } else if (gender === "female") {
        newText = newText
          .replace(/\bHe\b/g, "She")
          .replace(/\bhe\b/g, "she")
          .replace(/\bHis\b/g, "Her")
          .replace(/\bhis\b/g, "her")
          .replace(/\bHim\b/g, "Her")
          .replace(/\bhim\b/g, "her");
      }

      if (newText !== text) {
        changesCount++;
        return newText;
      }
      return text;
    } catch (e) {
      console.error(`Error processing row ${currentRow}:`, e);
      return text;
    }
  });

  if (changesCount > 0) {
    selection.setValues(processedData);
    StyleManager.applyActiveStyle(selection);
  }

  let toastMessage = "";
  if (changesCount > 0) {
    toastMessage = `✓ Fixed pronouns in ${changesCount} cells!`;
  } else {
    toastMessage = "No pronoun fixes needed.";
  }

  if (skippedCount > 0) {
    toastMessage += ` (${skippedCount} rows before DATA_START_ROW skipped)`;
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(toastMessage, "HeckTeck");
}

/**
 * Normalizes gender values to standard 'male' or 'female' format.
 * Accepts: "M", "Male", "male", "MALE", "F", "Female", "female", "FEMALE"
 * @param {string} gender - Raw gender value from spreadsheet
 * @returns {string} - Normalized gender ('male', 'female') or empty string if invalid
 */
function normalizeGender(gender) {
  if (!gender) return "";

  const normalized = gender.trim().toUpperCase();

  if (normalized === "M" || normalized === "MALE") {
    return "male";
  } else if (normalized === "F" || normalized === "FEMALE") {
    return "female";
  }

  return "";
}
```

## Key Improvements:

1. **Undo/Finalize Complete** - Full state saving and recovery for any changes
2. **API Caching & Retry** - Exponential backoff handles quota limits and transient errors
3. **Gender Normalization** - Accepts "M", "F", "Male", "Female" in any case
4. **Enhanced Error Handling** - Detailed feedback on what succeeded/failed
5. **Sea Blue Styling** - Consistent #00f9ff color throughout
6. **Secure Configuration** - API key via Script Properties, not hardcoded
