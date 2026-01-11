const StyleManager = {
  ACTIVE_COLOR: '#0000FF',
  ACTIVE_WEIGHT: 'bold',

  applyActiveStyle: function(range) {
    range.setFontColor(this.ACTIVE_COLOR);
    range.setFontWeight(this.ACTIVE_WEIGHT);
  },

  revertStyle: function(range, baseColors, baseWeights) {
    if (baseColors.length === 1 && baseColors[0].length === 1) {
      range.setFontColor(baseColors[0][0]);
      range.setFontWeight(baseWeights[0][0]);
    } else {
      range.setFontColors(baseColors);
      range.setFontWeights(baseWeights);
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StyleManager };
}
