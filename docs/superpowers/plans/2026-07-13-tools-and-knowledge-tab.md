# Tools and Knowledge Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the third “Использованные инструменты и знания” tab, update the approved assignment copy, and explain the prototype map implementation.

**Architecture:** Keep the existing local tab state in `App.jsx`, add one focused static page component, and render tool/article content from local data arrays. Store all icon assets locally and extend the existing Techvill design system in `styles.css` without adding dependencies or changing the map logic.

**Tech Stack:** React, Vite, Vitest, Testing Library, CSS, local SVG assets.

## Global Constraints

- Preserve the user-provided Russian copy exactly, including “Вайбкодинг в чистом виде!” and “Yandex Maps API Heatmap Module”.
- Keep the existing global “Важно о концепции” disclaimer on all three tabs.
- Do not change the heatmap, recommendation, scoring, filtering, or data-loading logic.
- Do not add runtime API calls, icon packages, routing, or server logic.
- External article links must use `target="_blank"` and `rel="noreferrer"`.
- The three-tab header and new page must remain readable on desktop and mobile.

---

### Task 1: Assignment and Prototype Copy

**Files:**
- Modify: `tests/app.test.jsx`
- Modify: `tests/prototype.test.jsx`
- Modify: `src/components/AssignmentPage.jsx`
- Modify: `src/components/PrototypePage.jsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: existing `AssignmentPage` and `PrototypePage` React components.
- Produces: approved section-eight copy and a `.prototype-disclaimer` informational block.

- [ ] **Step 1: Write failing copy tests**

Add assertions for the exact section-eight label, heading, and paragraph in `tests/app.test.jsx`. Add a prototype test that expects the complete disclaimer text, a `<strong>` element containing `Yandex Maps API Heatmap Module`, and no `AI location intelligence` text.

- [ ] **Step 2: Run the focused tests and verify failure**

Run:

```powershell
pnpm exec vitest --run tests/app.test.jsx tests/prototype.test.jsx
```

Expected: FAIL because the assignment still contains the old copy and the prototype disclaimer does not exist.

- [ ] **Step 3: Implement the approved copy**

Replace section eight with:

```jsx
<SectionLabel number="08">Моя прямая ответственность</SectionLabel>
<h2>Моя роль как Project Manager AI</h2>
<p>Я являюсь связующим звеном между отделом развития, командой модели, руководством и иными заказчиками и заинтересованными лицами</p>
```

Remove the prototype eyebrow and add this block after `.prototype-intro`:

```jsx
<aside className="prototype-disclaimer" aria-labelledby="prototype-disclaimer-title">
  <span className="disclaimer-mark" aria-hidden="true">i</span>
  <div>
    <h2 id="prototype-disclaimer-title">Важно о прототипе</h2>
    <p>
      Здесь я подтянул Яндекс API со своим ключом и хотел наиболее наглядно продемонстрировать прототип. Помимо прочего пытался на основе <strong>Yandex Maps API Heatmap Module</strong> отрисовать именно тепловую карту. Далеко от идеала (я не программист), но я уверен с командой на обсуждении можно будет прийти либо к такому, но более приемлемому варианту либо вообще пересмотреть формат отображения и отрисовки
    </p>
  </div>
