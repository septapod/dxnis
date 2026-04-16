---
name: Impeccable Audit + Clarify Fixes
date: 2026-04-16
status: Resolved. Open Decisions closed 2026-04-16. Ready for /ce:plan.
source: /impeccable audit + /clarify rounds run on index.html, css/styles.css, css/dsl-tokens.css
---

# Impeccable Audit + Clarify Fixes — Requirements

## 1. Background

The /impeccable audit scored dxn.is at 11/20 (Acceptable, significant work needed). The /clarify round added 12 copy findings. Brent selected scope "Everything": all 33 remaining findings including P3 polish. This document captures the requirements for a full sweep.

Two audit findings were withdrawn after Brent clarified that `.phase-card` and `.belief-full` CSS blocks are paused work, not dead code. The BAN 1 violations inside those blocks are still flagged (see §5.3) so they do not survive the eventual revival.

## 2. Goals

1. Eliminate every impeccable BAN 1 violation on the live site and in any code that will render when paused sections resume.
2. Raise accessibility to a consistent WCAG 2.2 AA bar (target sizes, focus patterns, form semantics).
3. Bring stylesheet theming in line with the DSL token system: no orphan brand-color rgba literals in styles.css, no hardcoded `#FFFFFF` / `rgba(0,0,0,…)` in theme-aware code.
4. Resolve docs/code drift on fonts (DESIGN.md says self-hosted, reality is Google Fonts).
5. Align every piece of copy with the voice rules in `~/.claude/skills/brent-voice/SKILL.md` and the anti-slop rules in `~/.claude/skills/writing-quality/SKILL.md`.
6. Keep every signature move DESIGN.md calls out: grainy hero bloom, p5.js scroll sketches, custom cursor with follower, logo marquee, screen-print ghost text, square-cornered buttons.

## 3. Non-Goals

- No redesign of the hero headline type treatment, service panel structure, framework section, or testimonial carousel UI.
- No migration off vanilla HTML/CSS/JS. The stack stays.
- No new sections, no new visuals, no new p5.js sketches.
- No performance optimization beyond what is named here (no image CDN, no service worker, no critical CSS extraction).
- No analytics changes.

## 4. Scope Summary

| Category | P0 | P1 | P2 | P3 | Total |
|---|---|---|---|---|---|
| Anti-Pattern | 1 active + 1 paused | 0 | 1 | 0 | 3 |
| Accessibility | 0 | 3 | 3 | 1 | 7 |
| Performance | 0 | 3 | 2 | 2 | 7 |
| Theming | 0 | 2 | 3 | 0 | 5 |
| Responsive | 0 | 1 | 1 | 0 | 2 |
| Copy (Clarify) | 0 | 2 | 7 | 3 | 12 |
| **Total** | **2** | **11** | **17** | **6** | **36** |

## 5. Technical Requirements

### 5.1 Accessibility

**R-A11Y-01 (P1): Convert `:focus` to `:focus-visible`**
- Scope: css/styles.css:290-293, 2763-2766, 2923-2928
- Accept when: all three sites use `:focus-visible` for the 2px accent-gold outline; a `:focus { outline: none }` fallback prevents the mouse-click ring; keyboard-triggered focus still shows the ring.

**R-A11Y-02 (P1): Resolve carousel form-message ARIA conflict**
- Scope: index.html:682
- Accept when: element uses `role="alert"` without `aria-live` OR uses `role="status"` without `aria-live`. Pick alert for form success/error messaging so screen readers announce assertively.

**R-A11Y-03 (P1): Fix interactive `.services-dot` buttons hidden inside `aria-hidden` wrapper**
- Scope: index.html:423-427
- Accept when: `aria-hidden="true"` is removed from `.services-dots`; each dot has a descriptive `aria-label="Jump to service N"`; keyboard focus lands correctly.

**R-A11Y-04 (P2): Bring touch targets to 44x44 minimum**
- Scope: carousel prev/next (both desktop and mobile sizes), indicator dots, carousel-pause, nav-toggle, theme-toggle
- Accept when: every interactive control has a minimum 44x44 hit area. Wrap the 12x12 indicator dots in 44x44 transparent padding rather than enlarging the visual dot. Bump other controls to 44x44 directly.

