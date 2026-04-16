---
name: DSL Design System
version: 3.0
project: Dixon Strategic Labs (dxn.is)
format: Stitch DESIGN.md (9 sections)
status: Updated 2026-04-14. Reflects color palette tightening, framework section, typography change, CTA warmth, and section restructuring.
---

# DSL Design System

The design source of truth for Dixon Strategic Labs and dxn.is. Any coding agent working on this project should read this file before generating UI. Tokens, patterns, and philosophy live here. When the site evolves, this doc evolves with it.

This is v3.0. Major updates from v2.0: typography changed to Plus Jakarta Sans / Inter / Fraunces, color palette tightened (82 orphan rgba values consolidated to tokens), CTA buttons use coral in light mode, "How I Work" replaced with "What I look for" framework section with p5.js scroll-driven sketches, beliefs section commented out pending content.

---

## 1. Visual Theme & Atmosphere

**Design philosophy: Swiss Grid, updated.** The current site is explicitly built on Josef Müller-Brockmann's principle that a designer's work should have "the clearly intelligible, objective, functional, and aesthetic quality of mathematical thinking." The HTML comments in `index.html` name this outright. Every element sits on a grid. White space is designed, not leftover. Asymmetry only happens through varied column spans inside grid constraints, never through free-floating placement. Scale creates hierarchy.

**Mood.** Intellectually serious, grounded, quietly confident. Dark by default with a light theme toggle. The dark surface signals depth and focus. Warm accent colors (gold, coral, teal) prevent it from reading as corporate or cold. The overall atmosphere is "a consultant who thinks carefully and respects your time," not "an agency that wants to dazzle you."

**Density.** Medium. Paragraph max-width is capped at 70 characters for readability. Sections breathe with generous vertical spacing (up to 128px between major sections). The grid is dense enough to feel precise, not so dense that it feels cramped.

**Interactive flourishes.** Five signature moves:
1. A grainy gradient bloom in the hero (CSS radial gradients with SVG noise overlay, mouse-reactive positions). Gold, coral, teal layers on dark; warm washes on light.
2. Three p5.js scroll-driven sketches in the services section (Alignment Network, Radial Pulse, Gravitational Pair). Scroll position IS the animation frame.
3. Three p5.js scroll-driven sketches in the framework section (converging arrows, priority grid clearing, forking branch). Different visual vocabulary from services (structural/diagnostic vs organic/living).
4. A custom cursor with a follower element on desktop.
5. A logo marquee (continuous horizontal scroll) in the clients section.

These are design-signature moves. They should be preserved across evolutions unless explicitly retired.

---

## 2. Color Palette & Roles

<!-- DSL:COLORS:BEGIN -->
<!-- This section is auto-generated from css/dsl-tokens.css by scripts/sync-design-md.mjs. Do not edit by hand. -->

### Brand colors (universal, theme-independent)

| Name | Hex | Role |
|------|-----|------|
| Gold | `#FBE248` | Hero highlight, primary accent, default button fill |
| Coral | `#CF5A5A` | Alerts, warnings, gradient endpoints |
| Teal | `#437481` | Primary interactive, link hover, progress indicators |

Retired: indigo (`#6366f1`). Teal replaced it across the system. Do not reintroduce indigo without an explicit decision.

### Dark theme (default)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#09090B` | Page background |
| `--color-surface` | `#111114` | Cards, panels |
| `--color-surface-elevated` | `#1A1A1F` | Modals, dropdowns |
| `--color-surface-hover` | `#242429` | Hover states on surfaces |
| `--color-border` | `#2A2A32` | Default borders |
| `--color-border-hover` | `#3A3A44` | Hover and focus borders |
| `--color-text` | `#FAFAFA` | Primary text, headings |
| `--color-text-body` | `#E8E8ED` | Body paragraphs |
| `--color-text-dim` | `#8A8A96` | Captions, secondary text |
| `--color-text-muted` | `#78787F` | Tertiary, timestamps, disabled |
| `--color-primary` | `#529099` | Primary interactive |
| `--color-accent` | `#FBE248` | Accent highlight |
| `--color-accent-coral` | `#CF5A5A` | Coral accent |
| `--color-accent-teal` | `#529099` | Teal accent |
| `--color-alert` | `#CF5A5A` | Alerts and errors |

