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

/**
 * Extracts the valid data range from a selection, starting at DATA_START_ROW.
 * If entire column(s) selected, returns from DATA_START_ROW to last row with data.
 * @param {GoogleAppsScript.Spreadsheet.Range} range
 * @return {GoogleAppsScript.Spreadsheet.Range} - Filtered range starting at DATA_START_ROW
 */
function getValidDataRange(range) {
  const sheet = range.getSheet();
  const lastRow = sheet.getLastRow();
  const startRow = Math.max(Config.DATA_START_ROW, range.getRow());
  const endRow = Math.min(lastRow, range.getRow() + range.getNumRows() - 1);

  if (startRow > endRow) {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      "No data found starting from row " + Config.DATA_START_ROW,
      "HeckTeck"
    );
    return null;
  }

  return sheet.getRange(
    startRow,
    range.getColumn(),
    endRow - startRow + 1,
    range.getNumColumns()
  );
}

/**
 * Polishes selected cells using Gemini API for grammar/punctuation fixes.
 */
function polishSelectedCells() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const selection = sheet.getActiveRange();

  // Get valid data range starting from row 4
  const range = getValidDataRange(selection);
  if (!range) return;

  // Save state for undo
  saveStateForUndo(range);

  const data = range.getValues();
  const baseColors = range.getFontColors();
  const baseWeights = range.getFontWeights();

  try {
    const processedData = SelectionProcessor.processData(data, (text) => {
      const polished = callGeminiAPI(text, Config.MODEL_NAME, Config.API_KEY);
      return polished || text;
    });

    range.setValues(processedData);
    range.getFontColors().forEach((row, i) => {
      row.forEach((_, j) => {
        StyleManager.applyActiveStyle(range.getCell(i + 1, j + 1));
      });
    });

    const toastMessage = `✓ Polished ${range.getNumRows()} cells starting from row ${range.getRow()}`;
    SpreadsheetApp.getActiveSpreadsheet().toast(toastMessage, "HeckTeck");
  } catch (e) {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Error polishing cells: ${e.message}`,
      "HeckTeck Error"
    );
    undoLastAction();
  }
}

/**
 * Fixes pronouns in selected cells based on CLASSLIST gender data.
 */
function fixPronouns() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const selection = sheet.getActiveRange();

  // Get valid data range starting from row 4
  const range = getValidDataRange(selection);
  if (!range) return;

  // Save state for undo
  saveStateForUndo(range);

  const classlistSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    Config.CLASSLIST_SHEET_NAME
  );
  if (!classlistSheet) {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Sheet "${Config.CLASSLIST_SHEET_NAME}" not found`,
      "HeckTeck Error"
    );
    return;
  }

  const classlistData = classlistSheet.getDataRange().getValues();
  const genderMap = {};

  for (let i = Config.DATA_START_ROW - 1; i < classlistData.length; i++) {
    const name = classlistData[i][Config.CLASSLIST_NAME_COL - 1];
    const gender = classlistData[i][Config.CLASSLIST_GENDER_COL - 1];
    if (name) {
      genderMap[name.trim()] = normalizeGender(gender);
    }
  }

  const data = range.getValues();
  const baseColors = range.getFontColors();
  const baseWeights = range.getFontWeights();
  let changesCount = 0;

  try {
    const processedData = SelectionProcessor.processData(data, (text, rowIndex) => {
      const studentName = sheet.getRange(range.getRow() + rowIndex, Config.REPORT_NAME_COL).getValue();
      const gender = genderMap[studentName?.toString().trim()] || "unknown";

      if (gender === "unknown") return text;

      const pronouns = gender === "male"
        ? { he: "he", him: "him", his: "his", He: "He", Him: "Him", His: "His" }
        : { he: "she", him: "her", his: "her", He: "She", Him: "Her", His: "Her" };

      let result = text;
      Object.entries(pronouns).forEach(([from, to]) => {
        const regex = new RegExp(`\\b${from}\\b`, "g");
        result = result.replace(regex, to);
      });

      if (result !== text) changesCount++;
      return result;
    });

    range.setValues(processedData);
    range.getFontColors().forEach((row, i) => {
      row.forEach((_, j) => {
        StyleManager.applyActiveStyle(range.getCell(i + 1, j + 1));
      });
    });

    const toastMessage = `✓ Fixed pronouns in ${changesCount} cells (rows ${range.getRow()}-${range.getLastRow()})`;
    SpreadsheetApp.getActiveSpreadsheet().toast(toastMessage, "HeckTeck");
  } catch (e) {
    SpreadsheetApp.getActiveSpreadsheet().toast(
      `Error fixing pronouns: ${e.message}`,
      "HeckTeck Error"
    );
    undoLastAction();
  }
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
