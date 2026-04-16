# dxn.is Handoff

**Timestamp:** 2026-04-16 00:15 PDT
**Session focus:** Performance optimization (site was freezing browsers)
**Last file modified:** css/styles.css, js/hero-particles.js, js/main.js, js/service-visuals.js, index.html
**Branch:** main (deployed to Vercel at dxn.is)

## Decisions Made

1. **Performance root cause:** Compounding GPU/CPU load from 4+ simultaneous animation layers in the hero section. The worst offender was mouse-reactive bloom gradient updates that forced the browser to re-composite a full-viewport `blur(45px)` element on every mousemove event.

2. **Fixes applied across 3 commits** (all deployed):
   - `3f95b5f` - Hero particles: IntersectionObserver pause, 500->300 count, 30fps cap, scroll-idle skip on service sketches, blur radius reductions
   - `a638b14` - Removed mouse-reactive bloom JS entirely, removed mix-blend-mode: difference from cursor, removed p.ADD blend from particles, removed mix-blend-mode: overlay from hero grain
   - `2f07a0d` - Reimplemented "facilitation" underline as CSS pseudo-element (old SVG approach was broken/distorted)

3. **Underline decision:** Brent asked which word to underline. I recommended "facilitation" because it's the differentiating claim. He agreed. New implementation uses a `::after` pseudo-element with `scaleX` animation (draws left-to-right on load). Zero GPU overhead.

4. **What was removed vs preserved:**
   - Removed: mouse-reactive bloom gradient positions, additive blend mode, mix-blend-mode on cursor and grain
   - Preserved: 36s CSS bloom drift animation, particle mouse attraction/orbit, firefly glow, all service/framework sketches, grainy overlays (without blend modes), custom cursor (without blend mode)

## Current State

- All changes deployed to production via Vercel
- Brent confirmed "much better" after second round of fixes
- No visual QA pass done yet on the new underline across viewports

## Files Touched

- `css/styles.css` - blur reductions, will-change hints, removed blend modes, new underline CSS
- `js/hero-particles.js` - visibility observer, particle count reduction, framerate cap, removed ADD blend
- `js/main.js` - removed hero bloom mousemove handler
- `js/service-visuals.js` - scroll-idle skip on all three sketches
- `index.html` - removed SVG underline markup, added span wrapper for CSS underline
- `PROJECT_STATUS.md` - updated with performance section

## Next Steps

- Visual QA on new underline across desktop/tablet/mobile
- Browser smoke test on iOS Safari and Android Chrome (was already pending)
- Check if performance is now acceptable on lower-powered machines
