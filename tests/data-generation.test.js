import { expect, it } from 'vitest';
import { generateDataset } from '../scripts/generate-data.mjs';

it('generates a deterministic and internally consistent dataset', () => {
  const first = generateDataset(20260713);
  const second = generateDataset(20260713);
  expect(first).toEqual(second);
  expect(first.zones).toHaveLength(18);
  expect(first.stores).toHaveLength(20);
  expect(first.scores).toHaveLength(18);
  expect(first.scores.every((score) => first.zones.some((zone) => zone.zone_id === score.zone_id))).toBe(true);
  expect(first.scores.every((score) => score.factor_breakdown.length === 9)).toBe(true);
  expect(first.scores.every((score) => score.factor_breakdown.reduce((sum, factor) => sum + factor.points, 0) === score.score)).toBe(true);
  expect(first.scores.every((score) => score.economics && score.recommendation)).toBe(true);
});
