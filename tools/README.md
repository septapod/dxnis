# Tools and Methods

A growing library of AI-strategy methods for credit union and community bank leaders. Each method gets a **teaching page** that explains it in plain language, plus a **take-away** people carry into the room where the work actually happens. Credited to its original author. It lives inside the dxn.is site and reuses the site's header, footer, brand tokens, and theme toggle, so it reads as another page on dxn.is.

> **Working name.** "Tools and Methods" is provisional. You liked the "field guide" genre but can't use that exact term (another firm owns it). Change the name in one place: the `TM` object at the top of `tools.js`.

Deploys at `dxn.is/tools/`. The pages are read-only; the take-away is the printout (Ctrl+P, or Save as PDF).

## The pattern

Every method is two things:

1. **A teaching page.** Brand chrome (header, footer, theme) plus a plain-language explainer. The reader understands the method here.
2. **A take-away that fits the method.** The page hands off something usable into the room where the work happens. For evals, the work is judging a vendor in a meeting, which is qualitative and off the site, so the take-away is a **printable worksheet**: the page prints to a clean scorecard and a blank cases table you write on by hand. A different method might want a different take-away (a calculator for a numbers method, a discussion guide for a board conversation). The page-plus-fitted-take-away shape stays constant; the take-away's form follows the method.

The pages are read-only. No in-browser fill-in, no autosave, no Save/Print/Email buttons. People do the method in a meeting or a doc, not in the browser.

## What's here

| File | What it is |
| --- | --- |
| `index.html` | Landing page. The card grid of methods. |
| `evals.html` | The flagship entry: "Your AI product needs evals." A teaching page that prints to a vendor scorecard and a cases worksheet. |
| `tools.css` | Section styles. Every value is a brand token, so it follows the site's dark default and the light theme. Namespaced `tm-` so it never collides with the homepage. Holds the `@media print` rules that turn a page into its worksheet. |
| `tools.js` | Section behavior: theme and nav (mirrors the site) and the accordion. That is all; the pages have no in-page tool logic. |

The brand chrome comes from the site itself: `../css/dsl-tokens.css` (tokens), `../css/styles.css` (header, nav, logo, buttons, footer). This folder does not redefine any of that.

## The print convention

The take-away is the page's printout, built with two helper classes:

- `.tm-screen-only` — shown on screen, hidden in print (guidance like the print cue, the rating key, the intros).
- `.tm-print-only` — hidden on screen, revealed in print (the worksheet header, the mark boxes, the note lines, the blank cases table).

The `@media print` block in `tools.css` hides the chrome and the explainer (`.tm-section { display: none }`) and shows only the worksheet sections (`#scorecard`, `#cases`). To make a new method printable: give its worksheet section an `id`, mark screen guidance `.tm-screen-only` and the fillable scaffolding `.tm-print-only`, and add the reveal rules to the print block.

## Add a new method (three steps)

1. **Copy the entry.** Duplicate `evals.html` to `your-method.html`. Keep the `<head>` (the theme script, fonts, and stylesheet links) and the header/footer chrome exactly. Replace the content between them.
2. **Write the content.** Use the namespaced building blocks already in `evals.html`:
   - `.tm-hero` with `.tm-kicker`, an `<h1>`, `.tm-lede`, and a `.tm-source` attribution box.
   - `.tm-section` blocks for explainer copy. `.tm-levels` / `.tm-level` for an accordion. `.tm-rule` for a single highlighted rule.
   - The take-away section(s): plain read-only content on screen, with `.tm-print-only` scaffolding for what people write on (see the print convention above). For evals, that is the `#scorecard` and `#cases` sections.
   - `.tm-cta` for the closing call to action, and `.tm-attribution` for the credit block.
   - If the method's take-away is not a printout (a calculator, a discussion guide), build what fits and document it here.
3. **Add a card.** In `index.html`, copy the flagship `<a class="tm-card">` and point it at `your-method.html`. Fill the title, one plain sentence, the format chips, and the source credit. Use a `../tools/your-method.html` path (parent-relative) so links work whether or not the live URL has a trailing slash. Once there are two or more methods, delete the "More methods are on the way" placeholder card; the grid carries itself from there.

## Attribution is required

Every adapted entry credits the original author prominently in both the hero source box and the attribution block, links to the original, states plainly that the framework and ideas are the author's, and labels any invented examples as "illustrative." Driving traffic to the source is the point. The evals entry is the model: copy its pattern.

## Reserved for Brent

- The final section name and the URL path (`/tools/` is the working choice).
- Which methods to add next, drawn from past "Try This" newsletter features.
- Any wording changes to an adaptation.
