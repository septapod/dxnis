---
title: Add Connection Lines, Mouse Velocity Response, and Global Breathing to Particles
type: feat
status: active
date: 2026-03-15
---

# Connection Lines, Mouse Velocity, and Global Breathing

## Overview

Three enhancements to the hero particle animation that reinforce the "bringing people together" metaphor and make the page feel alive. All three are performance-sensitive additions to a system already running 300 particles at 60fps.

## Feature 1: Connection Lines Between Orbiting Particles

### What it does
When particles are orbiting the cursor and close to each other, draw faint lines between them. As more particles converge, a web of connections forms. When the cursor leaves, connections dissolve.

### The metaphor
Scattered dots = disconnected perspectives. Cursor = the facilitator. Convergence = people coming together. Lines = connections forming between them.

### Implementation

**In the draw loop, after updating all particles but before rendering them:**

```javascript
// Only check particles that are actively orbiting (alignment > 0.3)
// This is the key performance optimization: skip 80%+ of particles
const orbiting = cells.filter(c => c.alignment > 0.3);

// Draw connection lines (max 30 to prevent visual noise)
let lineCount = 0;
const maxLines = 30;
const connectionDist = 80;  // px
const connectionDistSq = connectionDist * connectionDist;

p.strokeWeight(0.5);

for (let i = 0; i < orbiting.length && lineCount < maxLines; i++) {
  for (let j = i + 1; j < orbiting.length && lineCount < maxLines; j++) {
    const dx = orbiting[i].x - orbiting[j].x;
    const dy = orbiting[i].y - orbiting[j].y;
    const distSq = dx * dx + dy * dy;

    if (distSq < connectionDistSq) {
      const dist = Math.sqrt(distSq);
      const alpha = (1 - dist / connectionDist) * 40;  // max alpha 40
      // Use brand accent color
      p.stroke(COLOR.r, COLOR.g, COLOR.b, alpha * Math.min(orbiting[i].alignment, orbiting[j].alignment));
      p.line(orbiting[i].x, orbiting[i].y, orbiting[j].x, orbiting[j].y);
      lineCount++;
    }
  }
}

p.noStroke();
```

### Performance analysis
- Filter step: O(n) where n=300. Produces ~60-80 orbiting particles when cursor is active, ~0 when not.
- Line check: O(k^2/2) where k=~60-80 orbiting particles. Worst case: ~3000 distance checks. But:
  - Distance check uses `distSq` (no sqrt until needed)
  - Early exit at `maxLines = 30`
  - The filter gate (`alignment > 0.3`) means zero cost when cursor is inactive
- Line rendering: max 30 `p.line()` calls per frame. Negligible.
- **Expected impact: <1ms per frame when cursor is active. Zero when cursor is inactive.**

### Brand-specific tuning

| Parameter | Amber | Indigo |
|---|---|---|
| Line color | amber `(212,160,66)` | indigo `(99,102,241)` |
| Max alpha | 40 | 35 (ADD mode amplifies) |
| Connection distance | 80px | 65px (tighter orbit = tighter connections) |
| Stroke weight | 0.5px | 0.5px |
| Max lines | 30 | 30 |
| Alignment threshold | 0.3 | 0.3 |

## Feature 2: Mouse Velocity Affects Attraction

### What it does
Slow, deliberate cursor movement attracts particles strongly. Fast, erratic movement weakens attraction or mildly scatters. Rewards intentional interaction.

### Implementation

**Track mouse speed in the draw loop:**

```javascript
// At module level:
let prevMouseX = 0;
let prevMouseY = 0;
let mouseSpeed = 0;

// In draw(), before the particle update loop:
const mdx = p.mouseX - prevMouseX;
const mdy = p.mouseY - prevMouseY;
mouseSpeed = Math.sqrt(mdx * mdx + mdy * mdy);
prevMouseX = p.mouseX;
prevMouseY = p.mouseY;

// Smooth it (don't snap)
mouseSpeed = p.lerp(mouseSpeedSmooth, mouseSpeed, 0.15);
```

**In Cell.attractToMouse(), modulate attraction strength:**

```javascript
// After computing attractionStrength and orbitStrength:
// Scale by inverse of mouse speed
const speedFactor = mouseSpeed < 2 ? 1.0        // stationary/slow: full attraction
                  : mouseSpeed < 8 ? map(mouseSpeed, 2, 8, 1.0, 0.3)  // moderate: reduced
                  : 0.1;                          // fast: minimal attraction

attractionStrength *= speedFactor;
orbitStrength *= speedFactor;
```

