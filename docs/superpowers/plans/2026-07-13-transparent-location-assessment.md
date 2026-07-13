# Transparent Location Assessment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a continuous heatmap and a mathematically transparent, information-rich location assessment.

**Architecture:** Pure domain functions own score breakdown, economics, and recommendation output. The data generator persists those results; React components render them. A pure IDW helper produces heatmap grid features for the official Yandex Heatmap module.

**Tech Stack:** JavaScript, React, Yandex Maps API 2.1, Vitest, Vite.

## Global Constraints

- Nine visible factor rows must sum exactly to the displayed score out of 100.
- Economics assumptions must be visible and no 30-month cap may be used.
- Recommendations are deterministic templates, not live LLM output.
- Heatmap interpolation must not create new ranked addresses.

---

### Task 1: Domain calculations

**Files:** Modify `src/domain/scoring.js`; modify `tests/scoring.test.js`.

- [ ] Test exact factor-point sum, inverse factors, economics, and structured recommendation.
- [ ] Run focused tests and verify RED.
- [ ] Implement factor definitions, largest-remainder allocation, scenario economics, and recommendation builder.
- [ ] Run focused tests and verify GREEN.

### Task 2: Dataset consistency

**Files:** Modify `scripts/generate-data.mjs`, `tests/data-generation.test.js`; regenerate `public/data/scores.json`.

- [ ] Update generator tests for factor breakdown, economics, and recommendation structure.
- [ ] Generate each score from shared domain functions.
- [ ] Regenerate deterministic JSON and verify internal consistency.

### Task 3: Continuous heatmap

**Files:** Modify `src/components/PotentialMap.jsx`, `tests/heatmap.test.js`.

- [ ] Test normalized source weights and compact radial point clouds without a rectangular grid.
- [ ] Implement deterministic radial point clouds and compact score markers.
- [ ] Increase heatmap radius/opacity and clarify the legend.

### Task 4: Explainable UI

**Files:** Modify `src/components/LocationDetails.jsx`, `src/components/RecommendationList.jsx`, `src/styles.css`, `tests/prototype.test.jsx`.

- [ ] Test visible additive factor points, methodology, expanded explanation, and scenario payback.
- [ ] Render the breakdown, assumptions, structured recommendation, and template disclosure.
- [ ] Style the new explanation and methodology sections responsively.

### Task 5: Verification

- [ ] Run the full test suite.
- [ ] Run the production build.
- [ ] Inspect high, medium, and low recommendations plus desktop/mobile heatmap in browser.
- [ ] Run `git diff --check` and commit.
