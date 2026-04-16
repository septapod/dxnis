---
title: Impeccable Audit + Clarify Fixes
type: refactor
status: active
date: 2026-04-16
origin: docs/brainstorms/2026-04-16-impeccable-audit-fixes-requirements.md
---

# Impeccable Audit + Clarify Fixes

## Overview

A two-phase refactor pass on dxn.is to address 34 findings from the /impeccable audit (11/20 → target 18/20) and /clarify copy review. Phase A ships the meaningful quality bar: BAN 1 removal, accessibility primary fixes, performance corrections, font-loading alignment with DESIGN.md, a theming token sweep, and P1 copy edits. Phase B handles polish: touch target normalization, label hygiene, scrolled-header tokens, ring-shadow removal, newsletter/form copy, and the footer tagline.

No signature moves change: grainy hero bloom, p5.js scroll sketches, custom cursor with follower, logo marquee, screen-print ghost text, and square-cornered buttons all stay.

## Problem Frame

The site ships at 11/20 on the /impeccable rubric. The three big drags are: (1) two BAN 1 violations on the contact section (colored side-stripe hover reveals), (2) orphan brand-color rgba literals scattered across `css/styles.css` despite the DSL token system, and (3) copy inconsistencies (CTA hierarchy disagrees with `llms.txt`, service panel closings soft, form register mismatched). The audit and clarify findings are already concrete. This plan sequences them into atomic units an implementer can ship.

See origin: `docs/brainstorms/2026-04-16-impeccable-audit-fixes-requirements.md` for the full rationale behind each requirement.

## Requirements Trace

The origin document defines 34 requirements across A11y, Performance, Anti-Pattern, Theming, Responsive, Docs, and Copy categories. This plan addresses all 34. Requirement IDs (R-*) in each unit map back to the origin.

Phase A covers (13 IDs listed, 14 requirements work since R-DOC-02 is absorbed into R-PERF-02): R-ANTI-01, R-ANTI-02, R-A11Y-01, R-A11Y-02, R-A11Y-03, R-PERF-01, R-PERF-02, R-PERF-03, R-THEME-01, R-THEME-02, R-DOC-01, R-COPY-01, R-COPY-03.

Phase B covers: R-A11Y-04, R-A11Y-05, R-A11Y-06, R-A11Y-07, R-PERF-04, R-PERF-05, R-ANTI-03, R-THEME-03, R-THEME-04, R-RESP-02, R-COPY-05, R-COPY-06, R-COPY-07, R-COPY-08, R-COPY-09, R-COPY-10, R-COPY-11, R-COPY-12, R-COPY-13, R-COPY-14.

Five origin requirements are absorbed into parent requirements: R-DOC-02 inside R-PERF-02 (Unit 4), R-RESP-01 inside R-A11Y-04 (Unit 7), R-THEME-05 inside R-PERF-02 (Unit 4), R-COPY-09 inside R-A11Y-05 (Unit 7), R-COPY-10 inside R-A11Y-06 (Unit 7). R-COPY-09 and R-COPY-10 are listed in the Phase B trace above because they carry copy-detail text that matters at implementation; R-DOC-02, R-RESP-01, and R-THEME-05 are not listed separately because their work is fully contained in the parent unit with no independent sub-text.

## Scope Boundaries

- No redesign of any section. Hero, services, framework, testimonials, newsletter, contact, footer layouts all stay.
- No migration off vanilla HTML/CSS/JS. No build tools, no bundler, no framework.
- No new sections, new visuals, new p5.js sketches.
- No image CDN, no service worker, no critical-CSS extraction.
- No changes to Web3Forms, Calendly, Beehiiv, Category 6, or Google Analytics integrations.
- No changes to the paused `.phase-card` / `.belief-full` CSS blocks (see origin §5.3 R-PAUSED-01 — flagged for eventual resurrection, not shipped now).

### Deferred to Separate Tasks

- R-COPY-02 (Service 1 concrete tools): withdrawn in origin §9.4. Keep existing copy.
- R-COPY-04 (Service panel link verbs): withdrawn in origin §9.4. Keep three existing verbs.
- R-PAUSED-01 (BAN 1 violations inside paused CSS): addressed when Brent revives the paused sections, not during this refactor.

## Context & Research

### Relevant Code and Patterns

- `css/dsl-tokens.css` — DSL token source of truth. Houses `:root` universal tokens plus `[data-theme="dark"]` and `[data-theme="light"]` palette blocks. New tokens added in this plan must land here and be declared in both theme blocks.
- `css/styles.css` — single site stylesheet, 3403 lines. Uses DSL tokens for most surfaces but contains ~58 orphan rgba literals.
- `index.html` — single-page markup. Uses Schema.org JSON-LD, `aria-label` and `role` conventions throughout, and loads fonts from Google Fonts at line 230.
- `js/main.js` — currently wires scroll progress, nav toggle, theme toggle, carousel rotation, and testimonial auto-rotate. This plan touches it for progress-bar transform writes, nav-toggle state labels, and carousel-pause state labels.
- `js/framework-visuals.js` and `js/service-visuals.js` — p5.js scroll-driven sketches. Not touched.
- `DESIGN.md` — v3.0 design system doc. Its §3 (Typography) claim about self-hosted fonts is out of sync with `index.html` reality; this plan updates it. Its §2 (Color Palette) auto-generates from `css/dsl-tokens.css` via `scripts/sync-design-md.mjs`; new tokens will re-flow on the next sync run.
- `fonts/dsl-fonts.css` — legacy Satoshi loader. Referenced by `agents/index.html` and `sketch-gallery.html` only. Not deleted.
- `llms.txt` — external contract for AI agents summarizing the site. Lines 46-47 contradict the hero CTA hierarchy; updated in Unit 6.

### Institutional Learnings

No `docs/solutions/` directory exists for this project. `docs/research/consulting-website-conversion-research.md` is conversion-focused and does not speak to accessibility, theming, or the specific fixes in this plan.

### External References

No external research was run. The requirements are against the /impeccable rubric, which is already loaded, and against WCAG 2.2 AA patterns, which are standard.

## Key Technical Decisions