**No scattering (repulsion).** Brent's current sketch doesn't scatter on fast movement and adding repulsion would feel jarring. Instead, fast movement simply weakens the attraction. Particles drift away naturally because the wander force is always present.

### Performance analysis
- 2 subtractions, 1 sqrt, 1 lerp per frame (not per particle). Zero impact.
- 1 comparison + 1 map per particle in attractToMouse. Negligible (already doing trig).

### Brand-specific tuning

| Parameter | Amber | Indigo |
|---|---|---|
| Slow threshold | < 2px/frame | < 2px/frame |
| Fast threshold | > 8px/frame | > 10px/frame (indigo is snappier, tolerates faster movement) |
| Min speed factor | 0.1 | 0.15 |

## Feature 3: Global Breathing Force

### What it does
A very slow sinusoidal force applied to all particles every frame. The entire field gently drifts one direction, pauses, drifts back. Like a tide. Imperceptible as a pattern. The page feels alive.

### Implementation

**In the draw loop, before the particle update loop:**

```javascript
const breathX = Math.sin(p.frameCount * 0.003) * 0.02;
const breathY = Math.cos(p.frameCount * 0.002) * 0.015;
```

**In the particle update loop:**

```javascript
for (let cell of cells) {
  // Apply breathing force before other forces
  cell.applyForce(breathX, breathY);
  cell.update(isMouseInHero, p.mouseX, p.mouseY);
  cell.show(isDarkMode);
}
```

Wait, `applyForce` in the current sketch takes `fx, fy` separately:

```javascript
applyForce(fx, fy) {
  this.ax += fx;
  this.ay += fy;
}
```

So call: `cell.applyForce(breathX, breathY);`

### Performance analysis
- 2 sin/cos calls per frame (not per particle). The force values are computed once and applied to all.
- 2 additions per particle in applyForce. Already happens for wander and mouse attraction. Zero meaningful impact.

### Brand-specific tuning

| Parameter | Amber | Indigo |
|---|---|---|
| X frequency | 0.003 | 0.0035 (slightly faster breathing) |
| Y frequency | 0.002 | 0.0025 |
| X amplitude | 0.02 | 0.018 |
| Y amplitude | 0.015 | 0.012 |
| Cycle period | ~35 seconds | ~30 seconds |

The different X and Y frequencies mean the breathing path traces a Lissajous figure, not a simple back-and-forth. More organic.

## Implementation Order

All three features can be added independently. Order by impact:

1. **Connection lines** (most visible, most "wow")
2. **Global breathing** (simplest to implement, always-on ambient life)
3. **Mouse velocity** (most subtle, rewards repeat visitors)

## Files to Modify

| File | Changes |
|---|---|
| `hero-particles-amber.js` | Add all 3 features with amber-specific tuning |
| `hero-particles-indigo.js` | Add all 3 features with indigo-specific tuning |

No HTML changes needed.

## Acceptance Criteria

### Connection Lines
- [ ] Lines appear between orbiting particles within 80px (amber) / 65px (indigo)
- [ ] Lines only appear when both particles have alignment > 0.3
- [ ] Max 30 lines visible at once
- [ ] Line alpha fades with distance (closer = more visible)
- [ ] Lines use brand accent color
- [ ] Zero lines drawn when cursor is not in the hero (no performance cost)
- [ ] Lines dissolve as particles drift away after cursor leaves

### Mouse Velocity
- [ ] Slow cursor (< 2px/frame) = full attraction strength
- [ ] Fast cursor (> 8-10px/frame) = minimal attraction (particles drift, don't orbit)
- [ ] Speed is smoothed (lerp 0.15) so it doesn't snap between states
- [ ] No repulsion/scattering (just weakened attraction)

### Global Breathing
- [ ] All particles drift gently in a slow Lissajous pattern
- [ ] Cycle period 30-35 seconds (imperceptible as a loop)
- [ ] Force is tiny enough that it doesn't override cursor attraction or wander
- [ ] Different X/Y frequencies create organic, non-repetitive drift

### Performance
- [ ] Steady 60fps with all 3 features active (desktop)
- [ ] Connection line check only runs on orbiting particles (not all 300)
- [ ] Breathing force computed once per frame, not per particle
- [ ] Mouse speed computed once per frame, not per particle

## Sources

- Nature of Code: force accumulation pattern (Ch 2), particle systems (Ch 4)
- Brainstorm: connection lines reinforce "bringing together" metaphor, mouse velocity rewards intention, breathing creates ambient life
- Existing code: `hero-particles-amber.js`, `hero-particles-indigo.js` (current state with weaving orbit)
