import { afterEach, expect, it, vi } from 'vitest';
import { loadYandexMaps, resetYandexMapsLoader } from '../src/components/PotentialMap.jsx';

afterEach(() => {
  document.head.querySelectorAll('script[data-yandex-maps], script[data-yandex-heatmap]').forEach((script) => script.remove());
  delete window.ymaps;
  resetYandexMapsLoader();
  vi.restoreAllMocks();
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
