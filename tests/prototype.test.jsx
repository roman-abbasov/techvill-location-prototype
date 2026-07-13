import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import PrototypePage from '../src/components/PrototypePage.jsx';
import { buildRecommendation, calculateEconomics, calculateScoreBreakdown } from '../src/domain/scoring.js';

const zone = { zone_id: 'z1', city: 'Москва', district: 'Хамовники', address_label: 'Комсомольский проспект, 28', center_lat: 55.72, center_lng: 37.57, distance_from_center_km: 3, features: { population_density: 12433, avg_income_index: .9, competitors_count_300m: 4, foot_traffic_score: 88, car_traffic_score: 60, distance_to_metro_m: 195, new_developments_nearby: 1, delivery_orders_density: 277, rent_price_per_sqm: 2591 } };
const store = { store_id: 's1', address_label: 'Остоженка, 27', lat: 55.73, lng: 37.59 };
const breakdown = calculateScoreBreakdown(zone.features);
const economics = calculateEconomics(zone.features, 4_900_000);
const score = { zone_id: 'z1', score: breakdown.score, revenue_forecast: 4900000, payback_months: economics.paybackMonths, economics, cannibalization_risk: 'low', nearest_own_store: { store_id: 's1', distance_m: 1200 }, factor_breakdown: breakdown.factors, recommendation: buildRecommendation({ zone, breakdown, economics, revenueForecast: 4_900_000, risk: 'low', nearestStore: store, distanceM: 1200 }) };
const fixtureData = { zones: [zone], stores: [store], scores: [score] };

it('sorts recommendations and opens details after a click', async () => {
  render(<PrototypePage initialData={fixtureData} />);
  const item = screen.getByRole('button', { name: /открыть локацию/i });
  expect(item).toHaveTextContent(String(score.score));
  await userEvent.click(item);
  expect(screen.getByRole('region', { name: /детали локации/i })).toHaveTextContent(zone.address_label);
  expect(screen.getByRole('heading', { name: 'Из чего складывается оценка' })).toBeInTheDocument();
  expect(screen.getByText(`Итого: ${score.score} из 100 баллов`)).toBeInTheDocument();
  expect(screen.getByText(/Пешеходный трафик:/)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Объяснение рекомендации' })).toBeInTheDocument();
  expect(screen.getByText('Демо-объяснение сформировано по шаблону')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Что проверить вручную' })).toBeInTheDocument();
});

it('does not imitate a live LLM request', async () => {
  render(<PrototypePage initialData={fixtureData} />);
  await userEvent.click(screen.getByRole('button', { name: /открыть локацию/i }));
  expect(screen.queryByRole('button', { name: /сформировать ии-объяснение/i })).not.toBeInTheDocument();
});
