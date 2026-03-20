# Frontend Redesign — Implementation Plan
### Filipino Native Delicacies Vibe
**Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React, Zustand, React Hook Form, Zod

---

## Overview

This plan is broken into **6 phases**. Each phase must be completed and verified before moving to the next. No functional code is touched at any point — only the visual layer.

---

## Phase 1 — Audit & Inventory
> **Goal:** Understand what exists before changing anything.

- [x] **1.1** List every page/route in the app
- [x] **1.2** List every shared/reusable component (buttons, inputs, cards, modals, toasts, badges, etc.)
- [x] **1.3** Identify the current styling approach — inline Tailwind classes, `@apply` blocks, or separate CSS files
- [x] **1.4** Flag any styles that JS/TS logic depends on:
  - `hidden` / `block` toggled by state
  - `absolute` / `fixed` / `z-*` used for dropdowns, modals, tooltips
  - Transition classes toggled programmatically
- [x] **1.5** Note all existing color values, font families, and spacing patterns currently in use
- [x] **1.6** Take **before screenshots** of every page for comparison later

---

## Phase 2 — Design System Setup
> **Goal:** Establish the single source of truth for all visual tokens before writing a single component style.

### 2.1 — Font Import
- [x] Add Google Fonts import to the root CSS file or `index.html`:
  - `Playfair Display` — 700, 900
  - `Lora` — 400, 500
  - `DM Sans` — 400, 500

### 2.2 — Tailwind v4 `@theme` Block
- [x] Add the following to your base CSS file:

```css
@theme {
  --color-kape:   #3B1F0E;   /* deep coffee brown — primary dark */
  --color-latik:  #7C4A1E;   /* toasted coconut — primary mid */
  --color-pandan: #4A7C59;   /* pandan leaf green — accent */
  --color-gatas:  #F5ECD7;   /* fresh coconut milk — background */
  --color-asukal: #FDF6E3;   /* raw sugar white — surface */
  --color-pulot:  #C2852A;   /* golden syrup — highlight / CTA */
  --color-ube:    #6B4FA0;   /* ube purple — secondary accent */

  --font-display: 'Playfair Display', serif;
  --font-body:    'Lora', serif;
  --font-label:   'DM Sans', sans-serif;

  --radius-card:  1rem;
  --radius-btn:   0.5rem;
  --shadow-warm:  0 4px 24px rgba(59, 31, 14, 0.12);
}
```

### 2.3 — Global Base Styles
- [x] Set default background to `--color-gatas` on `body`
- [x] Set default font to `--font-body` on `body`
- [x] Set default text color to `--color-kape`
- [x] Add a subtle noise/grain texture overlay to the body background (SVG filter or CSS pseudo-element)
- [x] Set `h1–h6` to use `--font-display`
- [x] Set buttons, labels, nav items to use `--font-label`

### 2.4 — Verify Tokens
- [x] Verify colors, fonts, and spacing values on existing live routes without adding a temporary route
- [x] Confirm all tokens render correctly in the browser before proceeding

---

## Phase 3 — Layout Shells
> **Goal:** Restyle the structural containers of the app — the frame everything lives inside.

### 3.1 — Navigation / Header
- [x] Background: `bg-kape` or `bg-latik` with warm shadow
- [x] Logo/brand text: `font-display` in `text-asukal`
- [x] Nav links: `font-label` uppercase tracking, `text-gatas` with `hover:text-pulot` transition
- [x] Mobile menu: warm overlay background, smooth slide-in animation
- [x] Active link indicator: underline or left border in `--color-pulot`

### 3.2 — Sidebar (if applicable)
- [x] Background: `bg-asukal` with `border-r border-latik/20`
- [x] Section headers: `font-label` uppercase, `text-latik`
- [x] Active item: `bg-gatas` with `border-l-2 border-pulot`

### 3.3 — Page Wrapper / Main Content Area
- [x] Background: `bg-gatas` with grain texture
- [x] Max-width container: centered, with consistent horizontal padding
- [x] Section dividers: `border-t border-latik/20` or decorative SVG leaf/weave element

### 3.4 — Footer
- [x] Background: `bg-kape`
- [x] Text: `text-gatas/80`
- [x] Links: `text-gatas hover:text-pulot`
- [x] Add a warm top border: `border-t border-latik/40`

---

## Phase 4 — Shared Components
> **Goal:** Restyle every reusable UI component consistently using the design system.

### 4.1 — Buttons
- [x] **Primary:** `bg-pulot text-asukal font-label tracking-wide rounded-btn shadow-warm hover:brightness-110 hover:shadow-lg transition-all duration-300`
- [x] **Secondary:** `border border-latik text-latik bg-transparent hover:bg-latik/10 rounded-btn font-label tracking-wide transition-all duration-300`
- [x] **Ghost/Link:** `text-pandan underline-offset-4 hover:underline font-label`
- [x] **Destructive:** `bg-red-800/80 text-asukal` (muted, not harsh red)
- [x] All buttons: consistent padding, `font-label`, no default browser styles

### 4.2 — Form Inputs (React Hook Form)
- [x] Base input: `bg-asukal border border-latik/40 rounded-card text-kape font-body placeholder:text-latik/50`
- [x] Focus ring: `focus:outline-none focus:ring-2 focus:ring-pandan/60 focus:border-pandan`
- [x] Labels: `font-label text-xs uppercase tracking-widest text-latik`
- [x] Error state: `border-red-700/60 focus:ring-red-700/40`
- [x] Error message: `text-red-700/80 text-xs font-label mt-1`
- [x] Helper text: `text-latik/60 text-xs font-body`
- [x] Textarea: same as input with `resize-y`
- [x] Select: custom styled, warm chevron icon from Lucide

