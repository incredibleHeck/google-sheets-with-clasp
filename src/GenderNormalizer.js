const GenderNormalizer = {
  normalize: function(gender) {
    if (!gender) return "";
    const normalized = gender.toString().trim().toUpperCase();
    if (normalized.startsWith("M")) return "male";
    if (normalized.startsWith("F")) return "female";
    return "";
  },

  buildGenderMap: function() {
    const classlistSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
      Config.CLASSLIST_SHEET_NAME
    );
    if (!classlistSheet) {
      throw new Error(`Sheet "${Config.CLASSLIST_SHEET_NAME}" not found`);
    }

    const classlistData = classlistSheet.getDataRange().getValues();
    const genderMap = {};

    // START_ROW: Classlist data starts at Row 2 (Index 1) based on your CSV
    const START_ROW_INDEX = 1; 

    for (let i = START_ROW_INDEX; i < classlistData.length; i++) {
      // Ensure row has enough columns
      if (classlistData[i].length < Config.CLASSLIST_GENDER_COL) continue;

      const name = classlistData[i][Config.CLASSLIST_NAME_COL - 1];   // Col B
      const gender = classlistData[i][Config.CLASSLIST_GENDER_COL - 1]; // Col E

      if (name && gender) {
        // Key is lowercased for fuzzy matching
        genderMap[name.toString().trim().toLowerCase()] = this.normalize(gender);
      }
    }

    return genderMap;
  }
};