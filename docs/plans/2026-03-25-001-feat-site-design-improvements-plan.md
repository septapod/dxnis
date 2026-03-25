---
title: "feat: DXN.IS Design Improvement Pass (Mobile-Ready + Polish)"
type: feat
status: completed
date: 2026-03-25
origin: docs/brainstorms/2026-03-25-site-design-improvements-requirements.md
---

# DXN.IS Design Improvement Pass

## Overview

Two-phase improvement to make dxn.is functional on mobile and fix accessibility, performance, and code quality issues. Phase 1 adds the missing mobile navigation and verifies existing responsive behavior. Phase 2 fixes accessibility violations, defers render-blocking scripts, removes dead code, and consolidates the design token system.

## Problem Frame

The site has no mobile navigation (Services, About, Contact links disappear below 768px) and carries accessibility violations, eagerly loaded third-party scripts, and ~300 lines of dead HTML/CSS. This work improves the current site without changing its visual identity or applying the pending brand redesign. (see origin: docs/brainstorms/2026-03-25-site-design-improvements-requirements.md)

## Requirements Trace

### Phase 1: Mobile-Ready
- R1. Add mobile navigation menu below 768px
- R2. Service cards stack to single-column on mobile
- R3. Photo hero stacks vertically on mobile
- R4. Testimonial carousel readable on mobile
- R5. Contact form and Calendly stack on mobile
- R6. Newsletter section stacks on mobile

### Phase 2: Professional Polish
- R7. Custom cursor restricted to mouse input only
- R8. Fix ARIA violations (role="list", missing h2, broken aria-labelledby)
- R9. Carousel keyboard nav without hover gate
- R10. Pause/play button on testimonial carousel
- R11. Progressive enhancement for scroll reveals
- R12. Defer p5.js loading
- R13. Lazy-load Calendly on click
- R14. Optimize testimonial images
- R15. Reduce logo marquee duplication
- R16. Optimize custom cursor animation loop
- R17. Remove commented-out HTML
- R18. Remove dead CSS
- R19. Consolidate design tokens
- R20. Remove unused font-mono and SearchAction schema
- R21. Move inline Calendly onclick to main.js
- R22. Remove or qualify AggregateRating schema

## Scope Boundaries

- NOT changing visual identity, colors, typography, or brand direction
- NOT applying sandbox AI copy changes
- NOT rewriting p5.js in raw Canvas
- NOT adding new sections or content
- NOT touching style tiles or brand exploration
- Phase 1 ships independently before Phase 2

## Context & Research

### Critical Finding: Existing Responsive Breakpoints

The site already has extensive responsive CSS at two breakpoints:

| Breakpoint | Grid | Behavior |
|---|---|---|
| 1024px (tablet) | 12 -> 8 columns | Photo hero stacks vertically, grid children respan |
| 768px (mobile) | 8 -> 4 columns | All grid children go full-width (1/5), nav CTA hidden, cursor hidden, newsletter stacks |

**R2-R6 are largely already satisfied.** The 768px breakpoint forces all grid children to `grid-column: 1 / 5` (full-width on 4-column grid). Service cards, contact/calendly, and testimonials all reflow. The photo hero stacks at 1024px via `flex-direction: column`.

**R1 (mobile nav) is the true gap.** Below 768px, `.nav-links` is `display: none` with no replacement. The theme toggle stays visible. The "Get Started" CTA hides.

### Relevant Code Paths

- **Grid container:** `css/styles.css` line 387 (`.grid-12`)
- **Tablet breakpoint:** `css/styles.css` line 2175 (`@media max-width: 1024px`)
- **Mobile breakpoint:** `css/styles.css` line 2366 (`@media max-width: 768px`)
- **Nav links show:** `css/styles.css` line 462 (`@media min-width: 768px`)
- **Touch cursor hide:** `css/styles.css` line 2532 (`@media hover: none, pointer: coarse`)
- **Custom cursor JS:** `js/main.js` lines 7-56
- **Carousel JS:** `js/main.js` lines 136-311
- **Theme toggle JS:** `js/main.js` lines 591-647
- **Hero particles:** `js/hero-particles.js` (already has reduced-motion and adaptive quality)

### Token System State

