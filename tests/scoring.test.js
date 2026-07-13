import { describe, expect, it } from 'vitest';
import { buildRecommendation, calculateCannibalizationRisk, calculateEconomics, calculateScore, calculateScoreBreakdown } from '../src/domain/scoring.js';

const realisticFeatures = {
  population_density: 12433,
  avg_income_index: 0.9,
  competitors_count_300m: 4,
  foot_traffic_score: 88,
  car_traffic_score: 60,
  distance_to_metro_m: 195,
  new_developments_nearby: 1,
  delivery_orders_density: 277,
  rent_price_per_sqm: 2591,
};

describe('calculateScore', () => {
  it('keeps the score in the 0–100 range', () => {
    expect(calculateScore({ population_density: 50000, avg_income_index: 3, competitors_count_300m: 0, foot_traffic_score: 100, car_traffic_score: 100, distance_to_metro_m: 0, new_developments_nearby: 8, delivery_orders_density: 500, rent_price_per_sqm: 1000 })).toBe(100);
    expect(calculateScore({ population_density: 1000, avg_income_index: 0.5, competitors_count_300m: 10, foot_traffic_score: 5, car_traffic_score: 5, distance_to_metro_m: 5000, new_developments_nearby: 0, delivery_orders_density: 5, rent_price_per_sqm: 9000 })).toBe(0);
  });
});

describe('calculateScoreBreakdown', () => {
  it('allocates visible factor points that add up exactly to the score', () => {
    const breakdown = calculateScoreBreakdown(realisticFeatures);
    expect(breakdown.factors).toHaveLength(9);
    expect(breakdown.factors.reduce((sum, factor) => sum + factor.points, 0)).toBe(breakdown.score);
    expect(breakdown.factors.reduce((sum, factor) => sum + factor.maxPoints, 0)).toBe(100);
  });

  it('treats lower rent and fewer competitors as better values', () => {
    const favorable = calculateScoreBreakdown({ ...realisticFeatures, rent_price_per_sqm: 1800, competitors_count_300m: 0 });
    const unfavorable = calculateScoreBreakdown({ ...realisticFeatures, rent_price_per_sqm: 6500, competitors_count_300m: 6 });
    expect(favorable.score).toBeGreaterThan(unfavorable.score);
  });
});

describe('calculateEconomics', () => {
  it('shows assumptions and calculates payback without a 30-month cap', () => {
    const economics = calculateEconomics(realisticFeatures, 4_270_000);
    expect(economics.assumptions.storeAreaSqm).toBe(100);
    expect(economics.monthlyRent).toBe(259_100);
    expect(economics.monthlyCashFlow).toBeGreaterThan(0);
    expect(economics.paybackMonths).toBeGreaterThan(0);
  });

  it('returns no payback for non-positive cash flow', () => {
    const economics = calculateEconomics({ ...realisticFeatures, rent_price_per_sqm: 6500 }, 2_000_000);
    expect(economics.monthlyCashFlow).toBeLessThanOrEqual(0);
    expect(economics.paybackMonths).toBeNull();
  });
});

it('builds a structured recommendation with decision, drivers, constraints, economics and checks', () => {
  const breakdown = calculateScoreBreakdown(realisticFeatures);
  const economics = calculateEconomics(realisticFeatures, 4_270_000);
  const recommendation = buildRecommendation({
    zone: { address_label: 'Комсомольский проспект, 28' },
    breakdown,
    economics,
    revenueForecast: 4_270_000,
    risk: 'low',
    nearestStore: { address_label: 'ул. Остоженка, 27' },
    distanceM: 1361,
  });
  expect(recommendation.verdict).toBeTruthy();
  expect(recommendation.drivers).toHaveLength(3);
  expect(recommendation.constraints).toHaveLength(2);
  expect(recommendation.manualChecks.length).toBeGreaterThanOrEqual(4);
  expect(recommendation.economics).toContain('выруч');
  expect(recommendation.cannibalization).toMatch(/1[\s\u00a0]361/);
});

describe('calculateCannibalizationRisk', () => {
  it.each([[5000000, 300, 'high'], [4000000, 800, 'medium'], [3000000, 1800, 'low']])('maps %i revenue at %i m to %s', (revenue, distance, expected) => {
    expect(calculateCannibalizationRisk(revenue, distance)).toBe(expected);
  });
});
