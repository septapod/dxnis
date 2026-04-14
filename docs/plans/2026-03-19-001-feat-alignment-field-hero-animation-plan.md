---
title: "feat: Alignment Field hero animation"
type: feat
status: completed
date: 2026-03-19
origin: docs/brainstorms/2026-03-19-alignment-field-hero-requirements.md
---

# Alignment Field Hero Animation

## Overview

Add an interactive p5.js particle animation to the Stitch prototype hero section (`style-tiles/site-stitch.html`). Particles represent diverse opinions; cursor/touch acts as facilitator triggering Craig Reynolds flocking behaviors; connection lines form between aligned particles. The animation IS the value proposition: visitors experience "many opinions becoming one plan" before reading a word.

## Problem Statement

The Stitch prototype hero is static text on a dark background. The production dxn.is site has a particle system. The prototype needs an interactive animation that embodies the core metaphor of strategic facilitation. (see origin: docs/brainstorms/2026-03-19-alignment-field-hero-requirements.md)

## Proposed Solution

A single inline p5.js sketch using instance mode, embedded in site-stitch.html. Craig Reynolds flocking (separation, alignment, cohesion) activated within cursor influence zone. Connection lines between aligned particles as the visual payoff. Slow entropy on idle.

## Technical Approach

### Architecture

**Single file, inline.** Matches gallery pattern (see origin R10). p5.js 1.9.0 from CDN. Sketch defined as instance mode function, instantiated with `new p5(alignmentField)`.

**Canvas placement:**
```html
<!-- Inside .hero section, before .hero-content -->
<div id="hero-canvas-container" style="position:absolute;inset:0;z-index:0;overflow:hidden;"></div>
```

Hero content already has `position: relative; z-index: 1` so text sits above canvas.

**Script placement:** Two `<script>` tags at bottom of `<body>`, before closing tag:
1. p5.js CDN
2. Inline sketch

### Implementation Phases

#### Phase 1: Particle System Foundation

**Files modified:** `style-tiles/site-stitch.html`

**Tasks:**
1. Add `<div id="hero-canvas-container">` inside `.hero`, before `.hero-content`
2. Add p5.js CDN script tag
3. Implement `Particle` class with:
   - Position, velocity, acceleration vectors
   - `reset()`: randomized position and velocity
   - `applyForce(fx, fy)`: accumulate forces
   - `update()`: apply acceleration to velocity, velocity to position, friction (0.97), reset acceleration
   - `edges()`: wrap around canvas boundaries
   - `show()`: draw particle as circle, size 1-4px, opacity driven by `this.alignment` (0.2 dim to 0.8 bright)
4. Implement `setup()`:
   - Create canvas sized to hero container
   - Initialize 70 particles (desktop), 40 (mobile)
   - `prefers-reduced-motion` check
5. Implement `draw()`:
   - Semi-transparent background clear: `p.background(10, 10, 15, 25)` for trails on fast particles
   - Update and show all particles
   - Independent wandering via Perlin noise (existing pattern from hero-particles.js)
6. Background color: `rgb(10, 10, 15)` matching `--ground: #0a0a0f`

**Success criteria:** Particles drift independently on screen. No interaction yet.

#### Phase 2: Flocking Behaviors + Cursor Interaction

**Tasks:**
1. Implement `flock(particles, mouseX, mouseY, mouseActive)` method on Particle:
   - Calculate distance to cursor
   - If within influence radius (~180px): apply separation, alignment, cohesion forces
   - If outside: no flocking forces (independent drift only)
   - **Separation:** steer away from neighbors within 25px. Weight: 1.5
   - **Alignment:** steer toward average heading of neighbors within 50px. Weight: 1.0
   - **Cohesion:** steer toward center of mass of neighbors within 50px. Weight: 0.8
   - Neighbor search: naive O(n^2) is fine at 70 particles (~2,400 checks/frame)
2. Track `this.alignment` per particle: rolling average of heading similarity with neighbors (0 = scattered, 1 = fully aligned). Use `lerp` for smooth transitions.
3. Mouse/touch tracking:
   - `mouseMoved()`: set `mouseActive = true`, update `mouseX/mouseY`
   - `touchMoved()`: same behavior for mobile (see origin R7)
   - Inactivity timeout: if no mouse/touch for 200ms, set `mouseActive = false`
4. **Slow entropy (origin R5):** When `mouseActive` is false, flocking force multiplier decays from 1.0 toward 0.0 over ~180 frames (3 seconds at 60fps). `alignment` values decay with `lerp(alignment, 0, 0.01)`.

**Success criteria:** Moving cursor through the field causes nearby particles to flock. Removing cursor causes gradual dispersal.

#### Phase 3: Connection Lines + Visual Polish

**Tasks:**
1. **Connection lines (origin R4):**
   - After updating all particles, iterate pairs where both have `alignment > 0.3`
   - If distance < 80px AND heading difference < 30 degrees: draw teal line
   - Line opacity proportional to alignment strength: `stroke(14, 246, 204, alignment * 60)`
   - Max 30 lines per frame (sort by alignment, take top 30)
   - Zero cost when cursor is inactive (no particles above alignment threshold)
2. **Trail rendering (origin R6):**
   - Already handled by semi-transparent background clear from Phase 1
   - Tune alpha value (lower = longer trails). Start at 25, adjust.
   - Periodic full clear every 300 frames to prevent muddy accumulation (learned from prior work)
