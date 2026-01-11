```javascript
// ==========================================
// HECKTECK SelectionProcessor.gs
// ==========================================
const SelectionProcessor = {
  /**
   * Iterates over a 2D array of data and applies a callback to valid strings.
   * @param {Object[][]} data - The values from the range.
   * @param {Function} callback - Function(value, rowIndex, colIndex) to transform text.
   * @return {Object[][]} - The processed 2D array.
   */
  processData: function (data, callback) {
    return data.map((row, rIndex) => {
      return row.map((cellValue, cIndex) => {
        // Skip empty or non-string cells, or short text (prevent API waste)
        if (
          !cellValue ||
          typeof cellValue !== "string" ||
          cellValue.trim().length < 3
        ) {
          return cellValue;
        }
        return callback(cellValue, rIndex, cIndex);
      });
    });
  },
};
```
