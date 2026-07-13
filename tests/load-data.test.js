import { afterEach, expect, it, vi } from 'vitest';
import { loadPrototypeData } from '../src/data/loadData.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

it('loads prototype JSON files relative to the deployed Vite base path', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({}),
  });
  vi.stubGlobal('fetch', fetchMock);

  await loadPrototypeData('/techvill-location-prototype/');

  expect(fetchMock.mock.calls.map(([path]) => path)).toEqual([
    '/techvill-location-prototype/data/zones.json',
    '/techvill-location-prototype/data/stores.json',
    '/techvill-location-prototype/data/scores.json',
  ]);
});
