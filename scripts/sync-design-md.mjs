#!/usr/bin/env node
/**
 * sync-design-md.mjs
 *
 * Parses css/dsl-tokens.css and regenerates the token sections of DESIGN.md
 * between marker comments. Manual prose sections are untouched.
 *
 * Usage:
 *   node scripts/sync-design-md.mjs
 *
 * Markers expected in DESIGN.md:
 *   <!-- DSL:COLORS:BEGIN --> ... <!-- DSL:COLORS:END -->
 *   <!-- DSL:SPACING:BEGIN --> ... <!-- DSL:SPACING:END -->
 *   <!-- DSL:RADII:BEGIN --> ... <!-- DSL:RADII:END -->
 *
 * Source of truth: css/dsl-tokens.css
 * Target: DESIGN.md
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const TOKENS_PATH = resolve(REPO_ROOT, 'css/dsl-tokens.css');
const DESIGN_PATH = resolve(REPO_ROOT, 'DESIGN.md');

// Semantic role hints for tokens (manual knowledge that lives alongside parsed values)
const ROLE_HINTS = {
  '--color-bg': 'Page background',
  '--color-surface': 'Cards, panels',
  '--color-surface-elevated': 'Modals, dropdowns',
  '--color-surface-hover': 'Hover states on surfaces',
  '--color-border': 'Default borders',
  '--color-border-hover': 'Hover and focus borders',
  '--color-text': 'Primary text, headings',
  '--color-text-body': 'Body paragraphs',
  '--color-text-dim': 'Captions, secondary text',
  '--color-text-muted': 'Tertiary, timestamps, disabled',
  '--color-primary': 'Primary interactive',
  '--color-accent': 'Accent highlight',
  '--color-accent-coral': 'Coral accent',
  '--color-accent-teal': 'Teal accent',
  '--color-alert': 'Alerts and errors',
  '--color-muted': 'Muted text',
  '--brand-gold': 'Hero highlight, primary accent, default button fill',
  '--brand-coral': 'Alerts, warnings, gradient endpoints',
  '--brand-teal': 'Primary interactive, link hover, progress indicators',
  '--radius-sm': 'Inputs, badges, small cards',
  '--radius-md': 'Default cards, panels',
  '--radius-lg': 'Modal, large cards',
  '--radius-xl': 'Hero sections, major features',
  '--radius-full': 'Pills, avatars',
  '--space-1': 'Tight element gaps',
  '--space-2': 'Paragraph spacing',
  '--space-3': 'Grid gap, section padding',
  '--space-4': 'Between paragraphs and headings',
  '--space-6': 'Large component gaps',
  '--space-8': 'Section internal padding',
  '--space-10': 'Between content blocks',
  '--space-12': 'Major section vertical padding',
  '--space-16': 'Extra-generous section rhythm',
};

function role(token) {
  return ROLE_HINTS[token] || '';
}

function parseBlock(css, selector) {
  // Find the block for this selector. Selector may be a raw string or regex-ish.
  const escaped = selector.replace(/[-[\]{}()*+?.\\^$|#\s]/g, '\\$&');
  const re = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, 'i');
  const match = css.match(re);
  if (!match) return {};
  const body = match[1];
  const vars = {};
  const varRe = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = varRe.exec(body)) !== null) {
    vars[m[1]] = m[2].trim();
  }
  return vars;
}

function renderColorsSection(tokens) {
  const root = tokens.root;
  const dark = tokens.dark;
  const light = tokens.light;

  const brandTokens = ['--brand-gold', '--brand-coral', '--brand-teal'];
  const themeTokens = [
    '--color-bg', '--color-surface', '--color-surface-elevated', '--color-surface-hover',
    '--color-border', '--color-border-hover', '--color-text', '--color-text-body',
    '--color-text-dim', '--color-text-muted', '--color-primary', '--color-accent',
    '--color-accent-coral', '--color-accent-teal', '--color-alert'
  ];

  let out = '';
  out += '<!-- This section is auto-generated from css/dsl-tokens.css by scripts/sync-design-md.mjs. Do not edit by hand. -->\n\n';
  out += '### Brand colors (universal, theme-independent)\n\n';
  out += '| Name | Hex | Role |\n';
  out += '|------|-----|------|\n';
  for (const t of brandTokens) {
    if (root[t]) {
      const name = t.replace('--brand-', '').replace(/^\w/, c => c.toUpperCase());
      out += `| ${name} | \`${root[t]}\` | ${role(t)} |\n`;
    }
  }
  out += '\nRetired: indigo (`#6366f1`). Teal replaced it across the system. Do not reintroduce indigo without an explicit decision.\n\n';

  out += '### Dark theme (default)\n\n';
  out += '| Token | Hex | Usage |\n';
  out += '|-------|-----|-------|\n';
  for (const t of themeTokens) {
    if (dark[t]) {
      out += `| \`${t}\` | \`${dark[t]}\` | ${role(t)} |\n`;
    }
  }

  out += '\n### Light theme\n\n';
  out += '| Token | Hex | Usage |\n';
  out += '|-------|-----|-------|\n';
  for (const t of themeTokens) {
    if (light[t]) {
      out += `| \`${t}\` | \`${light[t]}\` | ${role(t)} |\n`;
    }
  }

  out += '\nLight theme brand colors are darkened from their universal values to maintain WCAG contrast ratios on a light background. Dark theme uses the pure brand values.\n';

  return out;
}

function renderSpacingSection(tokens) {
  const root = tokens.root;
  const spaceTokens = [
    '--space-1', '--space-2', '--space-3', '--space-4', '--space-6',
    '--space-8', '--space-10', '--space-12', '--space-16'
  ];

  let out = '';
  out += '<!-- This section is auto-generated from css/dsl-tokens.css by scripts/sync-design-md.mjs. Do not edit by hand. -->\n\n';
  out += '| Token | Value | Typical use |\n';
  out += '|-------|-------|-------------|\n';
  for (const t of spaceTokens) {
    if (root[t]) {
      out += `| \`${t}\` | ${root[t]} | ${role(t)} |\n`;
    }
  }
  return out;
}

function renderRadiiSection(tokens) {
  const root = tokens.root;
  const radiusTokens = ['--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-full'];

  let out = '';
  out += '<!-- This section is auto-generated from css/dsl-tokens.css by scripts/sync-design-md.mjs. Do not edit by hand. -->\n\n';
  out += '| Token | Size | Usage |\n';
  out += '|-------|------|-------|\n';
  for (const t of radiusTokens) {
    if (root[t]) {
      out += `| \`${t}\` | ${root[t]} | ${role(t)} |\n`;
    }
  }
  return out;
}

function replaceSection(md, key, content) {
  const beginRe = new RegExp(`<!-- DSL:${key}:BEGIN -->`);
  const endRe = new RegExp(`<!-- DSL:${key}:END -->`);

  const beginMatch = md.match(beginRe);
  const endMatch = md.match(endRe);

  if (!beginMatch || !endMatch) {
    console.error(`[sync-design-md] Missing markers for ${key} in DESIGN.md. Expected both BEGIN and END comments.`);
    return md;
  }

  const beginIdx = beginMatch.index + beginMatch[0].length;
  const endIdx = endMatch.index;

  if (endIdx < beginIdx) {
    console.error(`[sync-design-md] Marker order inverted for ${key}. END appears before BEGIN.`);
    return md;
  }

  return md.slice(0, beginIdx) + '\n' + content + '\n' + md.slice(endIdx);
}

async function main() {
  const css = await readFile(TOKENS_PATH, 'utf8');
  const md = await readFile(DESIGN_PATH, 'utf8');

  const tokens = {
    root: parseBlock(css, ':root'),
    dark: parseBlock(css, '[data-theme="dark"], .dark, :root'),
    light: parseBlock(css, '[data-theme="light"], .light'),
  };

  const colorsContent = renderColorsSection(tokens);
  const spacingContent = renderSpacingSection(tokens);
  const radiiContent = renderRadiiSection(tokens);

  let updated = md;
  updated = replaceSection(updated, 'COLORS', colorsContent);
  updated = replaceSection(updated, 'SPACING', spacingContent);
  updated = replaceSection(updated, 'RADII', radiiContent);

  if (updated === md) {
    console.log('[sync-design-md] No changes.');
    return;
  }

  await writeFile(DESIGN_PATH, updated, 'utf8');
  console.log('[sync-design-md] DESIGN.md synced from css/dsl-tokens.css.');
  console.log(`  - Colors: ${Object.keys(tokens.root).filter(k => k.startsWith('--brand-')).length} brand tokens + ${Object.keys(tokens.dark).filter(k => k.startsWith('--color-')).length} dark + ${Object.keys(tokens.light).filter(k => k.startsWith('--color-')).length} light`);
  console.log(`  - Spacing: ${Object.keys(tokens.root).filter(k => k.startsWith('--space-')).length} tokens`);
  console.log(`  - Radii: ${Object.keys(tokens.root).filter(k => k.startsWith('--radius-')).length} tokens`);
}

main().catch(err => {
  console.error('[sync-design-md] Error:', err);
  process.exit(1);
});
