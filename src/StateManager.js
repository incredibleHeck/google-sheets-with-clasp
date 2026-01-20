// Undo/Finalize/Styling - 115 lines

const StateManager = {
// Use Cache for Undo (100KB limit) instead of Properties (9KB limit)
// Use Properties only for persistent settings (Base Styles)
cache: CacheService.getDocumentCache(),
props: PropertiesService.getScriptProperties(),

saveForUndo: function(range) {
try {
const state = {
rangeA1: range.getA1Notation(),
values: range.getValues(),
colors: range.getFontColors(),
weights: range.getFontWeights(),
sheetName: range.getSheet().getName(),
};

      const payload = JSON.stringify(state);

      // SAFETY CHECK: CacheService limit is 100KB
      if (payload.length > 100000) {
        SpreadsheetApp.getActiveSpreadsheet().toast("⚠️ Selection too large for Undo protection.", "HeckTeck");
        console.warn("Undo state too large: " + payload.length + " bytes");
        return;
      }

      // Save to cache for 25 minutes (1500 seconds)
      this.cache.put("LAST_UNDO_STATE", payload, 1500);

    } catch (e) {
      console.error("Failed to save undo state:", e);
    }

},

undo: function() {
const stateStr = this.cache.get("LAST_UNDO_STATE");

    if (!stateStr) {
      SpreadsheetApp.getUi().alert("No recent changes found to undo (or undo expired).");
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

      // Restore Everything
      const range = sheet.getRange(state.rangeA1);
      range.setValues(state.values);

      // Use our StyleManager if available, or manual set
      if (typeof StyleManager !== 'undefined') {
        StyleManager.revertStyle(range, state.colors, state.weights);
      } else {
        range.setFontColors(state.colors);
        range.setFontWeights(state.weights);
      }

      // Clear the cache so you can't undo twice (cleaner UX)
      this.cache.remove("LAST_UNDO_STATE");

      SpreadsheetApp.getActiveSpreadsheet().toast("✓ Last action reverted.", "HeckTeck");

    } catch (e) {
      console.error("Undo failed:", e);
      SpreadsheetApp.getUi().alert("Failed to undo. State data may be corrupted.");
    }

},

finalize: function() {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
const selection = sheet.getActiveRange();

    // Get current state
    const colors = selection.getFontColors();
    const weights = selection.getFontWeights();

    // Get the defaults (or fallback to black/normal)
    const baseColor = this.props.getProperty("BASE_TEXT_COLOR") || "#000000";
    const baseWeight = this.props.getProperty("BASE_FONT_WEIGHT") || "normal";

    // LOGIC: Loop through and replace ONLY the "Active" style with "Base" style
    // This preserves manual formatting (like red text for errors) that wasn't touched by AI
    const newColors = colors.map(row => row.map(color =>
      // Compare broadly (case insensitive) to catch #00f9ff vs #00F9FF
      color.toLowerCase() === StyleManager.ACTIVE_COLOR.toLowerCase() ? baseColor : color
    ));

    const newWeights = weights.map(row => row.map(weight =>
      weight === StyleManager.ACTIVE_WEIGHT ? baseWeight : weight
    ));

    // Batch Update
    selection.setFontColors(newColors);
    selection.setFontWeights(newWeights);

    SpreadsheetApp.getActiveSpreadsheet().toast("✅ Changes finalized & merged!", "HeckTeck");

},

detectBaseStyles: function() {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
const selection = sheet.getActiveRange();

    // We only check the top-left cell of the selection
    const cell = selection.getCell(1, 1);
    const color = cell.getFontColor();
    const weight = cell.getFontWeight();

    // Save these permanently in Properties (persist across sessions)
    this.props.setProperty("BASE_TEXT_COLOR", color);
    this.props.setProperty("BASE_FONT_WEIGHT", weight);

    SpreadsheetApp.getActiveSpreadsheet().toast(`✓ Base style saved: ${color} / ${weight}`, "HeckTeck");

}
};
