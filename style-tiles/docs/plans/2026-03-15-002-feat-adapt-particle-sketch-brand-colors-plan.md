---
title: Adapt Existing Particle Sketch to Amber and Indigo Brand Palettes
type: feat
status: active
date: 2026-03-15
---

# Adapt Existing Particle Sketch to Brand Palettes

## Overview

Fork the existing `hero-particles.js` into two brand-specific versions by changing colors and tuning personality parameters. The organic physics, cursor interaction, firefly glow, and "bringing things together" metaphor all stay intact. This is a palette/personality swap, not a rewrite.

## Problem Statement

The current particle animation uses cyan (`rgb(0, 220, 255)`) which doesn't belong to either brand direction. The animation itself is excellent and beloved by users. It just needs to feel like it belongs to the Amber or Indigo identity.

## Proposed Solution

Create two files by forking `~/dev/dxnis/js/hero-particles.js`:

- `hero-particles-amber.js` in `~/dev/dxnis/style-tiles/`
- `hero-particles-indigo.js` in `~/dev/dxnis/style-tiles/`

No production files are modified.

### What Changes (per file)

Each fork changes ONLY these things in the existing 475-line sketch:

#### 1. Color Constants (lines 44-46)

**Amber:**
```javascript
// Replace:
const cyanColor = { r: 0, g: 220, b: 255 };
const darkCyan = { r: 0, g: 100, b: 140 };

// With:
const primaryColor = { r: 212, g: 160, b: 66 };   // amber
const dimColor = { r: 140, g: 105, b: 45 };        // dark amber
const accentColor = { r: 196, g: 93, b: 62 };      // rust (for 25% of particles)
```

**Indigo:**
```javascript
const primaryColor = { r: 99, g: 102, b: 241 };    // indigo
const dimColor = { r: 60, g: 62, b: 150 };          // dark indigo
const accentColor = { r: 165, g: 180, b: 252 };     // lavender (for 20% of particles)
// Rare flash color:
const flashAccent = { r: 232, g: 121, b: 168 };     // magenta (10% of flashes)
```

#### 2. Background Color in draw() (lines 364-368)

**Amber:**
```javascript
if (isDarkMode) {
  p.background(20, 20, 23);  // graphite #141417
} else {
  p.background(245, 240, 232);  // warm off-white for light mode
}
```

**Indigo:**
```javascript
if (isDarkMode) {
  p.background(13, 17, 23);  // navy #0d1117
} else {
  p.background(240, 242, 245);  // cool off-white for light mode
}
```

#### 3. Particle Color Assignment in Cell.reset()

Add a `colorSet` property to each particle. On reset, assign color randomly:

**Amber:**
```javascript
// In reset():
this.colorSet = Math.random() < 0.25 ? 'accent' : 'primary';
// 75% amber, 25% rust
```

**Indigo:**
```javascript
this.colorSet = Math.random() < 0.20 ? 'accent' : 'primary';
// 80% indigo, 20% lavender
```

#### 4. Cell.show() Color Selection (lines 229-259)

Replace the fixed `cyanColor`/`darkCyan` references with the particle's assigned color:

```javascript
show(isDarkMode) {
  let color;
  if (isDarkMode) {
    color = this.colorSet === 'accent' ? accentColor : primaryColor;
  } else {
    color = this.colorSet === 'accent' ? accentColor : dimColor;
  }
  // ... rest of show() unchanged
}
```

#### 5. Blend Mode (lines 375-387)

**Amber:** Change ADD to BLEND. Amber particles wash out with ADD mode (warm colors add to white too fast). Compensate by increasing base alpha:

```javascript
// In draw():
if (isDarkMode) {
  // No blendMode change for amber - use default BLEND
  // Increase alpha compensation:
}
```

In `Cell.show()`, increase `baseAlpha` for Amber:
```javascript
let baseAlpha = isDarkMode ? 140 : 130;  // up from 95/110
```

**Indigo:** Keep ADD. Blue-spectrum colors glow beautifully with ADD (same reason the current cyan version works).

#### 6. Personality Parameters

**Amber (warmer, slower, more deliberate):**
```javascript
// In Cell.reset():
this.baseRadius = p.random(1.5, 2.5);     // up from 1.2-2.0 (larger, warmer)
this.maxSpeed = p.random(1.2, 2.5);       // down from 1.5-3.0 (slower)

// In attractToMouse():
const orbitRadius = 130;                    // up from 110 (wider orbit)
attractionStrength = 0.50 * pullIntensity;  // down from 0.65 (gentler pull)
const orbitStrength = 0.50 * falloff;       // down from 0.65 (gentler orbit)

// Flash timing - longer, warmer glow:
const FLASH_RISE = 10;    // up from 8
const FLASH_HOLD = 6;     // up from 4
const FLASH_FALL = 30;    // up from 24
```

