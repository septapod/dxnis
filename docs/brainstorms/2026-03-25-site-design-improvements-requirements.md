---
date: 2026-03-25
topic: site-design-improvements
---

# DXN.IS Design Improvement Pass

## Problem Frame

The live site at dxn.is has no mobile navigation, no responsive layout stacking, accessibility violations, dead code from commented-out sections, competing design token systems, and performance issues from eagerly loaded dependencies. The site is a consulting practice's primary web presence and needs to work well on every device. This work improves the current site as-is, separate from the pending brand redesign (style tiles) and AI copy integration.

## Phase 1: Mobile-Ready

Make the site functional and usable on phones and tablets.

- R1. Add a mobile navigation menu (hamburger or equivalent) that exposes Services, About, and Contact links below 768px
- R2. Service cards stack to single-column on screens below 768px
- R3. Photo hero section stacks vertically on mobile (image full-width above text)
- R4. Testimonial carousel reduces horizontal padding on mobile so content is readable; arrow buttons overlay content area
- R5. Contact form and Calendly section stack to full-width single-column on mobile
- R6. Newsletter section stacks to single-column on mobile (already partially handled, verify completeness)

## Phase 2: Professional Polish

Fix accessibility, performance, and code quality issues.

### Accessibility
- R7. Restrict custom cursor to mouse pointer input only; never hide the native cursor for touch, pen, or keyboard users
- R8. Fix ARIA violations: add `role="list"` to service card parent, add visible or visually-hidden h2 for testimonial section, fix broken `aria-labelledby` reference
- R9. Make carousel keyboard navigation work without requiring mouse hover (remove the `:hover` gate on arrow key handling)
- R10. Add a visible pause/play button to the auto-rotating testimonial carousel
- R11. Make scroll-triggered section reveals progressive enhancement: content visible by default, animation applied only when JS confirms loaded

### Performance
- R12. Add `defer` attribute to the p5.js script tag (do not rewrite in raw Canvas; keep p5.js but stop it from blocking render)
- R13. Lazy-load Calendly CSS and JS on first click of the "Schedule a Call" button instead of loading eagerly
- R14. Add `width` and `height` attributes to testimonial images; convert to WebP if source files are available
- R15. Reduce logo marquee duplication from 3x to 2x; add `loading="lazy"` to images beyond the first set
- R16. Only run the custom cursor animation loop when the mouse is moving; stop the requestAnimationFrame loop when the cursor follower catches up; skip entirely on touch devices

### Code Quality
- R17. Remove all commented-out HTML sections (What to Expect, Industries, Track Record, Stats) from index.html
- R18. Remove CSS rules that only style the removed sections (~200 lines of dead styles)
- R19. Consolidate design tokens: pick one system (recommend `dsl-tokens.css` as canonical) and update `styles.css` to reference it instead of redeclaring its own variables
- R20. Remove the unused `--font-mono` declaration and the SearchAction schema (site has no search)
- R21. Move the inline `onclick` Calendly handler to main.js with a null check for the Calendly global
- R22. Remove or qualify the AggregateRating schema (4.9/5 from 30 reviews) unless backed by a third-party review source

## Success Criteria

- Site is navigable and readable on a 375px screen (iPhone SE) with no horizontal scroll, no hidden nav links, and no overlapping content
- Lighthouse accessibility score improves (current baseline TBD at start of work)
- No ARIA violations flagged by axe-core on the live page
- No render-blocking scripts in `<head>` except critical CSS
- Zero lines of commented-out HTML sections in index.html; zero CSS rules targeting removed sections

## Scope Boundaries

- NOT changing the visual identity, color palette, typography choices, or brand direction
- NOT applying the sandbox AI copy changes (separate effort)
- NOT rewriting p5.js particle animation in raw Canvas (keep the library, just defer loading)
- NOT adding new sections or content
- NOT touching the style tiles or brand exploration work
- Phase 1 ships independently before Phase 2 begins

## Key Decisions

- **Both phases, staged**: Mobile-ready first (Phase 1), then polish (Phase 2). Each is a shippable unit.
- **Separate from brand redesign**: This improves the current site. Style tiles, AI copy, and visual redesign are a different project.
- **Keep particles and custom cursor**: Both stay. Fix their performance and accessibility issues rather than removing them.
- **dsl-tokens.css is canonical**: The more complete token system wins. styles.css stops redeclaring its own variables.

## Dependencies / Assumptions

- Source testimonial images are available for WebP conversion (if not, skip that part of R14)
- The responsive breakpoints follow the existing 768px convention already used for nav-links

## Outstanding Questions

### Deferred to Planning
- [Affects R1][Needs research] What mobile nav pattern best fits the Swiss grid aesthetic? Hamburger icon, slide-out drawer, or bottom sheet?
- [Affects R12][Technical] Does deferring p5.js cause a visible flash of un-animated hero on first load? May need a CSS fallback background.
- [Affects R19][Technical] How many styles.css rules reference the local tokens vs dsl-tokens.css tokens? Scope the consolidation effort.

## Next Steps

-> `/ce:plan` for structured implementation planning
