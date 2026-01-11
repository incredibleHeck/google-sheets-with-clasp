# Track Plan: Refactor Core Infrastructure

## Phase 1: Foundation & Testing Setup [checkpoint: 7f6ffad]
- [x] Task: Initialize Node.js environment and install Jest for local testing.
- [x] Task: Create GAS service mocks (SpreadsheetApp, PropertiesService, UrlFetchApp) for unit tests.
- [ ] Task: Conductor - User Manual Verification 'Foundation' (Protocol in workflow.md)

## Phase 2: Core Logic Refactoring
- [x] Task: Write Tests: API communication and error handling logic.
- [x] Task: Implement: Refactored `callGeminiAPI` using `gemini-1.5-flash` with robust error handling.
- [x] Task: Write Tests: Selection processing and "Selection Intelligence" logic.
- [x] Task: Implement: Unified `SelectionProcessor` to handle single cells, ranges, and columns.
- [ ] Task: Conductor - User Manual Verification 'Core Logic' (Protocol in workflow.md)

## Phase 3: Visual Audit & Integration
- [ ] Task: Write Tests: Formatting state management and reversion logic.
- [ ] Task: Implement: `StyleManager` to handle Bright Blue/Bold highlights and color detection.
- [ ] Task: Implement: "Finalize/Approve Changes" menu logic to revert blue text to base color.
- [ ] Task: Conductor - User Manual Verification 'Visual Audit' (Protocol in workflow.md)
