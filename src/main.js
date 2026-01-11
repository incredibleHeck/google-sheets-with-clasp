const { StyleManager } = require('./style');
const { SelectionProcessor } = require('./selection');
const { callGeminiAPI } = require('./api');

function onOpen() {
  SpreadsheetApp.getUi().createMenu('HeckTeck Tools')
      .addItem('⚡ Auto-Fix Pronouns (Blue Text)', 'fixPronouns')
      .addItem('✨ AI Polish (Grammar & Tone)', 'polishSelectedCells')
      .addSeparator()
      .addItem('✅ Finalize/Approve All Changes', 'finalizeChanges')
      .addItem('🔍 Detect Base Styles', 'detectBaseStyles')
      .addToUi();
}

function finalizeChanges() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const selection = sheet.getActiveRange();
  const colors = selection.getFontColors();
  const weights = selection.getFontWeights();
  const props = PropertiesService.getScriptProperties();
  
  const baseColor = props.getProperty('BASE_TEXT_COLOR') || '#ffffff';
  const baseWeight = props.getProperty('BASE_FONT_WEIGHT') || 'normal';

  const newColors = colors.map(row => row.map(color => (color === StyleManager.ACTIVE_COLOR ? baseColor : color)));
  const newWeights = weights.map(row => row.map(weight => (weight === StyleManager.ACTIVE_WEIGHT ? baseWeight : weight)));

  selection.setFontColors(newColors);
  selection.setFontWeights(newWeights);
}

function detectBaseStyles() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const selection = sheet.getActiveRange();
  const cell = selection.getCell(1, 1);
  const color = cell.getFontColor();
  const weight = cell.getFontWeight();
  
  const props = PropertiesService.getScriptProperties();
  props.setProperty('BASE_TEXT_COLOR', color);
  props.setProperty('BASE_FONT_WEIGHT', weight);
  
  SpreadsheetApp.getActiveSpreadsheet().toast(`Base style detected: ${color}, ${weight}`, "HeckTeck");
}

function polishSelectedCells() {
  // Placeholder for integrated AI polishing logic
}

function fixPronouns() {
  // Placeholder for integrated pronoun fixing logic
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { onOpen, finalizeChanges, detectBaseStyles, polishSelectedCells, fixPronouns };
}