### 4.3 — Cards
- [x] Container: `bg-asukal rounded-card border border-latik/20 shadow-warm`
- [x] Hover: `hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`
- [x] Card title: `font-display text-kape`
- [x] Card body: `font-body text-kape/80`
- [x] Card footer: `border-t border-latik/10 pt-3`

### 4.4 — Badges & Tags
- [x] Default: `bg-gatas text-latik border border-latik/30 font-label text-xs tracking-wide rounded-full px-3 py-1`
- [x] Accent: `bg-pulot/10 text-pulot border border-pulot/30`
- [x] Green/success: `bg-pandan/10 text-pandan border border-pandan/30`

### 4.5 — Modals & Dialogs
- [x] Overlay: `bg-kape/60 backdrop-blur-sm`
- [x] Panel: `bg-asukal rounded-card shadow-warm border border-latik/20`
- [x] Header: `font-display text-kape border-b border-latik/20`
- [x] Entrance animation: fade-in + scale-up (`animate-in` or custom CSS keyframe)

### 4.6 — Toasts / Notifications
- [x] Base: `bg-asukal border-l-4 shadow-warm font-body text-kape rounded-r-card`
- [x] Success: `border-l-pandan`
- [x] Error: `border-l-red-700`
- [x] Info: `border-l-ube`
- [x] Entrance: slide in from right with fade

### 4.7 — Icons (Lucide React)
- [x] Set default `strokeWidth={1.5}` across all icon usages
- [x] Primary icons: `text-latik`
- [x] CTA/accent icons: `text-pulot`
- [x] Success icons: `text-pandan`
- [x] Standardize icon sizes: `size-4` for inline, `size-5` for buttons, `size-6` for section headers

---

## Phase 5 — Page-Level Styling
> **Goal:** Apply the design system to each individual page with context-appropriate layouts.

### 5.1 — For Each Page:
- [x] Replace background colors with warm tokens
- [x] Update all headings to `font-display`
- [x] Update all body/description text to `font-body`
- [x] Update all labels, captions, metadata to `font-label`
- [x] Add entrance animations to content sections (staggered `animation-delay` on cards/list items)
- [x] Add section dividers between major content blocks
- [x] Ensure consistent spacing using base-8 scale (`8px`, `16px`, `24px`, `32px`, `48px`, `64px`)

### 5.2 — Hero / Banner Sections
- [x] Large `font-display` heading, expressive sizing (`text-5xl` or larger)
- [x] Warm gradient or textured background
- [x] CTA button in `bg-pulot`
- [x] Optional: decorative leaf or weave SVG element as background accent

### 5.3 — Product / Item Grids
- [x] Consistent card sizing using the card styles from Phase 4.3
- [x] Hover lift effect on each card
- [x] Product name: `font-display`
- [x] Price / metadata: `font-label text-pulot`
- [x] Description: `font-body text-kape/70`

### 5.4 — Empty States
- [x] Warm illustration or icon in `text-latik/40`
- [x] Message: `font-display text-latik`
- [x] Sub-message: `font-body text-latik/60`

### 5.5 — Loading States
- [x] Skeleton loaders: `bg-latik/10 animate-pulse rounded-card`
- [x] Spinner: `text-pulot` colored, smooth rotation

---

## Phase 6 — Polish & QA
> **Goal:** Ensure consistency, accessibility, and visual quality across the entire app.

### 6.1 — Visual Consistency Check
- [ ] Every page uses only tokens from the `@theme` block — no hardcoded hex values
- [ ] Font usage is consistent: display for headings, body for paragraphs, label for UI chrome
- [ ] Spacing follows the base-8 scale throughout
- [ ] All interactive elements have visible hover and focus states

### 6.2 — Accessibility Check
- [ ] All text meets WCAG AA contrast ratio (use a contrast checker tool)
- [ ] Focus rings are visible on all interactive elements
- [ ] No color is the only indicator of state (add icons or text labels where needed)
- [ ] All existing `aria-*` and `role` attributes are untouched and still correct

### 6.3 — Responsive Check
- [ ] Mobile (`< 640px`): layout stacks cleanly, touch targets are large enough, no overflow
- [ ] Tablet (`640px–1024px`): grid columns reduce gracefully
- [ ] Desktop (`> 1024px`): generous spacing, max-width container centered

### 6.4 — Functional Regression Check
- [ ] All forms still submit correctly (React Hook Form + Zod validation works)
- [ ] All Zustand state changes still trigger correct UI updates
- [ ] All modals, dropdowns, and tooltips open/close correctly
- [ ] All routes/navigation still work
- [x] No TypeScript errors introduced

### 6.5 — Before vs. After Review
- [ ] Take **after screenshots** of every page
- [ ] Compare side-by-side with Phase 1.6 before screenshots
- [ ] Confirm the vibe matches: warm, handcrafted, Filipino delicacies aesthetic
- [ ] Remove the temporary `/design-tokens` dev page if created in Phase 2.4

---

## Checklist Summary

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Audit & Inventory | ✅ Completed |
| Phase 2 | Design System Setup | ✅ Completed |
| Phase 3 | Layout Shells | ✅ Completed |
| Phase 4 | Shared Components | ✅ Completed |
| Phase 5 | Page-Level Styling | 🟡 In progress |
| Phase 6 | Polish & QA | ⬜ Not started |

---

Status note: Phase 5 is complete. Phase 6 is in progress.

## Notes
- Never skip Phase 1 — auditing prevents accidental breakage
- Never skip Phase 2 — components must use tokens, not hardcoded values
- If unsure whether a style is safe to change, **leave it and flag it** for review
- Commit after each phase so changes are reversible