### Light theme

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#FAFAF8` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, panels |
| `--color-surface-elevated` | `#F4F4F2` | Modals, dropdowns |
| `--color-surface-hover` | `#EBEBEA` | Hover states on surfaces |
| `--color-border` | `#D4D4D0` | Default borders |
| `--color-border-hover` | `#B0B0AC` | Hover and focus borders |
| `--color-text` | `#0A0A0A` | Primary text, headings |
| `--color-text-body` | `#2D2D2D` | Body paragraphs |
| `--color-text-dim` | `#6B6B6B` | Captions, secondary text |
| `--color-text-muted` | `#6E6E6E` | Tertiary, timestamps, disabled |
| `--color-primary` | `#2D5A66` | Primary interactive |
| `--color-accent` | `#7D6400` | Accent highlight |
| `--color-accent-coral` | `#B84545` | Coral accent |
| `--color-accent-teal` | `#3A6370` | Teal accent |
| `--color-alert` | `#B84545` | Alerts and errors |

Light theme brand colors are darkened from their universal values to maintain WCAG contrast ratios on a light background. Dark theme uses the pure brand values.

<!-- DSL:COLORS:END -->

### Semantic color roles

- **Success / active state:** primary teal
- **Highlight / emphasis:** accent gold
- **Warning / error / alert:** accent coral
- **Interactive default:** text color + border (outlined)
- **Interactive hover:** accent gold fill with gradient underline sweep

---

## 3. Typography Rules

### Font families

| Role | Family | Weights | Hosting | Usage |
|------|--------|---------|---------|-------|
| Display | Plus Jakarta Sans | 400, 500, 600, 700, 800 | Google Fonts | Headings, hero text, nav, framework headlines |
| Body | Inter | 300, 400, 500, 600, 700 | Google Fonts | Paragraphs, UI text, labels, buttons |
| Serif accent | Fraunces | 400, 500, 600, 400i | Google Fonts | Outcome quote, editorial moments |

All three are delivered via Google Fonts (see `index.html`). A `<link rel="preload" as="style">` primes the stylesheet download so the hero paints closer to its final typography. The legacy `fonts/dsl-fonts.css` still ships Satoshi for `agents/index.html` and `sketch-gallery.html`; the main site does not use it. Offline or availability-hardened builds would self-host from Fontshare or Google Fonts Helper.

**Semantic token: `--font-quote`.** In `css/styles.css` a semantic alias `--font-quote: var(--font-serif);` exposes Fraunces under a role-named token. Use it at testimonial paragraphs and the Wheatley statement quote. Reserved for pull-quote-style copy where the italic serif treatment is the whole point. Do not use `--font-quote` as general body text.

**Why this pairing.** Plus Jakarta Sans has warm geometric character that signals personal approachability without sacrificing professional seriousness. Inter is the most readable UI body font available. Fraunces adds warmth and personality for pull quotes. Previous pairing (Satoshi/Karla/Lora) was replaced 2026-04-12.

### Full hierarchy table

