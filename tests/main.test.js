const { finalizeChanges } = require("../src/main");
const {
  SpreadsheetApp,
  PropertiesService,
} = require("../test-utils/gas-mocks");

jest.mock("../src/config", () => ({
  Config: {
    MODEL_NAME: "gemini-2.5-flash",
    API_KEY: "YOUR_API_KEY_HERE",
    CLASSLIST_SHEET_NAME: "CLASSLIST",
    CLASSLIST_NAME_COL: 2,
    CLASSLIST_GENDER_COL: 5,
    REPORT_NAME_COL: 1,
    DATA_START_ROW: 4,
  },
}));

describe("Main Integration", () => {
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
      getSheet: jest.fn(() => ({
        getName: jest.fn(() => "Sheet1"),
      })),
    };
    mockSheet.getActiveRange.mockReturnValue(mockRange);
  });

  test("finalizeChanges reverts sea blue text to base color", () => {
    // Setup: range has sea blue color
    mockRange.getFontColors.mockReturnValue([["#00f9ff"]]);
    mockRange.getFontWeights.mockReturnValue([["bold"]]);

    // Mock property service returning white as base color
    PropertiesService.getScriptProperties().getProperty.mockReturnValue(
      "#ffffff"
    );

    finalizeChanges();

    expect(mockRange.setFontColors).toHaveBeenCalledWith([["#ffffff"]]);
    expect(mockRange.setFontWeights).toHaveBeenCalledWith([["normal"]]);
  });
});
