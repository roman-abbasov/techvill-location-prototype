const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const scale = (value, min, max) => clamp((value - min) / (max - min), 0, 1);

export function calculateScore(features) {
  const score = 100 * (
    scale(features.population_density, 4000, 25000) * 0.14 +
    scale(features.avg_income_index, 0.7, 1.6) * 0.10 +
    scale(features.foot_traffic_score, 20, 95) * 0.18 +
    scale(features.car_traffic_score, 15, 90) * 0.07 +
    (1 - scale(features.distance_to_metro_m, 100, 1800)) * 0.10 +
    scale(features.new_developments_nearby, 0, 4) * 0.08 +
    scale(features.delivery_orders_density, 30, 350) * 0.16 +
    (1 - scale(features.competitors_count_300m, 0, 6)) * 0.09 +
    (1 - scale(features.rent_price_per_sqm, 1800, 6500)) * 0.08
  );
  return Math.round(clamp(score, 0, 100));
}

export function calculateCannibalizationRisk(monthlyRevenue, distanceM) {
  const rawRisk = monthlyRevenue / Math.max(distanceM, 1) ** 2;
  if (rawRisk >= 35) return 'high';
  if (rawRisk >= 5) return 'medium';
  return 'low';
}