</aside>
```

Style `.prototype-disclaimer` from the same visual foundation as `.concept-disclaimer`, but keep it inside the prototype content width with appropriate bottom spacing.

- [ ] **Step 4: Re-run the focused tests**

Run the same Vitest command. Expected: PASS.

- [ ] **Step 5: Commit the copy change**

```powershell
git add tests/app.test.jsx tests/prototype.test.jsx src/components/AssignmentPage.jsx src/components/PrototypePage.jsx src/styles.css
git commit -m "content: clarify responsibility and prototype context"
```

### Task 2: Third Tab and Knowledge Page

**Files:**
- Create: `tests/tools-page.test.jsx`
- Create: `src/components/ToolsAndKnowledgePage.jsx`
- Modify: `tests/app.test.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/AppShell.jsx`

**Interfaces:**
- Consumes: `activeTab: string` and `onTabChange(tab: string)` in `AppShell`.
- Produces: `ToolsAndKnowledgePage()` and the tab label `Использованные инструменты и знания`.

- [ ] **Step 1: Write failing page and navigation tests**

In `tests/tools-page.test.jsx`, render `ToolsAndKnowledgePage` and assert the intro, five card headings, all user-provided descriptions, four article links with exact `href`, `_blank`, and `noreferrer`, and the Techvill image alt text. Extend `tests/app.test.jsx` to click the third tab and expect its page heading.

- [ ] **Step 2: Run the focused tests and verify failure**

```powershell
pnpm exec vitest --run tests/app.test.jsx tests/tools-page.test.jsx
```

Expected: FAIL because the component and third tab do not exist.

- [ ] **Step 3: Create the page component**

Create `ToolsAndKnowledgePage.jsx` with:

```jsx
const articles = [
  { title: 'Кейс М.Видео-Эльдорадо про ML для выбора локаций', href: 'https://vc.ru/mvideoeldorado/129503-ekspansiya-na-mashinnom-obuchenii-otkryvaem-magaziny-v-luchshih-lokaciyah-i-razvivaem-onlayn', description: 'Реальный пример того, как крупная российская сеть считает трафик, каннибализацию и прогноз оборота — помог понять, какие данные вообще используются на практике.' },
  { title: 'Геоаналитика для выбора локации магазина (Билайн)', href: 'https://bigdata.beeline.ru/blog/articles/vybor-lokacii-magazina', description: 'Объясняет, как тепловые карты и данные о трафике используются ритейлерами для выбора места под магазин.' },
  { title: 'Как геоаналитика помогает искать места для точек, модель Хаффа', href: 'https://geointellect.com/kak-geoanalitika-pomogaet-iskat-mesta-dlya-torgovyh-tochek/', description: 'Отсюда я взял понимание, как классически считают распределение трафика между несколькими точками поблизости.' },
  { title: 'Что такое каннибализация рынка и как её избегать', href: 'https://priceva.ru/blog/article/chto-takoe-kannibalizatsiya-rynka-vidy-i-sposoby-predotvrashheniya', description: 'Базовое объяснение эффекта каннибализации в ритейле — пригодилось, чтобы точнее сформулировать этот риск в разделе 9.' },
];
```

Render the intro and cards for Notion, GPT Codex, Яндекс.Карты API, Внешние статьи, and Оформление. Render article links with `target="_blank" rel="noreferrer"`.

- [ ] **Step 4: Connect the third tab**

Define the three tab labels in `AppShell`. Replace the binary branch in `App.jsx` with an explicit page map or switch so each label renders the correct component and each panel keeps a unique id.

- [ ] **Step 5: Re-run focused tests**

Run the same Vitest command. Expected: PASS.

- [ ] **Step 6: Commit the functional page**

```powershell
git add tests/app.test.jsx tests/tools-page.test.jsx src/App.jsx src/components/AppShell.jsx src/components/ToolsAndKnowledgePage.jsx
git commit -m "feat: add tools and knowledge tab"
```

### Task 3: Local Icons and Responsive Presentation

**Files:**
- Create: `src/assets/icon-notion.svg`
- Create: `src/assets/icon-openai.svg`
- Create: `src/assets/icon-yandex.svg`
- Create: `src/assets/icon-articles.svg`
- Modify: `src/components/ToolsAndKnowledgePage.jsx`
- Modify: `src/styles.css`
- Modify: `tests/tools-page.test.jsx`

**Interfaces:**
- Consumes: five card records in `ToolsAndKnowledgePage` and existing `logo-techvill.svg`.
- Produces: local image sources with descriptive `alt` attributes and responsive `.tools-page`, `.tools-grid`, `.tool-card`, and `.article-list` styles.

- [ ] **Step 1: Add failing icon assertions**

Assert that the page contains images named `Notion`, `OpenAI`, `Яндекс` and `Техвилл`, plus an accessible decorative label for the external-articles icon.

- [ ] **Step 2: Run the icon test and verify failure**

```powershell
pnpm exec vitest --run tests/tools-page.test.jsx
```

Expected: FAIL because the local icon assets are not rendered.

- [ ] **Step 3: Add and connect local SVG assets**

Use compact official or visually accurate SVG marks for Notion, OpenAI, and Yandex; create a simple document/research SVG for articles; reuse `logo-techvill.svg`. Import them from `ToolsAndKnowledgePage.jsx` and render them inside `.tool-icon` containers.

- [ ] **Step 4: Implement responsive styling**

Add a two-column `.tools-grid`, make `.articles-card` span both columns, and collapse to one column below 760px. Prevent long tab text from overflowing by allowing header buttons to wrap and using a one-column tab layout on small phones. Add clear hover and focus states to article links without changing the existing Techvill palette.

- [ ] **Step 5: Run focused and full verification**

```powershell
pnpm exec vitest --run tests/tools-page.test.jsx tests/app.test.jsx tests/prototype.test.jsx
pnpm exec vitest --run
pnpm run build
```

Expected: all tests PASS and Vite production build succeeds.

- [ ] **Step 6: Visually verify**

Open the local Vite page and inspect all three tabs at desktop and mobile widths. Confirm that the long third tab is readable, cards do not overflow, article links remain scannable, and the existing prototype map is unchanged.

- [ ] **Step 7: Commit presentation changes**

```powershell
git add src/assets/icon-notion.svg src/assets/icon-openai.svg src/assets/icon-yandex.svg src/assets/icon-articles.svg src/components/ToolsAndKnowledgePage.jsx src/styles.css tests/tools-page.test.jsx
git commit -m "style: present tools with branded icons"
```
