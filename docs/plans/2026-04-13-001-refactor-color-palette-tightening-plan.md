---
title: "refactor: Color Palette Tightening"
type: refactor
status: completed
date: 2026-04-13
origin: Color audit conducted in session (audit-checklist.md methodology)
---

# Color Palette Tightening

## Overview

The token layer in `css/dsl-tokens.css` is clean (12 hex values, two themes, semantic roles). But the implementation layer in `css/styles.css` bypasses tokens with 82+ hardcoded rgba values and 13 orphan hex values. The JS sketch layer adds 6 more hardcoded RGB triplets. This refactor consolidates all color usage back to the token system, fills gaps where tokens are missing, and ensures every color in the codebase traces to a named brand or semantic role.

## Problem Frame

Over many iterative design sessions, atmospheric and decorative colors (hero bloom gradients, section tints, belief hover states, service sketch fills) were tuned by eye using hardcoded rgba values. The result works visually but creates maintenance debt: changing a brand color requires hunting through 80+ values across three files. The token system governs text and basic UI, but decorative color (which covers most of the visual surface) operates outside it.

The site also lacks tokens for three color roles that are actively in use: magenta (beliefs section), functional colors (form validation), and interactive hover states (button hover). These need formal standing in the token system.

## Requirements Trace

- R1. Every color in styles.css and service-visuals.js must trace to a token in dsl-tokens.css (either directly via `var()` or as a documented rgba derivative of a token value)
- R2. Add tokens for magenta, functional (success/danger), and hover states
- R3. Hero bloom gradients must use brand token RGB values as their base colors
- R4. Light-mode section tints must be token-derived, not hardcoded hex
- R5. Belief hover backgrounds must use consistent brand-derived base colors
- R6. JS sketch color functions must use exact brand token RGB values
- R7. All existing contrast ratios must be preserved or improved (no accessibility regressions)
- R8. Visual appearance should remain as close as possible to current state (this is consolidation, not redesign)
- R9. Evaluate and decide on light-mode CTA warmth

## Scope Boundaries

- NOT changing the brand identity (gold, coral, teal remain the brand tricolor)
- NOT redesigning sections or layouts
- NOT adding dark mode remapping (dark mode tokens are already well-structured)
- NOT changing typography, spacing, or structural CSS
- CTA warmth (R9) is the only visual change that may be perceptible to users; all other changes are implementation-only

## Context & Research

### Relevant Code and Patterns

- `css/dsl-tokens.css` (lines 1-88): Two-tier token system. Universal brand colors (`--brand-gold`, `--brand-coral`, `--brand-teal`), then theme-specific semantic tokens (`--color-primary`, `--color-accent`, etc.)
- `css/styles.css`: All styling. Light-mode overrides use `[data-theme="light"]` selector. Section tints, bloom gradients, hover states, and shadows all use hardcoded values.
- `js/service-visuals.js` (lines 9-15): Three color functions (`gold()`, `coral()`, `teal()`) return hardcoded RGB arrays per theme via `isDarkMode()` check.
- Previous plan `docs/plans/2026-03-25-003-refactor-design-audit-plan.md` Unit 5 did a partial light-mode hex-to-token pass. This plan completes that work and extends it to atmospheric/decorative colors.

### Color Inventory (from audit)

| Category | Token values | Orphan rgba/hex values | Status |
|----------|-------------|----------------------|--------|
| Neutrals | 8 per theme | ~25 (shadows, borders) | Shadows are acceptable as rgba derivatives |
| Brand gold | 1 per theme | 15 | Needs consolidation |
| Brand coral | 1 per theme | 12 | Needs consolidation |
| Brand teal | 1 per theme | 8 | Needs consolidation |
| Magenta (beliefs) | 0 | 4 | Replace with coral-derived tint |
| Purple (bloom) | 0 | 2 | Drop (off-brand) |
| Cyan (bloom) | 0 | 4 | Should use brand teal |
| Functional | 0 | 4 | Needs tokens |
| Section tints (light) | 0 | 7 hex values | Needs tokens |

## Key Technical Decisions

- **Coral is the warm brand accent, not magenta.** Brent clarified that coral (`#CF5A5A`) is the brand color carrying the warm/emotive weight. The beliefs section background shifts from Deep Pink to a coral-derived tint. No `--brand-magenta` token needed. The brand tricolor remains gold, coral, teal.