- **Font hosting: keep Google Fonts, accept the availability tradeoff.** Performance delta is small for warm-referral traffic. Lower maintenance for a solo operator. Update `DESIGN.md` §3 to match reality rather than self-host. (See origin §9.1.) The tradeoff: Google Fonts has had outages; during an outage the site falls back to system fonts (`system-ui, sans-serif`) per the stack declared in `css/dsl-tokens.css`. This is acceptable for credibility-proof traffic and does not break core functionality. If a future outage materially affects the site (sustained degradation, audience complaint, or the SPOF becomes a pattern), self-host becomes the fallback plan.
- **Two-phase delivery.** Phase A ships the quality bar (P0 + P1). Phase B ships polish (P2 + P3). Avoids a 34-item coordination cost in a single PR while still getting the meaningful fixes live first.
- **Tokenize orphan rgba literals, do not just replace.** Introduce semantic alpha tokens (`--alpha-border-*`, `--alpha-shadow-*`, `--tint-*`) in `css/dsl-tokens.css` before sweeping the literals, so the replacement hub is per-theme and intention-readable. Avoids repeating the same alpha math across 58 sites.
- **Progress bar animations use `transform: scaleX/scaleY`, not `width/height`.** Layout-triggering transitions on scroll-linked indicators are the primary perf fix. JS progress writers switch to setting `--progress-value` on the bar and the CSS transforms use `scaleX(var(--progress-value))`.
- **Focus pattern switches to `:focus-visible`.** Mouse clicks no longer show the 2px gold ring; keyboard focus still does. Preserves accessibility, removes the "annoying outline on click" pattern.
- **Touch-target fixes wrap visuals, not enlarge them.** The 10-12px indicator and services dots stay at their current visual sizes. A 44x44 invisible padding ring inside the `<button>` carries the tap area. Exact inner sizes: `.indicator-dot` is 12x12, `.services-dot` is 10x10, `.indicator-dot.active` widens to 32x12. Visual design unchanged, WCAG 2.5.5 met.
- **Carousel-btn `backdrop-filter: blur` removed, not kept.** Blur layer is a perf cost without a visual gain against the warm background. Background-color alone carries the button weight.
- **R-COPY-11 (service kickers) awaits Brent's source at implementation.** Draft options in the origin stand; Brent picks or supplies alternates when Unit 10 ships.
- **R-COPY-13 (hero h1) is in scope but optional.** If Brent defers at implementation, the unit ships without it and the requirement stays in the origin doc for a later pass.

## Open Questions

### Resolved During Planning

- **Sequencing (origin §9.2):** Two phases. Phase A = P0 + P1 + P1 copy. Phase B = P2 + P3 polish.
- **Unit ordering within each phase:** Dependency-driven. Token additions (Unit 5) precede any unit that consumes new tokens. Otherwise units within a phase are independent and can ship in any order.

### Deferred to Implementation

- **R-COPY-11 kicker copy:** Brent supplies the moment-specific text during Unit 10. Draft options in the origin requirement are the starting menu.
- **R-COPY-13 hero h1:** Brent decides during Unit 11 whether to flip to first-person sentence or keep the noun-phrase positioning claim.
- Removed: earlier draft hedged the final alpha-token names as "starting menu." Names are now locked in Unit 5 approach: `--alpha-border-subtle`, `--alpha-border-hover`, `--alpha-shadow-soft`, `--alpha-shadow-lift`, `--tint-gold-soft`, `--tint-coral-soft`, `--tint-teal-soft`, `--color-on-cta`. Unit 8 consumes these names directly.
- Removed: earlier draft hedged whether `scripts/sync-design-md.mjs` still exists. It does, it is wired to the token file, and Unit 5 runs it. Resolved.

## Implementation Units

### Phase A — Quality Bar (P0 + P1)

- [ ] **Unit 1: Remove BAN 1 side stripes from contact section**

**Goal:** Kill the colored hover-reveal side stripes on `.contact-form-container` and `.calendly-container`. Replace with a hover cue that does not use a side stripe greater than 1px.

**Requirements:** R-ANTI-01, R-ANTI-02

**Dependencies:** None

**Files:**
- Modify: `css/styles.css`

**Approach:**
- In `.contact-form-container` (around line 2870-2878), remove `border-left: 3px solid transparent` and its hover-reveal counterpart `border-left-color: var(--color-accent-teal)`.
- In `.calendly-container` (around line 2978-2991), remove `border-right: 3px solid transparent` and its hover-reveal counterpart `border-right-color: var(--color-accent-coral)`.
- Replace both with a full 1px `border-color` shift on hover. Default (non-hover) border in both themes: `1px solid var(--color-border)` (resolves to `#2A2A32` dark / `#D4D4D0` light). Hover: `.contact-form-container` shifts to `var(--color-accent-teal)` (resolves to `#529099` dark / `#3A6370` light); `.calendly-container` shifts to `var(--color-accent-coral)` (resolves to `#CF5A5A` dark / `#B84545` light). The two containers stay visually distinct via the different accent colors. Verify both hover states pass WCAG 3:1 non-text contrast in both themes.
- Do not substitute `box-shadow: inset` for the stripe. Same pattern in disguise.

**Patterns to follow:**
- Existing `.btn:hover` pattern (`css/styles.css:572-578`) for a border-color-only hover shift.
- Existing light-mode form input focus pattern (`css/styles.css:147-151`) for how a full-border color shift reads in both themes.

**Test scenarios:**
- Test expectation: none — visual refactor. Verification via `/impeccable audit` rerun scoring Anti-Pattern category at 3 or higher, plus visual spot-check in Chrome + Safari on both themes.

**Verification:**
- Grep `css/styles.css` for `border-left:\s*[2-9]px` and `border-right:\s*[2-9]px`. Only hits should be inside the paused `.phase-card` block.
- Hover the contact form and calendly containers in both themes. Full 1px border color shifts, no side stripe reveals.

- [ ] **Unit 2: Accessibility foundations (focus-visible + ARIA correctness)**

**Goal:** Fix three accessibility primary issues in one pass: migrate `:focus` to `:focus-visible`, resolve the form-message `role="alert"` + `aria-live="polite"` conflict, and expose `.services-dot` buttons to assistive tech.

**Requirements:** R-A11Y-01, R-A11Y-02, R-A11Y-03

**Dependencies:** None

**Files:**
- Modify: `css/styles.css`
- Modify: `index.html`

