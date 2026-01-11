const SelectionProcessor = {
  processData: function(data, callback) {
    return data.map(row => {
      return row.map(cellValue => {
        if (!cellValue || typeof cellValue !== 'string' || cellValue.trim().length < 3) {
          return cellValue;
        }
        return callback(cellValue);
      });
    });
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SelectionProcessor };
}