`dsl-tokens.css` is **never loaded** on the production page. It exists as a reference file. `styles.css` redeclares all tokens it needs in its own `:root` block. Consolidation means: import dsl-tokens.css, remove duplicate declarations from styles.css, and add styles.css-only tokens (grid, gutter, etc.) that dsl-tokens doesn't cover.

## Key Technical Decisions

- **Mobile nav pattern: full-screen overlay.** Fits the Swiss grid aesthetic (clean, mathematical, no busy slide-outs). Hamburger icon triggers a full-viewport overlay with centered nav links. Matches the zero-border-radius, minimal design language. Uses the same nav-links markup, toggled via JS class.
- **Phase 1 is mostly verification.** Since R2-R6 are already handled by existing breakpoints, Phase 1 is primarily: implement mobile nav (R1), then verify and fine-tune the existing responsive behavior in-browser.
- **p5.js defer won't flash.** The hero has CSS `::before` and `::after` pseudo-elements providing a styled background. Hero text loads immediately. The particle canvas initializes after DOM load regardless (it uses `DOMContentLoaded`). Adding `defer` to the script tag changes nothing functionally; p5.js was already waiting for DOMContentLoaded. The real win is unblocking the HTML parser.
- **Token consolidation approach:** Add `@import '../css/dsl-tokens.css'` at top of styles.css. Remove the ~37 duplicate variable declarations from styles.css `:root`. Keep styles.css-only variables (grid, gutter, max-width, baseline) in styles.css. Reconcile the 3-4 conflicting hex values (e.g., `--color-bg: #000000` vs `#09090B`).

## Open Questions

### Resolved During Planning

- **Mobile nav pattern?** Full-screen overlay with centered links. Clean, fits the aesthetic, minimal JS.
- **p5.js defer flash?** No visible flash. Background is already styled via CSS. Canvas was already deferred to DOMContentLoaded.
- **Token consolidation scope?** ~37 duplicate declarations to remove, 3-4 hex conflicts to reconcile, ~8 styles.css-only tokens to keep. Medium effort, well-bounded.

### Deferred to Implementation

- **Exact hamburger icon design:** Use a simple 3-line SVG matching the site's stroke style. Final sizing determined during implementation.
- **Testimonial image source availability:** Check if original high-res images exist for WebP conversion. If not, skip WebP and just add dimension attributes.
- **Which specific CSS rules are dead:** Implementation will grep for selectors matching commented-out sections (.value-card, .industry-card, .track-stat, .stat, .outcomes-section, etc.) and remove them.

## Implementation Units

### Phase 1: Mobile-Ready

- [ ] **Unit 1: Mobile Navigation**

  **Goal:** Add a hamburger menu that reveals Services, About, and Contact links below 768px.

  **Requirements:** R1

  **Dependencies:** None

  **Files:**
  - Modify: `index.html` (add hamburger button to nav, wrap nav-links for toggle)
  - Modify: `css/styles.css` (mobile nav overlay styles, hamburger icon, animation)
  - Modify: `js/main.js` (toggle open/close, close on link click, close on Escape, trap focus)

  **Approach:**
  - Add a `<button class="nav-toggle" aria-label="Menu" aria-expanded="false">` before `.nav-links` in the header
  - The button contains a simple 3-line SVG hamburger icon
  - Below 768px, `.nav-links` becomes a full-screen fixed overlay (`position: fixed; inset: 0`) with `display: none` by default
  - When toggled open: `display: flex; flex-direction: column; align-items: center; justify-content: center` on a dark/light background matching the theme
  - JS toggles an `.open` class, updates `aria-expanded`, and closes on Escape key or link click
  - Include the "Get Started" CTA and theme toggle in the mobile overlay
  - Use `var(--color-bg)` and `var(--color-text)` so the overlay inherits the active theme

  **Patterns to follow:**
  - Existing `.theme-toggle` button styling for the hamburger button size (40x40, border-radius: 50%)
  - Existing `var(--transition-quick)` for open/close animation
  - Existing `[data-theme="light"]` override pattern if any light-mode-specific tweaks are needed

  **Test scenarios:**
  - At 375px: hamburger visible, clicking opens overlay, all 3 nav links + CTA visible, clicking a link closes overlay and scrolls to section
  - At 768px+: hamburger hidden, nav-links display normally
  - Escape key closes the overlay
  - Theme toggle works inside the mobile overlay
  - Body scroll is locked when overlay is open (`overflow: hidden` on body)

  **Verification:**
  - On a 375px viewport: all nav destinations are reachable
  - On a 768px+ viewport: no visible change from current behavior
  - Keyboard: Tab cycles through overlay links, Escape closes