| Element | Family | Weight | Size | Line height | Letter spacing | Bottom margin |
|---------|--------|--------|------|-------------|----------------|---------------|
| h1 (hero) | Plus Jakarta Sans | 700 | `clamp(2.5rem, 5vw, 4rem)` | 1.1 | -0.02em | 32px |
| h2 | Plus Jakarta Sans | 700 | `clamp(2rem, 3.5vw, 3rem)` | 1.15 | -0.015em | 32px |
| h2 (section kicker) | Inter | 600 | 0.8rem | 1.2 | 0.12em UPPERCASE | 16px |
| h3 | Plus Jakarta Sans | 600 | `clamp(1.4rem, 2.5vw, 1.8rem)` | 1.2 | -0.01em | 16px |
| body p | Inter | 400 | 1rem-1.05rem | 1.75-1.8 | default | 24px |
| nav links | Inter | 500 | 1rem | default | 0.03em | default |
| button | Inter | 500 | 0.95rem | default | 0.02em | default |
| outcome quote | Fraunces | italic | `clamp(1.1rem, 2vw, 1.4rem)` | 1.6 | default | default |
| framework headline | Plus Jakarta Sans | 700 | `clamp(1.5rem, 3vw, 2.2rem)` | 1.15 | -0.01em | 24px |

**Reading column.** Body paragraphs are capped at `max-width: 70ch` for comfortable reading. This is a hard rule. Never let text run edge-to-edge on desktop.

**Section labels.** Major section headings (`.services-header h2`, `.contact-header h2`) override the default h2 styling with uppercase and increased letter-spacing. This is the signature section-label treatment. Preserve it.

---

## 4. Component Stylings

### Buttons

**Base button (`.btn`).**
- Padding: 14px 32px
- Border: 1px solid current text color
- Border radius: **0 (square corners)**. Deliberate Swiss grid choice.
- Background: transparent
- Font: Inter 0.95rem, weight 500, letter-spacing 0.02em
- Transition: `all var(--transition-quick)`

**Base button hover (dark mode).**
- Background fills with accent gold
- Border becomes accent gold
- Text color inverts to background color
- Transform: translateY(-2px)
- Gold glow shadow
- Gradient underline (coral to teal) sweeps in via `::before`

**Base button hover (light mode).**
- Background fills with `--color-cta` (coral `#B84545`)
- Border becomes coral
- Text: white
- Transform: translateY(-1px)
- Warm coral shadow: `0 8px 24px rgba(184, 69, 69, 0.25)`

**Primary button (`.btn-primary`).**
- Dark mode: accent gold fill, teal hover
- Light mode: coral fill (`--color-cta`), darker coral hover (`--color-cta-hover`), scale(1.02) on hover

**CTA color rationale.** Light mode uses coral for CTAs because warm colors outperform cool in B2B conversion research, and coral creates visual tension against the warm off-white background. Dark mode keeps the gold/teal pattern. The `--color-cta` token is separate from `--color-primary` to avoid side effects on links, borders, and other elements that use `--color-primary`.

### Cards

- Background: `var(--color-surface)`
- Border: `1px solid var(--color-border)`
- Border radius: `var(--radius-md)` = 12px
- Hover: border shifts to `var(--color-border-hover)`
- Shadow on elevation: `var(--shadow-md)`

### Navigation

- Fixed position, top of viewport
- Default state: transparent background, no border
- Scrolled state (`.site-header.scrolled`): 95% opacity black background, 12px backdrop blur with 180% saturation, 1px bottom border at 10% white
- Logo height: 32px
- In light theme, the logo is inverted via CSS filter

### Inputs (forms)

- Follow the card pattern for backgrounds
- Border: 1px `--color-border`, shifts to `--color-border-hover` on focus
- Radius: `--radius-sm` (8px) for inputs (softer than square buttons)
- Label weight: 500, label color: `--color-text`

### Interactive states (universal)

- **Hover:** 200-300ms transition, subtle transform (`translateY(-1px to -2px)`) where appropriate
- **Focus:** 2px solid accent gold outline with 2px offset (accessibility requirement, do not remove)
- **Active:** reduced transform, immediate feedback
- **Disabled:** 50% opacity, cursor not-allowed

---

## 5. Layout Principles

### Grid

