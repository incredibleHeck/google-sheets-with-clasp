# Main.gs

```javascript
function onOpen() {
  SpreadsheetApp.getUi().createMenu('HeckTeck Tools')
      .addItem('⚡ Auto-Fix Pronouns (Blue Text)', 'fixPronouns')
      .addItem('✨ AI Polish (Grammar & Tone)', 'polishSelectedCells')
      .addSeparator()
      .addItem('↩️ Undo Last Tool Action', 'undoLastAction')
      .addItem('✅ Finalize/Approve All Changes', 'finalizeChanges')
      .addSeparator()
      .addItem('🔍 Detect Base Styles', 'detectBaseStyles')
      .addToUi();
}

/**
 * Saves the current state of a range before a tool modifies it.
 */
function saveStateForUndo(range) {
  const state = {
    rangeA1: range.getA1Notation(),
    values: range.getValues(),
    colors: range.getFontColors(),
    weights: range.getFontWeights(),
    sheetName: range.getSheet().getName()
  };
  PROPS.setProperty('LAST_UNDO_STATE', JSON.stringify(state));
}

/**
 * Reverts the last tool action (Pronouns or AI Polish).
 */
function undoLastAction() {
  const stateStr = PROPS.getProperty('LAST_UNDO_STATE');
  if (!stateStr) {
    SpreadsheetApp.getUi().alert("No recent changes found to undo.");
    return;
  }

  const state = JSON.parse(stateStr);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(state.sheetName);
  const range = sheet.getRange(state.rangeA1);

  range.setValues(state.values);
  range.setFontColors(state.colors);
  range.setFontWeights(state.weights);
  
  PROPS.deleteProperty('LAST_UNDO_STATE');
  SpreadsheetApp.getActiveSpreadsheet().toast("Last action reverted.", "HeckTeck");
}

function finalizeChanges() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const selection = sheet.getActiveRange();
  const colors = selection.getFontColors();
  const weights = selection.getFontWeights();
  
  const baseColor = PROPS.getProperty('BASE_TEXT_COLOR') || '#ffffff';
  const baseWeight = PROPS.getProperty('BASE_FONT_WEIGHT') || 'normal';

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
  
  PROPS.setProperty('BASE_TEXT_COLOR', color);
  PROPS.setProperty('BASE_FONT_WEIGHT', weight);
  
  SpreadsheetApp.getActiveSpreadsheet().toast(`Base style detected: ${color}, ${weight}`, "HeckTeck");
}

function polishSelectedCells() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const selection = sheet.getActiveRange();
  const data = selection.getValues();
  
  saveStateForUndo(selection); // Snapshot before change

  let changesCount = 0;
  SpreadsheetApp.getActiveSpreadsheet().toast("Polishing...", "HeckTeck AI");

  const processedData = SelectionProcessor.processData(data, (text) => {
    const polished = callGeminiAPI(text);
    if (polished !== text) {
      changesCount++;
      return polished;
    }
    return text;
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
  
  saveStateForUndo(selection); // Snapshot before change

  const classListSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CLASSLIST_SHEET_NAME);
  if (!classListSheet) {
    SpreadsheetApp.getUi().alert(`❌ Error: Sheet "${CLASSLIST_SHEET_NAME}" missing.`);
    return;
  }
  
  const classData = classListSheet.getDataRange().getValues();
  const studentGenderMap = new Map();
  for (let i = 1; i < classData.length; i++) {
    const name = classData[i][CLASSLIST_NAME_COL - 1]; 
    const gender = classData[i][CLASSLIST_GENDER_COL - 1];
    if (name && gender) studentGenderMap.set(name.toString().trim(), gender.toString().trim().toUpperCase());
  }

  let changesCount = 0;
  const matchCase = (m, r) => {
    if (m === m.toUpperCase()) return r.toUpperCase();
    if (m[0] === m[0].toUpperCase()) return r.charAt(0).toUpperCase() + r.slice(1);
    return r;
  };

  const processedData = SelectionProcessor.processData(data, (text, rIndex) => {
    const currentRow = startRow + rIndex;
    if (currentRow < DATA_START_ROW) return text;

    const studentName = sheet.getRange(currentRow, REPORT_NAME_COL).getValue();
    const gender = studentGenderMap.get(studentName.toString().trim());
    if (!gender) return text;

    let newText = text.toString();
    if (gender === "F" || gender === "FEMALE") {
      newText = newText.replace(/\bhe\b/gi, (m) => matchCase(m, "she"))
                       .replace(/\bhis\b/gi, (m) => matchCase(m, "her"))
                       .replace(/\bhim\b/gi, (m) => matchCase(m, "her"))
                       .replace(/\bhimself\b/gi, (m) => matchCase(m, "herself"));
    } else {
      newText = newText.replace(/\bshe\b/gi, (m) => matchCase(m, "he"))
                       .replace(/\bhers\b/gi, (m) => matchCase(m, "his"))
                       .replace(/\bherself\b/gi, (m) => matchCase(m, "himself"))
                       .replace(/\bher\b/gi, (m) => matchCase(m, "his"));
    }

    if (newText !== text.toString()) {
      changesCount++;
      return newText;
    }
    return text;
  });

  if (changesCount > 0) {
    selection.setValues(processedData);
    StyleManager.applyActiveStyle(selection);
    SpreadsheetApp.getActiveSpreadsheet().toast(`Fixed ${changesCount} cells!`, "HeckTeck");
  } else {
    SpreadsheetApp.getActiveSpreadsheet().toast("No errors found.", "HeckTeck");
  }
}
```