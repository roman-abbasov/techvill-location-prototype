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