**R-A11Y-05 (P2): Theme-toggle aria-label and title must not disagree**
- Scope: index.html:270
- Accept when: the `title` attribute is removed. `aria-label="Toggle dark/light mode"` stays. Rationale: `title` is not keyboard-accessible and creates a second source of truth.

**R-A11Y-06 (P2): Nav-toggle aria-label must reflect state**
- Scope: index.html:263, js/main.js
- Accept when: JavaScript toggles the `aria-label` between "Open menu" and "Close menu" when toggling `aria-expanded`. Keep `aria-expanded` behavior as-is.

**R-A11Y-07 (P3): Carousel pause button label**
- Scope: index.html:556, js/main.js
- Accept when: initial `aria-label="Pause testimonial rotation"`; JS toggles to `aria-label="Resume testimonial rotation"` when paused.

### 5.2 Performance

**R-PERF-01 (P1): Convert layout-triggering progress bar transitions to transform-based**
- Scope: css/styles.css:1012 (`.scroll-progress-bar` width), 1810 (`.service-progress-fill` height)
- Accept when: both bars use `transform: scaleX()` / `scaleY()` + `transform-origin` instead of animating `width` / `height`. Keep the 0.1s linear timing. JS that sets progress updates the transform value.

**R-PERF-02 (P1): Font loading strategy — Google Fonts, docs catch up**
- Decision (2026-04-16): keep Google Fonts. Update DESIGN.md §3 to match.
- Scope: index.html:228-230, DESIGN.md §3, fonts/dsl-fonts.css
- Accept when: (a) DESIGN.md §3 no longer claims the three fonts are self-hosted; updated language names Google Fonts as the delivery mechanism and Fraunces / Inter / Plus Jakarta Sans as the three faces. (b) index.html adds `<link rel="preload" as="style">` in front of the Google Fonts stylesheet link so the CSS loads earlier on first paint. (c) fonts/dsl-fonts.css gets a header comment explaining it is the legacy Satoshi loader used only by `agents/index.html` and `sketch-gallery.html`, not the main site. Do not delete the file; the agents page still depends on it.

**R-PERF-03 (P1): Lazy-load below-fold images**
- Scope: index.html:492, 503, 515, 526 (4 testimonial images), 635 (newsletter logo)
- Accept when: all five images have `loading="lazy" decoding="async"`. Logo at line 255 stays eager.

**R-PERF-04 (P2): Gate smooth scroll on motion preference**
- Scope: css/styles.css:196
- Accept when: `html { scroll-behavior: smooth }` is wrapped in `@media (prefers-reduced-motion: no-preference)`.

**R-PERF-05 (P2): Remove `backdrop-filter: blur` from `.carousel-btn`**
- Scope: css/styles.css:2268
- Accept when: the `backdrop-filter: blur(8px)` declaration is removed. The button keeps its gold-tinted background and coral ring-shadow (ring shadow is dropped separately under R-ANTI-03).

### 5.3 Anti-Patterns

**R-ANTI-01 (P0): Remove colored side-stripe reveal from `.contact-form-container`**
- Scope: css/styles.css:2870-2878
- Accept when: `border-left: 3px solid transparent` is removed; hover state no longer reveals a side stripe; the hover cue is one of (a) full 1px border-color shift to `--color-accent-teal`, (b) subtle `background: var(--color-surface-hover)` fill, or (c) no hover cue at all if the form already communicates focus. Do not substitute `box-shadow: inset` — same pattern in disguise.

**R-ANTI-02 (P0): Remove colored side-stripe reveal from `.calendly-container`**
- Scope: css/styles.css:2978-2991
- Accept when: `border-right: 3px solid transparent` is removed; same replacement pattern as R-ANTI-01, using coral instead of teal for the border-color shift if the replacement approach keeps the two containers visually distinct.

**R-ANTI-03 (P2): Drop ring-shadow layer from carousel controls**
- Scope: css/styles.css:109, 115, 121, 2269, 2276, 2322
- Accept when: `box-shadow: 0 0 0 Npx rgba(...)` declarations are removed from `.carousel-btn` (base, hover) and `.indicator-dot.active`. Form input focus rings stay (they are functional affordances). Light-theme carousel button rings also go (lines 109, 115, 121).