**Approach:**
- Change `:focus` declarations to `:focus-visible` at `css/styles.css:147-148` (light-theme form input focus), `290-293` (global), `2763-2766` (newsletter input), and `2923-2928` (contact form input). Use the `:focus:not(:focus-visible) { outline: none }` idiom at each site rather than a blanket `:focus { outline: none }` companion. This preserves the ring for any browser that does not understand `:focus-visible`, fulfilling WCAG 2.4.7 without user-facing regression.
- Leave `css/styles.css:223` (`.skip-nav:focus`) unchanged. It is a keyboard-only affordance, intentionally always-visible on focus.
- At `index.html:682` (form-message), drop `aria-live="polite"`. Keep `role="alert"`, which implies assertive live region behavior. The success/error messages should announce on arrival, which is what alert does.
- Note on mobile services-dots: `.services-dots` is `display: none` on mobile (css/styles.css:2033). The ARIA improvements in this unit benefit desktop only; mobile a11y is unchanged by design, since the indicator serves a desktop scroll-position role that has no mobile analog.
- At `index.html:423-427` (services-dots): the three `<button class="services-dot">` elements currently have NO click handler wired in `js/main.js` (verified: `dotBtns` is queried but only used at line 155 to toggle `.active` class based on scroll state). Clicking them does nothing. Applying aria-labels would create a false affordance. Two dispositions for this requirement; Brent picks one:
  - Disposition A (preferred if implementation time allows): wire a click handler in `js/main.js` that scrolls the page to the corresponding offset within the 550vh `.services-scroll-track`. Calculate target offset as `trackTop + (trackHeight / panels.length) * dotIndex`. Empirical scroll-arithmetic refinement may be needed at implementation since the pinned-sticky behavior means a linear scroll-to may land mid-transition rather than on a stable panel. Then remove `aria-hidden="true"` from `.services-dots`, add per-dot `aria-label="Jump to service N"`. The affordance becomes real.
  - Disposition B (quick fix): convert the three `<button>` elements to `<span aria-hidden="true">` elements. Accepts they are purely visual scroll indicators, not controls. Screen readers ignore them. `aria-hidden` on the wrapper stays. R-A11Y-03 resolves by removing the false affordance rather than exposing it. Before shipping B, verify that `.services-counter` / `#services-counter-num` (the "1/3" position indicator) is exposed to assistive tech. If the counter is inside an `aria-hidden` wrapper, screen-reader users lose all position information in the 550vh pinned section, which is a WCAG 1.3.1 equivalence gap. If the counter is not exposed, add `aria-live="polite"` to the counter or default to Disposition A.
- If Brent defers the decision, ship Disposition B as the safe default after completing the counter-exposure verification above.

**Patterns to follow:**
- Existing aria-label convention on `.carousel-btn-prev` / `.carousel-btn-next` (`index.html:539-548`) for button labels.
- Existing aria-label convention on `.indicator-dot` (`index.html:551-554`) for position-based button labels.

**Test scenarios:**
- Happy path: Tab to a link, nav button, or form input from the keyboard. The 2px accent-gold ring appears. (Verifies `:focus-visible` behavior.)
- Happy path: Click any button with the mouse. No ring appears. (Verifies the mouse-click suppression.)
- Happy path: Programmatically set a success message via the form. Screen reader announces the message on arrival. (Verifies `role="alert"` without live-region conflict — spot-check with VoiceOver.)
- Happy path: With VoiceOver on, navigate to the services section. The three services-dot buttons announce their labels and are reachable by the VO rotor.
- Edge case: `:focus-visible` polyfill is not needed on modern browsers, but verify behavior holds on Safari 16+ and Firefox 115+.

**Verification:**
- VoiceOver on macOS reads "Jump to service 1, button" when landing on the first services-dot.
- A mouse click on any button does not show a focus ring.
- Keyboard Tab to the same button does show the ring.

- [ ] **Unit 3: Layout-safe progress animations and lazy-loaded images**

**Goal:** Convert the two layout-triggering `transition: width / height` animations on scroll-linked progress bars to `transform: scaleX / scaleY`, and add `loading="lazy" decoding="async"` to five below-fold images.

**Requirements:** R-PERF-01, R-PERF-03

**Dependencies:** None

**Files:**
- Modify: `css/styles.css`
- Modify: `index.html`
- Modify: `js/main.js`

**Approach:**
- In `css/styles.css`, at the top of the file, register both custom properties with `@property` so CSS transitions interpolate them as numbers rather than discrete values:
  ```
  @property --scroll-progress { syntax: '<number>'; inherits: false; initial-value: 0; }
  @property --service-progress { syntax: '<number>'; inherits: false; initial-value: 0; }
  ```
  Without this registration, the transform transitions will snap instead of ease, making the migration worse than the current width/height pattern.
- Browser-support note on `@property`: Firefox shipped `@property` support in version 128 (July 2024). On Firefox 115-127, the `@property` declaration is ignored and the transition will snap. Either accept Firefox 128+ as the support floor (consistent with warm-referral traffic who likely run current releases) OR add a JS fallback in `js/main.js` that writes the full transform string directly (`element.style.transform = 'scaleX(' + value + ')'`) so older Firefox degrades to compositor-only transforms without relying on custom-property interpolation. Default: accept the floor. Verification target: Safari 16.4+, Chrome 85+, Firefox 128+.
- In `css/styles.css`:
  - `.scroll-progress-bar` (around line 1012): replace `transition: width 0.1s linear` with `transition: transform 0.1s linear`. Add `transform-origin: left`. Set `width: 100%` (replacing the current `width: 0%`) and add `transform: scaleX(var(--scroll-progress, 0))` so the bar starts collapsed and grows to full width.
  - `.service-progress-fill` (around line 1810): replace `transition: height 0.1s linear` with `transition: transform 0.1s linear`. Add `transform-origin: top`. Set `height: 100%` and use `transform: scaleY(var(--service-progress, 0))`.
- In `js/main.js`: locate the scroll-progress writer and the service-progress writer. Change both from assigning `style.width = value + '%'` / `style.height = value + '%'` to setting the CSS custom property via `element.style.setProperty('--scroll-progress', value / 100)`. The service-progress writer iterates over all three `.service-progress-fill` siblings and sets `--service-progress` per-element; each element carries its own scoped value.
- In `index.html`: add `loading="lazy" decoding="async"` to the four testimonial `<img>` tags at lines 492, 503, 515, 526, and the newsletter logo `<img>` at line 635. The header logo at line 255 stays eager.

