import { aiApplications, capabilities, dataSources, risks, stages, successMetrics } from '../content/assignment.js';

const Icon = ({ children }) => <span className="section-icon" aria-hidden="true">{children}</span>;

export default function AssignmentPage() {
  return (
    <div className="assignment-page" id="panel-Задание" role="tabpanel">
      <section className="hero">
        <div>
          <p className="eyebrow">Тестовое задание · Project Manager AI</p>
          <h1>Быстрый и объяснимый выбор новых точек</h1>
          <p className="hero-copy">ИИ и геоаналитика превращают сотни адресов в короткий список обоснованных кандидатов — решение остаётся за человеком.</p>
          <div className="hero-actions"><button type="button" className="primary-button" onClick={() => document.querySelector('[role=tab][aria-controls="panel-Прототип"]')?.click()}>Открыть прототип <span>→</span></button><span className="hero-note">Синтетические данные · Москва</span></div>
        </div>
        <div className="hero-visual" aria-label="Схема отбора локаций">
          <span className="map-ring ring-one" /><span className="map-ring ring-two" /><span className="map-dot dot-one" /><span className="map-dot dot-two" /><span className="map-dot dot-three" />
          <div className="score-card"><small>Потенциал зоны</small><b>92</b><span>Высокий</span></div>
        </div>
      </section>

      <section className="content-section intro-grid">
        <div><p className="eyebrow">01 · Суть задачи</p><h2>От «на глазок» — к системному первому фильтру</h2></div>
        <div className="lead-copy"><p>Сегодня выбор сильно зависит от опыта конкретного сотрудника и плохо масштабируется. Сервис быстро оценивает район по гео- и бизнес-сигналам, чтобы команда глубоко анализировала только перспективные варианты.</p><p className="callout"><b>Принцип:</b> не заменить эксперта, а дать ему прозрачную отправную точку.</p></div>
      </section>

      <section className="content-section"><p className="eyebrow">02 · Возможности</p><h2>Что должен уметь сервис</h2><div className="capability-grid">{capabilities.map(([n,title,text])=><article className="feature-card" key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="content-section dark-section"><div><p className="eyebrow">03 · Метрики успеха</p><h2>Ценность измеряется решениями, а не красотой модели</h2></div><div className="metric-list">{successMetrics.map(([title,text],i)=><div key={title}><b>0{i+1}</b><span><strong>{title}</strong><small>{text}</small></span></div>)}</div></section>

      <section className="content-section"><p className="eyebrow">04 · Данные</p><h2>География показывает контекст.<br/>Собственные данные — реальный спрос.</h2><div className="data-grid"><article><Icon>⌖</Icon><h3>Геоданные</h3><ul>{dataSources.geo.map(x=><li key={x}>{x}</li>)}</ul></article><article><Icon>↗</Icon><h3>Бизнес-сигналы</h3><ul>{dataSources.business.map(x=><li key={x}>{x}</li>)}</ul></article></div></section>

      <section className="content-section"><p className="eyebrow">05 · Где именно ИИ</p><h2>Три отдельные задачи — без размытого «AI внутри»</h2><div className="ai-flow">{aiApplications.map(([title,text],i)=><article key={title}><span>0{i+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div><p className="backtest-note"><b>До пилота:</b> спрятать фактическую выручку точек последних 2–3 лет и проверить, насколько точно модель предсказала бы результат до открытия.</p></section>

      <section className="content-section"><p className="eyebrow">06 · План проекта</p><h2>От данных к масштабированию</h2><div className="timeline">{stages.map(([stage,time,result],i)=><div className="timeline-row" key={stage}><span className="timeline-index">{String(i+1).padStart(2,'0')}</span><strong>{stage}</strong><b>{time}</b><small>{result}</small></div>)}</div></section>

      <section className="content-section pm-section"><div><p className="eyebrow">07 · Роль PM AI</p><h2>Связать три языка в одно решение</h2><p>PM отвечает за требования, бэктест, дизайн честного пилота и раннюю коммуникацию с юристами — не просто передаёт задачу дата-сайентистам.</p></div><div className="audience-stack"><span>Отдел развития<small>Объяснимость и доверие</small></span><span>Команда модели<small>Доступные данные и критерии</small></span><span>Руководство<small>ROI и контролируемый риск</small></span></div></section>

      <section className="content-section"><p className="eyebrow">08 · Риски</p><h2>Риски и их митигирование</h2><div className="risk-table">{risks.map(([risk,action])=><div key={risk}><strong>{risk}</strong><span>{action}</span></div>)}</div></section>

      <section className="conclusion"><p className="eyebrow">09 · Итог</p><h2>Не ИИ вместо человека.<br/>ИИ — для лучшего первого решения.</h2><p>Инструмент экономит время и снижает субъективность, а доверие строится на понятных факторах и обязательной проверке модели на истории.</p></section>
    </div>
  );
}
