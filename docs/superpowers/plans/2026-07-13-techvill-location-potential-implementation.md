# Techvill Location Potential Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Собрать рабочее React/Vite-демо с презентационной вкладкой, Яндекс.Картой, синтетическими геоданными, фильтрами, рейтингом и подробной карточкой локации.

**Architecture:** Frontend-only React-приложение читает заранее рассчитанные JSON-файлы и хранит только UI-состояние. Отдельный детерминированный Node-скрипт генерирует зоны, магазины и оценки; интеграция с Яндекс.Картами изолирована в компоненте с самостоятельными состояниями отсутствующего ключа и ошибки API.

**Tech Stack:** React, Vite, JavaScript, Vitest, Testing Library, jsdom, Яндекс.Карты JS API 2.1, статические JSON.

## Global Constraints

- Название проекта и корневой папки: `Тестовое задание 1 Техвилл`.
- В приложении две вкладки: `Задание` и `Прототип`, переключаемые без перезагрузки.
- Карта использует Яндекс.Карты JS API и модуль Heatmap, не Leaflet.
- Ключ карты читается только из `VITE_YANDEX_MAPS_KEY`; `.env` не коммитится.
- Backend, база данных, аутентификация, геокодер и живые LLM-вызовы отсутствуют.
- LLM-кнопка остаётся демонстрационной и не отправляет сетевые запросы.
- Набор данных содержит ровно 18 зон Москвы и 20 существующих магазинов.
- Все данные синтетические, но правдоподобные; генерация воспроизводима.
- Содержимое вкладки `Задание` сохраняет смысл приложенного DOCX.

---

## Planned File Structure

```text
Тестовое задание 1 Техвилл/
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── vite.config.js
├── index.html
├── scripts/
│   └── generate-data.mjs
├── public/data/
│   ├── zones.json
│   ├── stores.json
│   └── scores.json
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles.css
│   ├── content/assignment.js
│   ├── data/loadData.js
│   ├── domain/scoring.js
│   ├── domain/filtering.js
│   ├── domain/formatters.js
│   ├── components/AppShell.jsx
│   ├── components/AssignmentPage.jsx
│   ├── components/PrototypePage.jsx
│   ├── components/Filters.jsx
│   ├── components/PotentialMap.jsx
│   ├── components/RecommendationList.jsx
│   ├── components/LocationDetails.jsx
│   ├── components/MapFallback.jsx
│   └── test/setup.js
└── tests/
    ├── scoring.test.js
    ├── filtering.test.js
    ├── data-generation.test.js
    ├── app.test.jsx
    ├── prototype.test.jsx
    └── potential-map.test.jsx
```

## Task 1: Project Foundation and Domain Formulas

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/main.jsx`
- Create: `src/domain/scoring.js`
- Create: `src/domain/filtering.js`
- Create: `src/domain/formatters.js`
- Create: `src/test/setup.js`
- Test: `tests/scoring.test.js`
- Test: `tests/filtering.test.js`

**Interfaces:**
- Produces: `calculateScore(features): number`, `calculateCannibalizationRisk(monthlyRevenue, distanceM): "low"|"medium"|"high"`, `filterRecommendations(records, zonesById, filters): object[]`, `formatCurrency(value): string`.

- [ ] **Step 1: Create the failing scoring tests**

```js
import { describe, expect, it } from 'vitest';
import { calculateCannibalizationRisk, calculateScore } from '../src/domain/scoring.js';

describe('calculateScore', () => {
  it('keeps the score in the 0–100 range', () => {
    expect(calculateScore({ population_density: 50000, avg_income_index: 3, competitors_count_300m: 0, foot_traffic_score: 100, car_traffic_score: 100, distance_to_metro_m: 0, new_developments_nearby: 8, delivery_orders_density: 500, rent_price_per_sqm: 1000 })).toBe(100);
    expect(calculateScore({ population_density: 1000, avg_income_index: 0.5, competitors_count_300m: 10, foot_traffic_score: 5, car_traffic_score: 5, distance_to_metro_m: 5000, new_developments_nearby: 0, delivery_orders_density: 5, rent_price_per_sqm: 9000 })).toBe(0);
  });
});

