import { render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import PotentialMap, { resetYandexMapsLoader } from '../src/components/PotentialMap.jsx';

afterEach(() => {
  resetYandexMapsLoader();
  document.querySelectorAll('script[data-yandex-maps]').forEach((node) => node.remove());
  delete window.ymaps;
  vi.restoreAllMocks();
});

it('explains how to configure a missing key', () => {
  render(<PotentialMap apiKey="" zones={[]} stores={[]} scores={[]} onSelectZone={() => {}} />);
  expect(screen.getByText(/VITE_YANDEX_MAPS_KEY/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /получить ключ/i })).toHaveAttribute('href', expect.stringContaining('yandex.ru/dev/maps'));
});

it('keeps a Maps API failure separate from missing data', async () => {
  vi.spyOn(document.head, 'appendChild').mockImplementation((node) => { queueMicrotask(() => node.onerror()); return node; });
  render(<PotentialMap apiKey="bad-key" zones={[]} stores={[]} scores={[]} onSelectZone={() => {}} />);
  expect(await screen.findByText(/не удалось загрузить Яндекс.Карты/i)).toBeInTheDocument();
});