**R-PAUSED-01 (deferred, not shipped now): Phase-card and belief-full side stripes**
- Scope: css/styles.css:1247-1262, 1606-1616 (phase-card); paused sections in index.html
- Not a current-sprint requirement. Captured so that when Brent resurrects either section, the colored `border-left` pattern does not ship. The replacement mechanic for each card should come from the R-ANTI-01 / R-ANTI-02 resolution.
- Accept when: on resurrection, neither section ships with a colored side stripe of width > 1px.

### 5.4 Theming

**R-THEME-01 (P1): Sweep orphan brand-color rgba literals**
- Scope: approximately 58 occurrences across css/styles.css. Audit notes examples at lines 82, 96, 109, 115, 121, 150, 160, 315, 320, 323, 381, 499, 577, 927, 1330, 1334, 1431, 1434, 1437, 2195, 2256-2257, 2269, 2276, 2304-2305, 2312, 2322, 2334, 2914, 2927, 2947-2956, 3021, 3027, 3081, 3097.
- Accept when: any rgba that uses a brand RGB tuple (251,226,72 / 207,90,90 / 67,116,129 / 184,69,69 / 125,100,0 / 58,99,112) is replaced by one of: (a) a new alpha token in css/dsl-tokens.css, or (b) a `color-mix(in oklab, var(--brand-color) N%, transparent)` call. Pure white (255,255,255,a) and pure black (0,0,0,a) rgba values used for borders or shadows become new `--alpha-border-*` / `--alpha-shadow-*` tokens.
- Not in scope: the three hero bloom `radial-gradient` rgba declarations (they are the signature). Leave those inline but comment them.

**R-THEME-02 (P1): Replace hardcoded `#FFFFFF` in light-mode button copy**
- Scope: css/styles.css:81, 89, 95, 160
- Accept when: a new token `--color-on-cta` is added to both theme blocks in dsl-tokens.css (light = `#FFFFFF`, dark = `var(--color-bg)` or explicit). All four sites use the token.

**R-THEME-03 (P2): Scrolled header background as a token**
- Scope: css/styles.css:319-323 (default), 29-32 (light override)
- Accept when: `--color-header-scrolled` is defined per theme in dsl-tokens.css; both sites reference the token.

**R-THEME-04 (P2): `--font-accent` resolution**
- Scope: css/styles.css:19, 2208, 2581
- Accept when: either (a) rename to `--font-quote` and document in DESIGN.md §3 as a fourth semantic role, or (b) inline `var(--font-serif)` at both use sites and delete the alias. Brent decides. Default: rename and document.

**R-THEME-05 (P2): Orphan `fonts/dsl-fonts.css` handled**
- Covered by R-PERF-02. No separate task.

### 5.5 Responsive

**R-RESP-01 (P1): Mobile touch targets**
- Covered by R-A11Y-04. Same sweep.

**R-RESP-02 (P2): Hero min-height for small-landscape**
- Scope: css/styles.css:599
- Accept when: `.hero { min-height: 60vh }` becomes `min-height: clamp(520px, 70vh, 900px)` OR the rule is dropped on mobile and the hero flows to natural content height.

### 5.6 Documentation

**R-DOC-01 (P1): Update llms.txt CTA statement**
- Scope: llms.txt:46-47
- Accept when: the text changes from "The primary CTA is the AI for FIs newsletter. The secondary CTA is the contact form." to language that matches the site's actual hierarchy: the primary CTA is booking a call or reaching out, and the newsletter is the secondary on-ramp. Draft text is in R-COPY-01 below.

**R-DOC-02 (P2): Update DESIGN.md to reflect font-hosting reality**
- Covered inside R-PERF-02.

## 6. Copy Requirements (Clarify)

