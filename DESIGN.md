---
name: DSL Design System
version: 2.0
project: Dixon Strategic Labs (dxn.is)
format: Stitch DESIGN.md (9 sections)
status: Baseline snapshot of current site, 2026-04-11. Evolves from here.
---

# DSL Design System

The design source of truth for Dixon Strategic Labs and dxn.is. Any coding agent working on this project should read this file before generating UI. Tokens, patterns, and philosophy live here. When the site evolves, this doc evolves with it.

This is v2.0, the first Stitch-format version. It documents the current visual system as a baseline. Future changes are tracked as versioned edits to this file rather than scattered notes in other places.

---

## 1. Visual Theme & Atmosphere

**Design philosophy: Swiss Grid, updated.** The current site is explicitly built on Josef Müller-Brockmann's principle that a designer's work should have "the clearly intelligible, objective, functional, and aesthetic quality of mathematical thinking." The HTML comments in `index.html` name this outright. Every element sits on a grid. White space is designed, not leftover. Asymmetry only happens through varied column spans inside grid constraints, never through free-floating placement. Scale creates hierarchy.

**Mood.** Intellectually serious, grounded, quietly confident. Dark by default with a light theme toggle. The dark surface signals depth and focus. Warm accent colors (gold, coral, teal) prevent it from reading as corporate or cold. The overall atmosphere is "a consultant who thinks carefully and respects your time," not "an agency that wants to dazzle you."

**Density.** Medium. Paragraph max-width is capped at 70 characters for readability. Sections breathe with generous vertical spacing (up to 128px between major sections). The grid is dense enough to feel precise, not so dense that it feels cramped.

**Interactive flourishes.** Three specific moves that give the site personality without being gimmicky:
1. A p5.js particle canvas in the hero. Subtle motion, not showy.
2. A custom cursor with a follower element on desktop.
3. A logo marquee (continuous horizontal scroll) in the clients section.

These are design-signature moves, not decoration. They should be preserved across evolutions unless explicitly retired.

---

## 2. Color Palette & Roles

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
| `--color-bg` | `#09090B` | Page background (near-black, warm) |
| `--color-surface` | `#111114` | Cards, panels |
| `--color-surface-elevated` | `#1A1A1F` | Modals, dropdowns |
| `--color-surface-hover` | `#242429` | Hover states on surfaces |
| `--color-border` | `#2A2A32` | Default borders |
| `--color-border-hover` | `#3A3A44` | Hover and focus borders |
| `--color-text` | `#FAFAFA` | Primary text, headings |
| `--color-text-body` | `#E8E8ED` | Body paragraphs |
| `--color-text-dim` | `#8A8A96` | Captions, secondary text |
| `--color-text-muted` | `#55555F` | Tertiary, timestamps, disabled |
| `--color-primary` | `#437481` | Primary interactive (teal) |
| `--color-accent` | `#FBE248` | Accent (gold) |
| `--color-accent-coral` | `#CF5A5A` | Accent (coral) |
| `--color-alert` | `#CF5A5A` | Alerts and errors |

### Light theme

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#FAFAF8` | Page background (warm white, not pure white) |
| `--color-surface` | `#FFFFFF` | Cards |
| `--color-surface-elevated` | `#F4F4F2` | Secondary panels |
| `--color-surface-hover` | `#EBEBEA` | Hover states |
| `--color-border` | `#D4D4D0` | Default borders |
| `--color-border-hover` | `#B0B0AC` | Hover and focus borders |
| `--color-text` | `#0A0A0A` | Primary text |
| `--color-text-body` | `#2D2D2D` | Body paragraphs |
| `--color-text-dim` | `#6B6B6B` | Captions |
| `--color-text-muted` | `#999999` | Tertiary |
| `--color-primary` | `#2D5A66` | Darkened teal for contrast |
| `--color-accent` | `#B89500` | Darkened gold for contrast |
| `--color-accent-coral` | `#B84545` | Darkened coral for contrast |
| `--color-alert` | `#B84545` | Alerts |

Light theme brand colors are darkened from their universal values to maintain WCAG contrast ratios on a light background. Dark theme uses the pure brand values.

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
| Display | Satoshi | 400, 500, 700 | Self-hosted woff2 | Headings, hero text, nav |
| Body | Karla | 300, 400, 500, 600, 700 | Google Fonts | Paragraphs, UI text, labels |
| Serif accent | Lora | 400, 500, 600, 400i, 500i | Google Fonts | Pull quotes, editorial flourishes |
| Monospace | JetBrains Mono | 400, 500 | Google Fonts (not currently linked on dxn.is but reserved in tokens) | Code, metrics, data |

