# Techvill Brand Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle both application tabs with Techvill's official palette and add the approved conceptual disclaimer.

**Architecture:** Add a focused `Disclaimer` component to `AppShell`; preserve all page behavior and content; replace the legacy visual tokens and component styling in CSS with a cohesive Techvill theme.

**Tech Stack:** React, CSS, Vite, Vitest, Testing Library.

## Global Constraints

- Use `#F5F7FA`, `#171717`, `#333333`, `#A5F04B`, `#6C1EFF`, and white as the primary palette.
- Display the supplied disclaimer verbatim before the active tab content.
- Preserve the ten assignment sections and all prototype behavior.
- Add no dependencies or network requests.

---

### Task 1: Disclaimer behavior

**Files:**
- Create: `src/components/Disclaimer.jsx`
- Modify: `src/components/AppShell.jsx`
- Modify: `tests/app.test.jsx`

**Interfaces:**
- `Disclaimer()` renders a labelled `<aside>` containing the exact approved text.
- `AppShell` renders `Disclaimer` once between the header and `<main>`.

- [ ] Add a test asserting the heading and complete disclaimer text.
- [ ] Run `pnpm exec vitest --run tests/app.test.jsx` and confirm failure because the disclaimer is absent.
- [ ] Implement `Disclaimer` and mount it in `AppShell`.
- [ ] Re-run the focused test and confirm success.

### Task 2: Techvill visual system

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Existing class names remain the styling API for assignment and prototype components.

- [ ] Replace the imported decorative fonts with a system sans-serif stack.
- [ ] Define brand tokens for graphite, purple, lime, light gray, white, muted text, and borders.
- [ ] Restyle the header as a rounded graphite bar with responsive tabs.
- [ ] Style the disclaimer as a compact white card with a purple accent.
- [ ] Restyle assignment sections, cards, buttons, visual, tables, and conclusion using the brand tokens.
- [ ] Restyle prototype filters, panels, recommendation states, metrics, explanation, and map fallback without changing heatmap semantics.
- [ ] Preserve mobile layouts and visible focus states.

### Task 3: Verification

**Files:**
- Verify all changed files.

**Interfaces:**
- Produces a tested production bundle.

- [ ] Run `pnpm exec vitest --run` and confirm zero failures.
- [ ] Run `pnpm run build` and confirm exit code 0.
- [ ] Inspect both tabs at desktop and mobile widths in the browser.
- [ ] Run `git diff --check`, review scope, and commit with `feat: apply Techvill brand styling`.

### Task 4: Restore the Yandex heatmap module

**Files:**
- Modify: `src/components/PotentialMap.jsx`
- Create: `tests/heatmap.test.js`

**Interfaces:**
- `loadYandexMaps(apiKey)` resolves only after both Yandex Maps API 2.1 and the official Heatmap module are loaded.

- [ ] Add a failing loader test proving that `heatmap.min.js` is appended after the Maps API becomes ready.
- [ ] Update the loader to load `https://yastatic.net/s3/mapsapi-jslibs/heatmap/0.0.1/heatmap.min.js` before resolving.
- [ ] Keep the existing `ymaps.modules.require(['Heatmap'])` rendering path and verify it now receives the registered module.
