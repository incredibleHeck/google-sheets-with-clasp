// Gender Normalization & Mapping - 35 lines

const GenderNormalizer = {
normalize: function(gender) {
if (!gender) return "";
const normalized = gender.trim().toUpperCase();
if (normalized === "M" || normalized === "MALE") return "male";
if (normalized === "F" || normalized === "FEMALE") return "female";
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

    for (let i = Config.DATA_START_ROW - 1; i < classlistData.length; i++) {
      const name = classlistData[i][Config.CLASSLIST_NAME_COL - 1];
      const gender = classlistData[i][Config.CLASSLIST_GENDER_COL - 1];
      if (name) {
        genderMap[name.trim()] = this.normalize(gender);
      }
    }

    return genderMap;

}
};