- **Purple bloom layer: dropped.** The bloom becomes three layers (gold, coral, teal) instead of four. Three layers are cleaner, fully on-brand, and avoid orphan hues. Odd-numbered layers also avoid visual symmetry.

- **Section tints via semantic tokens (Approach C).** New tokens `--color-surface-gold`, `--color-surface-teal`, `--color-surface-coral` defined per theme. Components reference tokens. Most maintainable long-term. The current hardcoded hex values become the initial token values for light mode; dark mode uses rgba overlays on the bg.

- **JS sketch colors use universal brand values, not theme-specific semantic tokens.** The sketches render on transparent canvas with alpha-controlled brightness. They need the vivid brand colors (`--brand-gold: #FBE248`), not the darkened accessible-text variants (`--color-accent: #7D6400`). For light mode, reduce alpha in the draw calls rather than using the muted token values.

- **CTA: coral in light mode + enhanced hover (B+D combined).** Use coral (`#B84545`) as the light-mode primary button color. Teal stays as dark-mode primary. Coral creates visual tension against warm off-white and warm CTAs outperform cool ones in B2B. Enhanced hover state (darker coral, subtle scale, warm shadow) adds interaction responsiveness.

- **Shadow rgba values are acceptable.** Box-shadows and glows using `rgba(brand-rgb, opacity)` are standard CSS practice. They should use the correct brand RGB decomposition but do not need their own tokens.

## Open Questions

### Resolved During Planning

- **Should bloom colors match tokens exactly or stay "close enough"?** Resolved: use exact brand token RGB values. The current near-miss values (e.g., `rgba(230, 210, 20)` vs brand gold `rgb(251, 226, 72)`) create confusion about whether they are the same color. Exact match plus opacity adjustment preserves the atmospheric effect while establishing clear lineage.

- **Will swapping bloom base colors change the visual feel?** Resolved: yes, slightly. The biggest shift is cyan bloom (`rgba(0, 160, 200)` is vivid sky-blue; brand teal `rgb(67, 116, 129)` is muted). Compensate by increasing opacity on the teal bloom layer. The hero bloom was chosen for atmosphere, not precision; minor warmth shift is acceptable.

- **Which green/red for functional colors?** Resolved: use the existing values already in the codebase (`#22c55e` / `#ef4444` for dark, with darkened variants for light mode that pass contrast). Normalize to one green and one red, not two of each.

### Deferred to Implementation

- **Exact opacity adjustments for bloom layers after base color swap.** Will need visual tuning after applying the new base colors. Cannot be predetermined.
- **Whether light-mode section tint token values should exactly match current hardcoded hex or be simplified.** Compare side-by-side during implementation.
- **Exact coral CTA hover color and scale transform amount.** Needs visual tuning.

## Implementation Units

- [x] **Unit 1: Add missing tokens to dsl-tokens.css**

  **Goal:** Establish token coverage for every color role currently in use on the site.

  **Requirements:** R2

  **Dependencies:** None (this unblocks everything else)

  **Files:**
  - Modify: `css/dsl-tokens.css`

  **Approach:**

  Add to dark theme block:
  - `--color-success: #22c55e`
  - `--color-danger: #ef4444`
  - `--color-primary-hover: #3A7A87` (lighter teal for dark hover)
  - `--color-surface-gold: rgba(251, 226, 72, 0.04)`
  - `--color-surface-coral: rgba(207, 90, 90, 0.04)`
  - `--color-surface-teal: rgba(67, 116, 129, 0.04)`

  Add to light theme block:
  - `--color-success: #16a34a`
  - `--color-danger: #dc2626`
  - `--color-primary-hover: #1E4650`
  - `--color-surface-gold: #F6F4EC`
  - `--color-surface-coral: #F5EDEA`
  - `--color-surface-teal: #ECF3F6`

  **Patterns to follow:**
  - Existing token naming: `--color-{role}` for semantic, `--brand-{name}` for universal
  - Existing grouping: comments separating brand, semantic, shadows

  **Test expectation:** None. Pure token definition, no behavioral change until downstream units consume them.

  **Verification:** The token file compiles without errors. Both theme blocks have symmetric coverage for all new tokens.

