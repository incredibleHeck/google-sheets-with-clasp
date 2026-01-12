```javascript
// ==========================================
// HECKTECK StyleManager.gs
// ==========================================
const StyleManager = {
  // Config:  bright cyan is used for active text
  ACTIVE_COLOR: "#00f9ff",
  ACTIVE_WEIGHT: "bold",

  // Default styles for "Reset" actions
  DEFAULT_COLOR: "#000000",
  DEFAULT_WEIGHT: "normal",
  DEFAULT_BG: "#ffffff",

  /**
   * Applies the HeckTeck active style to the given range.
   * @param {GoogleAppsScript.Spreadsheet.Range} range
   */
  applyActiveStyle: function (range) {
    // These are single-value setters (apply to whole range)
    // Much faster than building arrays if the style is uniform
    range.setFontColor(this.ACTIVE_COLOR);
    range.setFontWeight(this.ACTIVE_WEIGHT);
  },

  /**
   * Reverts the range to the provided base colors and weights.
   * Includes safety checks to prevent crashes.
   * @param {GoogleAppsScript.Spreadsheet.Range} range
   * @param {string[][]} baseColors
   * @param {string[][]} baseWeights
   */
  revertStyle: function (range, baseColors, baseWeights) {
    const rows = range.getNumRows();
    const cols = range.getNumColumns();

    // SAFETY CHECK: Ensure the saved history matches the current range size
    if (baseColors.length !== rows || baseColors[0].length !== cols) {
      console.warn("StyleManager: Undo skipped. Range size mismatch.");
      SpreadsheetApp.getActiveSpreadsheet().toast(
        "Cannot undo style: Selection changed.",
        "HeckTeck"
      );
      return;
    }

    // Direct batch update (Works for 1 cell or 1000 cells)
    range.setFontColors(baseColors);
    range.setFontWeights(baseWeights);
  },

  /**
   * completely cleans the range (removes color/bold/background)
   * Useful for a "Reset" menu button.
   */
  resetToDefault: function (range) {
    range.setFontColor(this.DEFAULT_COLOR);
    range.setFontWeight(this.DEFAULT_WEIGHT);
    range.setBackground(this.DEFAULT_BG);
  },
};
```
