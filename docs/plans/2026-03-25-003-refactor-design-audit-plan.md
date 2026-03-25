---
title: "refactor: DXN.IS Design Audit Implementation"
type: refactor
status: completed
date: 2026-03-25
origin: Design audit published to Proof (proofeditor.ai/d/gbvscutr)
---

# DXN.IS Design Audit Implementation

## Overview

Implement all findings from the visual design audit across three phases. Each phase ships independently and is verified visually before the next begins.

## Requirements Trace

### Phase 1: Critical
- D1. Fix testimonial section dead zone (reduce padding, add visible heading)
- D2. Differentiate service cards (colored top borders, visible resting state)
- D3. Fix hero subline readability (larger size, switch to body font)
- D4. Cap about section line length (restore max-width: 70ch)
- D5. Fix no-JS nav flash (move js-loaded class to inline head script)

### Phase 2: Refinement
- D6. Reduce statement quote padding (space-16 to space-12)
- D7. Increase client logo opacity (0.6 to 0.75)
- D8. Fix newsletter section visual language (width, radius, alignment)
- D9. Fix clients section background color (hardcoded #000 to token)
- D10. Simplify button gradients (single-color per state)
- D11. Increase nav link font-size (0.95rem to 1rem)

### Phase 3: Polish
- D12. Refactor light-mode hardcoded hex to token variables
- D13. Simplify testimonial headshot shadows
- D14. Simplify light-mode card hover shadows
- D15. Tighten carousel indicator dot spacing
- D16. Simplify footer gradient accent
- D17. Normalize contact submit button styling

## Scope Boundaries

- NOT changing content, copy, or page structure
- NOT changing the brand identity or color palette
- NOT adding new sections or features
- Each phase ships and is verified visually before the next begins
- Iterative: screenshot after each phase, compare, adjust

## Implementation Units

### Phase 1: Critical

- [ ] **Unit 1: Testimonial section density + service card differentiation**

  **Goal:** Fix the two biggest visual hierarchy problems at once (they're adjacent sections).

  **Requirements:** D1, D2

  **Files:**
  - Modify: `index.html` (add visible h2 for testimonials section, replacing visually-hidden)
  - Modify: `css/styles.css` (testimonial section padding, service card top borders)

  **Approach:**
  - Replace the `visually-hidden` class on the testimonials h2 with a visible styled heading (small, uppercase, muted, centered, matching the services heading treatment)
  - Reduce testimonial carousel top padding from space-4 to space-2
  - Add a permanent 3px top-border to each service card using the brand tricolor: `.service-card-1` gets gold, `.service-card-2` gets coral, `.service-card-3` gets teal
  - Show the `::before` animated accent at 30% opacity by default (currently 0 height, revealed on hover). On touch devices this ensures the accent is always visible.

  **Verification:** Screenshot services + testimonials. Cards should be visually distinct at a glance. Testimonial section should not read as empty space.

- [ ] **Unit 2: Hero subline + about line length + nav flash**

  **Goal:** Fix the three remaining Phase 1 readability/UX issues.

  **Requirements:** D3, D4, D5

  **Files:**
  - Modify: `index.html` (move js-loaded inline, change hero-subline class if needed)
  - Modify: `css/styles.css` (subline size, about max-width, subline font-family)

  **Approach:**
  - Hero subline: change `clamp(0.8rem, 1vw, 0.9rem)` to `clamp(0.95rem, 1.5vw, 1.1rem)`. Change `font-family` from `var(--font-accent)` (Lora) to `var(--font-body)` (Karla). Remove `font-style: italic`. Keep the slightly lighter color to maintain the "secondary voice" hierarchy without relying on tiny italic serif.
  - About: change `.about-content p { max-width: none }` to `max-width: 70ch`
  - Nav flash: add `<script>document.body.classList.add('js-loaded')</script>` as an inline script in the `<head>` after the CSS links. Remove `document.body.classList.add('js-loaded')` from main.js.

  **Verification:** Screenshot hero section. Subline should be clearly readable. About paragraphs should not stretch beyond ~70 characters. On mobile, nav links should not flash on load.

- [ ] **Phase 1 visual check: Screenshot all viewports, compare to pre-change baseline**

### Phase 2: Refinement

- [ ] **Unit 3: Spacing + opacity + newsletter consistency**

  **Goal:** Fix the spacing imbalances and newsletter section visual language.

  **Requirements:** D6, D7, D8, D9

  **Files:**
  - Modify: `css/styles.css` (quote padding, logo opacity, newsletter styles, clients bg)

  **Approach:**
  - Statement quote: change `padding: var(--space-16)` to `var(--space-12)`
  - Logo opacity: change `.logo-item img { opacity: 0.6 }` to `0.75`
  - Newsletter container: change `max-width: 900px` to `1100px`. Change `text-align: right` to `center`. Change `align-items: flex-end` to `center` on `.newsletter-info` and `.newsletter-action`. Remove `flex-direction: row-reverse` on `.newsletter-brand`.
  - Newsletter inputs: change `border-radius: 4px` to `0` on both the email input and subscribe button
  - Clients section: change `background: #000000` to `var(--color-bg)`. Change `[data-theme="light"] .clients-section { background: #FFFFFF }` to `background: var(--color-surface)`

  **Verification:** Screenshot full page. Quote section should feel proportional. Logos should be visible without hovering. Newsletter should feel like part of the same site.

- [ ] **Unit 4: Button simplification + nav sizing**

  **Goal:** Create a consistent button color story and strengthen the nav.

  **Requirements:** D10, D11

  **Files:**
  - Modify: `css/styles.css` (button gradients, nav font-size)

  **Approach:**
  - `.btn-primary`: change from `linear-gradient(135deg, gold, coral)` to solid `var(--color-accent)`. Hover: solid `var(--color-accent-teal)`.
  - `.btn:hover` (ghost button): fill with solid `var(--color-accent)` instead of gradient. Remove the multi-shadow hover effect.
  - Light mode button overrides: follow the same single-color pattern
  - Nav links: change `font-size: 0.95rem` to `1rem`, add `letter-spacing: 0.03em`

  **Verification:** Hover over buttons in both themes. Each button should have one clear color, not a gradient.

- [ ] **Phase 2 visual check: Screenshot all viewports, compare to Phase 1 state**

### Phase 3: Polish

- [ ] **Unit 5: Light mode token refactor**

  **Goal:** Replace hardcoded hex values with token references throughout light mode overrides.

  **Requirements:** D12

  **Files:**
  - Modify: `css/styles.css` (all `[data-theme="light"]` blocks)

  **Approach:**
  - Audit every `[data-theme="light"]` rule. Replace hardcoded hex with the equivalent `var()` token where one exists.
  - Key replacements: `#B89500` to `var(--color-accent)`, `#B84545` to `var(--color-accent-coral)`, `#3A6370` to `var(--color-accent-teal)`, `#0A0A0A` to `var(--color-text)`, `#FFFFFF` to `var(--color-surface)`, `#5A5A5A` to `var(--color-muted)`
  - Keep hardcoded rgba() values where no token equivalent exists (shadow tints, gradients with opacity)

  **Verification:** Toggle theme back and forth. Light mode should render identically (no visual change, just cleaner code).

- [ ] **Unit 6: Visual simplification pass**

  **Goal:** Reduce ornamental complexity across testimonials, indicators, footer, and contact.

  **Requirements:** D13, D14, D15, D16, D17

  **Files:**
  - Modify: `css/styles.css` (testimonial shadows, indicator gap, footer gradient, submit button)

  **Approach:**
  - Testimonial image: simplify box-shadow from 3-layer to single `0 8px 24px rgba(0,0,0,0.3)`. Keep the gold border.
  - Light mode testimonial: same simplification
  - Light mode card hover: change from three tinted shadows to single `var(--shadow-md)` or equivalent
  - Carousel indicators: change gap from `var(--space-2)` to `var(--space-1)`
  - Footer `::before` gradient: change from tricolor (teal + gold + coral) to single `linear-gradient(90deg, transparent 0%, var(--color-accent-teal) 50%, transparent 100%)`
  - Contact `.btn-submit`: remove `width: 100%`. Match standard `.btn-primary` sizing.

  **Verification:** Screenshot testimonials, footer, contact. Everything should feel quieter and more unified.

- [ ] **Phase 3 visual check: Final full-page screenshots at all viewports in both themes**

## Risks

- **Service card border colors may clash with card hover effects.** The animated `::before` accent already uses a gold-to-coral gradient. Adding a permanent colored top border means two accent elements per card. May need to remove the animated `::before` in favor of the static border.
- **Newsletter realignment changes the section's visual rhythm.** Center-aligning a section that was right-aligned will need careful spacing review.
- **Button simplification affects every CTA on the page.** Test all button instances (hero, about, nav, contact, newsletter, calendly) after the change.

## Sources & References

- Design audit: [Proof doc](https://www.proofeditor.ai/d/gbvscutr?token=3e0aa8f4-9e69-4218-ade7-cc36f2e4822b)
- Screenshots: /tmp/dxnis-audit/ (desktop-dark-full.png, desktop-light-full.png, mobile-dark-full.png, mobile-light-full.png, plus section crops)
- Design system: css/dsl-tokens.css, DESIGN.md
