# Assignment Page Source Fidelity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the «Задание» page to use the supplied Techvill logo, the approved header copy, responsive hero layout, and only sections 1–10 from the source DOCX.

**Architecture:** Keep the existing React/Vite structure. Store presentation data in `src/content/assignment.js`, render it in `AssignmentPage`, and keep shell branding in `AppShell`; CSS provides responsive layout without new dependencies.

**Tech Stack:** React, Vite, Vitest, Testing Library, CSS, SVG.

## Global Constraints

- The page contains exactly the ten source-document sections and no section 11 or source links.
- Use the exact header line «Аббасов Роман Русланович: тестовое задание для AI-команды Техвилл».
- Remove «AI location intelligence» and «PM AI · demo».
- Do not introduce network calls, LLM functionality, or new packages.
- Preserve navigation to the prototype page.

---

### Task 1: Lock the approved content and branding with tests

**Files:**
- Modify: `tests/app.test.jsx`

**Interfaces:**
- Consumes: the rendered `App` component.
- Produces: regression coverage for branding, sections 1–10, absence of section 11, and tab navigation.

- [ ] **Step 1: Write failing tests**

Add assertions for the Techvill logo alt text, exact author line, all ten exact section headings, and absence of the removed strings and section 11.

- [ ] **Step 2: Run tests to verify RED**

Run: `pnpm exec vitest --run tests/app.test.jsx`

Expected: FAIL because the old branding and nine-section page are still rendered.

- [ ] **Step 3: Commit the test checkpoint after implementation is green**

Commit tests together with the production files in Task 4 so no deliberately failing commit remains.

### Task 2: Update assets, shell branding, and source-faithful content

**Files:**
- Create: `src/assets/logo-techvill.svg`
- Modify: `src/components/AppShell.jsx`
- Modify: `src/content/assignment.js`

**Interfaces:**
- `AppShell` renders `<img src={logoTechvill} alt="Техвилл" />` and the exact approved subtitle.
- `assignment.js` exports `capabilities`, `successMetrics`, `dataSources`, `serviceView`, `aiApplications`, `stages`, `pmResponsibilities`, and `risks`.

- [ ] **Step 1: Copy the supplied SVG into the application asset directory**

Copy `C:\Users\balsa\OneDrive\Desktop\logo_techvill.svg` unchanged to `src/assets/logo-techvill.svg`.

- [ ] **Step 2: Replace shell branding**

Import the SVG, replace the hand-built mark with the image, render the approved author line, preserve tabs, and delete the demo badge.

- [ ] **Step 3: Replace assignment content data**

Use only the claims, durations, metrics, data categories, roles, and risks present in sections 1–10 of the source DOCX.

### Task 3: Render ten sections and correct the responsive layout

**Files:**
- Modify: `src/components/AssignmentPage.jsx`
- Modify: `src/styles.css`

**Interfaces:**
- `AssignmentPage` consumes the content exports from Task 2.
- CSS classes keep the hero text at normal word wrapping and stack the artwork below the copy at the responsive breakpoint.

- [ ] **Step 1: Render sections 1–10 in source order**

Create separate visible sections for «Суть задачи», «Что должен уметь сервис», «Как мерить успех», «Какие данные использовать», «Как это будет выглядеть», «Как это может работать (без глубоких технических деталей)», «Этапы проекта», «Роль Project Manager AI», «Риски», and «Итог».

- [ ] **Step 2: Preserve readable presentation**

Use cards for capabilities, lists for data and service appearance, and table-like rows for stages and risks. Do not add an eleventh section.

- [ ] **Step 3: Fix hero and header CSS**

Give the copy column `min-width: 0`, disable `word-break` and hyphenation, allocate a stable visual column on wide screens, and stack columns before text becomes narrow. Increase the brand name and subtitle by 2pt and remove obsolete badge styling where safe.

- [ ] **Step 4: Run the focused test to verify GREEN**

Run: `pnpm exec vitest --run tests/app.test.jsx`

Expected: PASS.

### Task 4: Regression and production verification

**Files:**
- Verify: all changed files.

**Interfaces:**
- Produces a tested Vite build with unchanged prototype navigation.

- [ ] **Step 1: Run the complete test suite**

Run: `pnpm exec vitest --run`

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Run the production build**

Run: `pnpm run build`

Expected: exit code 0 and a generated `dist` bundle.

- [ ] **Step 3: Inspect the final diff and requirement checklist**

Confirm the exact header, SVG asset, sections 1–10, absence of section 11, responsive CSS, and no unrelated changes.

- [ ] **Step 4: Commit the implementation**

Run:

```powershell
git add tests/app.test.jsx src/assets/logo-techvill.svg src/components/AppShell.jsx src/components/AssignmentPage.jsx src/content/assignment.js src/styles.css docs/superpowers/plans/2026-07-13-assignment-page-source-fidelity.md
git commit -m "feat: align assignment page with source brief"
```
