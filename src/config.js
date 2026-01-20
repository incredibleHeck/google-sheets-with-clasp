// ==========================================
//      HECKTECK MASTER CONFIGURATION
// ==========================================

const Config = {
  /**
   * API_KEY Management
   * Retrieved from PropertiesService.getScriptProperties()
   * * Setup Instructions:
   * 1. Go to Project Settings (gear icon)
   * 2. Under "Script Properties", add 'GEMINI_API_KEY' with your key.
   */
  get API_KEY() {
    const key = PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY");
    if (!key) {
      throw new Error("API_KEY not configured. Set GEMINI_API_KEY in Script Properties.");
    }
    return key;
  },

  // AI Model Version
  MODEL_NAME: "gemini-2.5-flash",

  // Class List Configuration (Source of Truth)
  CLASSLIST_SHEET_NAME: "CLASSLIST",
  CLASSLIST_NAME_COL: 2,   // Col B (Student Names)
  CLASSLIST_GENDER_COL: 5, // Col E (Gender: M/F)

  // Report Sheet Configuration (Where we fix pronouns)
  REPORT_NAME_COL: 1,      // Col A (Student Names in Report)
  DATA_START_ROW: 4,       // Row 4 (Where data actually begins)
};

const PROPS = PropertiesService.getScriptProperties();