---

- [x] **Unit 2: Unify hero bloom colors to brand tokens (3-layer)**

  **Goal:** Replace the 8 divergent bloom base colors (4 dark, 4 light) with exact brand token RGB values. Drop the purple layer entirely, reducing to 3 brand-aligned layers: gold, coral, teal.

  **Requirements:** R3, R1

  **Dependencies:** Unit 1 (tokens established)

  **Files:**
  - Modify: `css/styles.css` (hero bloom `::before` gradients, lines ~627-665)

  **Approach:**

  Dark mode `.hero::before` (reduce from 4 to 3 radial gradients):
  - Yellow: `rgba(230, 210, 20, 0.38)` becomes `rgba(251, 226, 72, 0.38)` (brand gold)
  - Rose/magenta: `rgba(210, 40, 90, 0.30)` becomes `rgba(207, 90, 90, 0.30)` (brand coral)
  - Cyan: `rgba(0, 160, 200, 0.35)` becomes `rgba(67, 116, 129, 0.45)` (brand teal, higher opacity to compensate for lower saturation)
  - Purple: `rgba(180, 30, 220, 0.20)` REMOVED

  Light mode `[data-theme="light"] .hero::before` (reduce from 4 to 3):
  - Yellow: `rgba(180, 155, 0, 0.3)` becomes `rgba(251, 226, 72, 0.22)` (brand gold at lower opacity for light bg)
  - Rose: `rgba(170, 50, 70, 0.22)` becomes `rgba(207, 90, 90, 0.22)` (brand coral)
  - Cyan: `rgba(20, 100, 130, 0.28)` becomes `rgba(67, 116, 129, 0.32)` (brand teal)
  - Purple: `rgba(100, 40, 140, 0.15)` REMOVED

  Also update `.grainy-bloom::before` (lines ~692-694) dark mode to use exact brand values, and `.grainy-bloom::before` light mode (lines ~1533-1535) to match.

  Also update service panel bloom backgrounds (lines ~1358-1366 dark, ~1697-1705 light) to use exact brand RGB values.

  **Patterns to follow:**
  - Keep the existing gradient geometry (ellipse sizes, positions, blur, saturate) for remaining 3 layers
  - Redistribute the removed purple layer's visual real estate by slightly enlarging the coral bloom ellipse
  - Opacity values are starting points; tune visually

  **Test expectation:** None. Visual-only change. Verified by visual inspection.

  **Verification:** Open site in both themes. Hero bloom should read as a cohesive gold-coral-teal palette. No orphan hues. The removal of the purple layer should feel cleaner, not emptier.

---

- [x] **Unit 3: Convert section tint backgrounds to tokens**

  **Goal:** Replace 7 hardcoded hex section backgrounds in light mode with token references. Replace dark-mode rgba section tints with token references.

  **Requirements:** R4, R1

  **Dependencies:** Unit 1 (surface tokens must exist)

  **Files:**
  - Modify: `css/styles.css` (testimonials, beliefs, how-i-work, newsletter, footer section backgrounds)

  **Approach:**

  Dark mode section backgrounds (already use rgba, just need token swap):
  - `.testimonials-section` background gradient: replace `rgba(230, 210, 20, 0.04/0.02)` with gradient using `var(--color-surface-gold)` as start color fading to transparent
  - `.beliefs-section` background: replace `rgba(255, 20, 147, 0.16/0.08)` with coral-derived tint using `var(--color-surface-coral)` at higher opacity (beliefs section gets a stronger tint to maintain its visual weight)
  - `.how-i-work` background: replace `rgba(0, 160, 200, 0.04/0.02)` with gradient using `var(--color-surface-teal)` values
  - Newsletter section dark mode: if it has an rgba tint, replace similarly

  Light mode section backgrounds (hardcoded hex to token swap):
  - `[data-theme="light"] .testimonials-section`: `#F6F4EC` / `#F3F1EA` becomes gradient from `var(--color-surface-gold)` to `var(--color-bg)`
  - `[data-theme="light"] .beliefs-section`: rgba magenta overlay becomes coral-derived tint on `var(--color-bg)` (use `rgba(207, 90, 90, 0.10)` to maintain warm emotive weight without the magenta hue)
  - `[data-theme="light"] .how-i-work`: `#ECF3F6` / `#F0F2EE` becomes gradient from `var(--color-surface-teal)` to `var(--color-bg)`
  - `[data-theme="light"] .newsletter-section`: `#F5EDEA` / `#EFEAE2` becomes gradient from `var(--color-surface-coral)` to `var(--color-bg)`
  - `[data-theme="light"] .site-footer`: `#EAF0F2` becomes `var(--color-surface-teal)`

  **Challenge:** The current light-mode tints use `linear-gradient(180deg, colorA, colorB)` with two slightly different hex values for a subtle vertical fade. A single token can't express a gradient. Options:
  - Use the token as the solid background (lose the subtle gradient). Simplest.
  - Define two tokens per section (`--color-surface-gold-start`, `--color-surface-gold-end`). Over-engineering.
  - Use the token for the start color and `var(--color-bg)` for the end. Preserves the fade effect with tokens.

  Recommend option 3: `linear-gradient(180deg, var(--color-surface-gold), var(--color-bg))`. This preserves the fade and uses only existing tokens.

  **Patterns to follow:**
  - Dark-mode testimonials section already uses this gradient-to-transparent pattern

  **Test expectation:** None. Visual-only change. Verified by visual inspection.

  **Verification:** Toggle themes. Section backgrounds should look identical to current state. Check that the gradient direction and subtlety are preserved.