- [ ] **Unit 2: Verify and Fine-Tune Existing Responsive Behavior**

  **Goal:** Confirm R2-R6 are satisfied by existing breakpoints. Fix any spacing, padding, or overflow issues found during manual testing.

  **Requirements:** R2, R3, R4, R5, R6

  **Dependencies:** Unit 1

  **Files:**
  - Modify: `css/styles.css` (only if fixes are needed)

  **Approach:**
  - Open the site at 375px, 768px, and 1024px viewports
  - Check each section: hero, services, testimonials, photo hero, about, newsletter, contact, statement quote
  - Verify no horizontal scroll at any width
  - Fix any padding/margin issues that cause content to overflow or become unreadable
  - The existing 768px breakpoint already forces all grid children to `1 / 5` (full-width). Testimonials already switch to vertical layout. Newsletter already stacks. Photo hero stacks at 1024px.
  - Primary risk: testimonial slide padding (`96px` horizontal) may still be too large even at the 768px breakpoint. Check and reduce if needed.

  **Test scenarios:**
  - 375px: all content single-column, no horizontal scroll, text readable
  - 768px: transition point looks clean, no layout jump
  - 1024px: tablet layout with 8 columns renders correctly
  - Landscape on mobile (667px wide): no breakage

  **Verification:**
  - No horizontal scrollbar at any viewport width from 320px to 1440px
  - All text is readable (no truncation, no overlap) at 375px

### Phase 2: Professional Polish

- [ ] **Unit 3: Remove Dead HTML and CSS**

  **Goal:** Remove all commented-out HTML sections and their corresponding dead CSS rules.

  **Requirements:** R17, R18, R20

  **Dependencies:** None (can begin immediately in Phase 2)

  **Files:**
  - Modify: `index.html` (remove ~100 lines of commented-out sections)
  - Modify: `css/styles.css` (remove CSS for .value-card, .industry-card, .track-stat, .stat, .outcomes-section, etc.)
  - Modify: `index.html` (remove SearchAction schema block, remove or qualify AggregateRating schema)

  **Approach:**
  - Remove the 4 commented-out HTML blocks: What to Expect (lines ~330-362), Industries (lines ~364-387), Track Record (lines ~390-428), Stats (lines ~546-561)
  - Grep styles.css for selectors targeting removed classes and delete those rule blocks
  - Remove `--font-mono` declaration from dsl-tokens.css
  - Remove the SearchAction JSON-LD block from index.html
  - Remove the AggregateRating from the ProfessionalService schema (no third-party source backs it)

  **Test scenarios:**
  - Site renders identically after removal (no visible change)
  - No console errors
  - HTML validates without the removed sections

  **Verification:**
  - `grep -c "value-card\|industry-card\|track-stat\|outcomes" css/styles.css` returns 0
  - Zero commented-out `<section>` blocks in index.html
  - No SearchAction or AggregateRating in JSON-LD

- [ ] **Unit 4: Accessibility Fixes**

  **Goal:** Fix ARIA violations, carousel keyboard nav, progressive enhancement, and add carousel pause button.

  **Requirements:** R8, R9, R10, R11

  **Dependencies:** None

  **Files:**
  - Modify: `index.html` (add role="list" wrapper, add visually-hidden h2 for testimonials, fix aria-labelledby)
  - Modify: `css/styles.css` (add .visually-hidden class if not present, pause button styles, progressive enhancement default)
  - Modify: `js/main.js` (remove :hover gate on carousel keyboard nav, add pause/play toggle, add .js-loaded class to body)

  **Approach:**
  - Wrap the three `.service-card` articles in a `<div role="list">` or change the parent grid-12 to carry `role="list"`
  - Add `<h2 id="social-proof-heading" class="visually-hidden">Testimonials</h2>` to the social proof section
  - Fix the `aria-labelledby="social-proof-heading"` reference to match the new h2's id
  - In carousel keyboard handler: remove `if (!carousel.matches(':hover')) return;` and replace with focus-based detection (check if carousel or its children have focus)
  - Add a pause/play `<button>` next to the carousel indicators. Toggle `aria-label` between "Pause" and "Play". When paused, stop `autoRotateInterval`.
  - For progressive enhancement: change `.section` default to `opacity: 1; transform: none`. Add `body.js-loaded .section { opacity: 0; transform: translateY(30px); }`. Add `document.body.classList.add('js-loaded')` at the top of main.js.

  **Patterns to follow:**
  - Existing `.visually-hidden` / `.skip-nav` pattern for screen-reader-only content
  - Existing carousel button styling (`.carousel-btn`) for the pause button
  - Existing `aria-label` patterns on carousel navigation buttons

  **Test scenarios:**
  - axe-core reports no ARIA violations on the page
  - With JS disabled: all sections are visible (not hidden at opacity: 0)
  - Tab to carousel area, press arrow keys: slides change without needing mouse hover
  - Pause button stops auto-rotation; play button resumes it
  - Screen reader announces "Testimonials" section heading

  **Verification:**
  - `document.querySelectorAll('[role="listitem"]')` all have a parent with `role="list"`
  - Carousel responds to keyboard without mouse interaction
  - Disabling JS in browser shows all content visible