**Patterns to follow:**
- CSS custom property + transform pattern is simple enough that no existing pattern reference is needed; the grainy hero bloom at `css/styles.css:628-637` uses custom properties (`--bloom-x1`, `--bloom-y1`) as the closest local reference.

**Test scenarios:**
- Happy path: Scroll the page. Top progress bar fills from left to right smoothly. No jank on a throttled 4x CPU DevTools profile.
- Happy path: Scroll through the pinned services section. The left-edge progress stroke fills top to bottom for each service panel.
- Happy path: Load the page fresh on a slow 3G DevTools throttle. The four testimonial images and newsletter logo do not request until they approach the viewport.
- Edge case: Scroll very quickly. Progress bar values update without visual tearing.
- Edge case: Resize the window while the services section is pinned. Progress stroke recalculates correctly.

**Verification:**
- DevTools Performance panel shows no "Layout" work during scroll progress updates (transforms are compositor-only).
- Network tab on fresh load shows testimonial image requests deferred until scroll reaches the testimonial section.
- Visual parity with current behavior: progress indicators look and feel the same.

- [ ] **Unit 4: Font loading realigned to reality**

**Goal:** Close the docs/code drift on fonts. Keep Google Fonts as the delivery mechanism, document that in `DESIGN.md` §3, annotate the legacy `fonts/dsl-fonts.css`, and add a preload hint to `index.html`.

**Requirements:** R-PERF-02, R-DOC-02

**Dependencies:** None

**Files:**
- Modify: `index.html`
- Modify: `DESIGN.md`
- Modify: `fonts/dsl-fonts.css`

**Approach:**
- In `index.html` at line 230, add a `<link rel="preload" href="https://fonts.googleapis.com/css2?..." as="style">` referencing the same Google Fonts URL before the existing `<link rel="stylesheet">`. Do NOT add `crossorigin` to the preload. The existing stylesheet `<link>` has no `crossorigin` attribute (its CSS fetch is no-CORS), and a preload's CORS mode must match the stylesheet's CORS mode to coalesce into one request. An earlier draft of this plan specified `crossorigin`; that was incorrect and would have caused the exact double-fetch the preload is meant to avoid. Verification: DevTools Network tab on fresh load shows exactly one request for the Google Fonts stylesheet, not two. Crossorigin only belongs on font-file preloads (`as="font"`), not CSS-file preloads.
- In `DESIGN.md` §3 (Typography Rules, around lines 121-152): replace language claiming "All three are self-hosted in `fonts/` with `@font-face` declarations in `fonts/dsl-fonts.css`" with accurate language: "Delivered via Google Fonts (see `index.html`). `<link rel=\"preload\">` with `crossorigin` primes the stylesheet. Offline builds would self-host from Fontshare or Google Fonts Helper." Keep the rest of the typography table as-is.
- In `DESIGN.md` §9 (Agent Prompt Guide): update the three ready-to-use prompt blocks that still reference retired fonts. In the "new landing page section" prompt, replace "body copy in Karla at 1.125rem" with "body copy in Inter at 1.125rem". In the "new card component" prompt, replace "Title in Satoshi weight 600, body in Karla weight 400" with "Title in Plus Jakarta Sans weight 600, body in Inter weight 400". In the "new button variant" prompt, replace "0.95rem Karla weight 500" with "0.95rem Inter weight 500".
- In `fonts/dsl-fonts.css`: add a header comment at the top explaining the file is legacy, loads Satoshi only, and is referenced by `agents/index.html` and `sketch-gallery.html` rather than the main site.

**Patterns to follow:**
- `<link rel="preconnect">` already exists at `index.html:228-229`. The new preload slots in between the preconnects and the stylesheet link.

**Test scenarios:**
- Happy path: Load the page fresh with DevTools Network tab open. The Google Fonts stylesheet request fires earlier on the waterfall with preload than without.
- Happy path: Open `agents/index.html` in the browser. Satoshi still loads correctly. (Verifies `fonts/dsl-fonts.css` still works.)
- Test expectation: no automated test for `DESIGN.md` content accuracy. Human verification by reading §3 post-change.

**Verification:**
- Grep `DESIGN.md` for "self-hosted" — remaining hits should be accurate or intentional.
- `fonts/dsl-fonts.css` first lines include a comment explaining purpose and scope.
- `index.html` has preload + stylesheet links in the correct order (preconnect, preload, stylesheet).

- [ ] **Unit 5: Theming token sweep (orphan rgba → tokens)**

**Goal:** Introduce semantic alpha tokens to `css/dsl-tokens.css` and replace ~58 orphan rgba literals in `css/styles.css` with token references. Also add a `--color-on-cta` token for the four hardcoded white CTA text sites.

**Requirements:** R-THEME-01, R-THEME-02

**Dependencies:** None (but landed before Unit 8, which also edits tokens)

**Files:**
- Modify: `css/dsl-tokens.css`
- Modify: `css/styles.css`

**Approach:**
- Run in two passes, not one. Pass 1 is a pilot on 5-10 literals to validate token groupings before committing to the full sweep. Pass 2 is the full 58-literal sweep once the token set is confirmed sound. Pilot pass/fail rule: all 5-10 pilot literals must map cleanly to an existing token or to a `color-mix` call (no new token needed post-pilot), and the touched surfaces render at visual parity with pre-refactor in both themes. If either condition fails, pause and re-examine the token set before Pass 2.
- Alpha heuristic note: dark-theme alpha values are intentionally 2-5x their light-theme counterparts (for example `--alpha-shadow-soft` is `0.3` dark / `0.06` light) because dark shadows over dark surfaces need more alpha to read at perceptual parity with light shadows over light surfaces. The pilot pass validates this ratio in context; if pilot surfaces reveal mismatch, adjust the ratios before Pass 2.
- In `css/dsl-tokens.css`, add a new section per theme for alpha tokens. Token list is locked at plan time (not a "starting menu" — final names below):
  - `--alpha-border-subtle`: borders using low-alpha white or black. Dark: `rgba(255,255,255,0.08)`. Light: `rgba(0,0,0,0.08)`.
  - `--alpha-border-hover`: hover-state borders. Dark: `rgba(255,255,255,0.15)`. Light: `rgba(0,0,0,0.15)`.
  - `--alpha-shadow-soft`: drop shadows. Dark: `rgba(0,0,0,0.3)`. Light: `rgba(0,0,0,0.06)`.
  - `--alpha-shadow-lift`: heavier shadows. Dark: `rgba(0,0,0,0.4)`. Light: `rgba(0,0,0,0.12)`.
  - `--tint-gold-soft`: `rgba(251,226,72,0.1)` in dark, `rgba(125,100,0,0.08)` in light.
  - `--tint-coral-soft`: `rgba(207,90,90,0.1)` in dark, `rgba(184,69,69,0.08)` in light.
  - `--tint-teal-soft`: `rgba(67,116,129,0.1)` in dark, `rgba(58,99,112,0.1)` in light.
  - `--color-on-cta`: `#FFFFFF` in both themes (covers R-THEME-02 — both theme blocks get the literal white, no theme-variant value).
