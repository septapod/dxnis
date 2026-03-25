# dxn.is — Project Status

## Current State
Personal/consulting website at dxn.is. Static site (vanilla HTML/CSS/JS) with p5.js hero animation, hosted via GitHub Pages or Vercel from `septapod/dxnis`.

## Recent Changes

### Site Design Improvement Pass (2026-03-25) — COMPLETE
Two-phase improvement: mobile responsiveness and professional polish.

**Phase 1: Mobile-Ready**
- Added hamburger menu with full-screen overlay below 768px (Services, About, Contact, Get Started, theme toggle)
- Verified existing responsive breakpoints handle card stacking, photo hero, testimonials, contact, newsletter

**Phase 2: Professional Polish**
- Removed ~600 lines of dead HTML/CSS (4 commented-out sections, dead selectors, invalid schemas)
- Fixed ARIA violations: role="list" wrapper, visually-hidden h2 for testimonials, fixed aria-labelledby
- Carousel keyboard nav works without mouse hover; added pause/play button
- Progressive enhancement: sections visible by default, animation only with JS
- Custom cursor restricted to mouse-only, rAF loop stops when idle
- Deferred p5.js, lazy-loaded Calendly on click, added image dimensions, reduced logo duplication
- Consolidated design tokens into dsl-tokens.css as single source of truth

Branch: `feat/site-improvements` (7 commits, not yet merged)

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
