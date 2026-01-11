const SpreadsheetApp = {
  getActiveSpreadsheet: jest.fn(() => ({
    getActiveSheet: jest.fn(() => ({
      getRange: jest.fn(() => ({
        getValues: jest.fn(),
        setValues: jest.fn(),
        setFontColor: jest.fn(),
        setFontWeight: jest.fn(),
        setBackground: jest.fn(),
        getBackgrounds: jest.fn(),
        getFontColors: jest.fn(),
        getFontWeights: jest.fn(),
        getA1Notation: jest.fn(),
      })),
      getName: jest.fn(),
    })),
    toast: jest.fn(),
  })),
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

module.exports = { SpreadsheetApp, PropertiesService, UrlFetchApp, Utilities };
