import { formatCurrency } from '../domain/formatters.js';

const riskLabels = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };

export default function RecommendationList({ scores, zonesById, selectedZoneId, onSelect }) {
  return <aside className="recommendation-panel" aria-label="Рейтинг локаций">
    <div className="panel-heading"><div><p className="eyebrow">Рекомендации</p><h2>Топ локаций</h2></div><span>{scores.length}</span></div>
    {scores.length === 0 ? <div className="empty-state"><b>Не найдено подходящих локаций</b><p>Увеличьте радиус или максимальную ставку аренды.</p></div> : <div className="recommendation-list">{scores.map((score, index) => {
      const zone = zonesById.get(score.zone_id);
      return <button type="button" key={score.zone_id} aria-label={`Открыть локацию ${zone.address_label}`} aria-current={selectedZoneId === score.zone_id ? 'true' : undefined} onClick={() => onSelect(score.zone_id)}>
        <span className="rank">{String(index + 1).padStart(2, '0')}</span><span className="location-copy"><b>{zone.address_label}</b><small>{zone.district}</small><span className="location-stats"><em>{formatCurrency(score.revenue_forecast)} / мес</em><em>{score.payback_months} мес</em></span></span><span className="score-bubble">{score.score}</span><span className={`risk-badge risk-${score.cannibalization_risk}`}>{riskLabels[score.cannibalization_risk]}</span>
      </button>;
    })}</div>}
  </aside>;
}
