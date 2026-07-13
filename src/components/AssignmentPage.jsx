import {
  aiApplications,
  capabilities,
  dataSources,
  pmResponsibilities,
  risks,
  serviceView,
  stages,
  successMetrics,
} from '../content/assignment.js';

const SectionLabel = ({ number, children }) => <p className="eyebrow">{number} · {children}</p>;

export default function AssignmentPage() {
  return (
    <div className="assignment-page" id="panel-Задание" role="tabpanel">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Тестовое задание · Project Manager AI</p>
          <h1>Быстрый и объяснимый выбор новых точек</h1>
          <p className="hero-copy">ИИ и геоаналитика превращают сотни адресов в короткий список обоснованных кандидатов — решение остаётся за человеком.</p>
          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={() => document.querySelector('[role=tab][aria-controls="panel-Прототип"]')?.click()}>
              Открыть прототип <span>→</span>
            </button>
            <span className="hero-note">Синтетические данные · Москва</span>
          </div>
        </div>
        <div className="hero-visual" aria-label="Схема отбора локаций">
          <span className="map-ring ring-one" /><span className="map-ring ring-two" />
          <span className="map-dot dot-one" /><span className="map-dot dot-two" /><span className="map-dot dot-three" />
          <div className="score-card"><small>Потенциал зоны</small><b>92</b><span>Высокий</span></div>
        </div>
      </section>

      <section className="content-section intro-grid">
        <div><SectionLabel number="01">Суть задачи</SectionLabel><h2>Суть задачи</h2></div>
        <div className="lead-copy">
          <p>Сейчас выбор новых точек во многом зависит от опыта сотрудников и экспертной оценки «на глаз». Такой подход трудно масштабировать, когда нужно быстро сравнить сотни адресов.</p>
          <p>Сервис объединяет данные о районе с негеографическими бизнес-показателями и помогает отобрать наиболее перспективные варианты для детального анализа.</p>
          <p className="callout"><b>Главная цель:</b> не заменить человека, а дать ему быстрый и обоснованный первый фильтр.</p>
        </div>
      </section>

      <section className="content-section">
        <SectionLabel number="02">Возможности</SectionLabel><h2>Что должен уметь сервис</h2>
        <div className="capability-grid">{capabilities.map(([n, title, text]) => <article className="feature-card" key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="content-section dark-section">
        <div><SectionLabel number="03">Метрики</SectionLabel><h2>Как мерить успех</h2></div>
        <div className="metric-list">{successMetrics.map(([title, text], i) => <div key={title}><b>0{i + 1}</b><span><strong>{title}</strong><small>{text}</small></span></div>)}</div>
      </section>

      <section className="content-section">
        <SectionLabel number="04">Данные</SectionLabel><h2>Какие данные использовать</h2>
        <div className="data-grid">
          <article><h3>Геоданные</h3><ul>{dataSources.geo.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article><h3>Негеографические данные</h3><ul>{dataSources.business.map((item) => <li key={item}>{item}</li>)}</ul></article>
        </div>
      </section>

      <section className="content-section">
        <SectionLabel number="05">Интерфейс</SectionLabel><h2>Как это будет выглядеть</h2>
        <div className="service-view-grid">{serviceView.map(([title, text]) => <article className="feature-card" key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="content-section">
        <SectionLabel number="06">Принцип работы</SectionLabel><h2>Как это может работать (без глубоких технических деталей)</h2>
        <p className="section-lead">Основа — модель, обученная на данных уже открытых магазинов. Она сравнивает характеристики районов с фактическими результатами точек.</p>
        <div className="ai-flow">{aiApplications.map(([title, text], i) => <article key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        <p className="backtest-note"><b>Обязательное условие:</b> прежде чем модель начнёт влиять на реальные решения, нужно провести бэктест на открытиях последних 2–3 лет.</p>
      </section>

      <section className="content-section">
        <SectionLabel number="07">План</SectionLabel><h2>Этапы проекта</h2>
        <div className="timeline">{stages.map(([stage, time, result], i) => <div className="timeline-row" key={stage}><span className="timeline-index">{String(i + 1).padStart(2, '0')}</span><strong>{stage}</strong><b>{time}</b><small>{result}</small></div>)}</div>
      </section>

      <section className="content-section pm-section">
        <div><SectionLabel number="08">Моя прямая ответственность</SectionLabel><h2>Моя роль как Project Manager AI</h2><p>Я являюсь связующим звеном между отделом развития, командой модели, руководством и иными заказчиками и заинтересованными лицами</p></div>
        <ul className="pm-list">{pmResponsibilities.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>

      <section className="content-section">
        <SectionLabel number="09">Контроль</SectionLabel><h2>Риски</h2>
        <div className="risk-table">{risks.map(([risk, action]) => <div key={risk}><strong>{risk}</strong><span>{action}</span></div>)}</div>
      </section>

      <section className="conclusion">
        <SectionLabel number="10">Вывод</SectionLabel><h2>Итог</h2>
        <p>ИИ не заменяет человека, который принимает решение об открытии. Он даёт быстрый и объяснимый инструмент для первичного отбора адресов, а обязательная проверка на истории помогает заслужить доверие команды.</p>
      </section>
    </div>
  );
}
