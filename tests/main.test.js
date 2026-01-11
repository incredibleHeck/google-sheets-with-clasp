const { finalizeChanges } = require('../src/main');
const { SpreadsheetApp, PropertiesService } = require('../test-utils/gas-mocks');

describe('Main Integration', () => {
  let mockRange;
  let mockSheet;

  beforeEach(() => {
    jest.clearAllMocks();
    global.SpreadsheetApp = SpreadsheetApp;
    global.PropertiesService = PropertiesService;

    mockSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    mockRange = {
      getFontColors: jest.fn(),
      getFontWeights: jest.fn(),
      setFontColors: jest.fn(),
      setFontWeights: jest.fn(),
    };
    mockSheet.getActiveRange.mockReturnValue(mockRange);
  });

  test('finalizeChanges reverts blue text to base color', () => {
    // Setup: range has blue color
    mockRange.getFontColors.mockReturnValue([['#0000FF']]);
    mockRange.getFontWeights.mockReturnValue([['bold']]);
    
    // Mock property service returning white as base color
    PropertiesService.getScriptProperties().getProperty.mockReturnValue('#ffffff');

    finalizeChanges();

    expect(mockRange.setFontColors).toHaveBeenCalledWith([['#ffffff']]);
    expect(mockRange.setFontWeights).toHaveBeenCalledWith([['normal']]);
  });
});
