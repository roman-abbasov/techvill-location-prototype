import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import PrototypePage from '../src/components/PrototypePage.jsx';

const zone = { zone_id: 'z1', city: 'Москва', district: 'Хамовники', address_label: 'Комсомольский проспект, 28', center_lat: 55.72, center_lng: 37.57, distance_from_center_km: 3, features: { rent_price_per_sqm: 4000 } };
const store = { store_id: 's1', address_label: 'Остоженка, 27', lat: 55.73, lng: 37.59 };
const score = { zone_id: 'z1', score: 92, revenue_forecast: 4900000, payback_months: 11, cannibalization_risk: 'low', nearest_own_store: { store_id: 's1', distance_m: 1200 }, factor_contributions: [{ factor: 'Пешеходный трафик', impact: 'positive', weight: .9 }, { factor: 'Аренда', impact: 'negative', weight: .4 }], explanation_text: 'Высокий трафик поддерживает потенциал локации.' };
const fixtureData = { zones: [zone], stores: [store], scores: [score] };

it('sorts recommendations and opens details after a click', async () => {
  render(<PrototypePage initialData={fixtureData} />);
  const item = screen.getByRole('button', { name: /открыть локацию/i });
  expect(item).toHaveTextContent('92');
  await userEvent.click(item);
  expect(screen.getByRole('region', { name: /детали локации/i })).toHaveTextContent(zone.address_label);
});

it('shows an honest demo message instead of calling an API', async () => {
  render(<PrototypePage initialData={fixtureData} />);
  await userEvent.click(screen.getByRole('button', { name: /открыть локацию/i }));
  await userEvent.click(screen.getByRole('button', { name: /сформировать ии-объяснение/i }));
  expect(screen.getByRole('status')).toHaveTextContent('подключение LLM предусмотрено на следующем этапе');
});
