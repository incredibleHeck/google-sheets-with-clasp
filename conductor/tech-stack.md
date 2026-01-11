# Technology Stack - HeckTeck Tools

## Core Platform
- **Runtime:** Google Apps Script (GAS)
- **Engine:** V8 Runtime
- **Primary Integration:** Google Sheets

## AI & Services
- **LLM Provider:** Google Generative AI (Gemini)
- **Model:** `gemini-1.5-flash` (Selected for high free-tier rate limits and stability)
- **API Communication:** `UrlFetchApp` (REST API calls)

## Google Apps Script Services
- **SpreadsheetApp:** For sheet/range manipulation and UI interaction.
- **PropertiesService:** For storing state, configuration, and undo history.
- **Ui:** For custom menus, toasts, and alerts.

## Development Standards
- **Language:** JavaScript (ES6+)
- **Error Handling:** `try...catch` blocks for robust API failure management.
- **Optimization:** Batch processing for multi-cell/column operations to respect API quotas.
