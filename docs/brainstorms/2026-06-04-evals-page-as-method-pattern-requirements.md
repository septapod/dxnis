# Requirements: evals page as the first instance of the Tools and Methods pattern

**Date:** 2026-06-04
**Status:** Ready for planning
**Surface:** `tools/` (evals.html, index.html, tools.css, tools.js, README.md)
**Source:** `docs/ideation/2026-06-03-tools-methods-delivery-ideation.md` + working session

## Why

The evals page was built as an interactive web widget (radio ratings, autosave, Save / Print / Email / Clear). That is the wrong modality. The real work, vetting a vendor, happens off the site: in a meeting, with a team, and the content is qualitative judgment, not data to compute. The widget adds friction without value (Save duplicates autosave, Print equals Ctrl+P, Email is no better than copying the link). The page's real job is to teach the method and hand off something people carry into the room.

## Outcome

- The evals page teaches plainly and prints to a clean, write-on-it worksheet.
- The interactive widget and its JS are gone.
- The "teach page plus printable take-away" shape is documented as the reusable pattern, so the next method is cheap and can use a take-away that fits its own nature.

## Audience and job

Non-technical credit union or community bank exec. Jobs: understand evals enough to act (on the web), then use it in a vendor meeting or with a team (the printed worksheet), and find it again later (the library).

## In scope

1. **Strip the widget.** Remove the scorecard interactivity: radio ratings, autosave, the Save / Print / Email / Clear buttons, the vendor field, the live tally, and the matching logic in `tools.js`. Same for the cases worksheet's add-row / save / export.
2. **Page becomes read-only content.** The explainer (hero, what-is, three levels, the rule) stays. The 8 questions render as a readable list, each with its "A good answer / A dodge" reminder. The cases worksheet renders as explained content with its column headers.
3. **Print is the take-away, both parts in one print.** A print stylesheet hides the site chrome, hero, explainer, and CTA, and lays out a clean worksheet:
   - **Vendor scorecard** — each question with its good/dodge reminder, a mark area to circle Strong / Vague / Dodged by hand, and lines for notes.
   - **Eval-cases worksheet** — a table with "A member asks" / "A good answer looks like" and about 10 empty rows.
   - A small header line: method name, source credit, and space to hand-write vendor and date.
   - Prints clean to paper and to "Save as PDF."
4. **Reusable pattern.** Document the shape in the section README: a method is a teach page (brand chrome plus explainer plus content) plus a take-away that fits the method (for evals, a printable worksheet). Include the print convention (what prints, what is hidden) so the next method inherits it. Keep it lightweight: a template to copy plus README guidance, not a build system.

## Out of scope (this pass)

- The copyable Google Doc companion (a separate option, deferred).
- Library reorganization by job, and newsletter-to-page wiring (the separate "journey and findability" track, deferred).
- Any on-screen fill-in or typing. The page is read-only; writing happens on the printout.
- Applying the pattern to other methods. Evals is instance #1; the pattern is documented, not yet reused.

## Success criteria

- Reading the page: you understand the method and see the 8 questions with good/dodge, with no inputs and no buttons.
- Ctrl+P or Save as PDF: you get a clean worksheet (scorecard plus blank cases table), no site chrome, no explainer, that you print and write on. Fits sensibly on paper, 1 to 2 pages.
- `tools.js` no longer contains scorecard or worksheet logic; the theme toggle, nav, and accordion still work.
- The README documents the teach-page-plus-printable-take-away pattern clearly enough that a non-engineer, with an agent, could add the next method by copying the page.
- Brand intact: square corners, no side-stripes, tokens, print-clean, `../tools/` paths.

## Decisions (resolved)

- Take-away = both the scorecard and the cases worksheet, one print.
- On-screen = read-only, no inputs.
- Print hides the explainer and chrome; shows only the worksheet.
- Pattern = lightweight (template plus README), not a system.
- Keep the accordion, the site chrome, the brand rules, and the paths.

## Assumptions (confirm at build if any are wrong)

- Mark control on print: hand-drawn circles or boxes for Strong / Vague / Dodged.
- Cases worksheet on print: about 10 blank rows.
- No page numbers or elaborate print headers beyond method name, source, and a vendor/date line.

## Constraints (from the repo)

- dxnis brand and `.impeccable.md`: Swiss grid, square corners, no side-stripe borders over 1px, gold 2px focus, 8px spacing, brand tokens, namespaced `tm-` classes.
- Paths: parent-relative (`../tools/`, `../css/`, `../assets/`) for trailing-slash safety at `dxn.is/tools`.
- No em dashes, plain language, the prose-craft and anti-slop rules.

## Next

`ce-plan` to turn this into an implementation plan, then execute.
