# dxn.is — Project Status

## Current State
Personal/consulting website at dxn.is. Static site (vanilla HTML/CSS/JS) with p5.js hero animation, hosted via GitHub Pages or Vercel from `septapod/dxnis`.

## Recent Changes

### Particle Orbit Tuning + Trail Fix (2026-02-23)
Two improvements to the cursor orbit interaction, deployed to production:

- **Tighter orbit**: `orbitRadius` 160 → 110, attraction 0.35 → 0.65, orbit strength 0.3 → 0.65. Particles rush to cursor faster and spin noticeably quicker.
- **Dot trail fix**: `maxSpeed` range tightened to 1.5-3.0 (was 2.2-5.0), alignment speed bonus cut from 2.5 to 0.5. Fast particles were moving more pixels per frame than their diameter, creating visible dot gaps. Fixed.

All changes in `js/hero-particles.js`. Deployed to production (f5413c9).

### Hero Particle Animation Overhaul (2026-02-19)
Transformed the particle animation from "swarm of insects" to "flowing energy/currents":

- **Trails**: Replaced full background clear with semi-transparent overlay (alpha 25) — particles leave fading streaks
- **Flow field**: Replaced per-particle Perlin noise with shared spatial flow field — nearby particles move coherently as streams
- **Parameter tuning**: Larger dots (1.2–3px), slower speed (0.8–1.8), fewer particles (500/350/200), gentler breathing
- **Refinements**: More friction (0.97), wider orbit radius (160px), softer burst on click (force 2)

All changes in `js/hero-particles.js`. **Not yet committed or deployed.**

## What's Left
- Preview particle changes in browser before deploying
- Commit and push when satisfied
- 36 logo marquee is complete (includes Brewery CU and TRUE Community CU)
