---
title: "feat: Expand site content architecture to communicate AI consulting work"
type: feat
status: active
date: 2026-03-25
---

# Expand Site Content Architecture to Communicate AI Work

## Overview

The dxn.is site is a minimal shell that doesn't reflect the AI strategy, speaking, and education work Brent has been doing for the past year. The site needs expanded content architecture to communicate this work. All changes build in sandbox (`~/dev/dxnis-sandbox/`).

## Problem Frame

A visitor arriving from the MCUL talk, the AI for FIs newsletter, or an Anthropic partnership referral sees a headline about facilitation, three one-sentence service cards, and a four-sentence bio. No evidence of AI work. No description of what an engagement looks like. No framing of the newsletter as expertise evidence. The site undersells by omission.

## Requirements Trace

- R1. Facilitation identity remains the foundation. AI is terrain, not a rebrand.
- R2. No portfolio items, named clients, or specific engagements referenced.
- R3. All copy passes /brent-voice and /writing-quality rules.
- R4. Keep existing visual identity (Satoshi, dark palette, Swiss grid, particle hero).
- R5. Schema.org structured data optimized for agent discovery.
- R6. All work grounded in things Brent has actually done. No invented offerings.
- R7. Build in sandbox at `~/dev/dxnis-sandbox/index.html`.

## Scope Boundaries

- No visual redesign (fonts, colors, grid system stay)
- No new JavaScript features or animations
- No portfolio/case study section
- No new CSS files (extend existing styles.css)
- No changes to particle hero, testimonials, contact form, or closing quote

## Key Technical Decisions

- **Expand in place**: Modify existing sections rather than adding many new sections. The site's strength is flow, not density.
- **"How I Work" as engagement arc**: 3-4 steps showing Discovery > Design > Facilitate > Follow-through. AI shows up as context within steps, not as a separate service. This is what Brent actually does in every engagement.
- **Service cards expand to 2-3 sentences each**: Enough to picture the work without becoming a brochure.
- **Newsletter reframed as credibility proof**: 50+ weekly issues of AI analysis is the strongest evidence on the site.
- **Bio gets one AI sentence**: Builder-practitioner signal after the Filene/UN/SU line.
- **Schema.org gets full AI keyword treatment**: Invisible to humans, critical for agent discovery.

## Implementation Units

- [ ] **Unit 1: Expand service card copy**

**Goal:** Replace one-line service descriptions with 2-3 sentence descriptions that include AI context.

**Requirements:** R1, R2, R3, R6

**Files:**
- Modify: `~/dev/dxnis-sandbox/index.html` (lines 318-331, service cards)

**Approach:**
- Speaking: mention AI strategy and adoption as a topic area
- Facilitation: describe what the session produces, mention AI governance as one context
- Advisory: mention workshops where teams get hands-on with agentic AI
- Apply brent-voice rules: no jargon, active voice, sounds like a person
- No named talks, no named clients

**Verification:**
- Each card has 2-3 sentences
- AI mentioned in each without dominating
- Passes writing-quality checklist

- [ ] **Unit 2: Add "How I Work" section**

**Goal:** New section between services and testimonials showing the engagement arc.

**Requirements:** R1, R3, R4, R6

**Files:**
- Modify: `~/dev/dxnis-sandbox/index.html` (insert after services section)
- Modify: `~/dev/dxnis-sandbox/css/styles.css` (add styles for new section)

**Approach:**
- 4 steps: Discovery, Design, Facilitate, Follow-through
- Each step: short heading + 2-3 sentence description
- AI appears naturally in 1-2 steps (Design and Facilitate most likely) as context
- Visual treatment: numbered or labeled steps, consistent with existing card styling
- Use existing grid system, section-light background to alternate from services
- Keep it compact. Not a process diagram. Just enough to picture the work.

**Patterns to follow:**
- Existing `.service-card` styling for card treatment
- `.section-light` class for background alternation
- Grid-12 layout system

**Verification:**
- Section renders between services and testimonials
- Responsive on mobile
- AI mentioned without being the headline of any step

- [ ] **Unit 3: Reframe newsletter section**

**Goal:** Reposition newsletter from signup widget to credibility proof.

**Requirements:** R1, R3, R6

**Files:**
- Modify: `~/dev/dxnis-sandbox/index.html` (newsletter section, lines 596-629)

**Approach:**
- Lead with expertise signal: "Every week, I read through dozens of sources..."
- Newsletter name and signup form stay
- Copy already drafted in this session, apply it

**Verification:**
- Newsletter reads as evidence of ongoing AI expertise
- Signup form still works
- No dramatic countdowns, no jargon

- [ ] **Unit 4: Update bio with AI builder signal**

**Goal:** Add one sentence to bio establishing AI practitioner credibility.

**Requirements:** R1, R2, R3, R6

**Files:**
- Modify: `~/dev/dxnis-sandbox/index.html` (about section, lines 582-593)
- Modify: `~/dev/dxnis-sandbox/index.html` (photo-hero intro, line 576)

**Approach:**
- Bio: one new sentence after Filene/UN/SU line about AI work + building own tools
- Photo-hero: add "including AI governance and adoption" to existing description
- Copy already drafted in this session

**Verification:**
- Bio reads as natural evolution, not a pivot
- No DXN OS named, no specific clients

- [ ] **Unit 5: Update hero subline**

**Goal:** Add one sentence to hero supporting copy introducing AI as terrain.

**Requirements:** R1, R3

**Files:**
- Modify: `~/dev/dxnis-sandbox/index.html` (hero section, line 291-292)

**Approach:**
- Append one sentence: "Lately, much of that work involves agentic AI, where the stakes are real and the decisions can't wait."
- Keep existing headline and "I run the process" line
- Copy already drafted in this session

**Verification:**
- Hero still reads facilitation-first
- AI sentence doesn't dominate

- [ ] **Unit 6: Update meta/SEO and Schema.org for agent discovery**

**Goal:** Make the site discoverable by AI agents searching for credit union AI consultants.

**Requirements:** R5

**Files:**
- Modify: `~/dev/dxnis-sandbox/index.html` (head section, lines 27-213)

**Approach:**
- Page title: add "& AI Strategy"
- Meta description: add AI strategy language, facilitation first
- OG/Twitter cards: match page title
- Schema.org Person: add "Agentic AI", "AI Strategy", "AI Governance" to knowsAbout
- Schema.org services: update descriptions to match card copy
- Schema.org ProfessionalService: add AI Strategy and AI Governance to serviceType
- Kill fake SearchAction and aggregateRating from previous agent's work
- Most of this already drafted in this session

**Verification:**
- All Schema.org validates (test with Google Rich Results validator)
- No fabricated ratings or non-existent features
- Agent querying "credit union AI consultant" would find relevant structured data

## Risks & Dependencies

- **CSS for "How I Work" section**: Only new CSS needed. Keep it minimal, follow existing card patterns.
- **Copy quality**: All copy must pass brent-voice and writing-quality checklists. Most already drafted and reviewed in this session.
- **Sandbox divergence**: Sandbox already has structural differences from live site (missing hamburger menu, missing dsl-tokens.css link). Plan operates on sandbox as-is.

## Sources & References

- Previous AI copy plan: `~/.claude/plans/quizzical-meandering-mango.md`
- Current live site: `~/dev/dxnis/index.html`
- Current sandbox: `~/dev/dxnis-sandbox/index.html`
- Brent voice skill: `~/.claude/skills/brent-voice/SKILL.md`
- Writing quality skill: `~/.claude/skills/writing-quality/SKILL.md`
