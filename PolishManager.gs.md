// Grammar/Tone Polishing - 50 lines

const PolishManager = {
process: function() {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
const selection = sheet.getActiveRange();

    const range = RangeValidator.getValidDataRange(selection);
    if (!range) return;

    StateManager.saveForUndo(range);
    const data = range.getValues();

    try {
      const processedData = SelectionProcessor.processData(data, (text) => {
        const polished = callGeminiAPI(text, Config.MODEL_NAME, Config.API_KEY);
        return polished || text;
      });

      range.setValues(processedData);
      RangeValidator.applyActiveStyle(range);

      const toastMessage = `✓ Polished ${range.getNumRows()} cells (rows ${range.getRow()}-${range.getLastRow()})`;
      SpreadsheetApp.getActiveSpreadsheet().toast(toastMessage, "HeckTeck");
    } catch (e) {
      console.error("Polish failed:", e);
      StateManager.undo();
      throw e;
    }

}
};
