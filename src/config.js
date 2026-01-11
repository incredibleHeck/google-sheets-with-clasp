const Config = {
  API_KEY: 'YOUR_API_KEY_HERE', 
  MODEL_NAME: "gemini-1.5-flash",
  CLASSLIST_SHEET_NAME: "CLASSLIST",
  CLASSLIST_NAME_COL: 2,   // Col B
  CLASSLIST_GENDER_COL: 5, // Col E
  REPORT_NAME_COL: 1,      // Col A
  DATA_START_ROW: 4        // Row 4
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Config };
}