- Sweep `css/styles.css`: replace brand-color rgba literals (tuples 251,226,72 / 207,90,90 / 67,116,129 / 184,69,69 / 125,100,0 / 58,99,112) with the matching token, or with `color-mix(in oklab, var(--brand-gold) N%, transparent)` when the alpha is unusual enough to not deserve a dedicated token. Do the same for border-grade `rgba(255,255,255,a)` and `rgba(0,0,0,a)` by routing to `--alpha-border-*` or `--alpha-shadow-*`.
- Replace the four `#FFFFFF` literals in light-mode CTA rules (`css/styles.css:81, 89, 95, 160`) with `var(--color-on-cta)`.
- Do NOT touch the three hero bloom `radial-gradient` rgba calls (`css/styles.css:629-631` and the light-theme override `css/styles.css:661-663`). Leave them inline; add a `/* signature rgba values — leave inline */` comment.
- Leave the testimonial image border shadow `rgba(0,0,0,0.3)` inline if it resists tokenization cleanly, but prefer the token.
- After the sweep, run `node scripts/sync-design-md.mjs` from the repo root. The script exists and parses `css/dsl-tokens.css`, regenerating the token sections of `DESIGN.md` between `<!-- DSL:COLORS:BEGIN -->` / `END` and `<!-- DSL:SPACING:BEGIN -->` / `END` marker comments. Prose sections stay untouched.
- Verification grep after the sweep: confirm the three hero bloom rgb tuples `(251, 226, 72)`, `(207, 90, 90)`, `(67, 116, 129)` still appear inside `radial-gradient(` declarations in `css/styles.css`. If any are zero, the sweep incorrectly tokenized the bloom and must be partially reverted.

**Patterns to follow:**
- Existing token patterns in `css/dsl-tokens.css:42-70` (dark theme) and `73-104` (light theme) for where new tokens go.
- Existing `--color-surface-gold` / `--color-surface-coral` / `--color-surface-teal` tokens (lines 64-66) as the model for tint tokens.

**Test scenarios:**
- Happy path: Toggle the theme. Every previously-tinted surface (form focus rings, tint backgrounds, border fades) still shifts correctly between dark and light.
- Happy path: Hover carousel controls, contact form inputs, indicator dots. All ring/glow states still render.
- Edge case: Grep `css/styles.css` for `rgba\(\s*(251|207|67|184|125|58)` outside the hero bloom. Remaining hits should be zero or commented as intentional.
- Edge case: Grep for `#FFFFFF` and `#ffffff`. Remaining hits should be zero or inside comments.

**Verification:**
- `css/dsl-tokens.css` has the new token block in both theme sections.
- `css/styles.css` no longer contains orphan brand-color rgba literals (excluding signature hero bloom).
- Light theme and dark theme toggle cleanly; both look identical to pre-refactor on a visual spot check.

- [ ] **Unit 6: Copy primary (hero flow, Service 2 collapse, llms.txt)**

**Goal:** Ship the three P1 copy changes: update `llms.txt` to match the actual hero CTA hierarchy, collapse the redundant Service 2 closing sentence, and keep every edit within brent-voice + writing-quality rules.

**Requirements:** R-COPY-01, R-COPY-03, R-DOC-01

**Dependencies:** None

**Files:**
- Modify: `llms.txt`
- Modify: `index.html`

**Approach:**
- In `llms.txt` (around lines 46-47), replace "The primary CTA is the AI for FIs newsletter. The secondary CTA is the contact form." with: "The primary CTA is the contact form at https://dxn.is/#contact. The secondary CTA is the AI for FIs newsletter, which is also the on-ramp for people not yet ready to reach out."
- In `index.html` at line 370 (Service 2 body copy), replace the two sentences "I take topics that feel out of reach and make them something your team can work with. You walk out with tools and ideas you can use the next morning." with one sentence. Two drafts; Brent picks one before the unit ships:
  - Draft A (names the topic): "I take the topics that feel out of reach, like agentic AI, and turn them into something your team can use the next morning."
  - Draft B (no topic named): "I take the topics that feel out of reach and turn them into something your team can use the next morning."
  - Naming "agentic AI" commits to a factual claim about what Brent handles in workshops; his own rule is not to inject claims in his voice without his say-so. Draft B ships safely without confirmation. Draft A ships only after Brent confirms "agentic AI" accurately names the workshop topic.
- Before committing, run the copy through the writing-quality checklist: no em dashes, no banned phrases, active voice, no tricolon default, no false singulars.

**Patterns to follow:**
- Service 3 body copy at `index.html:402` as the specificity benchmark ("A regular, confidential thinking partner for credit union CEOs and senior leaders. Each conversation is built around the decisions in front of you.").

**Test scenarios:**
- Happy path: Read `llms.txt` end to end. Statements about CTAs match the hero on the live site. No other contradictions surface.
- Happy path: Read Service 2 copy in the browser. Single-sentence closing, no redundancy with the kicker above or the link verb below.
- Edge case: "Agentic AI" as the named topic is consistent with Brent's positioning. If Brent prefers a different topic or wants the phrase removed, the edit is a one-line swap.

**Verification:**
- `llms.txt` and the hero on `index.html` agree that "Book a call" is primary.
- Service 2 body reads cleanly. No sentence says the same thing twice.