- Desktop: 12-column CSS grid
- Tablet: 12-column grid with reduced column spans per component
- Mobile: collapses to single-column or 2-column depending on component
- Grid container class: `.grid-12`
- Grid template: `repeat(12, 1fr)` with `gap: var(--grid-gap)` (24px)

### Container widths

- Max content width: 1400px (`--max-width`)
- Site gutter (horizontal padding): `clamp(24px, 5vw, 80px)` (responsive)
- Mobile gutter floor: 24px
- Desktop gutter ceiling: 80px

### Spacing scale (8px base grid)

Every spacing value is a multiple of 8px. Custom arbitrary values are not allowed.

<!-- DSL:SPACING:BEGIN -->
<!-- This section is auto-generated from css/dsl-tokens.css by scripts/sync-design-md.mjs. Do not edit by hand. -->

| Token | Value | Typical use |
|-------|-------|-------------|
| `--space-1` | 8px | Tight element gaps |
| `--space-2` | 16px | Paragraph spacing |
| `--space-3` | 24px | Grid gap, section padding |
| `--space-4` | 32px | Between paragraphs and headings |
| `--space-6` | 48px | Large component gaps |
| `--space-8` | 64px | Section internal padding |
| `--space-10` | 80px | Between content blocks |
| `--space-12` | 96px | Major section vertical padding |
| `--space-16` | 128px | Extra-generous section rhythm |

<!-- DSL:SPACING:END -->

### Vertical rhythm

All elements align to an 8px baseline. Headings, paragraphs, buttons, and cards all sit on multiples of 8px. This is a hard rule carried over from the Swiss grid philosophy.

### Whitespace philosophy

White space is a design element, not leftover. Sections breathe. A button sits in a block of space equal to its own height. Paragraphs never touch section boundaries. When in doubt, add more space, not less.

---

## 6. Depth & Elevation

### Shadow system