Every draft below is a candidate for Brent's review. All drafts run through brent-voice + writing-quality rules. Items flagged `[needs Brent's source]` require a piece of factual input (specific tool names, workshop topics, client moments) that I cannot invent without breaking the no-fabrication rule.

### R-COPY-01 (P1): llms.txt CTA hierarchy update

- Current lines 46-47:
  > "2. The primary CTA is the AI for FIs newsletter. The secondary CTA is the contact form."
- Proposed replacement:
  > "2. The primary CTA is the contact form at https://dxn.is/#contact. The secondary CTA is the AI for FIs newsletter, which is also the on-ramp for people not yet ready to reach out."

### R-COPY-02 (P1): Service 1 concrete tools — WITHDRAWN

- Decision (2026-04-16): keep current copy. Not a defect that needs fixing now.
- Current (index.html:337) stays as-is: "Your leadership team walks out aligned on the hard questions. You get a strategy on one page and tools to manage it."
- Rationale: the hero already mirrors llms.txt using the same language; the phrase signals follow-through without narrowing perception of what Brent delivers.
- Not in scope for planning.

### R-COPY-03 (P1): Service 2 collapse soft duplicate sentence

- Current (index.html:370): "I take topics that feel out of reach and make them something your team can work with. You walk out with tools and ideas you can use the next morning."
- Problem: the first sentence's "something your team can work with" and the second sentence's "tools and ideas you can use the next morning" say the same thing.
- Draft: "I take the topics that feel out of reach, like agentic AI, and turn them into something your team can use the next morning." (Collapses to one sentence. Names one topic. Preserves the "next morning" specificity.) [needs Brent's confirmation on which topic to name]

### R-COPY-04 (P2): Service-panel link verbs — WITHDRAWN

- Decision (2026-04-16): keep existing three verbs as-is.
- Current copy stays: "Let's talk →" / "Book a session →" / "Start a conversation →", all routing to `#contact`.
- Rationale: the verb variation is an aesthetic choice Brent wants to preserve.
- Not in scope for planning.

### R-COPY-05 (P2): Newsletter tagline + description de-duplicate

- Current tagline (index.html:638): "The weekly agentic AI brief for credit union leaders"
- Current description (index.html:641): "What credit union leaders need to know about agentic AI this week. Curated developments, practical takeaways, and a point of view."
- Problem: both say "agentic AI + weekly + credit union leaders."
- Draft:
  - Tagline: "Weekly, for credit union leaders."
  - Description: "Curated agentic AI developments with a point of view."
- Alternate draft (keeps more of the original specificity):
  - Tagline: "Weekly, for credit union leaders."
  - Description: "What's moving in agentic AI, with a point of view and what to do Monday."

### R-COPY-06 (P2): Contact form labels commit to warm register

- Current: "Your Name *" / "Email Address *" / "Organization" / "What's on your mind? *"
- Draft: "Your name *" / "Your email *" / "Where you work" / "What's on your mind? *"
- Required marker changes: all four keep their current `required` / non-required status.

### R-COPY-07 (P2): Contact form header + button align

- Current: h3 "Send Me a Message" / button "Send Message"
- Draft: h3 "Send Me a Message" / button "Send it"
- Alternate (tighter): h3 "Send Me a Message" / button "Send"

### R-COPY-08 (P2): Calendly header + button align

- Current: h3 "Book a Call" / button "Schedule a Call" / intro "Prefer to schedule a time to talk? Pick a 30-minute slot."
- Draft: h3 "Book a Call" / button "Book a Call" / intro "Prefer to pick a slot yourself? Grab 30 minutes."

### R-COPY-09 (P2): Theme-toggle title drop

- Current: `aria-label="Toggle dark/light mode" title="Toggle theme"`
- Draft: remove the `title` attribute. Keep the aria-label.

### R-COPY-10 (P2): Nav-toggle state-aware label

- Covered by R-A11Y-06. Copy detail: label text is "Open menu" when closed, "Close menu" when open.

### R-COPY-11 (P2): Service kickers moment-specific

- Current:
  - "For leadership teams at a crossroads"
  - "For boards, staff, and industry audiences"
  - "For CEOs and C-suite leaders"
- Problem: #1 and #3 are generic audience labels, not moments.
- Drafts to pick from:
  - Service 1: "When annual planning isn't landing" OR "When the strategy needs to hold up against AI" OR "Before a merger, a transition, or a reset"
  - Service 2: "For boards and teams getting ready to have the conversation" OR (keep current if audiences is the right frame)
  - Service 3: "For decisions you can't think through alone" OR "For the space between board meetings" OR "When the calendar is full and the thinking isn't"
