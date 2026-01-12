// Pronoun Fixing Logic - Performance Optimized - 95 lines

const PronounManager = {
// Map for converting TO Female
TO_FEMALE: {
"he": "she", "He": "She",
"him": "her", "Him": "Her",
"his": "her", "His": "Her"
// Note: "his" (possessive) and "him" (object) both map to "her"
},

// Map for converting TO Male
TO_MALE: {
"she": "he", "She": "He",
"her": "his", "Her": "His",
"hers": "his", "Hers": "His"
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
      const startRow = range.getRow();
      const numRows = range.getNumRows();

      // 1. PERFORMANCE FIX: Batch fetch all names at once
      // We grab the column where names are stored, but only for the rows in our selection
      const nameData = sheet.getRange(startRow, Config.REPORT_NAME_COL, numRows, 1).getValues();

      let changesCount = 0;

      // 2. Process Data in Memory
      const processedData = data.map((row, rIndex) => {
        return row.map(cellValue => {
          if (typeof cellValue !== 'string' || !cellValue) return cellValue;

          // Get name from our pre-fetched array (FAST)
          const studentName = nameData[rIndex][0];
          const gender = genderMap[studentName?.toString().trim()] || "unknown";

          if (gender === "unknown") return cellValue;

          // Select the correct replacement map
          const replacementMap = gender === "male" ? this.TO_MALE : this.TO_FEMALE;

          let result = cellValue;
          let cellChanged = false;

          // Run replacements
          Object.entries(replacementMap).forEach(([from, to]) => {
            // Regex: \b ensures we match "he" but not "the"
            const regex = new RegExp(`\\b${from}\\b`, "g");

            if (regex.test(result)) {
               result = result.replace(regex, to);
               cellChanged = true;
            }
          });

          if (cellChanged) changesCount++;
          return result;
        });
      });

      // 3. Batch Update
      if (changesCount > 0) {
        range.setValues(processedData);
        StyleManager.applyActiveStyle(range);

        const toastMessage = `✓ Fixed pronouns in ${changesCount} cells.`;
        SpreadsheetApp.getActiveSpreadsheet().toast(toastMessage, "HeckTeck");
      } else {
        SpreadsheetApp.getActiveSpreadsheet().toast("Pronouns look correct!", "HeckTeck");
      }

    } catch (e) {
      console.error("Pronoun fix failed:", e);
      StateManager.undo();
      throw e;
    }

}
};
