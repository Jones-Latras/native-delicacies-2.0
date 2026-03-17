# One-Week Hardening Implementation Plan

> **Project:** J&J Native Delicacies 2.0
> **Date:** March 18, 2026
> **Scope:** Hardening pass only (stability, UX trust, accessibility, tests)

## Guardrails

- **Safe-change rule:**
  - Items `#1-#3` are isolated file edits.
  - Items `#4-#14` are additive/UI-only.
  - No schema changes.
  - No API contract changes.
  - No business-logic rewrites.
- **Risk rule:** Item `#8` (search drawer) touches nav routing/interaction surface and is deferred to Day 7 or post-launch if time-constrained.
- **Merge rule:** Open one PR per day group (or one PR per task if team capacity allows parallel review).

## Priority Mapping

- **P0 - Must fix:** `#1`, `#2`, `#3`, `#4`
- **P1 - High impact:** `#5`, `#6`, `#7`, `#11`, `#14`
- **P2 - Polish:** `#9`, `#10`, `#12`, `#13`, `#15`
- **P3 - Low effort win / defer-safe:** `#8`

## Definition of Done (Global)

- `npm run typecheck` passes.
- `npm run lint` passes (or no new lint noise introduced if baseline has known warnings).
- Relevant E2E specs pass for changed flows.
- No regression in checkout happy path and tracking path.
- No placeholders in customer-facing copy.

---

## Day 1 - Foundations (Do Not Ship Until Complete)

### Task 1 - Fix TypeScript compile error (`#1`, P0)
**Target file:** `src/app/(storefront)/policies/page.tsx` (around line 34)

**Steps**
1. Run `npm run typecheck` and capture exact error in `policies/page.tsx`.
2. Fix the type issue with the smallest possible change (prefer local type narrowing/typing over broad `any`).
3. Re-run `npm run typecheck`.
4. Ensure no new type errors in unrelated files.

**Acceptance checks**
- TypeScript compiles cleanly.
- Render of `/policies` still works.

---

### Task 2 - Fix `@theme inline` CSS lint error (`#2`, P0)
**Target file:** `src/app/globals.css`

**Steps**
1. Run `npm run lint` and verify the exact CSS/PostCSS warning.
2. Align CSS syntax and PostCSS/Tailwind expectations for `@theme inline` usage.
3. If needed, adjust only style tooling config that directly supports valid parsing (no broad lint rule disabling).
4. Re-run lint and verify `globals.css` is clean.

**Acceptance checks**
- No `@theme inline` parsing/lint error.
- Existing site styling remains unchanged visually.

---

### Task 3 - Replace public-facing placeholders (`#3`, P0)
**Target files**
- `src/app/(storefront)/contact/page.tsx` (around lines 172, 179, 314)
- `src/app/(storefront)/track/[orderNumber]/tracking-client.tsx` (around line 308)

**Steps**
1. Inventory all placeholder content in contact + tracking surfaces.
2. Replace with production-real values (social links, map embed/details, support phone).
3. Verify links are clickable and correctly formatted (`tel:`, `https://`, map URL).
4. Re-check mobile layout for line wraps and overflow.

**Acceptance checks**
- No lorem/placeholder tokens in customer-visible contact/tracking areas.
- All external links open correctly.

**Day 1 exit gate**
- `typecheck` + `lint` green.
- Placeholder sweep complete.

---

## Day 2 - Checkout Trust and Conversion Safety

### Task 4 - Fix schedule time UTC bug (`#4`, P0)
**Target file:** `src/app/(storefront)/checkout/checkout-client.tsx` (around lines 871, 877)

**Steps**
1. Locate all `datetime-local` read/write formatting paths.
2. Remove UTC conversion for local picker value generation.
3. Ensure parse/format uses local timezone consistently.
4. Add validation guard against business/store hours.
5. Test with edge times near opening/closing boundaries.

**Acceptance checks**
- Selected local time is preserved exactly in UI.
- Invalid out-of-hours values are blocked with clear message.

---

### Task 11 - Add trust microcopy near checkout CTA (`#11`, P1)
**Target files**
- `src/app/(storefront)/checkout/checkout-client.tsx` (around line 620)
- `src/app/(storefront)/cart/page.tsx` (around line 263)