---

- [x] **Unit 4: Fix belief hover colors**

  **Goal:** Replace 6 mismatched belief hover background colors with 3 consistent brand-derived values.

  **Requirements:** R5, R1

  **Dependencies:** Unit 1 (brand tokens established)

  **Files:**
  - Modify: `css/styles.css` (belief hover rules, lines ~1220-1226 dark mode, ~1437-1450 light mode)

  **Approach:**

  Current state: belief 1 uses rose/pink base colors that match neither gold nor coral. Belief 2 and 3 use near-correct values but different bases per theme.

  Replace all with brand-exact values. Each belief gets one of the three brand colors:

  Dark mode:
  - `[data-belief="1"]:hover`: `background: rgba(251, 226, 72, 0.04)` (brand gold)
  - `[data-belief="2"]:hover`: `background: rgba(207, 90, 90, 0.03)` (brand coral exact)
  - `[data-belief="3"]:hover`: `background: rgba(67, 116, 129, 0.04)` (brand teal exact)

  Light mode:
  - `[data-theme="light"] .belief-full:hover` (belief 1 default): `background: rgba(207, 90, 90, 0.06)` (brand coral, matching beliefs section coral theme)
  - `[data-theme="light"] [data-belief="2"]:hover`: `background: rgba(251, 226, 72, 0.06)` (brand gold)
  - `[data-theme="light"] [data-belief="3"]:hover`: `background: rgba(67, 116, 129, 0.05)` (brand teal, same base as dark)

  The border-top-color on hover already uses correct token references. No change needed there.

  **Patterns to follow:**
  - Existing pattern of lower opacity in dark mode (dark bg amplifies color presence)

  **Test expectation:** None. Visual-only hover state change. Verified by visual inspection.

  **Verification:** Hover each belief in both themes. Each should show a faint tint of its assigned brand color. The tint should feel consistent across all three beliefs.

---

