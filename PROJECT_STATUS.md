# dxn.is — Project Status

## Current State
Personal/consulting website at dxn.is. Static site (vanilla HTML/CSS/JS) with p5.js hero animation, hosted via GitHub Pages or Vercel from `septapod/dxnis`.

## Recent Changes

### Design Audit Implementation (2026-03-25) — COMPLETE
Visual design improvements from full design audit, implemented in 3 phases:
- **Phase 1 (Critical):** Color-coded service card top borders (gold/coral/teal). Visible "What Clients Say" heading for testimonials. Hero subline increased from 12.8px to 15-17px Karla (was tiny italic Lora). About paragraphs capped at 70ch. No-JS nav flash eliminated via inline head script.
- **Phase 2 (Refinement):** Quote section padding reduced (128px to 96px). Logo opacity increased (0.6 to 0.75). Newsletter section centered, widened to 1100px, rounded corners removed. Clients section background uses token. All button gradients replaced with solid colors. Nav links sized up to 1rem.
- **Phase 3 (Polish):** 11 hardcoded hex values in light mode replaced with token vars. Testimonial headshot shadows simplified. Carousel indicator gap tightened. Footer gradient simplified to single teal. Contact submit button normalized.

Design audit published to Proof: proofeditor.ai/d/gbvscutr

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

Branch: `feat/site-improvements`, merged to main and deployed (ae1f411).

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
- 38 logo marquee (added MCUL + State National, deployed 2026-03-25)