### Phase B — Polish (P2 + P3)

- [ ] **Unit 7: Accessibility touch targets and state-aware labels**

**Goal:** Bring all interactive controls to 44x44 minimum tap area, drop the theme-toggle `title` attribute, wire state-aware labels on nav-toggle and carousel-pause.

**Requirements:** R-A11Y-04, R-A11Y-05, R-A11Y-06, R-A11Y-07, R-COPY-09 (theme-toggle title removal — copy-detail sub-task of R-A11Y-05), R-COPY-10 (nav-toggle state-aware label text — copy-detail sub-task of R-A11Y-06). R-RESP-01 (mobile touch targets) is absorbed into R-A11Y-04.

**Dependencies:** Unit 2 (focus-visible landing before touch-target changes so focus behavior is already settled)

**Files:**
- Modify: `css/styles.css`
- Modify: `index.html`
- Modify: `js/main.js`

**Approach:**
- Touch target fixes in `css/styles.css`:
  - `.carousel-btn` desktop (around line 2259): already 48x48, no change. Mobile override (around line 3308): raise from 36x36 to 44x44.
  - `.indicator-dot` (around line 2300): keep the 12x12 visual disc but wrap the hit area via padding inside the `<button>`. Total tap area reaches 44x44 via padding. **Layout compensation required:** padded buttons expand their laid-out footprint by ~32px each. Reduce the existing `gap` on `.carousel-indicators` (around line 2296) from `var(--space-1)` to `0` or negative margin equivalent so the visual dot cluster spacing stays roughly constant. Alternate pattern: position the tap area as an `::after` pseudo-element with `position: absolute; inset: -16px;` so the button's laid-out size stays 12x12 while the hit area expands. Pick whichever reads cleaner in the visual check.
  - `.carousel-pause` (around line 2326): raise from 36x36 to 44x44.
  - `.services-dot`: similar tap-area wrap pattern as `.indicator-dot`.
  - `.nav-toggle` (around line 378-384): raise from 40x40 to 44x44.
  - `.theme-toggle` (around line 497-502): raise from 40x40 to 44x44.
- In `index.html` at line 270 (theme-toggle): remove the `title="Toggle theme"` attribute. Keep `aria-label="Toggle dark/light mode"`.
- In `js/main.js`:
  - Find the nav-toggle click handler. When `aria-expanded` flips to `"true"`, set `aria-label="Close menu"`. When it flips to `"false"`, set `aria-label="Open menu"`.
  - Find the carousel-pause click handler. When paused, set `aria-label="Resume testimonial rotation"`. When resumed, set `aria-label="Pause testimonial rotation"`.
- In `index.html` at line 263 (nav-toggle): initial `aria-label="Open menu"` already correct.
- In `index.html` at line 556 (carousel-pause): change initial `aria-label="Pause auto-rotation"` to `aria-label="Pause testimonial rotation"`.

**Patterns to follow:**
- Existing `aria-label` + `aria-expanded` pattern on `.nav-toggle` as the model; the plan just extends it to toggle the label text too.

**Test scenarios:**
- Happy path: On a touch device (or Chrome DevTools mobile emulation), tap each interactive control. Hit area feels 44x44.
- Happy path: Open the mobile nav. Screen reader announces "Close menu" when the overlay is showing.
- Happy path: Pause and resume the testimonial carousel. Screen reader announces the opposite action on the button after each toggle.
- Edge case: Resize between desktop and mobile while nav is open. aria-label stays consistent with aria-expanded state.

**Verification:**
- Chrome Lighthouse "Accessibility" audit reports no failing touch-target rules.
- VoiceOver on iOS announces correct state-aware labels on nav-toggle and carousel-pause.

- [ ] **Unit 8: Theming polish (scrolled header, font-accent, hero min-height)**

**Goal:** Move the scrolled-header background to a theme token, resolve the undocumented `--font-accent` alias, and tighten the hero min-height for small landscape viewports.

**Requirements:** R-THEME-03, R-THEME-04, R-RESP-02

**Dependencies:** Unit 5 (new token patterns already established)

**Files:**
- Modify: `css/dsl-tokens.css`
- Modify: `css/styles.css`
- Modify: `DESIGN.md`

**Approach:**
- In `css/dsl-tokens.css`: add `--color-header-scrolled` to both theme blocks. Dark: `rgba(0, 0, 0, 0.95)` (or route through `--alpha-shadow-*` if the sweep produced a matching token). Light: `rgba(250, 250, 250, 0.95)`.
- In `css/styles.css:319-323` (default `.site-header.scrolled`) and `29-32` (light override): replace the hardcoded rgba with `background-color: var(--color-header-scrolled)`. Remove the light-theme override if the token resolves correctly.
- `--font-accent` alias at `css/styles.css:19`: default action is rename to `--font-quote` and document in `DESIGN.md` §3 as a fourth semantic role (for testimonial pull-quotes and the Wheatley statement quote). Brent may instead choose to inline `var(--font-serif)` at both use sites and delete the alias; confirm preference at implementation. If renaming, update the two use sites at `css/styles.css:2208` and `css/styles.css:2581`, AND grep across the full repo (`css/`, `index.html`, `agents/`, `sketch-gallery.html`, `fonts/`, `DESIGN.md`) for any remaining `--font-accent` reference before committing. Dangling references silently fall back to the system default.
- `.hero { min-height: 60vh }` at `css/styles.css:599`: replace with `min-height: clamp(520px, 70vh, 900px)`.

**Patterns to follow:**
- Token naming convention from Unit 5 (e.g., `--alpha-border-*`) applies here: `--color-header-scrolled` uses the `--color-*` prefix because it maps to a single surface, not an alpha value.

**Test scenarios:**
- Happy path: Scroll the page past the hero. Site header fills with theme-appropriate background. Toggle themes during scroll; background transitions without a black flash.
- Happy path: View the site on an iPhone SE in landscape (~375x667). Hero content fits without clipping.
- Happy path: Read `DESIGN.md` §3. `--font-quote` appears in the typography table as the fourth role.

**Verification:**
- Grep `css/styles.css` for `rgba\(0,\s*0,\s*0,\s*0\.95\)` — should be zero outside intentional signature use.
- Theme toggle while scrolled: no flash, no dark overlay persisting into light theme.
- Hero does not crop on landscape mobile.