- [x] **Unit 5: Sync JS sketch colors to brand values**

  **Goal:** Replace hardcoded RGB arrays in service-visuals.js with exact brand token RGB decompositions.

  **Requirements:** R6, R1

  **Dependencies:** Unit 1 (brand values established, though JS reads brand colors not semantic tokens)

  **Files:**
  - Modify: `js/service-visuals.js` (lines 13-15, the `gold()`, `coral()`, `teal()` functions)

  **Approach:**

  Use universal brand hex values as the base for both themes. For light mode, use slightly adjusted values that maintain visibility on white/off-white canvas backgrounds without going as dark as the accessible-text tokens.

  Updated functions:
  - `gold()`: dark `[251, 226, 72]` (from `#FBE248`), light `[201, 181, 10]` (50% between brand gold and light accent, maintaining visibility without the muddy olive of `#7D6400`)
  - `coral()`: dark `[207, 90, 90]` (from `#CF5A5A`), light `[184, 69, 69]` (from `#B84545`, the light coral token)
  - `teal()`: dark `[82, 144, 153]` (from `#529099`), light `[45, 90, 102]` (from `#2D5A66`, the light primary token)

  The light-mode gold is the only value that needs a custom midpoint. Pure brand gold (`251, 226, 72`) is too bright on off-white. The accessible text variant (`125, 100, 0`) is too dark for canvas fills. A midpoint keeps sketches vibrant without washing out.

  **Alternative considered:** Reading CSS custom properties from the DOM at runtime via `getComputedStyle`. This would auto-sync with tokens but adds a performance cost on init and a dependency on DOM readiness timing. The sketch init fires from `IntersectionObserver`, which runs after paint, so timing should be safe. However, the 6 values change rarely and the maintenance burden is low. Direct values are simpler.

  **Patterns to follow:**
  - Existing `isDarkMode()` check pattern
  - Existing function return format `[r, g, b]`

  **Test expectation:** None. Visual-only change. Verified by visual inspection.

  **Verification:** Scroll through services section in both themes. Sketch colors should feel like natural extensions of the brand palette. Gold dots should match the gold accents elsewhere on the page. Teal lines should match the teal used in buttons and links.

---

