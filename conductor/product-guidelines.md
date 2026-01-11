# Product Guidelines - HeckTeck Tools

## Prose Style & Tone
- **Hybrid Balance:** The AI Polisher must blend **Professional Encouragement** (growth-oriented) with **Objective Conciseness** (direct and factual).
- **Quality Standard:** Polished comments must be grammatically flawless while retaining the teacher's original vocabulary complexity.
- **Strict Constraint:** All polished comments **MUST NOT exceed 280 characters** to ensure they fit within standard report card layout constraints.

## Visual Identity & Feedback
- **Active State:** Any text modified by the Pronoun Fixer or AI Polisher must be formatted as **Bright Blue (#0000FF) and Bold**.
- **Contextual Awareness:** The tool must detect the "Base Color" of the original text (e.g., White) and the "Base Weight" before making changes.
- **Audit Mode:** The Bright Blue/Bold state represents an "Unverified" change that needs teacher review.

## User Experience (UX) Standards
- **Flexible Scope:** Tools must operate seamlessly on a single cell, a multi-cell range, or an entire column.
- **Dynamic Reversion:**
    - **One-Click Undo:** Reverts the last operation for the specific cell, restoring both original text and original formatting.
    - **Selection-Based Finalization:** If a user manually edits a blue cell, the tool should ideally recognize this as an "approval" and eventually revert formatting (or allow manual override).
- **Menu-Driven Finalization:** A dedicated "Finalize/Approve Changes" menu item will scan the selection and revert all Bright Blue text back to the detected "Base Color" (e.g., White) and original font weight.
