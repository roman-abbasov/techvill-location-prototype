import { afterEach, expect, it, vi } from 'vitest';
import { buildHeatmapData, loadYandexMaps, resetYandexMapsLoader } from '../src/components/PotentialMap.jsx';

afterEach(() => {
  document.head.querySelectorAll('script[data-yandex-maps], script[data-yandex-heatmap]').forEach((script) => script.remove());
  delete window.ymaps;
  resetYandexMapsLoader();
  vi.restoreAllMocks();
});

it('builds compact normalized point clouds without filling a rectangular grid', () => {
  const zonesById = new Map([
    ['a', { center_lat: 55.7, center_lng: 37.5 }],
    ['b', { center_lat: 55.8, center_lng: 37.7 }],
  ]);
  const data = buildHeatmapData([{ zone_id: 'a', score: 40 }, { zone_id: 'b', score: 60 }], zonesById, 8);

  expect(data.features).toHaveLength(18);
  expect(data.features.filter((feature) => feature.properties.source)).toHaveLength(2);
  expect(Math.max(...data.features.map((feature) => feature.properties.weight))).toBe(1);
  const sources = data.features.filter((feature) => feature.properties.source).map((feature) => feature.geometry.coordinates);
  data.features.filter((feature) => !feature.properties.source).forEach((feature) => {
    const [lat, lng] = feature.geometry.coordinates;
    const nearest = Math.min(...sources.map(([sourceLat, sourceLng]) => Math.hypot(lat - sourceLat, (lng - sourceLng) * .56)));
    expect(nearest).toBeLessThan(.014);
  });
});

it('loads the official Heatmap module before resolving Yandex Maps', async () => {
  const promise = loadYandexMaps('demo-key');
  const mapsScript = document.head.querySelector('script[data-yandex-maps]');

  expect(mapsScript.src).toContain('api-maps.yandex.ru/2.1/');
  window.ymaps = { ready: (callback) => callback() };
  mapsScript.onload();
  await Promise.resolve();

  const heatmapScript = document.head.querySelector('script[data-yandex-heatmap]');
  expect(heatmapScript).not.toBeNull();
  expect(heatmapScript.src).toBe('https://yastatic.net/s3/mapsapi-jslibs/heatmap/0.0.1/heatmap.min.js');

  heatmapScript.onload();
  await expect(promise).resolves.toBe(window.ymaps);
});
