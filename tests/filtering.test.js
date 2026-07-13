import { expect, it } from 'vitest';
import { filterRecommendations } from '../src/domain/filtering.js';

it('filters by city, distance and rent, then sorts score descending', () => {
  const zones = new Map([
    ['a', { city: 'Москва', distance_from_center_km: 2, features: { rent_price_per_sqm: 4000 } }],
    ['b', { city: 'Москва', distance_from_center_km: 4, features: { rent_price_per_sqm: 3000 } }],
    ['c', { city: 'Казань', distance_from_center_km: 1, features: { rent_price_per_sqm: 2000 } }],
  ]);
  const scores = [{ zone_id: 'a', score: 75 }, { zone_id: 'b', score: 95 }, { zone_id: 'c', score: 99 }];
  expect(filterRecommendations(scores, zones, { city: 'Москва', radiusKm: 3, maxRent: 4500 }).map(item => item.zone_id)).toEqual(['a']);
});
