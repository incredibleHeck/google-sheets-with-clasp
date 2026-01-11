# Config.gs

```javascript
// ==========================================
//      HECKTECK MASTER CONFIGURATION
// ==========================================
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

const PROPS = PropertiesService.getScriptProperties();
```

## Setup Instructions:

1. **Store your API key securely:**
   - Go to your Google Apps Script project
   - Click **Project Settings** (gear icon)
   - Scroll down to **Properties**
   - Add a new property: `GEMINI_API_KEY` with your actual API key value
   - Click Save

2. **Why this approach?**
   - Keeps sensitive API keys out of source code
   - Prevents accidental exposure in version control
   - Allows key rotation without code changes

## Migration from old hardcoded key:

If you previously had a hardcoded key, delete it from this file and add it to Script Properties instead.
