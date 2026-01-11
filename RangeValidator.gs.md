// Range Validation & Styling - 45 lines

const RangeValidator = {
getValidDataRange: function(range) {
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

    return sheet.getRange(startRow, range.getColumn(), endRow - startRow + 1, range.getNumColumns());

},

applyActiveStyle: function(range) {
const colors = range.getFontColors().map(row =>
row.map(() => StyleManager.ACTIVE_COLOR)
);
const weights = range.getFontWeights().map(row =>
row.map(() => StyleManager.ACTIVE_WEIGHT)
);
range.setFontColors(colors);
range.setFontWeights(weights);
}
};
