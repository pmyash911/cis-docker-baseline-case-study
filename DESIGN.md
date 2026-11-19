# DESIGN.md — Yalgar Consulting site

Rules for every page, component, PDF and social asset in this repository.
If something is not written here, do not invent a new pattern: use the closest
existing token or leave the element out.

## Hard constraints (non-negotiable)

1. **No gradients.** Solid colours only. No `bg-gradient-*`, no CSS `linear-gradient`,
   no radial washes, no glow effects.
2. **No dark backgrounds.** The page background is warm paper
   (`#fcf9f8` / `surface-container-lowest`) everywhere. Navy `primary` is a *text,
   rule and button* colour only — never a section background, never a card fill,
   never a hero band.
3. **No icons.** No icon libraries, no inline SVGs as pictograms, no arrow glyph
   characters, no checkmark glyphs, no emoji anywhere in UI, copy, metadata or
   filenames. Express affordances with words or with a 1px rule. (The only
   permitted non-typographic marks are the brand lockup wordmarks in
   `public/brand/` and the favicon.)
4. **No emoji.** Not in headings, not in social copy, not in commit messages that
   end up in the UI, not in generated PDFs.
5. **No stock imagery.** No photography, no illustration, no abstract artwork, no
   generated pictures of people or objects. The social preview image is
   typographic.

## Typography

- Display and headings: **Source Serif 4** (`font-display`, `font-headline-*`),
  weights 600, tight tracking (`-0.015em` to `-0.02em`).
- Body, labels, captions, tables: **Source Sans 3** (`font-body-*`,
  `font-label-md`, `font-caption`).
- Sentence-case headings. Uppercase only for small section labels
  (`font-caption uppercase tracking-wider`), never for headings or body.
- Body copy measure: 68–72 characters. No justified text.

## Colour

Use only tokens in `tailwind.config.ts`:

| Role | Token | Value |
| --- | --- | --- |
| Page background | `surface-container-lowest` | `#ffffff` |
| Section background | `surface` / `surface-container-low` | `#fcf9f8` / `#f6f3f2` |
| Body text | `on-surface` | `#1c1b1b` |
| Secondary text | `on-surface-variant` | `#43474e` |
| Muted text / metadata | `outline` | `#74777f` |
| Hairlines and table borders | `outline-variant` | `#c4c6cf` |
| Primary brand | `primary` | `#00152d` |
| Link / active accent | `secondary` | `#396090` |

No additional colours. Status may be expressed with the tokens above plus
`error` (`#ba1a1a`) for FAIL text only — never as a filled badge.

## Layout

- Content max width `1120px`, page margin `1rem` / `2rem` / `3rem`
  (mobile / tablet / desktop).
- Section rhythm `3rem` mobile, `6rem` desktop.
- Structure with **1px hairlines** (`border-outline-variant`) and whitespace.
  No cards with shadows, no rounded floating panels, no dividers made of
  characters or images.
- Corners: `rounded` (0.25rem) is the default and the maximum for interactive
  elements. Tables and rules are square.
- No box shadows except none at all. Interactive state is conveyed by colour,
  underline and 1px border changes.

## Interaction

- One primary button per view (`variant="default"`); secondary actions are
  underlined text links.
- Focus is always visible: 2px `secondary` outline, 2px offset.
- Hover is a colour or underline change only — no motion, no scale, no shadow.
- Honour `prefers-reduced-motion`; the only permitted animation is the short
  mobile-panel transition that already exists.

## Voice

- **First person singular.** I, my, me — not "we" or "the firm", and never the
  detached third person "Yalgar Consulting delivers…" in body copy.
  (`Yalgar Consulting LLC` is still the legal name in the footer, metadata and
  invoice-adjacent copy.)
- Plain language. Short declarative sentences. No corporate abstraction
  ("sovereign", "institutional", "synergy", "leverage", "robust", "best-in-class").
- Never invent a fact. If a fact is not supplied — dates, degrees, locations,
  certifications, clients, metrics — write `[FILL IN]` and leave it visible.
  Do not soften it into a vague claim.
- Numbers must be traceable to `docs/evidence/` or `artifacts/`. If the evidence
  changes, the number changes.

## Accessibility

- Body text contrast ≥ 4.5:1, large headings ≥ 3:1.
- Every interactive element reachable by keyboard, with a visible focus ring.
- Images: none, by rule. If one is ever added it needs real `alt` text.
- Headings strictly ordered (`h1` once per page, then `h2`, `h3`).

## Assets

| Asset | Rule |
| --- | --- |
| Brand lockup | Text-only `public/brand/*.svg`, navy on transparent |
| Favicon | `app/icon.svg`, navy mark |
| Social preview | `public/og.png`, 1200×630, typographic: paper background, navy rule, serif headline, Source Sans footnote |
| Resume | `public/resume.pdf`, generated from `scripts/make-resume.mjs`, no photo |
| Dossier PDF | `docs/dossier/container-environment-baseline.pdf`, same type and palette as the site — no colour blocks, no iconography, no marketing imagery |

## Anti-patterns (reject in review)

Dark hero bands, gradient text, glassmorphism, drop shadows, pill badges with
status colours, icon+label pairs, emoji in headings, stock photography,
"trusted by" logo walls, carousels, animated counters, invented metrics.