**Indigo (cooler, crisper, slightly more energetic):**
```javascript
// In Cell.reset():
this.baseRadius = p.random(1.0, 1.8);     // slightly smaller, crisper
this.maxSpeed = p.random(1.8, 3.5);       // slightly faster

// In attractToMouse():
const orbitRadius = 100;                    // tighter orbit
attractionStrength = 0.70 * pullIntensity;  // slightly stronger pull
const orbitStrength = 0.70 * falloff;       // snappier orbit

// Flash timing - sharper, quicker:
const FLASH_RISE = 6;
const FLASH_HOLD = 3;
const FLASH_FALL = 18;
```

#### 7. Indigo-Only: Magenta Flash Accent

10% of flashes use the magenta accent color instead of the primary indigo. In `Cell.show()`:

```javascript
// Only for Indigo version:
if (this.glowIntensity > 0.5 && this.useMagentaFlash) {
  color = flashAccent;  // magenta spark
}
```

In `Cell.reset()`:
```javascript
this.useMagentaFlash = Math.random() < 0.10;  // 10% chance
```

#### 8. Function Name

**Amber:** `const heroParticlesAmber = (p) => { ... }`
**Indigo:** `const heroParticlesIndigo = (p) => { ... }`

And the DOMContentLoaded listener at the bottom uses the renamed function.

### What Does NOT Change

Everything else in the 475-line sketch stays identical:

- [ ] Cell class physics (wander, attractToMouse, update, edges)
- [ ] Perlin noise wandering parameters
- [ ] Glow state machine logic (idle/rising/hold/falling)
- [ ] Adaptive quality system
- [ ] Window resize handling
- [ ] Click/tap burst effect
- [ ] Touch support
- [ ] Reduced motion support
- [ ] Frame skipping
- [ ] Canvas container setup
- [ ] Mouse tracking

## Acceptance Criteria

- [ ] `hero-particles-amber.js` renders amber/rust particles on graphite background
- [ ] `hero-particles-indigo.js` renders indigo/lavender particles on navy background
- [ ] Cursor attraction/orbit works identically to current sketch
- [ ] Firefly glow works with new colors
- [ ] Amber feels warmer, slower, more deliberate than current
- [ ] Indigo feels crisper, slightly more energetic than current
- [ ] Amber uses BLEND mode (not ADD) with increased alpha
- [ ] Indigo uses ADD mode (like current cyan)
- [ ] Indigo has 10% magenta flash accent
- [ ] Both respect prefers-reduced-motion
- [ ] Both have adaptive quality system
- [ ] Both work in site-amber.html and site-indigo.html prototypes
- [ ] Performance: steady 60fps (same as current sketch)

## Integration

Add to each site prototype:

```html
<!-- In hero section -->
<div id="hero-canvas-container" style="position:absolute;inset:0;z-index:0;"></div>

<!-- Before </body> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
<script src="hero-particles-amber.js"></script>  <!-- or indigo -->
```

Hero content needs `position: relative; z-index: 1` (already has this).

The weave reveal CSS animation (z-index 10000-10001) layers above the canvas. When the reveal fades, the particles are already moving underneath.

## Files to Create

| File | Purpose |
|---|---|
| `~/dev/dxnis/style-tiles/hero-particles-amber.js` | Fork with amber palette + warm personality |
| `~/dev/dxnis/style-tiles/hero-particles-indigo.js` | Fork with indigo palette + crisp personality |

## Files to Modify

| File | Change |
|---|---|
| `site-amber.html` | Add canvas container + script includes |
| `site-indigo.html` | Add canvas container + script includes |

## Implementation Steps

1. Copy `~/dev/dxnis/js/hero-particles.js` to `~/dev/dxnis/style-tiles/hero-particles-amber.js`
2. Apply Amber color/parameter changes (items 1-6 above)
3. Rename function to `heroParticlesAmber`
4. Copy original again to `hero-particles-indigo.js`
5. Apply Indigo color/parameter changes (items 1-7 above)
6. Rename function to `heroParticlesIndigo`
7. Add canvas container + script tags to both site prototypes
8. Test in browser, tune alpha/radius/speed by eye
9. Publish to dxn.here.now/brand/

## Sources

- Current sketch: `~/dev/dxnis/js/hero-particles.js` (475 lines)
- Nature of Code by Daniel Shiffman (referenced as original inspiration)
- Brainstorm context: the animation is a visual metaphor for "bringing messy, chaotic perspectives together." The interactivity and organic feel are fundamental, not optional.
