const { SpreadsheetApp, PropertiesService, UrlFetchApp, Utilities } = require('../test-utils/gas-mocks');

test('GAS Mocks are defined', () => {
    expect(SpreadsheetApp).toBeDefined();
    expect(PropertiesService).toBeDefined();
    expect(UrlFetchApp).toBeDefined();
    expect(Utilities).toBeDefined();
});

test('SpreadsheetApp mock structure', () => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    expect(sheet.getRange).toBeDefined();
});