- [ ] **Unit 9: Performance and anti-pattern polish**

**Goal:** Gate smooth scroll on motion preference, drop `backdrop-filter: blur` from `.carousel-btn`, remove the ring-shadow layer on carousel controls.

**Requirements:** R-PERF-04, R-PERF-05, R-ANTI-03

**Dependencies:** None

**Files:**
- Modify: `css/styles.css`

**Approach:**
- At `css/styles.css:196` (`html { scroll-behavior: smooth }`): wrap in `@media (prefers-reduced-motion: no-preference)` or move to the existing reduced-motion handler.
- At `css/styles.css:2268` (`.carousel-btn`): remove `backdrop-filter: blur(8px)`. Button keeps its gold-tinted background.
- Remove `box-shadow: 0 0 0 Npx rgba(...)` ring-shadow declarations at `css/styles.css:109, 115, 121, 2269, 2276, 2322`. Form input focus rings (at `css/styles.css:150, 2927`) stay; they are functional affordances, not decoration.
- Note on R-PERF-05: its origin accept-when (origin §5.2) reads "The button keeps its gold-tinted background and coral ring-shadow (ring shadow is dropped separately under R-ANTI-03)." That phrasing assumes sequential delivery. This unit co-locates R-PERF-05 and R-ANTI-03, so the ring-shadow drops alongside the backdrop-filter, not preserved.

**Patterns to follow:**
- Existing `prefers-reduced-motion` handlers at `css/styles.css:673, 906, 1464, 2553` as the gating pattern.

**Test scenarios:**
- Happy path: System preference set to "reduce motion". Click an anchor link. Page jumps, no smooth scroll.
- Happy path: System preference default. Click an anchor link. Smooth scroll still works.
- Happy path: Hover carousel prev/next and indicator dots. Background shifts, no ring layer around them.

**Verification:**
- DevTools accessibility pane confirms `prefers-reduced-motion` is respected.
- Visual pass on carousel: dot states and button hovers read cleaner without the coral rings.

- [ ] **Unit 10: Copy polish (newsletter, forms, kickers)**

**Goal:** Ship five P2 copy items in one pass: newsletter de-duplication, contact form label register, contact/calendly header-button alignment, and service kicker moment-specific rewrites. R-COPY-09 (theme-toggle title drop) now lands in Unit 7 as a sub-task of R-A11Y-05.

**Requirements:** R-COPY-05, R-COPY-06, R-COPY-07, R-COPY-08, R-COPY-11

**Dependencies:** Unit 7 (theme-toggle title removal already landed there — verify-only here)

**Files:**
- Modify: `index.html`

**Approach:**
- Newsletter de-dup (lines 638, 641):
  - Tagline → "Weekly, for credit union leaders."
  - Description (default) → "Curated agentic AI developments with a point of view."
  - Alternate description (Brent picks if he prefers more specificity): "What's moving in agentic AI, with a point of view and what to do Monday." Default ships unless Brent says otherwise.
- Contact form labels (lines 686, 692, 698, 704):
  - "Your Name *" → "Your name *"
  - "Email Address *" → "Your email *"
  - "Organization" → "Where you work"
  - "What's on your mind? *" stays.
- Contact form header + button (lines 673, 709):
  - Header stays "Send Me a Message"
  - Button "Send Message" → "Send it"
- Calendly header + button + intro (lines 715, 716, 717):
  - Header stays "Book a Call"
  - Button "Schedule a Call" → "Book a Call"
  - Intro "Prefer to schedule a time to talk? Pick a 30-minute slot." → "Prefer to pick a slot yourself? Grab 30 minutes."
- Service kickers (lines 335, 368, 400): Brent picks from origin §R-COPY-11 drafts or supplies alternates. Default if Brent defers: keep existing three kickers.
- Theme-toggle title: R-COPY-09 landed in Unit 7 (R-A11Y-05). Verify-only here.

**Execution note:** Run all drafts through the writing-quality checklist before commit. No em dashes. No "delve / leverage / utilize". No tricolon where two is enough.

**Patterns to follow:**
- Service 3 body copy specificity at `index.html:402` as the voice benchmark.
- `llms.txt` line 4 as an example of how Brent talks about the practice.

**Test scenarios:**
- Happy path: Read newsletter section. Tagline and description say different things.
- Happy path: Read contact form. Labels feel consistently warm.
- Happy path: Read calendly section. Header verb matches button verb.
- Test expectation: copy changes do not affect behavior or form submission. Web3Forms integration untouched.

**Verification:**
- Each copy item reads once. No redundancy between adjacent labels.
- Service kicker pass: Brent signs off on the chosen text.

- [ ] **Unit 11: Copy polish (footer, hero h1 option, alt comment)**

**Goal:** Final copy pass: footer tagline rethink, optional hero h1 flip, newsletter logo alt comment.

**Requirements:** R-COPY-12, R-COPY-13, R-COPY-14

**Dependencies:** None

**Files:**
- Modify: `index.html`

**Approach:**
- Footer (line 735): "Built with ❤️ for humans and agents." → "A site for humans and agents." Link on "agents" still routes to `/agents/`. Emoji removed.
- Hero h1 (lines 295-297): Brent decides whether to flip to first-person or keep noun-phrase. Default if Brent defers: keep current copy.
  - First-person option: "I facilitate strategy for credit union CEOs in the age of agentic AI." Moves the positioning claim to meta description if needed.
  - Implementation note if Brent chooses the flip: the h1 is three nested spans in `index.html:291-298` (two `<span class="hero-ghost">` copies carrying the screen-print misregistered offset, and one `<span class="hero-main">`). All three spans carry identical text. A flip updates all three to the new sentence. The `<span class="hero-underlined">` currently wraps "facilitation"; the flip needs a new target word. Default: wrap "facilitate" in the `<span class="hero-underlined">`. Alternate target: "strategy". Brent picks the underline target when confirming the flip.
  - Acceptance bar for the flip: ghost text still offsets cleanly, does not overflow the hero container, does not clip on mobile (ghost is `display: none` below 640px per `css/styles.css:1486-1488`), and does not alter the line height or margin of the visible h1.
