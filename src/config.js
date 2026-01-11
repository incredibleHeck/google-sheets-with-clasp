const Config = {
  // API_KEY: Retrieved from PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY')
  // Setup: Store your API key in Apps Script project properties:
  // 1. Go to Project Settings (gear icon)
  // 2. Under "Properties" section, add GEMINI_API_KEY with your key
  get API_KEY() {
    const key =
      PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
    if (!key) {
      throw new Error(
        "API_KEY not configured. Set GEMINI_API_KEY in Script Properties."
      );
    }
    return key;
  },

  MODEL_NAME: "gemini-2.5-flash",
  CLASSLIST_SHEET_NAME: "CLASSLIST",
  CLASSLIST_NAME_COL: 2, // Col B
  CLASSLIST_GENDER_COL: 5, // Col E
  REPORT_NAME_COL: 1, // Col A
  DATA_START_ROW: 4, // Row 4
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { Config };
}