3. **Particle brightness (origin R2):**
   - Fill color interpolates from dim teal `rgba(14, 246, 204, 0.2)` to bright `rgba(14, 246, 204, 0.8)` based on `this.alignment`
   - Size: base 2px, scales up to 3.5px at full alignment
4. **Color palette (origin R8):**
   - Primary: `#0ef6cc` (teal) for aligned particles and connections
   - Secondary: `#1173d4` (blue) for 20% of particles as accent
   - Connection lines: teal only
5. **Blend mode:** `ADD` for dark ground (consistent with production cyan variant)

**Success criteria:** Connection lines appear between aligned particles. Visual is subtle and elegant, not a tech demo. Text remains fully legible.

#### Phase 4: Performance + Accessibility

**Tasks:**
1. **Adaptive quality** (reuse battle-tested pattern):
   - FPS rolling window: 30 samples
   - Check interval: every 60 frames
   - Threshold: 28 FPS
   - Action: reduce particle count by 30%
   - Min count: 20 particles
2. **Responsive particle counts:**
   - Desktop (>768px): 70
   - Tablet (481-768px): 45
   - Mobile (<=480px): 30
3. **prefers-reduced-motion (origin R9):**
   - Show static arrangement of particles with visible connection lines
   - No animation, no `draw()` loop
   - Arrange particles in a pleasing scattered pattern using seeded random
4. **Window resize:** Resize canvas on `windowResized()`, reposition particles proportionally
5. **Hero overflow:** Verify `.hero` has `overflow: hidden` (already in CSS)

**Success criteria:** 60fps on modern laptop. 30fps acceptable on mobile. Reduced-motion users see a static composition.

## System-Wide Impact

Minimal. This is a self-contained prototype file. No shared code, no dependencies on other files, no build step.

- Canvas sits behind hero content at z-index 0. No layout changes.
- p5.js loaded from CDN. No npm dependency.
- The existing CSS grid background (`body::before` at z-index 0) may be partially occluded by the canvas in the hero section. This is acceptable since the canvas itself provides visual interest in that zone.

## Acceptance Criteria

- [ ] Particles drift independently when cursor is not in hero area
- [ ] Moving cursor/touch through hero causes nearby particles to flock (align headings, cohere)
- [ ] Connection lines appear between aligned particles (heading within 30 degrees, distance within 80px)
- [ ] Removing cursor causes alignment to decay over ~3 seconds
- [ ] Particle brightness correlates with alignment state (dim when scattered, bright when aligned)
- [ ] Fast-moving particles leave faint trails
- [ ] Touch works on mobile/tablet
- [ ] 60fps on desktop Chrome/Safari, 30fps acceptable on mobile
- [ ] `prefers-reduced-motion` shows static composition
- [ ] Hero text remains fully legible at all times
- [ ] Self-contained: no external .js files, p5.js from CDN
- [ ] Background color matches --ground (#0a0a0f) exactly

## Key Parameters (Tuning Reference)

These values are starting points. Expect live tuning during implementation.

| Parameter | Value | Notes |
|-----------|-------|-------|
| Particle count (desktop) | 70 | Lower than prod (300-500) for subtlety |
| Particle count (mobile) | 30 | |
| Influence radius | 180px | Cursor zone for flocking activation |
| Separation distance | 25px | |
| Separation weight | 1.5 | Strongest force (prevent clumping) |
| Alignment distance | 50px | Neighbor scan radius |
| Alignment weight | 1.0 | |
| Cohesion weight | 0.8 | Weakest (gentle pull) |
| Heading threshold for lines | 30 degrees | |
| Connection distance | 80px | |
| Max connection lines | 30 | Per frame |
| Entropy decay rate | lerp(f, 0, 0.005) | ~3s to full scatter |
| Alignment smoothing | lerp(a, target, 0.05) | Prevents flicker |
| Friction | 0.97 | |
| Trail alpha | 25 | Background clear opacity |
| Full clear interval | 300 frames | Prevents mud accumulation |

## Sources & References

### Origin

- **Origin document:** [docs/brainstorms/2026-03-19-alignment-field-hero-requirements.md](docs/brainstorms/2026-03-19-alignment-field-hero-requirements.md)
- Key decisions carried forward: connection lines over grid glow, slow entropy over frozen state, alignment-driven brightness, inline in HTML

### Internal References

- Existing particle system: `js/hero-particles.js` (instance mode pattern, adaptive quality, Cell class structure)
- Amber prototype particles: `style-tiles/hero-particles-amber.js` (connection lines, mouse velocity, breathing force)
- Indigo prototype particles: `style-tiles/hero-particles-indigo.js` (ADD blend mode, flash timing)
- Prior performance plan: `dxnis-sandbox/style-tiles/docs/plans/2026-03-15-003-fix-particle-performance-and-visual-conflict-plan.md`
- Prior connection lines plan: `dxnis-sandbox/style-tiles/docs/plans/2026-03-15-005-feat-connection-lines-breathing-velocity-plan.md`

### Ideation Context

- Ideation doc: `docs/ideation/2026-03-19-stitch-prototype-design-improvements-ideation.md` (Idea #1)
- Related ideas deferred: Reactive Grid (#2), Scroll Progress Meter (#7)