Satoshi is self-hosted in `fonts/Satoshi-*.woff2` with `@font-face` declarations in `fonts/dsl-fonts.css`.

**Why Satoshi.** The previous display font was Montserrat. CUCollaborate (a CU consulting peer) uses Montserrat, so Satoshi differentiates DSL immediately. Do not revert to Montserrat.

### Full hierarchy table

| Element | Family | Weight | Size | Line height | Letter spacing | Bottom margin |
|---------|--------|--------|------|-------------|----------------|---------------|
| h1 | Satoshi | 700 | `clamp(1.5rem, 3.5vw, 3rem)` | 1.2 | -0.01em | 32px |
| h2 | Satoshi | 700 | `clamp(2rem, 4vw, 3.5rem)` | 1.1 | -0.01em | 32px |
| h2 (section labels) | Satoshi | 600 | `clamp(1.5rem, 3vw, 2.5rem)` | 1.1 | 0.1em UPPERCASE | 32px |
| h3 | Satoshi | 600 | `clamp(1.5rem, 2.5vw, 2rem)` | 1.2 | -0.01em | 16px |
| h4-h6 | Satoshi | 700 | inherit | 1.1 | -0.01em | 24px |
| body p | Karla | 400 | 1.125rem (18px) | 1.75 | default | 24px |
| nav links | Karla | 500 | 1rem (16px) | default | 0.03em | default |
| button | Karla | 500 | 0.95rem (15.2px) | default | 0.02em | default |

**Reading column.** Body paragraphs are capped at `max-width: 70ch` for comfortable reading. This is a hard rule. Never let text run edge-to-edge on desktop.

**Section labels.** Major section headings (`.services-header h2`, `.contact-header h2`) override the default h2 styling with uppercase and increased letter-spacing. This is the signature section-label treatment. Preserve it.

---

## 4. Component Stylings

### Buttons

**Base button (`.btn`).**
- Padding: 14px 32px
- Border: 1px solid current text color
- Border radius: **0 (square corners)**. This is a deliberate choice that echoes the Swiss grid philosophy. Do not round buttons.
- Background: transparent
- Font: Karla 0.95rem, weight 500, letter-spacing 0.02em
- Transition: 0.3s cubic-bezier

**Base button hover.**
- Background fills with accent gold
- Border becomes accent gold
- Text color inverts to background color
- Transform: translateY(-2px)
- Box shadow: `0 8px 24px rgba(251, 226, 72, 0.2)` (gold glow)
- A gradient underline (coral to teal) sweeps in from left via `::before` pseudo-element

**Primary button (`.btn-primary`).**
- Background: accent gold (filled by default)
- Border: accent gold
- Text: background color (inverted)
- Hover: background shifts to accent teal, text color returns to primary text color

**Button philosophy.** The hover interaction (gold fill plus gradient underline sweep plus translateY lift) is the signature interactive moment on the site. Treat it as load-bearing. When adding new button styles, follow this pattern rather than inventing a new hover.

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

| Token | Size | Usage |
|-------|------|-------|
| `--radius-sm` | 8px | Inputs, badges, small cards |
| `--radius-md` | 12px | Default cards, panels |
| `--radius-lg` | 16px | Modal, large cards |
| `--radius-xl` | 20px | Hero sections, major features |
| `--radius-full` | 100px | Pills, avatars |

Buttons are a deliberate exception. They use radius 0 (square corners) to echo the Swiss grid philosophy.

---

## 7. Do's and Don'ts

### Do

- Align everything to the 8px baseline grid. No exceptions.
- Use square-corner buttons (radius 0). The square is load-bearing.
- Use the gradient-underline sweep as the signature button hover.
- Cap paragraph width at 70ch for readability.
- Use Satoshi for display, Karla for body, Lora for editorial pull quotes.
- Preserve the dark theme as the default. Light theme is a toggle, not the primary surface.
- Use the p5.js particle hero, custom cursor, and logo marquee as the three signature interactive moves.
- Scale type with `clamp()` so it responds fluidly to viewport width.
- Use teal as the primary interactive color. Always.
- Section label headings go uppercase with 0.1em letter-spacing.

### Don't

