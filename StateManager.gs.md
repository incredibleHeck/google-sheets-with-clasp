// Undo/Finalize/Styling - 75 lines

const StateManager = {
saveForUndo: function(range) {
const state = {
rangeA1: range.getA1Notation(),
values: range.getValues(),
colors: range.getFontColors(),
weights: range.getFontWeights(),
sheetName: range.getSheet().getName(),
};
const props = PropertiesService.getScriptProperties();
props.setProperty("LAST_UNDO_STATE", JSON.stringify(state));
},

undo: function() {
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

      props.deleteProperty("LAST_UNDO_STATE");
      SpreadsheetApp.getActiveSpreadsheet().toast("✓ Last action reverted.", "HeckTeck");
    } catch (e) {
      console.error("Undo failed:", e);
      SpreadsheetApp.getUi().alert("Failed to undo last action. State may be corrupted.");
    }

},

finalize: function() {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
const selection = sheet.getActiveRange();
const colors = selection.getFontColors();
const weights = selection.getFontWeights();
const props = PropertiesService.getScriptProperties();

    const baseColor = props.getProperty("BASE_TEXT_COLOR") || "#000000";
    const baseWeight = props.getProperty("BASE_FONT_WEIGHT") || "normal";

    const newColors = colors.map(row => row.map(color =>
      color === StyleManager.ACTIVE_COLOR ? baseColor : color
    ));
    const newWeights = weights.map(row => row.map(weight =>
      weight === StyleManager.ACTIVE_WEIGHT ? baseWeight : weight
    ));

    selection.setFontColors(newColors);
    selection.setFontWeights(newWeights);
    SpreadsheetApp.getActiveSpreadsheet().toast("✅ All changes finalized!", "HeckTeck");

},

detectBaseStyles: function() {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
const selection = sheet.getActiveRange();
const cell = selection.getCell(1, 1);
const color = cell.getFontColor();
const weight = cell.getFontWeight();

    const props = PropertiesService.getScriptProperties();
    props.setProperty("BASE_TEXT_COLOR", color);
    props.setProperty("BASE_FONT_WEIGHT", weight);

    SpreadsheetApp.getActiveSpreadsheet().toast(`✓ Base style detected: ${color}, ${weight}`, "HeckTeck");

}
};
