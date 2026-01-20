// ==========================================
// HECKTECK Main.gs
// ==========================================

function onOpen() {
const ui = SpreadsheetApp.getUi();

ui.createMenu('HeckTeck AI')
.addItem(' Polish Grammar & Style', 'runPolish')
.addItem('Fix Pronouns', 'runPronouns')
.addSeparator()
.addItem('Finalize Changes', 'runFinalize')
.addItem('Undo Last Action', 'runUndo')
.addItem('Generate Report Cards', 'generateReportCards')
.addSeparator()
.addSubMenu(ui.createMenu('Settings')
.addItem('Detect Base Style', 'runDetectStyle')
.addItem('Reset Selection Style', 'runResetStyle')
)
.addToUi();
}

// ------------------------------------------
// Wrapper Functions (Connecting Menu to Logic)
// ------------------------------------------

function runPolish() {
// Ensure base style is known before we mess it up
if (!PropertiesService.getScriptProperties().getProperty("BASE_TEXT_COLOR")) {
StateManager.detectBaseStyles();
}
PolishManager.process();
}

function runPronouns() {
if (!PropertiesService.getScriptProperties().getProperty("BASE_TEXT_COLOR")) {
StateManager.detectBaseStyles();
}
PronounManager.process();
}

function runFinalize() {
StateManager.finalize();
}

function runUndo() {
StateManager.undo();
}

function runDetectStyle() {
StateManager.detectBaseStyles();
}

function runResetStyle() {
const range = SpreadsheetApp.getActiveRange();
StyleManager.resetToDefault(range);
}
