```javascript
// ==========================================
// HECKTECK StyleManager.gs
// ==========================================
const StyleManager = {
ACTIVE_COLOR: '#00f9ff', // Sea Blue
ACTIVE_WEIGHT: 'bold',

/\*\*

- Applies the active style (Blue/Bold) to the given range.
- @param {GoogleAppsScript.Spreadsheet.Range} range
  \*/
  applyActiveStyle: function(range) {
  range.setFontColor(this.ACTIVE_COLOR);
  range.setFontWeight(this.ACTIVE_WEIGHT);
  },

/\*\*

- Reverts the range to the provided base colors and weights.
- @param {GoogleAppsScript.Spreadsheet.Range} range
- @param {string[][]} baseColors
- @param {string[][]} baseWeights
  \*/
  revertStyle: function(range, baseColors, baseWeights) {
  if (baseColors.length === 1 && baseColors[0].length === 1) {
  range.setFontColor(baseColors[0][0]);
  range.setFontWeight(baseWeights[0][0]);
  } else {
  // If it's a range
  range.setFontColors(baseColors);
  range.setFontWeights(baseWeights);
  }
  }
  };
```
