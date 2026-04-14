---
title: "feat: DSL Brand Design System"
type: feat
status: active
date: 2026-03-13
---

# DSL Brand Design System

## Overview

Build a distinctive, premium brand identity for Dixon Strategic Labs. The current visual language (teal/gold/coral, Satoshi/Karla) is functional but generic. It looks like a shadcn template with swapped accent colors. A consulting brand needs a recognizable visual signature, not a theme toggle on defaults.

This project delivers 3 interactive style tile comps for Brent to review and choose from, then applies the chosen direction across all DSL tools.

## Problem Statement

1. **No design review ever happened.** Colors, fonts, and component styles were chosen without presenting options or discussing aesthetics. The brand was assembled, not designed.
2. **The palette is interchangeable.** Swap the teal for indigo and you have every other dark-mode dashboard. No tinted neutrals, no signature treatment, no visual motif.
3. **Typography lacks contrast.** Satoshi (display) and Karla (body) are both geometric sans-serifs. The pairing reads "sameness" rather than "intentional hierarchy."
4. **Components are flat defaults.** Cards are `background + border + border-radius`. No layered shadows, no inner highlights, no depth. Hover states change one property instead of compound transitions.
5. **Tokens exist but aren't consumed.** `dsl-tokens.css` was built as an importable file, but every tool copy-pastes values with different variable names. The "system" is a document, not infrastructure.

## Proposed Solution

### Phase 1: Style Tiles (3 Directions)

Build 3 standalone HTML style tiles, each presenting a complete visual direction. Each tile renders the same component set with different aesthetic choices. Brent reviews all 3, picks a direction or mixes elements.

**Each tile includes:**
- Typography pairing (display, body, serif accent, mono) at real working sizes
- Color palette with named tokens, shown in both dark and light themes
- Tinted neutral surfaces (not generic gray)
- Component samples: cards, buttons (primary + ghost), tab bar, search input, status indicators, data table row, chat bubble, code block, badge/pill
- Brand signature element (motif, texture, or interaction pattern)
- Ambient/background treatment

