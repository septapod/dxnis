# dxn.is — Project Status

## Current State
Personal/consulting website at dxn.is. Static site (vanilla HTML/CSS/JS) with p5.js hero animation, hosted via GitHub Pages or Vercel from `septapod/dxnis`.

## Recent Changes

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