- Do not use Montserrat. CUCollaborate uses it. Satoshi is the differentiator.
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
Primary (teal): #437481
Accent (gold): #FBE248
Alert (coral): #CF5A5A
Text: #FAFAFA
Body: #E8E8ED
Dim: #8A8A96
```

### Typography reference

```
Display: 'Satoshi', system-ui, sans-serif (headings)
Body: 'Karla', system-ui, sans-serif (paragraphs and UI)
Serif: 'Lora', Georgia, serif (pull quotes only)
```

### Ready-to-use prompts

**Prompt: new landing page section.**
"Build a new section for dxn.is following DESIGN.md. Use `.grid-12` wrapper, `var(--space-12)` section padding, h2 in the section-label treatment (uppercase, letter-spacing 0.1em), body copy in Karla at 1.125rem with 70ch max-width, and at least one `.btn` or `.btn-primary` CTA. Dark theme default. No arbitrary spacing values."

**Prompt: new card component.**
"Build a card component for dxn.is following DESIGN.md. Use `var(--color-surface)` background, 1px border in `var(--color-border)`, `var(--radius-md)` corner radius, 24px internal padding, and `var(--shadow-md)` on hover with `translateY(-2px)` transform. Title in Satoshi weight 600, body in Karla weight 400."

**Prompt: new button variant.**
"Build a new button variant for dxn.is following DESIGN.md. Start from `.btn` base (square corners, 14px 32px padding, 1px border in current color, 0.95rem Karla weight 500, 0.02em letter-spacing). Follow the signature hover pattern: gold fill, translateY(-2px), gradient underline sweep from coral to teal via `::before` pseudo-element."

---

## Change log

- **v1.0** (pre-2026-04-11): Original DSL Design System doc. Typography, colors, spacing, radii, theme toggle, basic component patterns.
- **v2.0** (2026-04-11): Rewrite in Stitch DESIGN.md format (9 sections). Added visual theme and atmosphere, full typography hierarchy table, component state patterns, layout grid specifics, elevation layer map, do's and don'ts list, responsive breakpoints, and agent prompt guide. Based on extraction from `index.html`, `css/styles.css`, and `css/dsl-tokens.css` as of 2026-04-11. All content is descriptive of the current site, not prescriptive of changes. Future edits will evolve this baseline rather than replace it.
- **v2.1** (2026-04-11): Resolved four open tensions same day. Hero layout cleared for adaptation in the next design pass. Testimonial carousel locked to four featured (Ray, Mary Beth, Ronaldo, George). Custom cursor confirmed as part of the signature design language. JetBrains Mono reservation removed. Tablet grid discrepancy deferred to v2.1 layout pass. Typographic exploration track opened as separate workstream.

## Open tensions (resolution log)

Resolved 2026-04-11:

1. **Hero layout will be adapted** to accommodate the new positioning claim ("Credit union strategy for a moment when operating models are being rewritten by AI"). Brent confirmed the current hero reads generic and the next pass should get more interesting visually.
2. **Testimonial carousel slims from 7 to 4.** The four featured testimonials are Ray Springsteen (Abound CU), Mary Beth Spuck (Resource One CU), Ronaldo Hardy (Balance Financial Wellness), and George Hofheimer (Hofheimer Strategy Advisors). Retired from the carousel: Nancy Giordano, Stephen Pagenstecher, Dr. Philipp Khallerhoff. Retired testimonials should be moved to an archive rather than deleted, in case they are useful elsewhere.
3. **Custom cursor stays.** Brent confirmed the custom cursor and follower are part of the signature design language. Small ornaments and surprises add up when they are elegant and not distracting.
4. **JetBrains Mono reservation removed.** Not currently loaded in any stylesheet, and monospace type is not part of the site's active vocabulary. Will be reconsidered as part of a wider typographic exploration track.

Still open for future passes:

5. **Tablet grid discrepancy.** HTML comments describe an 8-column tablet grid but the CSS implements 12-column with column-span adjustments across all breakpoints. No action needed this pass. Verify and document the real behavior in v2.1 or during the next layout refactor.
6. **Typographic exploration track.** Brent wants to explore more distinctive typography than the current Satoshi and Karla pairing. Candidates to research: alternative display faces (PP Neue Montreal, Geist, Basis Grotesque, Söhne, GT Walsheim), serif alternatives to Lora (Fraunces, Tiempos, Editorial New, PP Editorial), and whether monospace has any role at all. Runs as a separate workstream until a finalist emerges, then lands back here as v3.0.