- [x] **Unit 6: Consolidate orphan rgba shadow and glow values**

  **Goal:** Ensure all shadow, glow, and border rgba values use the correct brand RGB decomposition (not near-misses).

  **Requirements:** R1

  **Dependencies:** Units 1-5 (all brand values finalized)

  **Files:**
  - Modify: `css/styles.css` (scattered shadow, glow, and border-color values)

  **Approach:**

  Audit every remaining rgba value in styles.css. For each, verify the RGB base matches the nearest brand token. Fix near-misses:

  Known fixes:
  - `rgba(184, 149, 0, ...)` used in carousel buttons and form hover states. This is a darkened gold (`#B89500`). Replace with `rgba(125, 100, 0, ...)` in light mode (matching `--color-accent: #7D6400` = rgb 125, 100, 0) or `rgba(251, 226, 72, ...)` in dark mode contexts.
  - `rgba(184, 69, 69, ...)` used in carousel button shadows and indicator dots. This matches `--color-accent-coral` in light mode (`#B84545` = rgb 184, 69, 69). Correct.
  - `rgba(45, 90, 102, ...)` used in contact `::before` and button shadows. This matches `--color-primary` in light mode (`#2D5A66` = rgb 45, 90, 102). Correct.
  - `rgba(58, 99, 112, ...)` used in contact section and input focus. This is `#3A6370` = `--color-accent-teal` in light mode. Correct.
  - `rgba(138, 110, 0, ...)` in phase card hover shadow. This is `#8A6E00`, which is close to but not the same as `--color-accent: #7D6400` (rgb 125, 100, 0). Replace with `rgba(125, 100, 0, 0.08)`.

  Also normalize form validation colors:
  - Success: replace `#4ade80` with `var(--color-success)`, replace `#34c759` (if present) with same
  - Danger: replace `#f87171` with `var(--color-danger)`, replace `#ef4444` (if present) with same

  Also replace `#1E4650` button hover with `var(--color-primary-hover)`.

  Also replace `#FFFFFF` in button color rules with `var(--color-bg)` or keep as `#FFFFFF` (white text on colored buttons is a legitimate hardcoded value since it's not theme-dependent).

  **Decision on white text:** Keep `#FFFFFF` for button text. White text on a colored button fill is a universal pattern, not a theme token. Replacing it with `var(--color-text)` would break because `--color-text` in light mode is dark (`#0A0A0A`).

  **Patterns to follow:**
  - Shadows and glows using rgba of brand colors at low opacity is standard. The goal is correct RGB bases, not eliminating rgba usage.

  **Test expectation:** None. Visual changes should be imperceptible (near-miss RGB corrections).

  **Verification:** Full page in both themes. No visible color changes (the fixes are sub-pixel corrections). Specifically check carousel buttons, phase card hovers, form validation states, and button hover states.

---

- [x] **Unit 7: Coral CTA in light mode + enhanced hover (B+D)**

  **Goal:** Change light-mode primary button to coral with an enhanced hover state. Dark mode keeps teal.

  **Requirements:** R9

  **Dependencies:** Units 1-6 (palette must be finalized)

  **Files:**
  - Modify: `css/dsl-tokens.css` (light mode `--color-primary` and `--color-primary-hover`)
  - Modify: `css/styles.css` (button hover/focus states)

  **Approach:**

  Token changes: added `--color-cta` and `--color-cta-hover` as new tokens in both themes.
  - Dark: `--color-cta: #529099` (teal, same as primary), `--color-cta-hover: #3A7A87`
  - Light: `--color-cta: #B84545` (coral), `--color-cta-hover: #9A3838` (darkened coral)

  Used a separate `--color-cta` token instead of changing `--color-primary` because `--color-primary` is referenced by 13+ non-button elements (service borders, coaching highlights, link hovers, belief borders). Changing it globally would break the teal role assignments.

  Style changes for light-mode buttons:
  - `.btn:hover` and `.btn-primary`: use `var(--color-cta)` / `var(--color-cta-hover)` instead of `var(--color-primary)`
  - Add subtle scale on hover: `transform: translateY(-1px) scale(1.02)`
  - Add warm shadow on hover: `box-shadow: 0 8px 24px rgba(184, 69, 69, 0.25/0.3)`
  - Existing `transition: all var(--transition-quick)` on `.btn` handles the transform animation

  Dark mode buttons unchanged (gold fill with teal hover, same as before).

  **Test scenarios:**
  - Contrast: `#B84545` with white text on `--color-bg` and `--color-surface` (must pass 4.5:1)
  - Color-blind check: coral CTA must remain distinguishable from body text and gold accents under deuteranopia and protanopia simulation
  - Hover state: visually distinct from default (color shift + scale + shadow all contribute)
  - Focus-visible: focus ring must remain visible on the coral button background
  - Theme toggle: switching themes mid-session shows teal buttons (dark) and coral buttons (light) correctly

  **Verification:** CTA buttons in light mode read as warm, inviting, and clearly distinct from the surrounding content. Hover state feels responsive. All contrast passes WCAG 2.2 AA.

## System-Wide Impact

- **Token consumers:** `dsl-tokens.css` is synced to `design.dxn.is` via jsDelivr CDN. Adding new tokens there will make them available downstream automatically, but `design.dxn.is` will not use them until its CSS references them. No breaking change.
- **Service visuals lifecycle:** The `gold()`, `coral()`, `teal()` functions are called every frame during scroll. Changing their return values has zero performance impact.
- **Light/dark toggle:** All changes must work correctly when the user toggles themes mid-session. Token-based values handle this automatically. The JS sketch colors require the `isDarkMode()` check to return correct values after toggle (it reads `data-theme` attribute, which is set synchronously on toggle).
- **Unchanged invariants:** Typography, spacing, layout, responsive breakpoints, scroll behavior, and all interactive JavaScript logic are untouched by this plan.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Bloom visual feel changes after base color swap | Opacity values in Unit 2 are starting points; tune visually. Revert to current values if the bloom looks worse. |
| Section tint gradients lose subtlety when tokenized | Use `linear-gradient(180deg, token, var(--color-bg))` to preserve the fade effect. Compare side-by-side. |
| Light-mode gold sketches become too dark with exact brand values | Unit 5 uses a custom midpoint for light-mode gold specifically to avoid this. |
| CTA change introduces visual regression | Unit 7 is gated on Brent's approval with visual comparison. No change ships without sign-off. |
| Near-miss shadow RGB corrections cause visible shifts | The corrections are typically 5-15 RGB units. At shadow opacities (0.05-0.25), this is sub-pixel. Verify but expect no visible change. |

## Sources & References

- **Origin:** Color audit conducted this session using `color-design` skill's `audit-checklist.md` methodology
- Design tokens: `css/dsl-tokens.css`
- Styles: `css/styles.css`
- Sketches: `js/service-visuals.js`
- Color design skill: `~/.claude/skills/color-design/`
- Previous related plan: `docs/plans/2026-03-25-003-refactor-design-audit-plan.md` (Unit 5: light mode token refactor, partially completed)
