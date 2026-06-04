# refactor: evals page as a print-worksheet take-away (Tools and Methods pattern, instance #1)

**Date:** 2026-06-04
**Status:** active
**Depth:** Lightweight
**Origin:** `docs/brainstorms/2026-06-04-evals-page-as-method-pattern-requirements.md`
**Target surface:** `tools/` (evals.html, tools.css, tools.js, README.md)

---

## Summary

Convert the evals page from an interactive widget into a read-only teaching page that prints to a clean, write-on-it worksheet (a vendor scorecard plus a blank eval-cases table, in one print). Remove the scorecard and worksheet JavaScript. Document the teach-page-plus-printable-take-away shape in the README so the next method is cheap to add.

## Problem frame

The page was built as an in-browser widget (radio ratings, autosave, Save/Print/Email/Clear). The real work happens off the site, in a vendor meeting, and the content is qualitative judgment, not data. The page's job is to teach the method and hand off a worksheet people carry into the room. (See origin: `docs/brainstorms/2026-06-04-evals-page-as-method-pattern-requirements.md`.)

## Key decisions

- On-screen is read-only. Writing happens on the printout.
- One print yields both the scorecard worksheet and the blank cases table.
- Print-only scaffolding (mark boxes, note lines, blank cases table, worksheet header) lives in the HTML as `display:none`-on-screen elements, revealed by `@media print`.
- Print hides chrome, explainer, and CTA; it shows only the worksheet.
- No print button (it equals Ctrl+P). A plain instructional line tells the reader to print or save as PDF.
- Lightweight pattern: the README documents the shape; no build system.
- Keep the accordion, site chrome, brand rules, and `../tools/` paths.

---

## Implementation units

### U1. Remove the scorecard and worksheet JavaScript

**Goal:** strip the interactive logic; keep the chrome and accordion working.
**Requirements:** advances "strip the widget" (origin In scope #1).
**Dependencies:** none.
**Files:** `tools/tools.js`
**Approach:** delete the Tool 1 (scorecard) and Tool 2 (worksheet) IIFEs and the helpers used only by them (`flashSaved`, `store`, `load`, `mailto`). Keep the `TM` name injection, theme toggle, nav toggle, header-scrolled listener, and the accordion handler.
**Test expectation:** none — static site, no test harness. **Verify:** page loads with no console errors; theme toggle, mobile nav, and the three-levels accordion still work; no references remain to removed element ids (`tm-scorecard`, `tm-cases`, `tm-tally`, `tm-vendor`, `data-act`).

### U2. Evals page becomes read-only content plus print-only worksheet scaffolding

**Goal:** remove inputs and buttons; show the questions as a readable list; add the print-only worksheet parts.
**Requirements:** origin In scope #2 and #3.
**Dependencies:** none (can land with or before U3; U3 styles what U2 adds).
**Files:** `tools/evals.html`
**Approach:**
- **Scorecard section:** keep the tag, h2, intro, and legend. Render the 8 questions as a static list (number, question, and the existing "A good answer / A dodge" reminder). Remove the vendor field, the tally, the radio inputs and labels, the note textareas, and the action buttons. Add one instructional line: "Print this page, or save it as a PDF, to get a worksheet you can write on."
- Inside each question, add print-only `.tm-print-mark` (boxes for Strong / Vague / Dodged) and `.tm-print-notes` (two or three ruled lines), hidden on screen.
- **Cases section:** keep the tag, h2, intro, and column headers as read-only content. Remove the add-row and action buttons. Add a print-only `.tm-print-cases` blank table (~10 rows of "A member asks" / "A good answer looks like"), hidden on screen.
- Add a print-only worksheet header `.tm-print-head`: method name, source credit (Hamel Husain), and hand-write lines for Vendor and Date.
- Tag the screen-only helper bits (chips, intros, legend, instructional line) with a `.tm-screen-only` hook so print can hide them; tag print-only blocks with `.tm-print-only`.
**Test expectation:** none. **Verify:** on screen the section is read-only (no inputs, no buttons); the 8 questions and their good/dodge reminders read cleanly; no leftover widget markup.

### U3. Print stylesheet produces the worksheet

**Goal:** `@media print` yields the worksheet only.
**Requirements:** origin In scope #3, success criterion "Ctrl+P gives a clean worksheet."
**Dependencies:** U2 (styles the scaffolding U2 adds).
**Files:** `tools/tools.css`
**Approach:** replace the existing `@media print` block. Hide `.site-header`, `.site-footer`, the hero, the what-is / three-levels / the-rule sections, the CTA, the attribution, the chips, the intros, the legend, the instructional line, the theme toggle, and the skip link (via `.tm-screen-only` and section-level hides). Reset `#main` top padding to 0 and set white background, black text. Show `.tm-print-head`, the scorecard question list with `.tm-print-mark` and `.tm-print-notes`, and `.tm-print-cases`. Use `break-inside: avoid` on each question and on table rows; consider `break-before` on the cases table so it starts cleanly. Keep it square and ink-friendly (no heavy fills).
**Test expectation:** none. **Verify:** browser print preview shows a clean worksheet (scorecard questions with mark boxes and note lines, then the blank cases table), no site chrome or explainer, fitting 1 to 2 pages; prints legibly in black and white.

### U4. README documents the pattern

**Goal:** capture the teach-page-plus-printable-take-away pattern and the print convention.
**Requirements:** origin In scope #4.
**Dependencies:** U1–U3 (document the shape they produce).
**Files:** `tools/README.md`
**Approach:** update the "what's here" and "add a method" sections. A method is a teach page (brand chrome plus explainer plus content) plus a take-away that fits the method; for evals the take-away is a printable worksheet. Document the print convention (`.tm-print-only` / `.tm-screen-only`, what prints, what hides). Remove references to the removed Save/Print/Email/Clear actions. Note that future methods may use a different take-away modality (a calculator, a discussion guide), and the page-plus-fitted-take-away shape is what stays constant.
**Test expectation:** none — docs only.

---

## Whole-feature verification

- **Screen:** read-only, brand intact (square corners, no side-stripes, tokens, gold focus); theme, nav, and accordion work.
- **Print:** one clean worksheet (scorecard plus blank cases table), no chrome or explainer.
- Paths parent-relative; no em dashes; plain language throughout.

## Out of scope

The copyable Google Doc companion; the library-by-job reorganization and newsletter wiring; applying the pattern to any other method.