- [ ] **Unit 5: Custom Cursor Optimization**

  **Goal:** Restrict cursor to mouse-only and optimize the animation loop.

  **Requirements:** R7, R16

  **Dependencies:** None

  **Files:**
  - Modify: `js/main.js` (cursor initialization, animation loop, touch detection)

  **Approach:**
  - Wrap cursor initialization in a check: only activate if `window.matchMedia('(hover: hover) and (pointer: fine)').matches`
  - Replace the always-running `requestAnimationFrame` loop with a motion-triggered approach: on `mousemove`, set a flag and start the loop. When the follower is within 0.5px of the cursor position, stop the loop.
  - The existing CSS media queries (`hover: none`, `pointer: coarse`, and `max-width: 768px`) already hide the cursor elements. The JS optimization prevents the animation from running even when hidden.
  - Remove `document.body.style.cursor = 'none'` and the per-element cursor overrides. Instead, set `cursor: none` via CSS only within the media query that shows the custom cursor (desktop with fine pointer).

  **Test scenarios:**
  - On touch device: no custom cursor elements created, no animation loop running, native cursor visible
  - On desktop: custom cursor works as before
  - When mouse stops moving: animation loop stops within ~200ms
  - When mouse moves again: animation loop restarts smoothly

  **Verification:**
  - On a touch device or below 768px: `document.querySelector('.custom-cursor')` behavior unchanged but no JS animation running
  - `requestAnimationFrame` callback is not firing when mouse is stationary (verify via Performance panel)

- [ ] **Unit 6: Performance Optimizations**

  **Goal:** Defer p5.js, lazy-load Calendly, optimize images, reduce logo duplication.

  **Requirements:** R12, R13, R14, R15, R21, R22

  **Dependencies:** Unit 3 (dead code removal should happen first to reduce file size before optimization)

  **Files:**
  - Modify: `index.html` (defer p5.js, remove Calendly eager load, add image dimensions, remove AggregateRating if not done in Unit 3)
  - Modify: `js/main.js` (add Calendly lazy-loader, move inline onclick handler)
  - Modify: `css/styles.css` (add aspect-ratio or explicit dimensions for testimonial images as fallback)

  **Approach:**
  - Add `defer` to the p5.js `<script>` tag. The hero-particles.js already uses `DOMContentLoaded`, so this is safe.
  - Remove the Calendly `<link>` and `<script>` tags from the HTML. In main.js, add a click handler on `.btn-calendly` that: (1) dynamically creates and appends the Calendly CSS link, (2) dynamically loads the Calendly JS, (3) on load, calls `Calendly.initPopupWidget()`. This replaces the inline `onclick` (R21).
  - Add `width="150" height="150"` to all testimonial `<img>` tags to prevent layout shift.
  - Check if source images exist for WebP conversion. If yes, convert and add `<picture>` with WebP + fallback. If not, skip WebP.
  - In logo marquee JS: change triplication (`[...logos, ...logos, ...logos]`) to duplication (`[...logos, ...logos]`). The infinite scroll animation still works with 2 copies. Add `loading="lazy"` to the second set of logo images (images beyond index `distributedLogos.length`).

  **Test scenarios:**
  - p5.js no longer appears in the "render-blocking resources" section of Lighthouse
  - Clicking "Schedule a Call" loads Calendly and opens the popup (first click may have a brief delay)
  - Testimonial images have no layout shift (CLS = 0 for that section)
  - Logo marquee still scrolls seamlessly with 2x duplication

  **Verification:**
  - Lighthouse Performance score improves (especially FCP and LCP)
  - Network tab shows Calendly resources only load after button click
  - No layout shift visible when testimonial images load