**Steps**
1. Add concise trust row near CTA (secure payment, delivery window, cancellation policy link).
2. Keep copy short and scannable on mobile.
3. Reuse existing typography/tokens where possible.

**Acceptance checks**
- Trust copy visible above/near final CTA on both cart and checkout.
- Layout remains clean on small screens.

---

### Task 14 - Empty cart checkout state (`#14`, P1)
**Target file:** `src/app/(storefront)/checkout/checkout-client.tsx` (around line 259)

**Steps**
1. Replace null/blank empty-cart render with guided empty state component.
2. Add CTA back to menu + brief helper text.
3. Confirm state appears when cart is cleared from another tab/session.

**Acceptance checks**
- Empty checkout never renders blank.
- CTA routes users back to menu reliably.

**Day 2 exit gate**
- Checkout local time behavior verified.
- Empty and trust states complete.

---

## Day 3 - Tracking UX and Recovery States

### Task 6 - Replace native confirm/alert in tracking (`#6`, P1)
**Target file:** `src/app/(storefront)/track/[orderNumber]/tracking-client.tsx` (around lines 205, 213, 216)

**Steps**
1. Identify native dialog calls (`alert`, `confirm`).
2. Replace with in-app modal/dialog component aligned with existing UI system.
3. Include cancellation policy messaging and explicit confirm/cancel actions.
4. Ensure keyboard support (`Esc`, focus return, button focus order).

**Acceptance checks**
- No native browser dialogs in tracking flow.
- Modal text includes policy context.

---

### Task 10 - Improve empty/error states (`#10`, P2)
**Target files**
- `src/components/storefront/menu-grid.tsx`
- `src/app/(storefront)/track/[orderNumber]/tracking-client.tsx` (around line 261)

**Steps**
1. Add contextual recovery actions:
   - Clear filters
   - Popular items shortcut
   - Support CTA
2. Use distinct copy for empty vs error states.
3. Verify actions are functional and not dead links/buttons.

**Acceptance checks**
- Every empty/error state has at least one recovery action.
- No dead-end screen in menu/tracking surfaces.

**Day 3 exit gate**
- Tracking dialogs modernized.
- Empty/error state recovery actions wired.

---

## Day 4 - Accessibility and Navigation Completeness

### Task 7 - Mobile nav accessibility (`#7`, P1)
**Target file:** `src/components/shared/navbar.tsx`

**Steps**
1. Add/verify `aria-expanded` and `aria-controls` on mobile menu trigger.
2. Implement focus trap inside open mobile menu.
3. Ensure close on `Esc` and focus return to trigger.
4. Match account menu behavior parity between desktop/mobile.

**Acceptance checks**
- Keyboard-only navigation works in mobile nav.
- Screen reader state announcements are accurate.

---

### Task 13 - Strengthen footer content (`#13`, P2)
**Target file:** `src/components/shared/footer.tsx`

**Steps**
1. Add compact contact shortcut block.
2. Add hours snapshot.
3. Add payment method indicators.
4. Add delivery area summary.
5. Keep footer height and mobile readability in balance.

**Acceptance checks**
- Footer contains practical trust/ops details.
- No visual clutter at mobile breakpoints.

**Day 4 exit gate**
- A11y checks pass for nav.
- Footer content expanded without layout regressions.

---

## Day 5 - Bilao + Cart Accuracy

### Task 5 - Cart prep-time ETA accuracy (`#5`, P1)
**Target file:** `src/components/storefront/cart-panel.tsx`

**Steps**
1. Audit current ETA source logic.
2. If accurate item-level prep data exists, compute ETA from real inputs.
3. If not reliable, remove ETA display and replace with neutral expectation copy.
4. Verify no contradictory times shown across cart/checkout.

**Acceptance checks**
- ETA shown only when defensible.
- No fabricated timing claims.

---

### Task 9 - Bilao builder mobile improvements (`#9`, P2)
**Target file:** `src/app/(storefront)/bilao-builder/bilao-builder-client.tsx` (around lines 176, 296, 477)

