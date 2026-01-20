// ==========================================
// HECKTECK PronounManager.gs (FIXED)
// ==========================================

const PronounManager = {
  // Simplified Map: "her" -> "his" (Assumes possessive context like "her grades")
  TO_MALE: {
    "she": "he", "She": "He", "SHE": "HE",
    "her": "his", "Her": "His", "HER": "HIS",
    "hers": "his", "Hers": "His", "HERS": "HIS"
  },

  TO_FEMALE: {
    "he": "she", "He": "She", "HE": "SHE",
    "him": "her", "Him": "Her", "HIM": "HER",
    "his": "her", "His": "Her", "HIS": "HER"
  },

  process: function() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const sheetName = sheet.getName().toUpperCase();

    // 1. SAFETY: Only run on Subject Sheets
    if (sheetName.includes("REPORT") || sheetName.includes("CLASSLIST") || sheetName.includes("DASHBOARD")) {
      SpreadsheetApp.getActiveSpreadsheet().toast("🚫 Stop: Go to a Subject Sheet (e.g., MATH) to run this.", "HeckTeck");
      return;
    }

    // 2. VALIDATION
    const selection = sheet.getActiveRange();
    // Uses your RangeValidator to ensure we don't hit headers
    const range = RangeValidator.getValidDataRange(selection); 
    if (!range) return;

    // Optional: Save state if you have StateManager
    if (typeof StateManager !== 'undefined') StateManager.saveForUndo(range);

    try {
      const genderMap = GenderNormalizer.buildGenderMap();
      const data = range.getValues();
      const startRow = range.getRow();
      const numRows = range.getNumRows();

      // 3. GET NAMES (Always Col A on Subject Sheets)
      const nameCol = 1; 
      const nameData = sheet.getRange(startRow, nameCol, numRows, 1).getValues();

      let changesCount = 0;

      // 4. PROCESS ROW BY ROW
      const processedData = data.map((row, rIndex) => {
        return row.map(cellValue => {
          if (typeof cellValue !== 'string' || !cellValue) return cellValue;

          const rawName = nameData[rIndex][0];
          // Use the smart fuzzy finder
          const gender = this.findGenderFuzzy(rawName, genderMap);

          if (gender === "unknown") return cellValue; 

          // Select Replacement Map
          const replacementMap = (gender === "male") ? this.TO_MALE : 
                                 (gender === "female") ? this.TO_FEMALE : null;

          if (!replacementMap) return cellValue;

          let result = cellValue;
          let cellChanged = false;

          Object.entries(replacementMap).forEach(([from, to]) => {
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

      // 5. WRITE CHANGES
      if (changesCount > 0) {
        range.setValues(processedData);
        SpreadsheetApp.getActiveSpreadsheet().toast(`✓ Fixed pronouns in ${changesCount} cells.`, "HeckTeck");
      } else {
        SpreadsheetApp.getActiveSpreadsheet().toast("No pronouns needed fixing.", "HeckTeck");
      }

    } catch (e) {
      console.error("Pronoun fix failed:", e);
      if (typeof StateManager !== 'undefined') StateManager.undo();
      SpreadsheetApp.getActiveSpreadsheet().toast("Error: " + e.message, "HeckTeck");
    }
  },

  /**
   * Helper: Finds gender intelligently (Handles Partial Names & Name Swaps)
   * Examples that work:
   * "Jeslyn" -> Match "Abrahams Jeslyn"
   * "Jeslyn Abrahams" -> Match "Abrahams Jeslyn"
   */
  findGenderFuzzy: function(nameFromRow, genderMap) {
    if (!nameFromRow) return "unknown";
    
    // Clean the input name (Subject Sheet Name)
    const cleanName = nameFromRow.toString().toLowerCase().trim();
    if (!cleanName) return "unknown";

    // 1. Direct Match (Fastest)
    if (genderMap[cleanName]) return genderMap[cleanName];

    // 2. Split input name into parts (e.g. "Jeslyn Abrahams" -> ["jeslyn", "abrahams"])
    const nameParts = cleanName.split(/\s+/);

    // 3. Smart Search through Class List
    const foundKey = Object.keys(genderMap).find(fullClassListName => {
      // Logic: If the teacher wrote "Jeslyn", does "Jeslyn" exist in "Abrahams Jeslyn"?
      // Logic: If the teacher wrote "Jeslyn Abrahams", do BOTH words exist in "Abrahams Jeslyn"?
      return nameParts.every(part => fullClassListName.includes(part));
    });

    return foundKey ? genderMap[foundKey] : "unknown";
  }
};