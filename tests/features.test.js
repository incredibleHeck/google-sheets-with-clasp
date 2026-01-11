const { polishSelectedCells, fixPronouns } = require('../src/main');
const { SpreadsheetApp, PropertiesService, UrlFetchApp, mockRange, mockSheet, mockSpreadsheet } = require('../test-utils/gas-mocks');
const { callGeminiAPI } = require('../src/api');

jest.mock('../src/api');

describe('Feature Implementation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.SpreadsheetApp = SpreadsheetApp;
    global.PropertiesService = PropertiesService;
    global.UrlFetchApp = UrlFetchApp;

    // Reset mocks to default
    mockRange.getValues.mockReturnValue([['Old Text']]);
    mockRange.getFontColors.mockReturnValue([['#000000']]);
    mockRange.getFontWeights.mockReturnValue([['normal']]);
    mockRange.getRow.mockReturnValue(4); // Matches DATA_START_ROW
    
    // Default Sheet Mock
    mockSpreadsheet.getSheetByName = jest.fn();
  });

  test('polishSelectedCells calls API and updates style on change', () => {
    // Mock API response
    callGeminiAPI.mockReturnValue('New Polished Text');
    
    polishSelectedCells();
    
    // Verify API called
    expect(callGeminiAPI).toHaveBeenCalledWith('Old Text', 'gemini-1.5-flash', 'YOUR_API_KEY_HERE');
    
    // Verify values updated
    expect(mockRange.setValues).toHaveBeenCalledWith([['New Polished Text']]);
    
    // Verify style updated (blue/bold) - StyleManager uses singular setters
    expect(mockRange.setFontColor).toHaveBeenCalledWith('#0000FF');
    expect(mockRange.setFontWeight).toHaveBeenCalledWith('bold');
  });

  test('fixPronouns replaces text based on gender', () => {
    // Mock Classlist Data
    const mockClasslistSheet = {
      getDataRange: jest.fn(() => ({
        getValues: jest.fn(() => [
          ['Header', 'Header', 'Header', 'Header', 'Header'], // Row 1
          ['', 'Student A', '', '', 'Male'], // Row 2
          ['', 'Student B', '', '', 'Female'] // Row 3
        ])
      }))
    };
    mockSpreadsheet.getSheetByName.mockReturnValue(mockClasslistSheet);

    // Mock Selection - Row 4 (Student A - Male)
    // Text uses wrong pronouns: "She is good. Her work is great."
    mockRange.getValues.mockReturnValue([['She is good. Her work is great.']]);
    mockRange.getRow.mockReturnValue(4); 
    
    // Mock getting student name from column A
    mockSheet.getRange.mockImplementation((row, col) => ({
      getValue: jest.fn().mockReturnValue('Student A') 
    }));

    // Re-setup active range for the selection
    mockSheet.getActiveRange.mockReturnValue(mockRange);

    // Run
    fixPronouns();

    // Verify replacement (Male pronouns)
    // "She" -> "He", "Her" -> "His"
    const setValuesArg = mockRange.setValues.mock.calls[0][0];
    expect(setValuesArg[0][0]).toBe('He is good. His work is great.');
    
    // Verify style updated
    expect(mockRange.setFontColor).toHaveBeenCalledWith('#0000FF');
    expect(mockRange.setFontWeight).toHaveBeenCalledWith('bold');
  });
});
