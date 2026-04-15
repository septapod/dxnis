# dxn.is: Project Status

## Current State
**Launched to production as dxn.is on 2026-04-14.** New site replaces the prior design at the root. Vanilla HTML/CSS/JS with p5.js animations, Vercel deploy from `septapod/dxnis` (main branch). Old site archived in git history. `feat/site-transformation` branch kept locally as the full source of truth but not pushed to origin.

## Recent Changes

### Launch Day (2026-04-14 through 2026-04-15): COMPLETE

Full rebuild shipped. The work was split across two commits on main: one to promote feat/site-transformation's root index.html to main, and a series of follow-on fixes to copy, icons, and mobile behavior.

**Content and copy**
- Hero positioning claim: "Strategic facilitation for credit unions in the age of agentic AI." Subline: "I work with credit union CEOs and boards on strategy that holds up when it meets reality."
- Ray Springsteen's outcome quote (Abound CU) moved to hero pull quote, removed from carousel.
- Testimonial carousel slimmed to four: Rebekah Henry (MCUL), Mary Beth Spuck (Resource One), Ronaldo Hardy (Balance Financial Wellness), George Hofheimer (Hofheimer Strategy Advisors). Indicator dots reduced from 5 to 4.
- Rebekah Henry testimonial corrected to her full original quote: "Brent was fantastic! I really appreciate how he tailored his presentation for our event, and our audience truly enjoyed it." Source: forwarded email from Shari Storm, 2026-03-31.
- George Hofheimer quote replaced with the sharper Dec 2023 referral to Abound CU: "I would unequivocally recommend him as a facilitator and guide for your strategic discussions."
- Bio rewritten. Old: "twenty years building systems where communities solve their own problems." New: "twenty years working alongside communities and cooperatives, co-designing the systems, gatherings, and tools they use to do their work together."
- Bio now includes: The Cooperative Trust sentence framed around the founding crash of the industry's biggest event and Filene still running the program today (no trumped-up 900-member / three-continent framing). Filene i3 Innovation program follow-on sentence. UN section reordered with innovation lab first, then Innovation Network co-chair, plus a new machine-learning beat: "One of our projects used machine learning to turn real-time public data into crisis response planning for humanitarian workers." Project Fortis and OCHA are deliberately not named.
- Coaching service description rewritten from the "hardest parts are rarely the ones on the agenda" line to a direct two-sentence version: "A regular, confidential thinking partner for credit union CEOs and senior leaders. Each conversation is built around the decisions in front of you."
- Workshops sentence: "You walk out with tools and ideas you can use the next morning" (was "something you can use").
- Framework kicker stayed as "What I've found" after exploring alternatives.
- Category 6 Consulting link in the bio now uses the `about-newsletter-link` class so it matches the brand gold instead of browser-default blue.

**Mobile responsiveness**
- `js/framework-visuals.js`: each sketch branches on `canvas.width < 600` in `setup()`. Hidden Misalignment drops from 12 arrows in a 4-column layout to 6 arrows in 3 columns. Plans Without Choices drops from 8x6 grid to 5x4. Tested Assumptions drops from 80 trunk points / 4 fork points to 50 / 3. Stroke weights and padding scale up for legibility.
- `js/service-visuals.js`: alignment network drops from 14 to 9 nodes on mobile, radial pulse from 6+10 to 5+7. Gravitational pair already scales off min(w,h). Mobile progress is now read from each panel's bounding rect via a per-container IntersectionObserver instead of the desktop pinned-scroll state.
- `css/styles.css` mobile services block: `.service-visual` is no longer `display: none` at 768px. It now stacks above the text at `order: 1`, `aspect-ratio: 16/11`, `max-height: 260px`, canvas forced to fill.

**Infrastructure**
- `/new` staging directory deleted. The site lives at the root now.
- App icons regenerated as crisp white logo on solid black. Source: leftmost 61x61 crop of `assets/dxnlogo.png`, composited through its alpha channel at each output size with proper padding. Fixes WhatsApp/Telegram/iMessage link previews that had been showing a near-invisible white-on-white logo.
- `llms.txt` stripped of placeholder sections (core beliefs, methodology, named clients list) and synced to the live site copy. Kept the "Three conditions for strategy that holds up" framework so agents can speak to the POV. Added Category 6 speaking representation.

**Infrastructure changes outside the repo**
- Global MEMORY.md "Evenings are not work time" rule removed. It had been accidentally captured from an offhand comment.
- New SessionStart hook at `~/.claude/hooks/session-time-context.sh`, wired into `~/.claude/settings.json`. Injects local date, day of week, time, and timezone into every new Claude Code session so agents always know what time it is.

## What's Left

- Beliefs section content (commented out in index.html, waiting on interview answers Q14-20).
- About/bio refinement pass (waiting on interview answers Q26-30).
- "How I work" section phases 2 and 3 (phase 1 drafted only).
- Browser smoke test on iOS Safari and Android Chrome. Mobile sketches and stacked service panels should be verified in real devices before claiming done.
- Confirm link preview regeneration in WhatsApp/Telegram/iMessage (previews are cached; may need to paste the link in a fresh chat or use a cache buster).

## Operational Notes

- Source of truth for tokens: `css/dsl-tokens.css`. Synced to DESIGN.md via `node scripts/sync-design-md.mjs`. design.dxn.is CDN pulls the same file.
- Bio copy content source of truth: https://www.proofeditor.ai/d/vl4h3k8k (interview extractions and positioning).
- DESIGN.md is currently v3.0. Update it with every design change per standing rule.
- `feat/site-transformation` branch is local-only, ~96 commits ahead of its origin. Do not push it.
