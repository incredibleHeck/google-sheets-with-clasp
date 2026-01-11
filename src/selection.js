const SelectionProcessor = {
  processData: function(data, callback) {
    return data.map((row, rIndex) => {
      return row.map((cellValue, cIndex) => {
        if (!cellValue || typeof cellValue !== 'string' || cellValue.trim().length < 3) {
          return cellValue;
        }
        return callback(cellValue, rIndex, cIndex);
      });
    });
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SelectionProcessor };
}
