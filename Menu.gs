// ==========================================
//      HECKTECK MASTER CONFIGURATION
// ==========================================
const API_KEY = 'AIzaSyCOfQmWm3iCjcCj7KU3V-2NHsHE7E14HfM'; // <--- PASTE KEY HERE

// Shared Settings
const CLASSLIST_SHEET_NAME = "CLASSLIST"; 
const CLASSLIST_NAME_COL = 2;   // Col B
const CLASSLIST_GENDER_COL = 5; // Col E
const REPORT_NAME_COL = 1;      // Col A
const DATA_START_ROW = 4;       // Row 4

const PROPS = PropertiesService.getScriptProperties();

// This runs automatically when the sheet opens
function onOpen() {
  SpreadsheetApp.getUi().createMenu('HeckTeck Tools')
      .addItem('⚡ Auto-Fix Pronouns (Blue Text)', 'fixPronouns')
      .addItem('↩️ Undo Pronoun Fix', 'revertPronounChanges')
      .addSeparator()
      .addItem('✨ AI Polish (Grammar & Tone)', 'polishSelectedCells')
      .addItem('↩️ Undo AI Polish', 'revertAiChanges')
      .addToUi();
}
