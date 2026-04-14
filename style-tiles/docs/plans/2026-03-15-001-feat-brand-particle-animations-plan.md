---
title: Brand-Specific Particle Animations for Amber and Indigo
type: feat
status: active
date: 2026-03-15
---

# Brand-Specific Particle Animations

## Overview

Replace the generic cyan firefly particle animation on dxn.is with two brand-specific versions that embody the DXN logo's weave motif. Particles move in **parallel streams that weave through each other**, not random scatter. The cursor interaction creates weave crossings, not orbital attraction.

Two scripts:
- `hero-particles-amber.js` for the Amber + Graphite identity
- `hero-particles-indigo.js` for the Indigo + Sage identity

Both live in `/Users/brentdixon/dev/dxnis/style-tiles/` alongside the site prototypes. They do NOT modify the production `~/dev/dxnis/js/hero-particles.js`.

## Problem Statement

The current particle animation is visually disconnected from the brand identity. Cyan fireflies with random Perlin noise wandering could belong to any site. The logo's core gesture (parallel lines weaving over/under each other) has no representation in the hero animation.

## Proposed Solution

### Core Concept: Streams, Not Scatter

Replace the Cell class with a **Stream class**. Each stream manages a group of 5 particles that move together along a shared path. Streams flow at the brand's signature angle (±45deg for Amber, ±30deg for Indigo). Two sets of streams cross through each other, creating the weave.

### Architecture

```
Stream (manages 5 particles)
├── direction: angle (e.g., 45deg or -45deg)
├── particles: Array[5] of {x, y, offset}
├── speed: flow velocity along direction
├── baseY: vertical position of the stream center
└── set: "over" | "under" (determines render order + brightness)
```

**Two stream sets** (matching the logo):
- Set A: 8-12 streams flowing at +angle (the "over" set, brighter)
- Set B: 8-12 streams flowing at -angle (the "under" set, dimmer)

