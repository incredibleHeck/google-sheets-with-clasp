const { StyleManager } = require('../src/style');

describe('StyleManager', () => {
  const mockRange = {
    setFontColor: jest.fn(),
    setFontWeight: jest.fn(),
    getFontColors: jest.fn(),
    getFontWeights: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('applyActiveStyle sets blue and bold', () => {
    StyleManager.applyActiveStyle(mockRange);
    expect(mockRange.setFontColor).toHaveBeenCalledWith('#0000FF');
    expect(mockRange.setFontWeight).toHaveBeenCalledWith('bold');
  });

  test('revertStyle restores provided colors and weights', () => {
    const colors = [['#ffffff']];
    const weights = [['normal']];
    StyleManager.revertStyle(mockRange, colors, weights);
    expect(mockRange.setFontColor).toHaveBeenCalledWith('#ffffff');
    expect(mockRange.setFontWeight).toHaveBeenCalledWith('normal');
  });
});
