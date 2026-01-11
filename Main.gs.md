// Menu & Orchestration Only - 58 lines

function onOpen() {
SpreadsheetApp.getUi()
.createMenu("HeckTeck Tools")
.addItem("⚡ Auto-Fix Pronouns (Sea Blue Text)", "fixPronouns")
.addItem("✨ AI Polish (Grammar & Tone)", "polishSelectedCells")
.addSeparator()
.addItem("↩️ Undo Last Action", "undoLastAction")
.addItem("✅ Finalize/Approve All Changes", "finalizeChanges")
.addItem("🔍 Detect Base Styles", "detectBaseStyles")
.addToUi();
}

function polishSelectedCells() {
try {
PolishManager.process();
} catch (e) {
console.error("Polish error:", e);
SpreadsheetApp.getActiveSpreadsheet().toast(`Error: ${e.message}`, "HeckTeck Error");
}
}

function fixPronouns() {
try {
PronounManager.process();
} catch (e) {
console.error("Pronoun fix error:", e);
SpreadsheetApp.getActiveSpreadsheet().toast(`Error: ${e.message}`, "HeckTeck Error");
}
}

function undoLastAction() {
StateManager.undo();
}

function finalizeChanges() {
StateManager.finalize();
}

function detectBaseStyles() {
StateManager.detectBaseStyles();
}