**Each stream = 5 parallel particles** spaced evenly (matching the logo's 5 strands), moving coherently along the stream's direction vector.

### Phase 1: Base Stream Behavior (no interaction)

**Movement**: Particles in a stream advance along their direction vector at a shared speed (0.3-0.8 px/frame). Individual particles have slight noise offset (±0.1px) so they breathe without breaking formation.

**Trail rendering**: Use semi-transparent background clear (`background(r, g, b, 20)` instead of full clear) so particles leave fading streaks. The streaks make the parallel paths visible as lines.

**Edge wrapping**: When a stream's lead particle exits the canvas, the entire group wraps to the opposite edge. Streams are continuous, not finite.

**Spawn distribution**: Streams start evenly distributed across the canvas height, offset so Set A and Set B interleave (A streams sit between B streams).

### Phase 2: The Weave Interaction (cursor)

**Default state** (no cursor): Streams flow in parallel. Set A and Set B pass through each other without interaction. The visual is calm, organized parallel motion.

**Cursor enters**: Streams within a 400px radius of the cursor begin to **bend toward** the cursor point. The bending creates a crossing zone where Set A and Set B streams intersect.

**The over/under effect**: At crossing points:
- Set A particles ("over") render at full brightness
- Set B particles ("under") render at 40% brightness
- This is achieved by drawing all Set B particles first, then Set A on top

**Cursor leaves**: Streams gradually unbend back to parallel flow over ~60 frames (1 second at 60fps). Uses the branded easing curve for the interpolation.

**Click/tap**: Brief burst that pushes nearby streams apart, then they snap back. Same as current sketch but applied to stream groups, not individual particles.

### Phase 3: Brand-Specific Variations

#### Amber Version (`hero-particles-amber.js`)

| Property | Value |
|---|---|
| Stream angle | ±45 degrees |
| Set A color | `rgb(212, 160, 66)` (amber) |
| Set B color | `rgb(196, 93, 62)` (rust, dimmer) |
| Background clear | `background(20, 20, 23, 20)` (graphite with alpha) |
| Particle count | 10 streams x 5 particles x 2 sets = 100 particles |
| Speed | 0.4-0.6 px/frame (deliberate, warm) |
| Trail alpha | 20 (longer trails, warmer feel) |
| Flash behavior | Gentle pulse traveling along a stream (like current through a wire). One stream pulses at a time. Amber glow at 150% brightness, 40 frames duration, 3-second cooldown. |
| Cursor bend radius | 350px |
| Bend strength | 0.15 (gentle, not snappy) |
| Blend mode | BLEND (no ADD mode, softer feel) |

#### Indigo Version (`hero-particles-indigo.js`)

| Property | Value |
|---|---|
| Stream angle | ±30 degrees (shallower, more elegant) |
| Set A color | `rgb(99, 102, 241)` (indigo) |
| Set B color | `rgb(134, 168, 119)` (sage, dimmer) |
| Background clear | `background(13, 17, 23, 18)` (navy with alpha) |
| Particle count | 12 streams x 5 particles x 2 sets = 120 particles |
| Speed | 0.5-0.8 px/frame (slightly more energetic) |
| Trail alpha | 18 (shorter trails, crisper) |
| Flash behavior | Synapse flash at crossing points only. When a Set A particle crosses a Set B particle's path, both flash briefly. Magenta spark: `rgb(232, 121, 168)` at the intersection point. 12 frames duration. |
| Cursor bend radius | 400px |
| Bend strength | 0.20 (slightly more responsive) |
| Blend mode | ADD for Set A (glow), BLEND for Set B |

### Phase 4: Integration with Site Prototypes

Each site prototype (`site-amber.html`, `site-indigo.html`) gets:
- A `<div id="hero-canvas-container">` in the hero section
- A `<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js">` include
- A `<script src="hero-particles-amber.js">` or `hero-particles-indigo.js` include
- The hero CSS adjusts to layer the canvas behind content (z-index 0, content z-index 1)

The weave reveal CSS animation plays on top of the canvas. When the reveal overlay fades, the streams are already flowing underneath.

## Technical Considerations

### What to Reuse from Current Sketch

| Keep | Adapt | Replace |
|---|---|---|
| p5.js instance mode pattern | Adaptive quality system (reduce streams, not individual particles) | Cell class → Stream class |
| Canvas container setup | Window resize (recalculate stream positions) | Perlin noise wandering → directional flow |
| Reduced-motion support | Click/tap burst (apply to stream groups) | Random scatter → parallel stream spawning |
| Frame skipping for reduced motion | Theme detection (dark/light) | Firefly glow → stream pulse (Amber) or synapse flash (Indigo) |
| Touch support | Edge wrapping (wrap stream groups, not individuals) | Orbital cursor attraction → cursor-driven stream bending |

### Performance Budget

- Current: 500 individual particles, each with independent physics = 500 updates/frame
- New: 20-24 streams x 5 particles = 100-120 particles, but with simpler physics (shared direction vector per stream) = ~24 stream updates + 120 particle renders/frame
- **Expected: 3-4x fewer computation per frame.** The stream abstraction is inherently cheaper.
- Adaptive quality: if FPS drops, reduce stream count (remove full streams of 5, not individual particles)

### Trail Rendering

The current sketch uses full `background(0)` clear each frame (no trails). The new version uses alpha-clear: `background(r, g, b, alpha)` where alpha 18-20 creates fading streaks. This is how the parallel paths become visible as lines rather than just moving dots.

**Caveat**: Alpha-clear accumulates over time and can create a muddy background. Mitigation: every 300 frames, do a full clear and re-render all trails for 10 frames to "refresh" the canvas.

### The Bend Math

When cursor is active, each stream's direction vector interpolates toward the cursor:

```javascript
// For each stream
const toCursor = atan2(cursorY - stream.y, cursorX - stream.x);
const dist = dist(stream.x, stream.y, cursorX, cursorY);
const influence = max(0, 1 - dist / bendRadius);

// Branded easing applied to influence
const easedInfluence = influence * influence * (3 - 2 * influence); // smoothstep

// Interpolate direction toward cursor
stream.currentAngle = lerp(stream.baseAngle, toCursor, easedInfluence * bendStrength);
```

This creates a smooth funnel effect where distant streams barely bend and close streams bend noticeably, all converging toward the cursor.

## Acceptance Criteria

- [ ] `hero-particles-amber.js` renders parallel amber/rust streams at ±45deg
- [ ] `hero-particles-indigo.js` renders parallel indigo/sage streams at ±30deg
- [ ] Streams flow in organized parallel paths (not random scatter)
- [ ] 5 particles per stream, visually matching the logo's 5-strand motif
- [ ] Trails make the parallel paths visible as fading lines
- [ ] Cursor interaction bends streams to create weave crossings
- [ ] Over/under brightness difference visible at crossings
- [ ] Amber: pulse travels along streams on cooldown timer
- [ ] Indigo: magenta synapse flash at crossing points
- [ ] Reduced-motion support (fewer streams, frame skipping)
- [ ] Adaptive quality (drop full streams if FPS < 28)
- [ ] Click/tap burst works on stream groups
- [ ] Edge wrapping is seamless (stream groups wrap together)
- [ ] Both scripts work in `site-amber.html` and `site-indigo.html` prototypes
- [ ] Weave reveal CSS animation layers correctly above the canvas
- [ ] Canvas resizes on window resize
- [ ] Performance: steady 60fps on 2020+ MacBook

## Files to Create

| File | Location | Purpose |
|---|---|---|
| `hero-particles-amber.js` | `~/dev/dxnis/style-tiles/` | Amber stream animation |
| `hero-particles-indigo.js` | `~/dev/dxnis/style-tiles/` | Indigo stream animation |

## Files to Modify

| File | Change |
|---|---|
| `site-amber.html` | Add canvas container div, p5.js CDN, script include |
| `site-indigo.html` | Add canvas container div, p5.js CDN, script include |

No production files (`~/dev/dxnis/js/`, `~/dev/dxnis/index.html`) are touched.

## Implementation Order

1. Build the Stream class with base parallel flow (shared between both versions)
2. Add trail rendering with alpha-clear
3. Add cursor interaction (stream bending)
4. Fork into amber and indigo variants (colors, angles, flash behavior)
5. Integrate into site prototypes
6. Test performance and tune particle counts
7. Publish to dxn.here.now/brand/

## Sources

- Current particle sketch: `~/dev/dxnis/js/hero-particles.js` (475 lines, Cell class architecture)
- Brand research: `https://www.proofeditor.ai/d/p97krh59?token=e71c307a-edee-4a6c-b7b5-ad7d40932686` (Part 6: Logo as Design System Seed)
- Brainstorm from conversation: stream concept, 5-strand count, over/under brightness, synapse flash for Indigo