- Newsletter logo alt (line 635): `alt=""` stays. Add an HTML comment above the `<img>` tag: `<!-- decorative: 'AI for FIs' text sits adjacent -->`.

**Patterns to follow:**
- Brent-voice rule 14 (pronouns shift I → we → you): if Brent flips the h1, first-person opens the page consistently with the subline below.

**Test scenarios:**
- Happy path: Read the footer. No emoji, no ambiguous "Built". Link to agents page still works.
- Happy path: If hero h1 flips, it agrees in voice with the subline. Meta description (`<meta name="description">` at index.html:37) still carries the positioning claim for search.

**Verification:**
- Footer tagline reads cleanly, does not break the restrained register.
- If h1 flipped, site-wide visual spot-check confirms type treatment and ghost offsets still work on the new sentence.

## System-Wide Impact

- **Interaction graph:** `js/main.js` progress-bar and label-toggle changes have no dependency on `js/service-visuals.js` or `js/framework-visuals.js`. p5.js sketches unaffected.
- **Error propagation:** Form `role="alert"` correction in Unit 2 assumes existing form success/error messaging paths are intact. No changes to Web3Forms integration.
- **State lifecycle risks:** Custom CSS property writes in Unit 3 (`--scroll-progress`, `--service-progress`) are write-only from JS; reading them back is not needed. No risk of partial-write inconsistencies.
- **API surface parity:** `llms.txt` content is an external contract for AI agents. Unit 6 updates that contract. Downstream consumers (ChatGPT search, Perplexity, Claude) will re-fetch on next crawl.
- **Integration coverage:** No cross-layer interaction coverage needed; this is a single-page static site with no backend layers.
- **Unchanged invariants:** Signature interactive moves (hero bloom, ghost text, custom cursor, logo marquee, p5.js sketches, square-cornered buttons) stay identical. DSL token system structure stays; the plan extends it, does not restructure it. DESIGN.md §2 auto-generated blocks stay; `scripts/sync-design-md.mjs` re-flows them on next run.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Unit 5 (token sweep) breaks a surface by misrouting an rgba literal to the wrong token | Visual diff pass in both themes after the sweep. If a surface regresses, revert the specific line and leave the literal inline with a `/* intentional — see token-sweep PR */` comment. |
| Unit 3 (progress bar transform migration) changes visual timing and Brent notices jank or stutter | Keep the 0.1s linear timing identical. Test with DevTools Performance panel before shipping. If the transform-based version feels different, fall back to `transform: translateX(-100%)` + width:100% parent pattern, which is also compositor-only. |
| Unit 6 (llms.txt update) goes live before the hero CTA hierarchy is confirmed stable | The requirements doc already resolved hero primary = "Book a call". Unit 6 just mirrors that. If Brent later flips to newsletter-primary, llms.txt flips in the same commit. |
| Unit 7 (touch target wrap on indicator dots) changes the clickable area but not the visual, confusing a user who expects the click zone to match the visual | Test on mobile. If users mis-tap, fall back to enlarging the visual dot to ~16x16 or 20x20 with reduced margin. |
| Brent deferred R-COPY-11 (kickers) and R-COPY-13 (hero h1) pending source | These are not blockers. Unit 10 and Unit 11 can ship with the existing copy if Brent has not supplied alternates by implementation time. |
| Unit 5 accidentally introduces an alpha token that conflicts with an existing `color-mix` elsewhere | Grep `color-mix` before the sweep; the codebase currently has none, so no conflict. |

## Phased Delivery

### Phase A — Quality Bar (Units 1-6)

Lands together or as a short burst of commits. Ships the meaningful quality bar: both BAN 1 violations gone, accessibility primary met, performance corrections live, font-loading docs aligned, token system consolidated, P1 copy shipped.

Directional audit target after Phase A: 15-16 / 20 (Good band). /impeccable is a heuristic review, not a test suite; a re-run can surface net-new findings in categories the prior audit did not exhaust. The target is a signal, not a contract.

### Phase A → Phase B Checkpoint

After Phase A lands, re-run /impeccable and /clarify. Decide whether Phase B is worth the attention cost. Evaluate in this order:

1. **Stop-and-reassess:** If the re-run surfaces three or more net-new P1 findings, stop. Something changed in the codebase or the rubric; investigate before shipping Phase B.
2. **Defer Phase B:** If Phase A lands in the Good band (15-16/20) AND the pain is gone (no BAN 1 violations, a11y primary met, copy clean enough for the audience), Phase B can defer indefinitely. The plan is complete for the stated outcome.
3. **Proceed with Phase B:** If neither of the above fires, proceed with Brent's judgment. Most common case when Phase B fixes are quick, attention allows, or the audit score lands in the middle band (12-14/20) where polish still meaningfully moves the dial.

The checkpoint is the go/no-go for Phase B, not a ceremonial milestone.

### Phase B — Polish (Units 7-11)

Lands when attention allows. Touch targets, label hygiene, theming polish, perf and anti-pattern cleanup, remaining copy. Each unit is independent within the phase; order by Brent's preference.

Directional audit target after Phase B: 18-19 / 20 (Excellent band). Same heuristic caveat as Phase A — the target is a signal, not a contract.

## Documentation / Operational Notes

- `DESIGN.md` updates land in Unit 4 (fonts) and Unit 8 (font-quote alias). No other docs need updates.
- `llms.txt` updates in Unit 6. No rollout required — file is static and re-fetched by agents on next crawl.
- No monitoring, feature flag, or migration concerns. Vercel auto-deploys from main.
- `PROJECT_STATUS.md` updates at the end of each phase (per Brent's global CLAUDE.md convention).

## Sources & References

- **Origin document:** [docs/brainstorms/2026-04-16-impeccable-audit-fixes-requirements.md](../brainstorms/2026-04-16-impeccable-audit-fixes-requirements.md)
- **Design system source:** [DESIGN.md](../../DESIGN.md)
- **Impeccable design context:** [.impeccable.md](../../.impeccable.md)
- **AI-agent contract:** [llms.txt](../../llms.txt)
- **Related prior plans:**
  - `docs/plans/2026-03-25-002-fix-review-findings-plan.md` (earlier review-finding pass)
  - `docs/plans/2026-04-13-001-refactor-color-palette-tightening-plan.md` (token work this plan extends)