describe('calculateCannibalizationRisk', () => {
  it.each([[5000000, 300, 'high'], [4000000, 800, 'medium'], [3000000, 1800, 'low']])('maps %i revenue at %i m to %s', (revenue, distance, expected) => {
    expect(calculateCannibalizationRisk(revenue, distance)).toBe(expected);
  });
});
```

- [ ] **Step 2: Run scoring tests and verify the missing-module failure**

Run: `npm test -- tests/scoring.test.js`

Expected: FAIL because `src/domain/scoring.js` does not exist.

- [ ] **Step 3: Implement the formulas**

```js
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const scale = (value, min, max) => clamp((value - min) / (max - min), 0, 1);

export function calculateScore(f) {
  const score = 100 * (
    scale(f.population_density, 4000, 25000) * 0.14 +
    scale(f.avg_income_index, 0.7, 1.6) * 0.10 +
    scale(f.foot_traffic_score, 20, 95) * 0.18 +
    scale(f.car_traffic_score, 15, 90) * 0.07 +
    (1 - scale(f.distance_to_metro_m, 100, 1800)) * 0.10 +
    scale(f.new_developments_nearby, 0, 4) * 0.08 +
    scale(f.delivery_orders_density, 30, 350) * 0.16 +
    (1 - scale(f.competitors_count_300m, 0, 6)) * 0.09 +
    (1 - scale(f.rent_price_per_sqm, 1800, 6500)) * 0.08
  );
  return Math.round(clamp(score, 0, 100));
}

export function calculateCannibalizationRisk(monthlyRevenue, distanceM) {
  const rawRisk = monthlyRevenue / Math.max(distanceM, 1) ** 2;
  if (rawRisk >= 35) return 'high';
  if (rawRisk >= 5) return 'medium';
  return 'low';
}
```

- [ ] **Step 4: Create filtering tests**

```js
import { expect, it } from 'vitest';
import { filterRecommendations } from '../src/domain/filtering.js';

it('filters by city, distance and rent, then sorts score descending', () => {
  const zones = new Map([
    ['a', { city: 'Москва', distance_from_center_km: 2, features: { rent_price_per_sqm: 4000 } }],
    ['b', { city: 'Москва', distance_from_center_km: 4, features: { rent_price_per_sqm: 3000 } }],
    ['c', { city: 'Казань', distance_from_center_km: 1, features: { rent_price_per_sqm: 2000 } }],
  ]);
  const scores = [{ zone_id: 'a', score: 75 }, { zone_id: 'b', score: 95 }, { zone_id: 'c', score: 99 }];
  expect(filterRecommendations(scores, zones, { city: 'Москва', radiusKm: 3, maxRent: 4500 }).map(x => x.zone_id)).toEqual(['a']);
});
```

- [ ] **Step 5: Implement filtering and formatting**

```js
export function filterRecommendations(scores, zonesById, filters) {
  return scores
    .filter(score => {
      const zone = zonesById.get(score.zone_id);
      return zone && zone.city === filters.city && zone.distance_from_center_km <= filters.radiusKm && zone.features.rent_price_per_sqm <= filters.maxRent;
    })
    .sort((a, b) => b.score - a.score);
}
```

```js
export const formatCurrency = value => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
```

- [ ] **Step 6: Run domain tests**

Run: `npm test -- tests/scoring.test.js tests/filtering.test.js`

Expected: PASS.

- [ ] **Step 7: Commit the foundation**

```powershell
git add package.json vite.config.js index.html .gitignore .env.example src/main.jsx src/domain src/test tests/scoring.test.js tests/filtering.test.js
git commit -m "feat: add project foundation and domain formulas"
```

## Task 2: Deterministic Synthetic Data Pipeline

**Files:**
- Create: `scripts/generate-data.mjs`
- Create: `public/data/zones.json`
- Create: `public/data/stores.json`
- Create: `public/data/scores.json`
- Create: `src/data/loadData.js`
- Test: `tests/data-generation.test.js`

**Interfaces:**
- Consumes: `calculateScore`, `calculateCannibalizationRisk`.
- Produces: `generateDataset(seed): { zones, stores, scores }`, `loadPrototypeData(): Promise<{ zones, stores, scores }>`.

- [ ] **Step 1: Write the dataset contract test**

```js
import { expect, it } from 'vitest';
import { generateDataset } from '../scripts/generate-data.mjs';

