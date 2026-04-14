---
title: Add Weaving Pattern to Particle Cursor Orbit
type: feat
status: completed
date: 2026-03-15
---

# Add Weaving Pattern to Particle Cursor Orbit

## Overview

When particles orbit the cursor, they currently all circle in the same direction at the same radius. This creates a flat ring. The change: split orbiting particles into two counter-rotating groups with alternating over/under brightness at crossing points. The orbit becomes a visual weave, connecting the particle animation to the logo's core motif.

## Proposed Solution

~15 lines of code changed per file. Three modifications to the existing Cell class:

### 1. Assign orbit direction on reset

In `Cell.reset()`, add one property:

```javascript
// hero-particles-amber.js and hero-particles-indigo.js
// In Cell.reset(), after existing property assignments:

this.orbitDirection = Math.random() < 0.5 ? 1 : -1;
```

Half the particles will orbit clockwise, half counterclockwise. The random assignment means the split is organic, not rigid.

### 2. Apply direction to tangential force

In `Cell.attractToMouse()`, the tangential direction is currently hardcoded:

```javascript
// CURRENT (line ~118 in both files):
const tangentX = -radialY;
const tangentY = radialX;
```

Change to:

```javascript
// NEW:
const tangentX = -radialY * this.orbitDirection;
const tangentY = radialX * this.orbitDirection;
```

This one-line change creates two counter-rotating streams. Where they pass through each other (at two points on the orbit), the weave happens naturally.

### 3. Modulate brightness at crossing points

In `Cell.show()`, after calculating `finalAlpha` and `finalRadius` but before drawing, add the over/under brightness modulation:

```javascript
// Only apply weave brightness when near the cursor (in orbit)
if (this.alignment > 0.15) {
  // Calculate angle from cursor to this particle
  // (mouseX/mouseY are available from the p5 instance)
  const angle = Math.atan2(this.y - p.mouseY, this.x - p.mouseX);

  // Determine if this particle is "over" or "under" at its current angle
  // Group A (dir=1) is "over" when cos(angle) > 0 (right half of orbit)
  // Group B (dir=-1) is "over" when cos(angle) < 0 (left half)
  const cosAngle = Math.cos(angle);
  const isOver = this.orbitDirection === 1 ? cosAngle > 0 : cosAngle < 0;

  // Smooth the transition (don't hard-switch at exactly 0/PI)
  const crossingFactor = Math.abs(cosAngle); // 0 at crossing, 1 at peak
  const weaveBrightness = isOver
    ? 1.0 + (1.0 - crossingFactor) * 0.3   // "over" gets a subtle boost at crossings
    : 0.35 + crossingFactor * 0.65;          // "under" dims at crossings, normal between

  // Scale by how strongly this particle is in orbit (alignment)
  const weaveAmount = Math.min(1, this.alignment * 2);
  const finalWeave = 1.0 + (weaveBrightness - 1.0) * weaveAmount;

  finalAlpha *= finalWeave;
  finalRadius *= (isOver ? 1.0 : 0.85);  // "under" particles also slightly smaller
}
```

### Key Design Decisions

**Why `this.alignment` as the gate:** The `alignment` property already tracks how strongly a particle is influenced by the cursor (0 = free wandering, approaches 1 = in full orbit). Using it as the gate means the weave effect only appears when particles are actually orbiting, and fades smoothly as they drift away. Free-wandering particles are unaffected.

**Why `cosAngle` for over/under:** The two counter-rotating groups cross at two points on the orbit (where `cos(angle) = 0`, roughly at the top and bottom of the orbit). At those crossing points, one group dims and the other brightens. Between crossings, both are at normal brightness. The `crossingFactor` (absolute cosine) smooths this so there's no hard pop.

**Why 0.35 minimum for "under":** The "under" particles shouldn't disappear. They should be clearly dimmer but still visible, like seeing a thread through the gap in the weave. 0.35 is enough to read as "behind" without vanishing.

**Why 0.85 radius for "under":** A slight size reduction reinforces the depth illusion. Smaller = further away. But only 15% smaller, so it's subtle.

## Brand-Specific Notes

### Amber
- The warmer, slower orbit (0.50 attraction, 130px radius) means the weave will be wider and more relaxed
- The larger particle sizes (1.5-2.5px) make the over/under size difference more visible
- BLEND mode means the brightness modulation will be directly visible (no ADD glow masking it)

### Indigo
- The tighter, snappier orbit (0.70 attraction, 100px radius) means the weave will be tighter and more precise
- ADD blend mode may wash out the brightness difference. If so, increase the contrast: "under" minimum to 0.25 instead of 0.35
- The 10% magenta flash particles will flash in their current orbit position regardless of over/under state (the flash overrides the weave modulation, which is fine because flashes are brief)

## Acceptance Criteria

- [x] `this.orbitDirection` assigned randomly (50/50) in `Cell.reset()` in both files
- [x] Tangential force direction uses `this.orbitDirection` in both files
- [x] Over/under brightness modulation applied when `this.alignment > 0.15` in both files
- [x] "Under" particles are dimmer (0.35 base) and slightly smaller (0.85x) at crossing points
- [x] "Over" particles get a subtle brightness boost (1.3x) at crossing points
- [x] The weave effect fades smoothly as particles leave the orbit influence zone
- [x] Free-wandering particles (alignment near 0) are completely unaffected
- [x] No performance regression (the math is 6 trig operations per particle per frame, only when alignment > 0.15)
- [ ] The visual reads as "two interlocking streams" not "random flickering"

## Files to Modify

| File | Lines Changed |
|---|---|
| `hero-particles-amber.js` | ~15 lines (reset, attractToMouse, show) |
| `hero-particles-indigo.js` | ~15 lines (same) |

## Risk

The over/under brightness modulation might be too subtle at small particle sizes. If it doesn't read visually, the fallback is to increase the contrast range (0.2 min for under, 1.5x for over) or add a slight color shift (under particles tint toward the secondary color).

## Sources

- Brainstorm from conversation: counter-rotating streams, over/under brightness at crossings
- Existing code: `Cell.attractToMouse()` lines 103-141, `Cell.show()` lines 229-259
- The `alignment` property (line 78, 138) already tracks orbit influence strength
