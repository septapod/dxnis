---
date: 2026-03-19
topic: alignment-field-hero
---

# Alignment Field Hero Animation

## Problem Frame
The Stitch prototype hero is static text on a dark background. The production dxn.is site has an interactive p5.js particle system. The prototype needs a hero animation that does more than look pretty: it should embody the core value proposition ("I help leadership teams transform diverse opinions into a co-owned plan") as an interactive visual metaphor.

## Requirements

- R1. **Particle field as canvas background.** A full-viewport p5.js canvas positioned behind the hero text (z-index 0, hero content z-index 1). ~60-80 particles on desktop, reduced on mobile. Canvas fills the hero section only, not the full page.

- R2. **Particles represent diverse opinions.** Each particle starts with a randomized velocity vector (direction and speed). Mixed sizes (1-4px), varied opacity (0.2-0.8). Particles that are more aligned with neighbors glow brighter. Scattered particles are dim. The alignment state IS the visual treatment.

- R3. **Cursor/touch acts as facilitator.** Mouse position (or touch on mobile) creates an influence zone (~150-200px radius). Within this zone, particles experience Craig Reynolds flocking forces: separation (don't overlap), alignment (steer toward neighbors' average heading), and cohesion (steer toward neighbors' center). Outside the zone, particles drift independently.

- R4. **Connection lines as alignment payoff.** When two or more particles within the cursor influence zone reach alignment (heading vectors within ~30 degrees of each other), draw faint teal lines between them. Lines fade in proportionally to alignment strength. This is the "co-owned plan" forming visually.

- R5. **Slow entropy on idle.** When cursor/touch is inactive, flocking forces gradually decay. Particles drift apart, connection lines fade, alignment erodes over 3-5 seconds. The field returns to gentle independent motion. Metaphor: without facilitation, alignment erodes.

- R6. **Faint trails on moving particles.** Faster-moving particles leave subtle, short-lived trails (semi-transparent afterimages that fade over ~10 frames). Slow/idle particles leave no trail. This adds kinetic energy to the composition without clutter.

- R7. **Touch support.** Touch interactions on mobile/tablet trigger the same facilitation behavior as mouse. Single-touch point acts as the cursor position.

- R8. **Teal color palette.** Particles, connection lines, and glow effects use the Stitch teal palette: --teal (#0ef6cc) for bright/aligned states, --teal-dim (rgba(14,246,204,0.15)) for dim/scattered states, --blue (#1173d4) for subtle accents.

- R9. **Performance.** Target 60fps on desktop, 30fps acceptable on mobile. Adaptive particle count: start at target count, reduce if frame rate drops below threshold. Respect `prefers-reduced-motion`: if set, show a static arrangement of particles with connection lines (no animation).

- R10. **Self-contained.** The entire animation lives inline in `site-stitch.html` (matching the gallery pattern of self-contained prototypes). p5.js loaded from CDN. No external JS files.

## Success Criteria
- A visitor who moves their cursor through the hero sees particles align and connect, intuitively understanding "this person brings things together" before reading the headline
- The animation feels subtle and elegant, not like a tech demo or screensaver
- Performance is smooth on a modern laptop in Chrome/Safari
- The animation enhances the hero text rather than competing with it (text remains fully legible)

## Scope Boundaries
- Hero section only (not full-page canvas)
- No grid interaction in this scope (Ideation Idea #2, separate work)
- No click/tap events beyond position tracking
- No particle system outside the hero (section entry bursts are deferred)
- Content and IA unchanged

## Key Decisions
- **Connection lines over grid glow:** The payoff is in particles connecting to each other (the team finding alignment), not in the grid framework responding. Grid interaction is a separate idea.
- **Slow entropy over frozen state:** Alignment should erode without facilitation. This reinforces why Brent's service matters.
- **Alignment-driven brightness:** Rather than separate glow/trail/opacity systems, the alignment state itself drives particle visibility. Simple rule, emergent beauty.
- **Inline in HTML:** Matches the gallery pattern. No separate .js file.

## Outstanding Questions

### Deferred to Planning
- [Affects R2][Needs research] Optimal particle count for visual density vs performance across screen sizes
- [Affects R3][Technical] Exact flocking force weights (separation, alignment, cohesion multipliers) will need live tuning
- [Affects R6][Technical] Trail implementation: semi-transparent overlay vs stored position history
- [Affects R9][Technical] Whether to use p5.js instance mode or global mode for inline embedding

## Next Steps
-> /ce:plan for structured implementation planning
