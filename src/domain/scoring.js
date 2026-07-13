const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const scale = (value, min, max) => clamp((value - min) / (max - min), 0, 1);
const number = (value) => new Intl.NumberFormat('ru-RU').format(Math.round(value));
const projects = (value) => `${number(value)} ${value === 1 ? 'проект' : value >= 2 && value <= 4 ? 'проекта' : 'проектов'} рядом`;

export const factorDefinitions = [
  { key: 'population_density', label: 'Плотность населения', maxPoints: 14, min: 4000, max: 25000, format: (v) => `${number(v)} чел./км²` },
  { key: 'avg_income_index', label: 'Доход аудитории', maxPoints: 10, min: 0.7, max: 1.6, format: (v) => `индекс ${Number(v).toFixed(2)}` },
  { key: 'foot_traffic_score', label: 'Пешеходный трафик', maxPoints: 18, min: 20, max: 95, format: (v) => `${number(v)} из 100` },
  { key: 'car_traffic_score', label: 'Автомобильный трафик', maxPoints: 7, min: 15, max: 90, format: (v) => `${number(v)} из 100` },
  { key: 'distance_to_metro_m', label: 'Близость метро', maxPoints: 10, min: 100, max: 1800, inverse: true, format: (v) => `${number(v)} м` },
  { key: 'new_developments_nearby', label: 'Новая застройка', maxPoints: 8, min: 0, max: 4, format: projects },
  { key: 'delivery_orders_density', label: 'Спрос в доставке', maxPoints: 16, min: 30, max: 350, format: (v) => `${number(v)} заказов/км²` },
  { key: 'competitors_count_300m', label: 'Конкуренты рядом', maxPoints: 9, min: 0, max: 6, inverse: true, format: (v) => `${number(v)} в радиусе 300 м` },
  { key: 'rent_price_per_sqm', label: 'Ставка аренды', maxPoints: 8, min: 1800, max: 6500, inverse: true, format: (v) => `${number(v)} ₽/м²` },
];

function allocateRoundedPoints(factors, target) {
  const allocated = factors.map((factor) => ({ ...factor, points: Math.floor(factor.rawPoints) }));
  let remainder = target - allocated.reduce((sum, factor) => sum + factor.points, 0);
  const order = allocated.map((factor, index) => ({ index, fraction: factor.rawPoints - Math.floor(factor.rawPoints) })).sort((a, b) => b.fraction - a.fraction);
  for (let index = 0; index < remainder; index += 1) allocated[order[index].index].points += 1;
  return allocated.map(({ rawPoints, ...factor }) => ({ ...factor, lostPoints: factor.maxPoints - factor.points }));
}

export function calculateScoreBreakdown(features) {
  const rawFactors = factorDefinitions.map((definition) => {
    const rawValue = features[definition.key];
    const directScore = scale(rawValue, definition.min, definition.max);
    const normalized = definition.inverse ? 1 - directScore : directScore;
    return {
      key: definition.key,
      label: definition.label,
      rawValue,
      displayValue: definition.format(rawValue),
      normalizedScore: Math.round(normalized * 100),
      maxPoints: definition.maxPoints,
      rawPoints: normalized * definition.maxPoints,
    };
  });
  const score = Math.round(rawFactors.reduce((sum, factor) => sum + factor.rawPoints, 0));
  return { score, factors: allocateRoundedPoints(rawFactors, score).sort((a, b) => b.maxPoints - a.maxPoints) };
}

export function calculateScore(features) {
  return calculateScoreBreakdown(features).score;
}

export function calculateEconomics(features, revenueForecast) {
  const assumptions = { storeAreaSqm: 100, launchInvestment: 8_000_000, operatingMarginBeforeRent: 0.18, otherFixedCosts: 150_000 };
  const monthlyRent = Math.round(features.rent_price_per_sqm * assumptions.storeAreaSqm);
  const monthlyCashFlow = Math.round(revenueForecast * assumptions.operatingMarginBeforeRent - monthlyRent - assumptions.otherFixedCosts);
  return {
    assumptions,
    monthlyRent,
    monthlyCashFlow,
    paybackMonths: monthlyCashFlow > 0 ? Math.ceil(assumptions.launchInvestment / monthlyCashFlow) : null,
  };
}

export function calculateCannibalizationRisk(monthlyRevenue, distanceM) {
  const rawRisk = monthlyRevenue / Math.max(distanceM, 1) ** 2;
  if (rawRisk >= 35) return 'high';
  if (rawRisk >= 5) return 'medium';
  return 'low';
}

export function buildRecommendation({ zone, breakdown, economics, revenueForecast, risk, nearestStore, distanceM }) {
  const drivers = [...breakdown.factors].sort((a, b) => b.points - a.points).slice(0, 3).map((factor) => `${factor.label}: ${factor.displayValue} — ${factor.points} из ${factor.maxPoints} баллов`);
  const constraints = [...breakdown.factors].sort((a, b) => b.lostPoints - a.lostPoints).slice(0, 2).map((factor) => `${factor.label}: ${factor.displayValue} — недобрано ${factor.lostPoints} баллов`);
  const riskLabel = { low: 'низкий', medium: 'средний', high: 'высокий' }[risk];
  const verdict = breakdown.score >= 60 ? 'Высокий приоритет для детальной проверки' : breakdown.score >= 50 ? 'Требуется дополнительная проверка' : 'Низкий приоритет в текущем сценарии';
  const action = breakdown.score >= 60 && economics.paybackMonths && risk !== 'high'
    ? 'Рассматривать адрес в приоритетном порядке и перейти к проверке помещения.'
    : breakdown.score >= 50 && risk !== 'high'
      ? 'Отправить адрес на дополнительную проверку экономики, трафика и каннибализации.'
      : 'Понизить приоритет адреса до устранения ключевых ограничений.';
  const economicsText = economics.paybackMonths
    ? `Прогноз выручки — ${number(revenueForecast)} ₽ в месяц. Расчётный денежный поток — ${number(economics.monthlyCashFlow)} ₽ в месяц, сценарная окупаемость — ${economics.paybackMonths} мес.`
    : `Прогноз выручки — ${number(revenueForecast)} ₽ в месяц. При заданных допущениях денежный поток составляет ${number(economics.monthlyCashFlow)} ₽, поэтому точка не окупается.`;
  return {
    verdict,
    summary: `${zone.address_label} получает ${breakdown.score} из 100 баллов по девяти факторам модели-гипотезы.`,
    drivers,
    constraints,
    economics: economicsText,
    cannibalization: `Риск каннибализации — ${riskLabel}. Ближайший магазин: ${nearestStore?.address_label ?? 'не найден'}, расстояние ${number(distanceM)} м. Чем ближе сильная действующая точка, тем выше риск перераспределения спроса внутри сети.`,
    manualChecks: ['Подтвердить коммерческие условия и фактическую площадь помещения.', 'Провести ручной замер пешеходного и автомобильного трафика.', 'Проверить доступность входа, разгрузки и заметность помещения.', 'Оценить влияние открытия на выручку ближайшего магазина.'],
    action,
  };
}
