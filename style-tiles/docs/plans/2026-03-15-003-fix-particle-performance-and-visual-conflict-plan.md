---
title: Fix Particle Performance and Visual Conflict with Site Designs
type: fix
status: active
date: 2026-03-15
---

# Fix Particle Performance and Visual Conflict

## The Two Problems

### 1. Performance is terrible
p5.js is ~800KB of library overhead. The sketch runs 500 particles with per-particle Perlin noise at 60fps. On top of that, the hero already has CSS backdrop-filter blur on the navbar, multiple layered CSS gradients (the weave pattern), SVG grain overlay, and CSS animations. That's too many layers competing for GPU/CPU.

### 2. Visual conflict
The hero currently has THREE visual layers fighting each other:
- The CSS weave pattern (repeating-linear-gradient at ±45/±30 degrees)
- The SVG grain overlay
- The p5.js particle canvas

The CSS weave and the particles are both trying to own the hero's visual identity. They clash. The weave pattern says "structured, architectural." The particles say "organic, alive." Both at once says "confused."

## The Fix

### Principle: Particles own the hero. Weave owns everything else.

The hero section is where the "bringing together" metaphor lives. That's the particle sketch's domain. The CSS weave motif appears in section dividers, card accents, and other non-hero contexts.

### Performance Changes

**A. Reduce particle count to 300 (desktop), 200 (tablet), 120 (mobile)**
The current 500 is from the production site where p5.js is the ONLY visual effect. Here, it's competing with CSS animations, grain overlay, and backdrop-filter. 300 particles with the same physics feels nearly identical visually but costs 40% less computation.

**B. Remove the CSS weave pattern from the hero section**
Kill `.hero::before` and `.hero::after` (the repeating-linear-gradient weave patterns). The hero's visual texture comes entirely from the particles. This removes ~6 gradient layers from GPU compositing in the hero viewport.

**C. Remove the weave reveal animation from the hero pseudo-elements**
The weave reveal (lines sliding in) was built on `.hero::before` and `.hero::after`. Since those are being removed, the reveal animation needs to move. Two options:
- **Option A**: Drop the weave reveal entirely. The particles ARE the reveal as they populate the canvas.
- **Option B**: Keep the solid overlay (`.weave-reveal`) that fades out, but without the line slide-in. Just a simple 1-second dark overlay that fades to show particles already moving underneath.

**Recommendation: Option B.** A brief dark-to-content fade is clean and lets the particles be the first thing you see.

**D. Keep the radial glow**
The subtle `radial-gradient` warm glow in the hero center stays. It's a single CSS gradient layer (cheap) and it gives the particles a warm ambient context.

**E. Keep the grain overlay but reduce opacity**
Drop from 2% to 1.5% opacity. The grain and the particles are in the same visual register (small, organic details). Less grain means less visual noise competing with the particles.

### Visual Integration Changes

**F. Match canvas background to hero background exactly**
The p5 `background()` call must use the exact same color as the CSS hero background. No slight mismatch.

- Amber: `p.background(20, 20, 23)` matches `--ground: #141417`
- Indigo: `p.background(13, 17, 23)` matches `--ground: #0d1117`

**G. Canvas fills the hero section only, not the full page**
The canvas should be contained within the hero section (it already is via `position:absolute;inset:0` on the container). But ensure the hero has `overflow:hidden` so particles don't visually bleed into the next section.

**H. The hero content z-index stack**
```
z-index 3: hero text content (.hero-content)
z-index 2: radial glow (background on .hero itself)
z-index 1: grain overlay (if it's within the hero)
z-index 0: p5 canvas (#hero-canvas-container)
```

## Acceptance Criteria

- [ ] Remove `.hero::before` CSS (weave pattern) from both site prototypes
- [ ] Remove `.hero::after` CSS (weave pattern / second line set) from both site prototypes
- [ ] Keep radial glow on `.hero` background property
- [ ] Simplify `.weave-reveal` to solid fade-out only (no line slide-in animations)
- [ ] Remove `weave-slide-left`, `weave-slide-right` keyframes
- [ ] Remove the z-index 10001 override on hero pseudo-elements
- [ ] Reduce particle count: 300/200/120 (desktop/tablet/mobile)
- [ ] Reduce grain overlay opacity from 2% to 1.5%
- [ ] Hero has `overflow: hidden`
- [ ] Canvas background color matches CSS ground color exactly
- [ ] Performance: smooth 60fps on scroll and interaction
- [ ] Particles are the ONLY animated visual in the hero
- [ ] CSS weave motif still appears in section dividers and card accents (non-hero)

## Files to Modify

| File | Changes |
|---|---|
| `site-amber.html` | Remove hero weave CSS, simplify reveal, add overflow:hidden to hero |
| `site-indigo.html` | Same |
| `hero-particles-amber.js` | Reduce particle count (500→300/200/120) |
| `hero-particles-indigo.js` | Same |

## Implementation Order

1. Reduce particle counts in both JS files
2. Remove hero weave CSS patterns from both HTML files
3. Simplify the reveal overlay (solid fade only)
4. Add overflow:hidden to hero
5. Reduce grain opacity
6. Test performance
7. Publish
