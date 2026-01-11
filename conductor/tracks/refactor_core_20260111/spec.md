# Track Spec: Refactor Core Infrastructure

## Overview
This track focuses on transforming the current script collection into a professional-grade Google Apps Script project. We will transition to `gemini-1.5-flash`, implement a unified selection processor, and establish a visual audit system.

## Requirements
- **Modularization:** Move away from scattered globals. Use a central `Config` object.
- **API Stability:** Update `callGeminiAPI` to use `gemini-1.5-flash`. Implement error handling for common API issues (quota, connection).
- **Selection Intelligence:** Create a utility that handles single cells, ranges, and columns while skipping empty cells.
- **Visual Audit System:**
    - Modified cells must turn **Bright Blue (#0000FF) and Bold**.
    - Implement a "Base Color" detection to allow reversion to the original color (e.g., White).
- **Testing:** Establish a local Jest environment to test logic (APIs, formatting math, selection filtering) independent of the GAS environment.

## Success Criteria
- Code is modular and follows the JavaScript style guide.
- API calls are stable and report errors gracefully.
- Visual feedback correctly highlights changes and reverts them perfectly.
- Unit test coverage for core logic is >80%.
