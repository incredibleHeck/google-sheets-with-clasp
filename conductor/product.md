# Initial Concept
A Google Sheets Add-on for educators to automate pronoun accuracy and professional grammar/tone polishing using AI, optimized for high-volume report card writing with stable free-tier API usage.

# Product Guide - HeckTeck Tools

## Target Users
- **Teachers:** Primary users managing hundreds of student comments.
- **School Administrators:** Users ensuring quality and consistency.
- **Educational Developers:** Using free-tier Gemini API for stable testing and integration.

## Core Goals
- **Stability:** Use high-quota free models (gemini-1.5-flash) to avoid "Resource Exhausted" errors during batch processing.
- **Ease of Use:** Support flexible interaction via single cell, range, or entire column selection.
- **Transparency:** Provide clear visual markers (Bright Blue/Bold) and easy revert options.

## Key Features
- **Flexible Selection Processing:** Users can apply tools to a single active cell, a custom range, or an entire selected column.
- **Automated Pronoun Fixer:** Cross-references the student's name against the CLASSLIST sheet to ensure gender-accurate pronouns.
- **AI Polisher (Gemini 1.5 Flash):** Optimized for higher rate limits. Fixes grammar and tone while ensuring pronouns match the student's name.
- **Selection Intelligence:** Automatically filters out empty cells or header rows during batch processing to optimize API usage and prevent quota waste.
- **Visual Audit & Safety:**
    - Modified text turns Bright Blue and Bold.
    - One-Click Revert:** Returns text and formatting to its original state if the change is rejected.
- **Pre-flight Check:** Verifies the existence of the CLASSLIST sheet and the Gemini API key before execution.
