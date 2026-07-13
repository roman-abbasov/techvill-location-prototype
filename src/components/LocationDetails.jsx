import { useState } from 'react';
import { formatCurrency } from '../domain/formatters.js';

const riskLabels = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };

export default function LocationDetails({ zone, score, nearestStore, onClose }) {
  const [demoMessage, setDemoMessage] = useState('');
  return <section className="details-panel" aria-label="Детали локации">
    <div className="details-title"><div><p className="eyebrow">Выбранная локация · {zone.district}</p><h2>{zone.address_label}</h2></div><button type="button" className="close-button" aria-label="Закрыть детали" onClick={onClose}>×</button></div>
    <div className="detail-metrics"><div><small>Потенциал</small><b>{score.score}<em>/100</em></b></div><div><small>Прогноз выручки</small><b>{formatCurrency(score.revenue_forecast)}</b></div><div><small>Окупаемость</small><b>{score.payback_months} мес</b></div><div><small>Каннибализация</small><b className={`risk-text risk-${score.cannibalization_risk}`}>{riskLabels[score.cannibalization_risk]}</b></div></div>
    <div className="details-grid"><div><h3>Что повлияло на оценку</h3><div className="factor-list">{score.factor_contributions.map((factor) => <div key={factor.factor}><span>{factor.factor}</span><div className={`factor-track ${factor.impact}`}><i style={{ width: `${factor.weight * 100}%` }} /></div><b>{factor.impact === 'positive' ? '+' : '−'}{Math.round(factor.weight * 100)}%</b></div>)}</div></div><div className="explanation-box"><span>✦</span><div><h3>Объяснение рекомендации</h3><p>{score.explanation_text}</p><p className="nearest-store">Ближайшая точка: {nearestStore?.address_label ?? '—'} · {score.nearest_own_store.distance_m} м</p><button type="button" className="secondary-button" onClick={() => setDemoMessage('Демо: подключение LLM предусмотрено на следующем этапе')}>Сформировать ИИ-объяснение</button>{demoMessage && <p className="demo-message" role="status">{demoMessage}</p>}</div></div></div>
  </section>;
}