**Direction A: "Midnight Observatory"**
- Personality: Precise, authoritative, high-contrast. The Linear/Vercel pole.
- Display: **Satoshi** (keep). Body: **Inter** (wider x-height, creates subtle contrast with Satoshi's tighter geometry).
- Neutrals: Cool blue-tinted darks (`#0D1117` base, GitHub Primer territory). True white light mode with cool gray borders.
- Accents: Teal as sole primary. Gold reserved for data highlights only. Coral for destructive/alerts only. Extreme restraint.
- Signature: Hairline grid pattern in card backgrounds (1px lines at 5% opacity). Top-edge inner highlight on all elevated surfaces.
- Hover: Compound transition (translateY -1px + shadow expansion + border glow).

**Direction B: "Warm Paper"**
- Personality: Editorial, considered, human. The Notion/McKinsey pole.
- Display: **Satoshi** (keep). Body: **Source Serif 4** (serif body signals "we write analysis, not ship features").
- Neutrals: Warm-tinted darks (`#131210` base, espresso). Light mode on cream/linen (`#F8F6F1`) with warm borders. Never pure white backgrounds.
- Accents: Teal deepened to a richer petrol. Gold warmed to amber. Coral softened. All colors feel "printed on paper."
- Signature: Subtle noise/grain texture overlay (SVG filter, 3% opacity). Lora italic for pull-quotes and callout text.
- Hover: Gentle background warmth shift + border color. No transform. Feels like hovering over a printed card.

**Direction C: "Electric Teal"**
- Personality: Bold, energetic, unapologetic. The Stripe/Figma pole.
- Display: **Cabinet Grotesk** (from Fontshare, bolder personality than Satoshi). Body: **Satoshi** (demoted to body, its geometry works here).
- Neutrals: Teal-tinted darks (`#0A1214` base). Light mode on `#F0F7F9` (teal-tinted white).
- Accents: Teal cranked up to a brighter `#4DB8CC`. Gold stays electric `#FBE248`. Coral pushed to `#E85D5D`. Colors are confident, not muted.
- Signature: Subtle gradient glow behind hero sections (teal-to-transparent radial). Teal accent bar on card left edge (3px solid).
- Hover: Scale(1.01) with glow shadow in accent color. Feels alive.

### Phase 2: Token Finalization

After Brent picks (or mixes), update the canonical design system:

- [ ] Rewrite `~/dev/dxnis/css/dsl-tokens.css` with chosen values
- [ ] Update `~/dev/dxnis/DESIGN.md` with rationale and specs
- [ ] Establish canonical variable naming convention (all tools will adopt)
- [ ] Add self-hosted font files if new fonts are chosen
- [ ] Document the brand signature element and how to apply it
- [ ] Define the extended semantic color palette (success, warning, error, info) harmonized with chosen direction
- [ ] Define data visualization color scale (5-7 colors for charts, optimized for both themes)

### Phase 3: Tool Rollout

Apply chosen direction to all 4 tools. Each tool gets:
- Updated CSS variables (canonical names)
- New font loading (if fonts changed)
- Component treatment upgrades (shadows, hover states, transitions)
- Brand signature element applied
- Both theme modes verified
- Hardcoded color values migrated to variables

**Tool-specific work:**

| Tool | File | Key Work |
|------|------|----------|
| DSL Dashboard | `~/dev/dsl-dashboard/style.css` + `index.html` | Update `style.css` vars, fix card-icon rgba literals, add signature element |
| Strategy Cockpit | `~/dev/strategy-workspace/cockpit.html` | Update inline `<style>` vars, fix ambient gradient rgba literals, harmonize 6 semantic colors |
| CFO Dashboard | `~/dev/dxn-finance/dashboard/index.html` | Update inline `<style>` vars, update Chart.js color config, verify grain texture works with new palette |
| TRUE Call Tool | `~/dev/consulting-practice/clients/true-community/call-tool/index.html` | Update inline `<style>` vars, fix hardcoded `#fff` in `.doc strong` and `.chat-msg.user`, add Lora font if chosen direction uses it |

**Hardcoded values to audit and fix:**
- Dashboard: `rgba(67,116,129,0.15)`, `rgba(251,226,72,0.12)`, `rgba(207,90,90,0.12)` in card-icon classes
- Cockpit: `rgba(67,116,129,.04)`, `rgba(251,226,72,.03)` in ambient gradient, `rgba(67,116,129,.12)` in active tab shadow
- Call tool: `color: #fff` in `.doc strong`, `.chat-msg.user`

### Phase 4: Deploy

- [ ] DSL Dashboard: commit + push (Vercel auto-deploys from `main`)
- [ ] Cockpit: commit to strategy-workspace repo
- [ ] CFO Dashboard: commit, republish to here.now if applicable
- [ ] Call Tool: commit to consulting-practice repo

## Technical Considerations

### Variable Naming Convention

Adopt a unified naming pattern. Proposed canonical names (all tools use these):

```css
/* Surfaces */
--bg, --surface, --surface-elevated, --surface-hover
--border, --border-hover

/* Text */
--text, --text-body, --text-dim, --text-muted

/* Brand */
--teal, --teal-bright, --gold, --coral

/* Semantic */
--success, --warning, --error, --info
```

Short names (no `--color-` prefix) since every tool already uses the short form. Pragmatic over pedantic.

### Font Loading

All tools load from CDN (Fontshare + Google Fonts). This works and is simpler than self-hosting across 4 separate projects with different architectures. Keep CDN approach.

If Direction C is chosen (Cabinet Grotesk), verify it's on Fontshare CDN. If not, self-host woff2 files in `~/dev/dxnis/fonts/` and reference via absolute file path or copy into each project.

### Theme Persistence

All tools should read/write `localStorage.getItem('dsl-theme')`. Currently the cockpit and call tool may use different keys. Unify during Phase 3.

### Accessibility

Every palette option in the style tiles must hit WCAG AA contrast ratios (4.5:1 for body text, 3:1 for large text/UI elements). Current teal (#437481) on dark bg (#09090B) is borderline at 4.1:1. New palettes should improve this.

### Token Distribution Strategy

Keep inline styles in single-file tools (cockpit, call tool, CFO dashboard). These are intentionally self-contained. The "system" is the naming convention and the reference document, not a shared import. The dashboard (Vite) can use external CSS.

## Acceptance Criteria

### Phase 1
- [ ] 3 HTML style tile files created in `~/dev/dxnis/style-tiles/`
- [ ] Each tile shows: typography scale, color palette (dark + light), card, button (primary + ghost), tab bar, search input, status dots, table row, chat bubble, code block, badge
- [ ] Each tile has a distinct personality and brand signature element
- [ ] Both dark and light themes visible in each tile (no toggle needed, show both inline)
- [ ] Body text at working sizes (14-16px) passes WCAG AA contrast in both themes
- [ ] Brent has reviewed and chosen a direction

### Phase 2
- [ ] `dsl-tokens.css` rewritten with chosen values
- [ ] `DESIGN.md` updated with rationale, full token reference, and signature element docs
- [ ] Semantic color palette defined and documented
- [ ] Data viz color scale defined

### Phase 3
- [ ] All 4 tools updated with chosen tokens
- [ ] Variable names unified across tools
- [ ] All hardcoded rgba/hex color values replaced with variables
- [ ] Both themes render correctly in all tools
- [ ] Theme persistence uses `dsl-theme` key in all tools
- [ ] Brand signature element applied in all tools

### Phase 4
- [ ] All tools deployed/committed
- [ ] DSL Dashboard live on Vercel with new brand

## Dependencies & Risks

**Risks:**
- **Font availability:** If a chosen font isn't on CDN, need self-hosting fallback
- **Chart.js theming:** CFO dashboard uses Chart.js, which has its own color configuration separate from CSS variables. Need to update both.
- **Ambient animation compatibility:** Cockpit's background gradient drift uses hardcoded rgba teal/gold values. Changing brand teal means updating the animation keyframes too.
- **Single-file fragility:** Cockpit and call tool are single HTML files with no version control history visible. Back up before modifying.

**Dependencies:**
- Brent's review and direction choice (blocks Phase 2)
- Font CDN availability for chosen direction
- All 4 tool repos accessible and pushable

## Implementation Notes

### Style Tile Structure

Each tile is a standalone HTML file with embedded CSS. No build step, no framework. Open in browser, scroll through, compare.

Structure per tile:
```
~/dev/dxnis/style-tiles/
  direction-a-midnight-observatory.html
  direction-b-warm-paper.html
  direction-c-electric-teal.html
```

Each file: ~400-600 lines. Self-contained. Font loading via CDN in `<head>`. All styles inline. Dark section on top, light section below, separated by a clear divider.

### What Makes Each Direction Distinctive (Summary)

| | A: Midnight Observatory | B: Warm Paper | C: Electric Teal |
|--|------------------------|---------------|-------------------|
| Vibe | Precise, restrained | Editorial, warm | Bold, energetic |
| Display font | Satoshi | Satoshi | Cabinet Grotesk |
| Body font | Inter | Source Serif 4 | Satoshi |
| Dark bg tint | Cool blue | Warm espresso | Teal |
| Light bg | Cool white | Cream/linen | Teal-tinted white |
| Accent use | Minimal (teal only) | Rich (all 3, muted) | Confident (all 3, bright) |
| Signature | Grid lines + inner highlights | Grain texture + serif accents | Gradient glow + accent bar |
| Reference | Linear, Vercel | Notion, McKinsey | Stripe, Figma |

## Sources

- Linear design system: https://linear.style/
- Vercel Geist: https://vercel.com/geist/introduction
- EightShapes on design tokens naming: https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676
- EightShapes on light/dark modes: https://medium.com/eightshapes-llc/light-dark-9f8ea42c9081
- Satoshi font pairings: https://www.fontpair.co/fonts/fontshare/satoshi
- Current design system: `~/dev/dxnis/DESIGN.md`
- Current tokens: `~/dev/dxnis/css/dsl-tokens.css`