- [ ] **Unit 7: Design Token Consolidation**

  **Goal:** Make dsl-tokens.css the single source of truth for design tokens.

  **Requirements:** R19

  **Dependencies:** Unit 3 (dead CSS removal reduces the number of rules to update)

  **Files:**
  - Modify: `index.html` (add `<link>` for dsl-tokens.css before styles.css)
  - Modify: `css/dsl-tokens.css` (add missing tokens that only styles.css currently defines)
  - Modify: `css/styles.css` (remove duplicate `:root` declarations, keep styles.css-only variables)

  **Approach:**
  - Add `<link rel="stylesheet" href="css/dsl-tokens.css">` before the styles.css link in index.html
  - Reconcile conflicting values. Recommend adopting dsl-tokens values (e.g., `--color-bg: #09090B` instead of `#000000`) since they were designed as the canonical brand system
  - Add to dsl-tokens.css: `--color-accent-coral` (maps from `--brand-coral`), `--color-accent-teal` (maps from `--brand-teal`), `--space-16: 128px`, `--transition-quick` (maps from `--transition-base`)
  - Add grid-only tokens to styles.css that don't belong in brand tokens: `--grid-columns`, `--grid-gap`, `--site-gutter`, `--max-width`, `--baseline`, `--font-accent` (alias for `--font-serif`)
  - Remove the ~37 duplicate declarations from styles.css `:root` and `[data-theme="light"]`
  - Remove `--font-mono` from dsl-tokens.css (unused)

  **Patterns to follow:**
  - dsl-tokens.css naming conventions (`--color-*`, `--space-*`, `--radius-*`)
  - Existing `[data-theme="light"]` / `[data-theme="dark"]` selector pattern

  **Test scenarios:**
  - Site renders identically in both dark and light modes after consolidation
  - No undefined CSS variable warnings in browser console
  - All color, spacing, and typography tokens resolve correctly

  **Verification:**
  - `grep -c "^  --color-\|^  --space-\|^  --font-\|^  --transition-" css/styles.css` shows significant reduction from baseline count
  - Visual diff (screenshot comparison) before and after shows no change

## System-Wide Impact

- **Interaction graph:** Mobile nav toggle adds a new global keyboard listener (Escape). Carousel keyboard handler change removes a constraint but doesn't add new interactions. Calendly lazy-load changes the onclick flow.
- **Error propagation:** If Calendly CDN is slow/down, the lazy-load approach should show a loading state or fall back gracefully. Add a timeout.
- **State lifecycle risks:** Mobile nav open state needs to be cleared on resize above 768px (user might open nav on mobile, then rotate to landscape). Add a resize listener.
- **API surface parity:** No API changes. The serverless function at `/api/latest-post` is untouched.
- **Integration coverage:** Test theme toggle inside mobile nav overlay. Test carousel pause/play with auto-rotation. Test Calendly lazy-load on slow network.

## Risks & Dependencies

- **Risk: Token consolidation visual regression.** Hex value differences between the two systems (e.g., `#000000` vs `#09090B` for background) could cause subtle color shifts. Mitigate with before/after screenshot comparison.
- **Risk: Calendly lazy-load delay on first click.** The widget JS + CSS must load before the popup opens. Mitigate by preloading Calendly on hover/focus of the button (speculative preload), or showing a brief loading indicator.
- **Dependency: Testimonial source images.** WebP conversion depends on high-res originals being available. If not available, skip WebP and just add dimension attributes.

## Sources & References

- **Origin document:** [docs/brainstorms/2026-03-25-site-design-improvements-requirements.md](docs/brainstorms/2026-03-25-site-design-improvements-requirements.md)
- **Design audit:** Published to Proof at `proofeditor.ai/d/gdlo625i`
- Related code: `css/styles.css` (responsive breakpoints at lines 2175 and 2366)
- Related code: `js/main.js` (carousel, cursor, theme toggle)
- Related code: `css/dsl-tokens.css` (canonical token reference, currently unloaded)
