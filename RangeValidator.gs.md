// Range Validation & Styling - Optimized - 54 lines

const RangeValidator = {
getValidDataRange: function(range) {
const sheet = range.getSheet();
const lastRow = sheet.getLastRow();

    // 1. Calculate boundaries
    // Ensure we don't start before the configured data row (e.g., Row 2 or 3)
    const startRow = Math.max(Config.DATA_START_ROW, range.getRow());

    // Ensure we don't go past the actual data in the sheet
    const endRow = Math.min(lastRow, range.getRow() + range.getNumRows() - 1);

    // 2. Validation Check
    // If the selection is entirely in the header or below the data, fail gracefully
    if (startRow > endRow) {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        `Selection is outside the valid data area (starts at row ${Config.DATA_START_ROW}).`,
        "HeckTeck"
      );
      return null;
    }

    // 3. Return the constrained range
    return sheet.getRange(
      startRow,
      range.getColumn(),
      endRow - startRow + 1,
      range.getNumColumns()
    );

}
};
