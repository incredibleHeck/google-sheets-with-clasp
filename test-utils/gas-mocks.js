const mockRange = {
  getValues: jest.fn(),
  setValues: jest.fn(),
  setFontColor: jest.fn(),
  setFontWeight: jest.fn(),
  setFontColors: jest.fn(),
  setFontWeights: jest.fn(),
  getFontColors: jest.fn(),
  getFontWeights: jest.fn(),
  getA1Notation: jest.fn(),
  getRow: jest.fn(),
  getCell: jest.fn(() => ({
    getFontColor: jest.fn(),
    getFontWeight: jest.fn(),
  })),
};

const mockSheet = {
  getRange: jest.fn(() => mockRange),
  getActiveRange: jest.fn(() => mockRange),
  getName: jest.fn(),
};

const mockSpreadsheet = {
  getActiveSheet: jest.fn(() => mockSheet),
  getSheetByName: jest.fn(),
  toast: jest.fn(),
};

const SpreadsheetApp = {
  getActiveSpreadsheet: jest.fn(() => mockSpreadsheet),
  getUi: jest.fn(() => ({
    createMenu: jest.fn(() => ({
      addItem: jest.fn().mockReturnThis(),
      addSeparator: jest.fn().mockReturnThis(),
      addToUi: jest.fn(),
    })),
    alert: jest.fn(),
    ButtonSet: { OK: 'OK' },
  })),
};

const PropertiesService = {
  getScriptProperties: jest.fn(() => ({
    getProperty: jest.fn(),
    setProperty: jest.fn(),
  })),
};

const UrlFetchApp = {
  fetch: jest.fn(),
};

const Utilities = {
  sleep: jest.fn(),
};

module.exports = { SpreadsheetApp, PropertiesService, UrlFetchApp, Utilities, mockRange, mockSheet, mockSpreadsheet };
