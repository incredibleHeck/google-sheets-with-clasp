const { StyleManager } = require('./style');
const { SelectionProcessor } = require('./selection');
const { callGeminiAPI } = require('./api');
const { Config } = require('./config');

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
  SpreadsheetApp.getActiveSpreadsheet().toast("All changes finalized!", "HeckTeck");
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
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const selection = sheet.getActiveRange();
  const data = selection.getValues();
  let changesCount = 0;

  SpreadsheetApp.getActiveSpreadsheet().toast("Polishing selected cells...", "HeckTeck AI");

  const processedData = SelectionProcessor.processData(data, (text) => {
    try {
      const polished = callGeminiAPI(text, Config.MODEL_NAME, Config.API_KEY);
      if (polished !== text) {
        changesCount++;
        return polished;
      }
      return text;
    } catch (e) {
      console.error(e);
      return text;
    }
  });

  if (changesCount > 0) {
    selection.setValues(processedData);
    StyleManager.applyActiveStyle(selection);
    SpreadsheetApp.getActiveSpreadsheet().toast(`Polished ${changesCount} cells!`, "HeckTeck AI");
  } else {
    SpreadsheetApp.getActiveSpreadsheet().toast("No changes needed.", "HeckTeck AI");
  }
}

function fixPronouns() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const selection = sheet.getActiveRange();
  const data = selection.getValues();
  const startRow = selection.getRow();
  
  // 1. Get Classlist Data
  const classListSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.CLASSLIST_SHEET_NAME);
  if (!classListSheet) {
    SpreadsheetApp.getUi().alert("Error", `Sheet '${Config.CLASSLIST_SHEET_NAME}' not found.`, SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  const classData = classListSheet.getDataRange().getValues();
  const studentGenderMap = new Map();
  
  // Skip header
  for (let i = 1; i < classData.length; i++) {
    const name = classData[i][Config.CLASSLIST_NAME_COL - 1]; // 0-based index
    const gender = classData[i][Config.CLASSLIST_GENDER_COL - 1];
    if (name) {
      studentGenderMap.set(name.trim().toLowerCase(), gender ? gender.trim().toLowerCase() : '');
    }
  }

  let changesCount = 0;

  const processedData = SelectionProcessor.processData(data, (text, rIndex, cIndex) => {
    const currentRow = startRow + rIndex;
    if (currentRow < Config.DATA_START_ROW) return text;

    // Get Student Name from Report Sheet (Col A)
    const nameCell = sheet.getRange(currentRow, Config.REPORT_NAME_COL); 
    const studentName = nameCell.getValue();
    
    if (!studentName) return text;

    const gender = studentGenderMap.get(studentName.trim().toLowerCase());
    if (!gender) return text;

    let newText = text;
    
    if (gender === 'male') {
      newText = newText.replace(/\bShe\b/g, "He")
                       .replace(/\bshe\b/g, "he")
                       .replace(/\bHer\b/g, "His")
                       .replace(/\bher\b/g, "his")
                       .replace(/\bHers\b/g, "His")
                       .replace(/\bhers\b/g, "his");
    } else if (gender === 'female') {
      newText = newText.replace(/\bHe\b/g, "She")
                       .replace(/\bhe\b/g, "she")
                       .replace(/\bHis\b/g, "Her")
                       .replace(/\bhis\b/g, "her")
                       .replace(/\bHim\b/g, "Her")
                       .replace(/\bhim\b/g, "her");
    }

    if (newText !== text) {
      changesCount++;
      return newText;
    }
    return text;
  });

  if (changesCount > 0) {
    selection.setValues(processedData);
    StyleManager.applyActiveStyle(selection);
    SpreadsheetApp.getActiveSpreadsheet().toast(`Fixed pronouns in ${changesCount} cells!`, "HeckTeck");
  } else {
    SpreadsheetApp.getActiveSpreadsheet().toast("No pronoun fixes needed.", "HeckTeck");
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { onOpen, finalizeChanges, detectBaseStyles, polishSelectedCells, fixPronouns };
}