- Recommendation: Brent picks one per service. The specifics should match the actual engagements he takes. [needs Brent's source]

### R-COPY-12 (P3): Footer tagline

- Current: "Built with ❤️ for humans and agents."
- Problem: the emoji sits outside the site's register; "Built" is ambiguous (site? practice?).
- Draft: "A site for humans and agents." (Link on "agents" still routes to /agents/. Emoji removed.)
- Alternate draft: just drop the tagline entirely and leave the copyright line.

### R-COPY-13 (P3): Hero h1 tension

- Current: "Strategic facilitation for credit unions in the age of agentic AI." (noun phrase)
- Tension named, not fixed. Two directions:
  1. Keep (intentional category positioning claim).
  2. Flip to first-person sentence: "I facilitate strategy for credit union CEOs in the age of agentic AI." Then move the category claim to the meta description or a secondary line.
- Recommendation: Brent decides. Not a defect. Flagged because the rest of the site leans first-person and the hero does not, which is a voice seam.

### R-COPY-14 (P3): Newsletter logo alt

- Current (index.html:635): `alt=""`
- Fine as-is (brand text sits adjacent). Add an HTML comment noting the logo is decorative because "AI for FIs" text is next to it.

## 7. Constraints

- No em dashes in any prose (Brent's standing rule).
- No emoji in anything I write (standing rule; footer emoji is Brent's existing choice to keep or cut).
- No rewriting testimonial quotes. They are sourced.
- No touching the Wheatley statement quote. It is attributed.
- No changes to the p5.js sketches, custom cursor behavior, or grainy bloom.
- No rounding of button corners. Square is load-bearing.
- No removing the 2px accent-gold focus outline. Accessibility.
- No regressing the warm off-white light-theme surface (`#FAFAF8`).

## 8. Success Criteria

1. Re-running /audit scores the site at 18/20 or higher (Excellent band).
2. Re-running /clarify produces zero P0 or P1 copy findings on the current shipped copy.
3. All paused CSS sections still compile without a BAN 1 violation present in the file.
4. DESIGN.md, llms.txt, and the live site agree on font hosting, CTA hierarchy, and the three-service verb pattern.
5. Every tap target on a touch device measures 44x44 or larger.

## 9. Open Decisions — Resolved

Closed 2026-04-16. Captured here for audit trail.

### 9.1 Font hosting — RESOLVED: keep Google Fonts

Keep the current Google Fonts link in index.html. Update DESIGN.md §3 to describe the real delivery mechanism. Add a `<link rel="preload" as="style">` to speed first paint on cold visits. See R-PERF-02 for full acceptance criteria.

Rationale: performance delta is small for warm-referral traffic. Google Fonts is lower-maintenance for a solo operator. The real credibility leak was DESIGN.md claiming self-hosted when it wasn't; fixing the doc closes the gap without a rebuild.

### 9.2 Sequencing — deferred to plan

Resolve inside the plan phase. Leaning toward two phases: (A) P0 + P1 + P1 copy, (B) P2 + P3 polish. /ce:plan will propose a concrete sequencing.

### 9.3 Service verbs (R-COPY-04) — RESOLVED: keep existing three

Withdraw the requirement. Current three verbs stay.

### 9.4 Service 1 tools (R-COPY-02) and Service kickers (R-COPY-11)

- R-COPY-02 — RESOLVED: keep existing copy. Withdraw the requirement.
- R-COPY-11 — IN SCOPE. Kicker selection awaits Brent's source input during implementation. Draft options in the requirement stand.

### 9.5 Hero h1 (R-COPY-13) — deferred

Not a defect. Flagged for voice consistency. Can be revisited later. Remains in scope at P3.

## 10. Dependencies

- No third-party service changes. Web3Forms, Calendly, Beehiiv, and Category 6 integrations stay as-is.
- No build-tool changes. Vercel static deploy continues to serve the repo root.
- CSS token additions touch css/dsl-tokens.css. Any script at scripts/sync-design-md.mjs that auto-generates the color, spacing, or radii sections of DESIGN.md must run after the new tokens land, or DESIGN.md updates manually.

## 11. Planning Handoff

Ready for /ce:plan as of 2026-04-16. All blocking decisions resolved or deferred appropriately. Net scope after withdrawals: **34 items** (originally 36; R-COPY-02 and R-COPY-04 withdrawn).