it('generates a deterministic and internally consistent dataset', () => {
  const first = generateDataset(20260713);
  const second = generateDataset(20260713);
  expect(first).toEqual(second);
  expect(first.zones).toHaveLength(18);
  expect(first.stores).toHaveLength(20);
  expect(first.scores).toHaveLength(18);
  expect(first.scores.every(score => first.zones.some(zone => zone.zone_id === score.zone_id))).toBe(true);
  expect(first.scores.every(score => score.factor_contributions.length >= 5)).toBe(true);
});
```

- [ ] **Step 2: Run the dataset test and verify failure**

Run: `npm test -- tests/data-generation.test.js`

Expected: FAIL because `scripts/generate-data.mjs` does not exist.

- [ ] **Step 3: Implement seeded generation**

Implement `mulberry32(seed)` for deterministic randomness. Define 18 Moscow location templates with district, address and center coordinates, and 20 store templates with address and coordinates. For every zone generate the exact feature keys from the design, a four-corner polygon around the center, and `distance_from_center_km`.

```js
export function mulberry32(seed) {
  return function random() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function generateDataset(seed = 20260713) {
  const random = mulberry32(seed);
  const zones = buildZones(random);
  const stores = buildStores(random);
  const scores = zones.map(zone => buildScore(zone, stores));
  return { zones, stores, scores };
}
```

`buildScore` must locate the nearest store with a haversine function, call both domain formulas, calculate `revenue_forecast` and `payback_months`, create signed factor weights, and construct a 2–3 sentence `explanation_text` from the strongest factors.

- [ ] **Step 4: Generate and validate JSON files**

Run: `npm run generate:data`

Expected: writes 18 zones, 20 stores and 18 scores to `public/data` and prints `Generated 18 zones, 20 stores, 18 scores`.

- [ ] **Step 5: Implement the data loader**

```js
async function readJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Не удалось загрузить ${path}`);
  return response.json();
}

export async function loadPrototypeData() {
  const [zones, stores, scores] = await Promise.all([
    readJson('/data/zones.json'),
    readJson('/data/stores.json'),
    readJson('/data/scores.json'),
  ]);
  return { zones, stores, scores };
}
```

- [ ] **Step 6: Run data tests and commit**

Run: `npm test -- tests/data-generation.test.js`

Expected: PASS.

```powershell
git add scripts public/data src/data tests/data-generation.test.js package.json
git commit -m "feat: add deterministic synthetic data pipeline"
```

## Task 3: Application Shell and Assignment Page

**Files:**
- Create: `src/App.jsx`
- Create: `src/components/AppShell.jsx`
- Create: `src/components/AssignmentPage.jsx`
- Create: `src/content/assignment.js`
- Create: `src/styles.css`
- Test: `tests/app.test.jsx`

**Interfaces:**
- Produces: `App`, `AppShell({ activeTab, onTabChange, children })`, `AssignmentPage()`.

- [ ] **Step 1: Write tab navigation tests**

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import App from '../src/App.jsx';

it('switches between assignment and prototype without navigation', async () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /быстрый и объяснимый/i })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('tab', { name: 'Прототип' }));
  expect(screen.getByRole('heading', { name: /потенциал новых точек/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the app test and verify failure**

Run: `npm test -- tests/app.test.jsx`

Expected: FAIL because `src/App.jsx` does not exist.

- [ ] **Step 3: Implement the accessible tab shell**

Use native buttons with `role="tab"`, `aria-selected`, matching `aria-controls`, and panels with `role="tabpanel"`. Keep the active tab in `App` state and render both pages through the same header and design tokens.

- [ ] **Step 4: Add assignment content**

Export structured arrays from `src/content/assignment.js` for capabilities, success metrics, data sources, AI applications, stages, PM audiences, risks and conclusion. `AssignmentPage` must render all nine approved sections, with the stage data as a semantic table or timeline and risk data as paired risk/mitigation rows.

- [ ] **Step 5: Establish visual tokens and responsive foundation**

In `src/styles.css`, define typography, spacing, surface, border, accent, score and risk tokens. Use a restrained green brand accent, high-contrast text, focus-visible outlines, 44px minimum interactive targets, and breakpoints that stack the prototype below 900px.

- [ ] **Step 6: Run tests and commit**

Run: `npm test -- tests/app.test.jsx`

Expected: PASS.

```powershell
git add src/App.jsx src/components/AppShell.jsx src/components/AssignmentPage.jsx src/content/assignment.js src/styles.css tests/app.test.jsx
git commit -m "feat: add app shell and assignment presentation"
```

## Task 4: Prototype Filters, Ranking, and Details

**Files:**
- Create: `src/components/PrototypePage.jsx`
- Create: `src/components/Filters.jsx`
- Create: `src/components/RecommendationList.jsx`
- Create: `src/components/LocationDetails.jsx`
- Test: `tests/prototype.test.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `loadPrototypeData`, `filterRecommendations`, `formatCurrency`.
- Produces: `PrototypePage`, `Filters`, `RecommendationList`, `LocationDetails`.

- [ ] **Step 1: Write prototype interaction tests**

```jsx
it('sorts recommendations and opens details after a click', async () => {
  render(<PrototypePage initialData={fixtureData} />);
  const items = screen.getAllByRole('button', { name: /открыть локацию/i });
  expect(items[0]).toHaveTextContent('92');
  await userEvent.click(items[0]);
  expect(screen.getByRole('region', { name: /детали локации/i })).toHaveTextContent(fixtureData.zones[0].address_label);
});

it('shows an honest demo message instead of calling an API', async () => {
  render(<PrototypePage initialData={fixtureData} />);
  await userEvent.click(screen.getAllByRole('button', { name: /открыть локацию/i })[0]);
  await userEvent.click(screen.getByRole('button', { name: /сформировать ии-объяснение/i }));
  expect(screen.getByRole('status')).toHaveTextContent('подключение LLM предусмотрено на следующем этапе');
});
```

- [ ] **Step 2: Run prototype tests and verify failure**

Run: `npm test -- tests/prototype.test.jsx`

Expected: FAIL because `PrototypePage` does not exist.

- [ ] **Step 3: Implement data and filter state**

`PrototypePage` accepts optional `initialData` for tests. Otherwise it calls `loadPrototypeData` in an effect. Store `{ city: 'Москва', radiusKm: 15, maxRent: 6500 }`, `selectedZoneId`, loading and error states. Derive `zonesById` and filtered scores with `useMemo`; reset selection in an effect when it no longer exists in the filtered set.

- [ ] **Step 4: Implement filters and empty state**

`Filters` uses one select and two labeled native range inputs with visible live values. When no scores match, render `Не найдено подходящих локаций` and `Увеличьте радиус или максимальную ставку аренды`.

- [ ] **Step 5: Implement the recommendation list**

Render one button per score with address, score, formatted revenue, payback months and a Russian risk badge (`Низкий`, `Средний`, `Высокий`). Give the selected item `aria-current="true"` and keep ordering supplied by `filterRecommendations`.

- [ ] **Step 6: Implement details and factor bars**

Render signed factor bars around a neutral center line. Use `impact` plus explicit `+`/`−` labels so direction does not rely only on color. Display the prepared `explanation_text`. The demo button sets a local status string only; it must not call `fetch`.

- [ ] **Step 7: Run tests and commit**

Run: `npm test -- tests/prototype.test.jsx tests/filtering.test.js`

Expected: PASS.

```powershell
git add src/App.jsx src/components/PrototypePage.jsx src/components/Filters.jsx src/components/RecommendationList.jsx src/components/LocationDetails.jsx tests/prototype.test.jsx
git commit -m "feat: add interactive recommendation workflow"
```

## Task 5: Yandex Map, Heatmap, and Fallbacks

**Files:**
- Create: `src/components/PotentialMap.jsx`
- Create: `src/components/MapFallback.jsx`
- Test: `tests/potential-map.test.jsx`
- Modify: `src/components/PrototypePage.jsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `zones`, `stores`, filtered `scores`, `selectedZoneId`, `onSelectZone(zoneId)`.
- Produces: `loadYandexMaps(apiKey): Promise<typeof window.ymaps>`, `PotentialMap(props)`, `MapFallback({ reason })`.

- [ ] **Step 1: Write map fallback tests**

```jsx
it('explains how to configure a missing key', () => {
  render(<PotentialMap apiKey="" zones={[]} stores={[]} scores={[]} onSelectZone={() => {}} />);
  expect(screen.getByText(/VITE_YANDEX_MAPS_KEY/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /получить ключ/i })).toHaveAttribute('href', expect.stringContaining('yandex.ru/dev/maps'));
});

it('keeps a Maps API failure separate from missing data', async () => {
  vi.spyOn(document.head, 'appendChild').mockImplementation(node => { queueMicrotask(() => node.onerror()); return node; });
  render(<PotentialMap apiKey="bad-key" zones={[]} stores={[]} scores={[]} onSelectZone={() => {}} />);
  expect(await screen.findByText(/не удалось загрузить Яндекс.Карты/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run map tests and verify failure**

Run: `npm test -- tests/potential-map.test.jsx`

Expected: FAIL because `PotentialMap` does not exist.

- [ ] **Step 3: Implement a singleton Maps API loader**

Build the script URL with `apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`. Reuse an existing promise to avoid duplicate scripts. Resolve only after `window.ymaps.ready`; reject with a Russian error when the script fails.

- [ ] **Step 4: Implement map lifecycle**

Create the map once in a ref-backed effect centered on Moscow. Load `Heatmap` through `ymaps.modules.require(['Heatmap'], callback)`. Keep separate refs for heatmap, store collection and recommendation collection. On data changes, remove old layers and add:

```js
const heatPoints = scores.map(score => {
  const zone = zonesById.get(score.zone_id);
  return { coordinates: [zone.center_lat, zone.center_lng], weight: score.score / 100 };
});
```

Use `ymaps.Placemark` with `preset: 'islands#greenHomeIcon'` for stores and `preset: 'islands#yellowStarIcon'` for recommendations. Set hint content to `${address} · ${score}`. Recommendation click handlers call `onSelectZone(zone_id)`.

- [ ] **Step 5: Add cleanup and selection synchronization**

Destroy the map on unmount. Remove listeners and geo objects before replacement. When `selectedZoneId` changes, pan to the zone center without recreating the map.

- [ ] **Step 6: Run tests and commit**

Run: `npm test -- tests/potential-map.test.jsx tests/prototype.test.jsx`

Expected: PASS.

```powershell
git add src/components/PotentialMap.jsx src/components/MapFallback.jsx src/components/PrototypePage.jsx src/styles.css tests/potential-map.test.jsx
git commit -m "feat: integrate Yandex map and heatmap fallbacks"
```

## Task 6: Visual Polish, Documentation, and Release Verification

**Files:**
- Create: `README.md`
- Modify: `src/styles.css`
- Modify: `package.json`
- Modify: any file required by a failing verification check

**Interfaces:**
- Consumes: completed application.
- Produces: documented, testable local demo.

- [ ] **Step 1: Complete responsive styling**

Verify desktop composition A: filters across the top; map at about two-thirds width; recommendation rail at one-third; details below. At widths below 900px stack map and list; below 600px stack metric cards and keep controls full-width. Ensure no horizontal overflow at 320px.

- [ ] **Step 2: Add reduced-motion and accessibility polish**

Add `prefers-reduced-motion` handling, visible keyboard focus, semantic headings, labels for every slider, non-color status text, and accessible names for map and recommendation regions.

- [ ] **Step 3: Write local setup instructions**

README must contain these exact flows:

```powershell
npm install
Copy-Item .env.example .env
# вставить ключ в VITE_YANDEX_MAPS_KEY внутри .env
npm run generate:data
npm run dev
```

Also document `npm test` and `npm run build`, explain that LLM buttons are intentionally demonstrational, and state that all business data is synthetic.

- [ ] **Step 4: Run the full automated verification**

Run: `npm run generate:data`

Expected: `Generated 18 zones, 20 stores, 18 scores`.

Run: `npm test -- --run`

Expected: all test files PASS with zero failed tests.

Run: `npm run build`

Expected: Vite exits with code 0 and creates `dist/`.

- [ ] **Step 5: Run secret and placeholder scans**

```powershell
rg -n "OPENAI_API_KEY|sk-[A-Za-z0-9]|YOUR_KEY|TODO|TBD" . -g '!node_modules/**' -g '!dist/**' -g '!docs/superpowers/**'
git status --short
```

Expected: no secret, placeholder, or `.env` match; only intentional final changes are listed before commit.

- [ ] **Step 6: Perform manual browser verification**

With a local `.env` key, verify: both tabs; keyless fallback by temporarily removing the key; heatmap and both marker types; all three filters; empty selection; recommendation click; map click; details; demo LLM notification; layouts at 1440px, 900px, 600px and 320px.

- [ ] **Step 7: Commit the finished demo**

```powershell
git add README.md package.json src
git commit -m "docs: finalize Techvill prototype demo"
git status --short
```

Expected: clean working tree.
