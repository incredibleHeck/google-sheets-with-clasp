// Pronoun Fixing Logic - 85 lines

const PronounManager = {
FEMALE_PRONOUNS: {
he: "she", him: "her", his: "her",
He: "She", Him: "Her", His: "Her"
},

MALE_PRONOUNS: {
he: "he", him: "him", his: "his",
He: "He", Him: "Him", His: "His"
},

process: function() {
const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
const selection = sheet.getActiveRange();

    const range = RangeValidator.getValidDataRange(selection);
    if (!range) return;

    StateManager.saveForUndo(range);

    try {
      const genderMap = GenderNormalizer.buildGenderMap();
      const data = range.getValues();
      let changesCount = 0;

      const processedData = SelectionProcessor.processData(
        data,
        (text, rowIndex) => {
          const studentName = sheet
            .getRange(range.getRow() + rowIndex, Config.REPORT_NAME_COL)
            .getValue();
          const gender = genderMap[studentName?.toString().trim()] || "unknown";

          if (gender === "unknown") return text;

          const pronouns = gender === "male" ? this.MALE_PRONOUNS : this.FEMALE_PRONOUNS;
          let result = text;

          Object.entries(pronouns).forEach(([from, to]) => {
            const regex = new RegExp(`\\b${from}\\b`, "g");
            result = result.replace(regex, to);
          });

          if (result !== text) changesCount++;
          return result;
        }
      );

      range.setValues(processedData);
      RangeValidator.applyActiveStyle(range);

      const toastMessage = `✓ Fixed pronouns in ${changesCount} cells (rows ${range.getRow()}-${range.getLastRow()})`;
      SpreadsheetApp.getActiveSpreadsheet().toast(toastMessage, "HeckTeck");
    } catch (e) {
      console.error("Pronoun fix failed:", e);
      StateManager.undo();
      throw e;
    }

}
};
