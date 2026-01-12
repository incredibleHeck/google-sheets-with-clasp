```javascript
// ==========================================
// HECKTECK SelectionProcessor.gs
// ==========================================
const SelectionProcessor = {
  /**
   * Iterates over a 2D array and applies a callback to valid strings.
   * Includes safety checks and configurable validation.
   * @param {Object[][]} data - The values from the range.
   * @param {Function} callback - Function(value, rowIndex, colIndex) to transform text.
   * @param {Object} [options] - Optional settings (e.g., minLength).
   * @return {Object[][]} - The processed 2D array.
   */
  processData: function (data, callback, options = {}) {
    // Default to 3, but allow override (e.g., set to 1 for Pronouns)
    const minLength = options.minLength !== undefined ? options.minLength : 3;

    return data.map((row, rIndex) => {
      return row.map((cellValue, cIndex) => {
        // 1. Basic Type Validation
        if (!cellValue || typeof cellValue !== "string") {
          return cellValue;
        }

        // 2. Length Validation
        if (cellValue.trim().length < minLength) {
          return cellValue;
        }

        // 3. Safe Execution (Try/Catch inside the loop)
        // If one cell crashes the logic, we don't want to break the whole operation
        try {
          return callback(cellValue, rIndex, cIndex);
        } catch (e) {
          console.warn(
            `SelectionProcessor Error at [${rIndex},${cIndex}]: ${e.message}`
          );
          return cellValue; // Return original value on error
        }
      });
    });
  },
};
```