**Steps**
1. Add partial-save draft flow (local state or local storage, no backend schema change).
2. Improve responsive panel behavior for narrow screens.
3. Add sticky mini summary on mobile for persistent context.
4. Validate draft restore on refresh/back navigation.

**Acceptance checks**
- Builder is usable end-to-end on mobile.
- Partial progress is not lost accidentally.

**Day 5 exit gate**
- ETA trustworthy or removed.
- Bilao builder is mobile-safe.

---

## Days 6-7 - Consistency, Tests, and Optional Search

### Task 12 - Unify design tokens (`#12`, P2)
**Target comparison**
- `src/app/(storefront)/track/[orderNumber]/tracking-client.tsx`
- `src/app/(storefront)/page.tsx`
- `src/components/storefront/menu-item-card.tsx`

**Steps**
1. Compare card, CTA, spacing, and icon treatment across tracking vs storefront.
2. Normalize to existing storefront token language.
3. Update only styling classes/variants; avoid logic changes.

**Acceptance checks**
- Tracking and storefront feel visually consistent.
- No token drift in key CTA surfaces.

---

### Task 15 - Add high-signal E2E tests (`#15`, P2)
**Target files**
- `e2e/app.spec.ts`
- `e2e/customer-journey.spec.ts`

**Steps**
1. Add/extend tests for:
   - Checkout validation
   - Payment failure handling
   - Mobile nav interactions
   - Order lifecycle checkpoints
2. Keep tests deterministic (avoid flaky timing assumptions).
3. Run `npx playwright test` and record failures.
4. Fix test selectors/assertions without altering product logic unless needed.

**Acceptance checks**
- New critical path specs pass in chromium + mobile profile.
- Tests guard against this week’s hardening regressions.

---

### Task 8 - Search icon to quick-search drawer (`#8`, P3/defer)
**Target file:** `src/components/shared/navbar.tsx`

**Execution rule**
- Implement only if all P0/P1 items and tests are complete.
- Otherwise move to post-launch backlog.

**If implemented, steps**
1. Build lightweight drawer UI with keyboard-first behavior.
2. Add instant client-side search over existing menu data surface.
3. Show top queries and recent items.
4. Validate open/close, focus, and route transitions.

**Acceptance checks**
- Drawer does not break nav routing or mobile nav a11y.
- No regressions in existing navbar interactions.

**Day 7 exit gate**
- Design consistency finalized.
- E2E hardening suite stable.
- Search drawer either complete or explicitly deferred.

---

## Suggested Branch and PR Flow

1. Create branch: `hardening/week-2026-03`.
2. Use daily task branches if multiple contributors are active:
   - `hardening/day1-foundations`
   - `hardening/day2-checkout-trust`
   - `hardening/day3-tracking-ux`
   - `hardening/day4-a11y-nav-footer`
   - `hardening/day5-bilao-cart`
   - `hardening/day6-7-consistency-tests`
3. PR template checklist per task:
   - Scope limited to listed file(s)
   - Before/after screenshots for UI-only changes
   - Typecheck/lint/test evidence
   - Risk note + rollback note

## Risk Register (Quick)

- **Timezone regressions** (Task #4)
  - Mitigation: explicit local-time helper, edge-case tests around store open/close boundaries.
- **A11y regressions in nav** (Task #7)
  - Mitigation: keyboard test pass (`Tab`, `Shift+Tab`, `Esc`) before merge.
- **Flaky E2E failures** (Task #15)
  - Mitigation: stable selectors and explicit waits on user-visible state.
- **Scope creep from search drawer** (Task #8)
  - Mitigation: strict defer rule unless all prior gates are green.

## Final Week Exit Checklist

- [ ] P0/P1 tasks shipped and verified.
- [ ] No public placeholders remain.
- [ ] Checkout local-time scheduling validated.
- [ ] Tracking UX has no native dialogs.
- [ ] Mobile nav accessibility complete.
- [ ] Cart ETA is accurate or removed.
- [ ] Bilao mobile flow supports partial progress.
- [ ] Design tokens aligned across major storefront surfaces.
- [ ] New high-signal E2E coverage merged.
- [ ] Search drawer status explicitly marked (`implemented` or `deferred`).
