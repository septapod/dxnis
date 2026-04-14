---
date: 2026-03-19
topic: stitch-prototype-design-improvements
focus: Design improvements for site-stitch.html including p5.js Alignment Field hero animation
---

# Ideation: Stitch Prototype Design Improvements

## Codebase Context

- **Project:** dxn.is, Brent Dixon's strategic facilitation consultancy site
- **Target file:** `style-tiles/site-stitch.html` (full homepage prototype)
- **Design system:** Dark ground (#0a0a0f), teal accent (#0ef6cc), Inter font, CSS grid-line texture at 80px intervals, 12px rounded cards, pill-shaped buttons
- **Core value prop:** "I help leadership teams transform diverse opinions into a co-owned plan"
- **Gallery context:** One of 3 site prototypes (alongside amber and indigo) in the brand identity exploration gallery at dxn.here.now/brand
- **Constraint:** Must preserve the exact content and information architecture from dxn.is. Visual and interaction changes only.
- **Key concept from Brent:** An interactive p5.js "Alignment Field" hero animation as a visual metaphor for strategic facilitation. Particles represent diverse opinions, cursor acts as facilitator, grid lines represent the framework/process.

## Ranked Ideas

### 1. Alignment Field Hero Animation (p5.js)
**Description:** Full-viewport p5.js canvas behind the hero text. ~60-80 particles drift with randomized velocity vectors (diverse opinions). Cursor proximity triggers Craig Reynolds flocking behaviors: separation keeps them from clumping, alignment steers nearby particles toward shared heading, cohesion pulls stragglers in. When particles converge near grid intersections, those nodes glow. On idle, slow drift back toward entropy. The grid lines (already in the CSS) become the framework particles resolve against.
**Rationale:** The entire value prop is "I turn divergent opinions into alignment." This makes the visitor experience that before reading a word. It's the conceptual anchor for every other improvement.
**Downsides:** Most complex single item. p5.js adds ~800KB. Performance tuning required for mobile. Risk of feeling "tech demo" if not tuned for subtlety.
**Confidence:** 90%
**Complexity:** High
**Status:** Explored (brainstormed 2026-03-19, requirements at docs/brainstorms/2026-03-19-alignment-field-hero-requirements.md)

### 2. Reactive Grid
**Description:** Convert the static CSS grid texture from `body::before` to a canvas or SVG layer where grid cells near the cursor glow brighter (0.12 opacity vs 0.04). On idle, a slow radial pulse emanates from center like sonar. The grid is not decoration. It is the framework that activates when people show up.
**Rationale:** Compounds directly with #1. Together they create one coherent system: particles find their place, the grid responds to presence. Every other consultancy site has a background texture. This one responds to you.
**Downsides:** Two canvas layers (hero particles + grid) may need to merge into one for performance. Subtle effect that may not register on first visit.
**Confidence:** 75%
**Complexity:** Medium
**Status:** Unexplored

### 3. Display Serif Restoration (from source material)
**Description:** The Stitch style tile uses a display serif for the hero headline, section headlines ("Our Services"), and testimonial quotes. Only nav, buttons, pill tags, and subline text are Inter. The prototype dropped this entirely, using Inter for everything. This is not an improvement idea, it is a fidelity fix. Restore a display serif (DM Serif Display, Libre Baskerville, or Playfair Display are candidates) for h1, h2, and blockquote text. Keep Inter for body, nav, UI. The testimonial quotes should also use selective bold + underline emphasis on key phrases, matching the Stitch tile's treatment.
**Rationale:** The serif/sans contrast is load-bearing in the Stitch design. It creates the editorial, luxury consultancy feel. Without it, the page reads as a SaaS template.
**Downsides:** Font selection still subjective. Adds ~40KB font load.
**Confidence:** 95%
**Complexity:** Low
**Status:** Unexplored

### 4. Teal Accent Hierarchy (Three Registers)
**Description:** Define three explicit teal volumes: full #0ef6cc for primary CTAs only, a mid-tone (rgba(14,246,204,0.4)) for secondary highlights (section labels, testimonial emphasis, about role text), and the existing 8% for borders/backgrounds. Currently everything teal screams at the same volume.
**Rationale:** When every accent element is at full brightness, the accent loses its ability to direct attention. Three registers turn teal into a navigation system.
**Downsides:** None significant. CSS-only change to existing variables.
**Confidence:** 95%
**Complexity:** Low
**Status:** Unexplored

### 5. Section Depth Stack
**Description:** Alternate section backgrounds between --ground (#0a0a0f), --surface (#111118), and --elevated (#1a1a24). Services on --surface, testimonials back to --ground, about on --surface, etc. The three tokens are already defined in :root but only --ground is used anywhere.
**Rationale:** Flat same-background sections force visitors to rely entirely on whitespace to know they've moved topics. Background depth variation is free visual wayfinding using tokens that already exist.
**Downsides:** Card colors need to step up one level to maintain contrast on elevated backgrounds.
**Confidence:** 90%
**Complexity:** Low
**Status:** Unexplored

### 6. Testimonial Presence Overhaul
**Description:** Two options. Option A (ambient wall): Remove the carousel, show all 7 testimonials simultaneously in a two-column masonry layout. Option B (scaled carousel): Keep the carousel but dramatically increase quote size (28-32px), go wider than 800px, add a teal left-border accent on the active quote. Either way, the current 22px italic centered in a vast dark void undercuts the social proof.
**Rationale:** Seven strong, named testimonials from CEOs are hidden behind a carousel that shows one at a time. Most visitors see one or two.
**Downsides:** Option A is an IA change (carousel to wall). Option B is safer but less bold. Wall requires more vertical space.
**Confidence:** 80%
**Complexity:** Medium (A) / Low (B)
**Status:** Unexplored

### 7. Scroll Progress Alignment Meter
**Description:** A 2px bar below the navbar that fills left-to-right as you scroll. Color transitions from --blue (#1173d4) at top to --teal (#0ef6cc) at bottom. Labeled "alignment" in Fira Code at 10px. The deeper you read, the more resolved the color becomes.
**Rationale:** Extends the alignment metaphor across the full scroll experience for near-zero implementation cost. Rewards scrolling with a visual payoff. Both color tokens already exist.
**Downsides:** Some visitors find progress bars distracting. The "alignment" label might be too cute.
**Confidence:** 70%
**Complexity:** Low
**Status:** Unexplored

## Rejection Summary

| # | Idea | Reason Rejected |
|---|------|-----------------|
| 1 | Dark/Light Theme Toggle | Production concern, not a comp differentiator |
| 2 | Custom Cursor | Nice-to-have, doesn't sell the design direction |
| 3 | Real Client Logos | Practical/production, not a design idea |
| 4 | Live Beehiiv Embed | Functional, not design |
| 5 | Service Card Expansion | Over-engineering a comp. Content doesn't exist yet |
| 6 | Contact as Diagnostic | Bold but changes IA (violates exact content constraint) |
| 7 | Facilitation Process Section | Adds a section not on dxn.is. IA change |
| 8 | Services as Decision Stages | Requires content rewrite, not a visual improvement |
| 9 | Editorial Split Hero | Already tried and removed to match IA. Conflicts with centered layout |
| 10 | Quote-Activated Texture Shift | Too specific, hard to preview in a static comp |
| 11 | Section Entry Particle Bursts | Good but defer. Compounds with #1 but adds complexity |
| 12 | Hero-to-Scroll Full-Page Canvas | Subsumed by #1 + #2 together. Full-page canvas is a perf risk |
| 13 | Teal Glow as Signal System | Too granular for ideation. Implementation detail |
| 14 | Testimonial Outcome Tags | Changes content. Needs Brent's input |
| 15 | Grid-Anchored Layout | Good discipline but hard to demonstrate visually |
| 16 | Service Card Differentiation | Subsumed by depth stack (#5) which handles it more systemically |
| 17 | Hero Subline Compression | Content change. Strong idea but violates exact content constraint |
| 18 | Services as Timeline | IA change. Interesting reframe but out of scope |
| 19 | Contact Commitment Ladder | UX concern, not a visual design improvement |

## Session Log
- 2026-03-19: Initial ideation. 32 candidates generated across 4 frames (pain/friction, missing capability, assumption-breaking, leverage/compounding). 27 unique after dedup + 3 cross-cutting syntheses. 7 survivors after adversarial filtering. Brent approved the candidate set.
- 2026-03-19: Typography re-examination. Stitch style tile screenshot re-analyzed. Display serif for headlines was in the source material but dropped in prototype. Idea #3 upgraded from "improvement" to "fidelity fix." Proceeding to brainstorm Idea #1 (Alignment Field Hero).
