import { formatCurrency } from '../domain/formatters.js';

const riskLabels = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };

export default function LocationDetails({ zone, score, nearestStore, onClose }) {
  const recommendation = score.recommendation;
  const economics = score.economics;
  const payback = economics.paybackMonths ? `${economics.paybackMonths} мес` : 'Не окупается';

  return <section className="details-panel" aria-label="Детали локации">
    <div className="details-title">
      <div><p className="eyebrow">Выбранная локация · {zone.district}</p><h2>{zone.address_label}</h2></div>
      <button type="button" className="close-button" aria-label="Закрыть детали" onClick={onClose}>×</button>
    </div>

    <div className="detail-metrics">
      <div><small>Потенциал</small><b>{score.score}<em>/100</em></b></div>
      <div><small>Прогноз выручки</small><b>{formatCurrency(score.revenue_forecast)}</b><em>в месяц</em></div>
      <div><small>Сценарная окупаемость</small><b>{payback}</b><em>по допущениям прототипа</em></div>
      <div><small>Каннибализация</small><b className={`risk-text risk-${score.cannibalization_risk}`}>{riskLabels[score.cannibalization_risk]}</b><em>{score.nearest_own_store.distance_m} м до ближайшей точки</em></div>
    </div>

    <div className="assessment-layout">
      <div className="score-breakdown">
        <div className="section-heading-row"><div><p className="eyebrow">Прозрачная формула</p><h3>Из чего складывается оценка</h3></div><b>{score.score}/100</b></div>
        <div className="factor-list">{score.factor_breakdown.map((factor) => <div key={factor.key}>
          <span><strong>{factor.label}</strong><small>{factor.displayValue}</small></span>
          <div className="factor-track"><i style={{ width: `${factor.normalizedScore}%` }} /></div>
          <b>{factor.points}<small> из {factor.maxPoints}</small></b>
        </div>)}</div>
        <p className="factor-total">Итого: {score.score} из 100 баллов</p>
      </div>

      <aside className="methodology-card">
        <p className="eyebrow">Методика прототипа</p><h3>Как считается оценка</h3>
        <p>Каждый показатель переводится в шкалу 0–100 и умножается на свой максимальный вес. Для аренды, конкурентов и расстояния до метро меньшее значение даёт больше баллов.</p>
        <div className="weight-list">{score.factor_breakdown.map((factor) => <span key={factor.key}><small>{factor.label}</small><b>{factor.maxPoints}</b></span>)}</div>
        <p className="method-note">Веса — продуктовая гипотеза. Перед использованием в реальных решениях их необходимо проверить на истории открытий и скорректировать вместе с командой.</p>
      </aside>
    </div>

    <div className="economics-card">
      <div><p className="eyebrow">Сценарная экономика</p><h3>Допущения расчёта окупаемости</h3></div>
      <div className="economics-grid">
        <span><small>Площадь</small><b>{economics.assumptions.storeAreaSqm} м²</b></span>
        <span><small>Инвестиции в запуск</small><b>{formatCurrency(economics.assumptions.launchInvestment)}</b></span>
        <span><small>Маржа до аренды</small><b>{Math.round(economics.assumptions.operatingMarginBeforeRent * 100)}%</b></span>
        <span><small>Прочие фикс. расходы</small><b>{formatCurrency(economics.assumptions.otherFixedCosts)}</b></span>
        <span><small>Расчётная аренда</small><b>{formatCurrency(economics.monthlyRent)}</b></span>
        <span><small>Денежный поток</small><b>{formatCurrency(economics.monthlyCashFlow)}</b></span>
      </div>
    </div>

    <article className="recommendation-explanation">
      <div className="explanation-heading"><span aria-hidden="true">✦</span><div><p className="eyebrow">Демо-объяснение сформировано по шаблону</p><h3>Объяснение рекомендации</h3></div></div>
      <div className="verdict-card"><small>Вердикт</small><b>{recommendation.verdict}</b><p>{recommendation.summary}</p></div>
      <div className="explanation-columns">
        <section><h4>Главные преимущества</h4><ul>{recommendation.drivers.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><h4>Что ограничивает оценку</h4><ul>{recommendation.constraints.map((item) => <li key={item}>{item}</li>)}</ul></section>
      </div>
      <div className="decision-context"><p><b>Экономика.</b> {recommendation.economics}</p><p><b>Каннибализация.</b> {recommendation.cannibalization}</p><p className="nearest-store">Ближайшая точка в данных: {nearestStore?.address_label ?? '—'}.</p></div>
      <section className="manual-checks"><h4>Что проверить вручную</h4><ul>{recommendation.manualChecks.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <p className="recommended-action"><b>Рекомендуемое действие:</b> {recommendation.action}</p>
    </article>
  </section>;
}
