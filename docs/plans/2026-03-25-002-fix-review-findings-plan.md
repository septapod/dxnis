---
title: "fix: Resolve P1 and P2 review findings from site improvement pass"
type: fix
status: completed
date: 2026-03-25
origin: Code review of commits 4723d0b..5538f7c
---

# Fix Review Findings

## Overview

The code review of the site improvement pass found 5 P1 bugs (live on production now) and 5 P2 issues. This plan fixes all 10.

## Problem Frame

The site improvement pass introduced several regressions: carousel pause is bypassed by mouseleave, the Satoshi display font is not loaded while unused Montserrat still is, two CSS custom properties reference undefined tokens, and the Calendly lazy-loader has incomplete error recovery. Additionally, orphaned CSS selectors from the dead code removal were missed.

## Requirements Trace

- F1. Carousel pause button must actually prevent auto-rotation in all scenarios (hover in/out, visibility change, keyboard nav)
- F2. Satoshi font must load for display headings; Montserrat must be removed from Google Fonts
- F3. All CSS custom property references must resolve to defined tokens
- F4. Calendly lazy-loader must recover gracefully from script load failure
- F5. No orphaned CSS selectors targeting HTML elements that don't exist
- F6. Mobile nav links should be accessible even without JS (CSS-only fallback)

## Scope Boundaries

- NOT changing visual design or adding features
- NOT addressing P3 items (unused tokens, monkey-patch pattern, marquee edge cases)
- Fix and ship in one commit batch

## Implementation Units

- [ ] **Unit 1: Fix carousel pause bypass and Calendly error recovery (JS)**

  **Goal:** Fix the two JS logic bugs.

  **Requirements:** F1, F4

  **Files:**
  - Modify: `js/main.js`

  **Approach:**
  - Carousel: Change `mouseleave` listener from passing `startAutoRotate` directly to wrapping in an arrow function: `() => startAutoRotate()`. This ensures the reassigned version (which checks `isPaused`) is called. Do the same for `mouseenter`/`stopAutoRotate` for consistency.
  - Calendly: In the `onerror` handler, reset `calendlyBtn.textContent` back to "Schedule a Call". Guard the click handler so it returns early with no action while `calendlyLoading` is true (prevent duplicate script injection). Set a flag after error so subsequent clicks go straight to the fallback URL instead of retrying the broken script.

  **Verification:**
  - Pause carousel, hover out: rotation stays paused
  - Block Calendly CDN, click button: fallback URL opens, button text resets, second click opens fallback directly

- [ ] **Unit 2: Fix font loading (HTML)**

  **Goal:** Load Satoshi, remove unused Montserrat.

  **Requirements:** F2

  **Files:**
  - Modify: `index.html`

  **Approach:**
  - Add `<link rel="stylesheet" href="fonts/dsl-fonts.css">` before the dsl-tokens.css link (font-face declarations should load before tokens reference them)
  - Remove `Montserrat:wght@400;500;600;700;800;900` from the Google Fonts URL (keep Lora and Karla)

  **Verification:**
  - Inspect any h1/h2 in DevTools: computed font-family shows Satoshi, not system-ui
  - Network tab: no Montserrat font files requested

- [ ] **Unit 3: Fix undefined CSS tokens (CSS)**

  **Goal:** Replace references to nonexistent CSS variables.

  **Requirements:** F3

  **Files:**
  - Modify: `css/styles.css`

  **Approach:**
  - `.btn-newsletter`: Replace `var(--space-5)` with `var(--space-6)` (48px, matches the visual intent of generous button padding)
  - `.photo-hero-content p`: Replace `var(--color-text-secondary)` with `var(--color-text-dim)` (the closest semantic match in the token system)

  **Verification:**
  - Newsletter subscribe button has visible horizontal padding
  - Photo hero intro text is visible in both themes

- [ ] **Unit 4: Remove orphaned CSS and fix duplicates (CSS)**

  **Goal:** Clean up remaining dead selectors missed in the first pass.

  **Requirements:** F5

  **Files:**
  - Modify: `css/styles.css`

  **Approach:**
  - Remove `.social-proof-header` and `.social-proof-header::after` rules (no matching HTML)
  - Remove `.services-intro` rule (no matching HTML)
  - Remove `.about-aside` rules across all locations (base, light-mode, tablet, mobile) (no matching HTML)
  - Remove `.clients-section h2` and `.clients-section h2::after` rules (no h2 in clients section)
  - Remove `.newsletter-form iframe` rule (no iframe in newsletter form)
  - Remove first duplicate `[data-theme="light"] .service-card::before` (overridden by identical selector later)
  - Remove duplicate `font-style: italic` on `.testimonial p`

  **Verification:**
  - `grep -c "social-proof-header\|services-intro\|about-aside\|clients-section h2\|newsletter-form iframe" css/styles.css` returns 0
  - Site renders identically

- [ ] **Unit 5: Add no-JS mobile nav fallback (CSS + HTML)**

  **Goal:** Make nav links accessible on mobile even without JS.

  **Requirements:** F6

  **Files:**
  - Modify: `css/styles.css`

  **Approach:**
  - Use the same progressive enhancement pattern as sections: show nav links by default on mobile, hide them only when JS is loaded. Specifically: in the `@media (max-width: 767px)` block, change `.nav-links { display: none; ... }` to show nav links by default in a simple vertical layout. Then scope the hiding to `body.js-loaded .nav-links { display: none; }` so the hamburger toggle takes over only when JS is available.
  - When JS is absent, nav links display as a simple stacked list below the header. Not beautiful, but functional.

  **Verification:**
  - Disable JS, load site at 375px: nav links (Services, About, Contact) are visible and clickable
  - Enable JS, load site at 375px: hamburger menu works as before, no visible change

## Sources & References

- Code review findings from this conversation (3 reviewer agents: correctness, maintainability, testing)
- Related code: `js/main.js` (carousel IIFE lines 186-405, Calendly loader lines 670-710)
- Related code: `css/styles.css` (orphaned selectors identified by maintainability reviewer)
- Related code: `index.html` (font loading at line 224)