**Dark theme** (glow-based, because dark backgrounds show depth differently):

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 2px 8px rgba(0,0,0,0.3)` | Light card elevation |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.4)` | Default card, button hover |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.5)` | Modals, elevated panels |
| `--shadow-glow` | `0 0 20px rgba(67,116,129,0.15)` | Teal glow for interactive focus |

**Light theme** (traditional drop shadows):

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.06)` | Light card elevation |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.08)` | Default card |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modals |
| `--shadow-glow` | `none` | Glow effects disabled in light mode |

### Elevation layers

From back to front:
1. Page background (`--color-bg`)
2. Particle canvas (hero only, `z-index: 0`)
3. Surface panels and cards (`--color-surface`, z-index 1)
4. Fixed navigation (`z-index: 100`)
5. Mobile nav overlay (`z-index: 200`)
6. Skip-nav accessibility link (`z-index: 200`)

### Radius system

<!-- DSL:RADII:BEGIN -->
<!-- This section is auto-generated from css/dsl-tokens.css by scripts/sync-design-md.mjs. Do not edit by hand. -->

| Token | Size | Usage |
|-------|------|-------|
| `--radius-sm` | 8px | Inputs, badges, small cards |
| `--radius-md` | 12px | Default cards, panels |
| `--radius-lg` | 16px | Modal, large cards |
| `--radius-xl` | 20px | Hero sections, major features |
| `--radius-full` | 100px | Pills, avatars |

<!-- DSL:RADII:END -->

Buttons are a deliberate exception. They use radius 0 (square corners) to echo the Swiss grid philosophy.

---

## 7. Do's and Don'ts

### Do

- Align everything to the 8px baseline grid. No exceptions.
- Use square-corner buttons (radius 0). The square is load-bearing.
- Use the gradient-underline sweep as the signature button hover.
- Cap paragraph width at 70ch for readability.
- Use Plus Jakarta Sans for display, Inter for body, Fraunces for editorial quotes.
- Preserve the dark theme as the default. Light theme is a toggle, not the primary surface.
- Use the p5.js particle hero, custom cursor, and logo marquee as the three signature interactive moves.
- Scale type with `clamp()` so it responds fluidly to viewport width.
- Use teal as the primary interactive color. Always.
- Section label headings go uppercase with 0.1em letter-spacing.

### Don't

- Do not use Montserrat. CUCollaborate uses it. Plus Jakarta Sans is the differentiator.
- Do not use Satoshi, Karla, or Lora. These were retired in v3.0.
- Do not reintroduce indigo. It was retired in favor of teal.
- Do not round buttons. Square corners are the Swiss grid signature.
- Do not let body text run wider than 70ch.
- Do not use arbitrary spacing values. Everything is a multiple of 8px.
- Do not use generic stock imagery. Photography in the site is personal (Brent's photo, client photos, event photography).
- Do not add rigid topic-sentence templates to copy blocks. The writing is conversational and rhythmic, per `brent-voice` skill.
- Do not use aggressive marketing language ("dominate," "crush," "disrupt"). The audience is cooperative leaders who reject that vocabulary.
- Do not remove the focus outline. It is 2px accent gold and required for accessibility.
- Do not use drop shadows in dark mode. Dark mode uses glow-based shadows instead.

---

## 8. Responsive Behavior

### Breakpoints

| Breakpoint | Range | Behavior |
|------------|-------|----------|
| Mobile | `max-width: 767px` | Single-column layouts, hamburger nav, 24px gutters, simplified type scale |
| Tablet | `768px to 1023px` | 8-column grid, visible nav links, 40-60px gutters, full type scale |
| Desktop | `1024px and up` | 12-column grid, full nav, 80px gutters, full type scale |

Note: the tablet grid is described in the HTML comment as "8-column" but the CSS implementation uses the 12-column grid at all sizes with column-span adjustments. Verify during the next layout pass.

### Touch targets

- Minimum tap target: 44x44px on touch devices
- Mobile nav toggle: 40x40px (slightly under spec, review in next pass)
- Theme toggle: 40x40px
- Buttons: 48px effective height after padding

### Mobile adjustments

- Custom cursor disabled on touch devices (`@media (hover: none) and (pointer: coarse)`)
- Nav collapses into full-screen overlay with centered vertical list
- Hero particle density reduced for performance
- Testimonial carousel shows one card at a time with swipe support
- Section padding reduces from `--space-12` (96px) to `--space-8` (64px)

### Fluid type

All headings use `clamp()` for fluid scaling. Example: `h1: clamp(1.5rem, 3.5vw, 3rem)`. This removes the need for separate mobile type scales.

---

## 9. Agent Prompt Guide

Quick-reference block for coding agents generating new UI for dxn.is.

### When asked to build a new page or section

1. Import `css/dsl-tokens.css` and `css/styles.css` from the project root. Never redefine tokens locally.
2. Wrap content in `.grid-12` for the 12-column grid.
3. Use section padding of `var(--space-12)` top and bottom.
4. Lead with an h2 in the section-label treatment (uppercase, 0.1em letter-spacing) unless the section is a hero.
5. Keep body paragraphs under 70ch width.
6. Default to dark theme. Test in light theme before shipping.

### Color reference (copy-paste ready)

```
Dark bg: #09090B
Dark surface: #111114
Primary (teal): #529099
CTA (dark): #529099 / CTA (light): #B84545
Accent (gold): #FBE248
Alert (coral): #CF5A5A
Success: #22c55e / Danger: #ef4444
Text: #FAFAFA
Body: #E8E8ED
Dim: #8A8A96
```

### Typography reference

```
Display: 'Plus Jakarta Sans', system-ui, sans-serif (headings)
Body: 'Inter', system-ui, sans-serif (paragraphs and UI)
Serif: 'Fraunces', Georgia, serif (pull quotes only)
```

### Ready-to-use prompts

**Prompt: new landing page section.**
"Build a new section for dxn.is following DESIGN.md. Use `.grid-12` wrapper, `var(--space-12)` section padding, h2 in the section-label treatment (uppercase, letter-spacing 0.1em), body copy in Inter at 1.125rem with 70ch max-width, and at least one `.btn` or `.btn-primary` CTA. Dark theme default. No arbitrary spacing values."

**Prompt: new card component.**
"Build a card component for dxn.is following DESIGN.md. Use `var(--color-surface)` background, 1px border in `var(--color-border)`, `var(--radius-md)` corner radius, 24px internal padding, and `var(--shadow-md)` on hover with `translateY(-2px)` transform. Title in Plus Jakarta Sans weight 600, body in Inter weight 400."

**Prompt: new button variant.**
"Build a new button variant for dxn.is following DESIGN.md. Start from `.btn` base (square corners, 14px 32px padding, 1px border in current color, 0.95rem Inter weight 500, 0.02em letter-spacing). Follow the signature hover pattern: gold fill, translateY(-2px), gradient underline sweep from coral to teal via `::before` pseudo-element."

---

## Change log

- **v1.0** (pre-2026-04-11): Original DSL Design System doc.
- **v2.0** (2026-04-11): Rewrite in Stitch DESIGN.md format (9 sections).
- **v2.1** (2026-04-11): Resolved four open tensions. Testimonial carousel locked to 4. Custom cursor confirmed. JetBrains Mono removed.
- **v3.0** (2026-04-14): Major update. Typography changed to Plus Jakarta Sans / Inter / Fraunces (replaced Satoshi / Karla / Lora). Color palette tightened: 82 orphan rgba values consolidated, new tokens for CTA, functional colors, surface tints, and hover states. Light-mode CTA buttons changed from teal to coral (`--color-cta` token). Hero bloom reduced from 4 to 3 layers (dropped purple, all layers use exact brand RGB values). "How I Work" section replaced with "What I look for" framework section (Alignment, Priorities, Evidence) with three p5.js scroll-driven sketches. Beliefs section commented out pending interview content. Testimonials moved to after services. Outcome pull-quote added between hero and services. Framework section gets elevated background (`--color-surface-elevated` in dark, coral tint in light).

## Open tensions (resolution log)

Resolved 2026-04-11:

1. **Hero layout will be adapted** to accommodate the new positioning claim ("Credit union strategy for a moment when operating models are being rewritten by AI"). Brent confirmed the current hero reads generic and the next pass should get more interesting visually.
2. **Testimonial carousel slims from 7 to 4.** The four featured testimonials are Ray Springsteen (Abound CU), Mary Beth Spuck (Resource One CU), Ronaldo Hardy (Balance Financial Wellness), and George Hofheimer (Hofheimer Strategy Advisors). Retired from the carousel: Nancy Giordano, Stephen Pagenstecher, Dr. Philipp Khallerhoff. Retired testimonials should be moved to an archive rather than deleted, in case they are useful elsewhere.
3. **Custom cursor stays.** Brent confirmed the custom cursor and follower are part of the signature design language. Small ornaments and surprises add up when they are elegant and not distracting.
4. **JetBrains Mono reservation removed.** Not currently loaded in any stylesheet, and monospace type is not part of the site's active vocabulary. Will be reconsidered as part of a wider typographic exploration track.

Still open for future passes:

5. **Tablet grid discrepancy.** HTML comments describe an 8-column tablet grid but the CSS implements 12-column with column-span adjustments across all breakpoints. No action needed this pass. Verify and document the real behavior in v2.1 or during the next layout refactor.
6. **Typographic exploration track.** Brent wants to explore more distinctive typography than the current Satoshi and Karla pairing. Candidates to research: alternative display faces (PP Neue Montreal, Geist, Basis Grotesque, Söhne, GT Walsheim), serif alternatives to Lora (Fraunces, Tiempos, Editorial New, PP Editorial), and whether monospace has any role at all. Runs as a separate workstream until a finalist emerges, then lands back here as v3.0.
