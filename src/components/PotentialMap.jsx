import { useEffect, useMemo, useRef, useState } from 'react';
import MapFallback from './MapFallback.jsx';

let mapsPromise;

export function resetYandexMapsLoader() { mapsPromise = undefined; }

export function loadYandexMaps(apiKey) {
  if (mapsPromise) return mapsPromise;
  const mapsApiPromise = window.ymaps ? Promise.resolve(window.ymaps) : new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.dataset.yandexMaps = 'true';
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
      script.onload = () => window.ymaps ? window.ymaps.ready(() => resolve(window.ymaps)) : reject(new Error('API не инициализирован'));
      script.onerror = () => reject(new Error('Не удалось загрузить Яндекс.Карты'));
      document.head.appendChild(script);
    });
  mapsPromise = mapsApiPromise.then((ymaps) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.dataset.yandexHeatmap = 'true';
    script.src = 'https://yastatic.net/s3/mapsapi-jslibs/heatmap/0.0.1/heatmap.min.js';
    script.onload = () => resolve(ymaps);
    script.onerror = () => reject(new Error('Не удалось загрузить модуль тепловой карты'));
    document.head.appendChild(script);
  }));
  return mapsPromise;
}

export function buildHeatmapData(scores, zonesById, gridSize = 20) {
  const points = scores.map((score) => ({ score: score.score, zone: zonesById.get(score.zone_id), id: score.zone_id })).filter((point) => point.zone);
  if (!points.length) return { type: 'FeatureCollection', features: [] };
  const minScore = Math.min(...points.map((point) => point.score));
  const maxScore = Math.max(...points.map((point) => point.score));
  const range = maxScore - minScore || 1;
  const weighted = points.map((point) => ({ ...point, weight: 0.1 + 0.9 * ((point.score - minScore) / range) }));
  const lats = weighted.map((point) => point.zone.center_lat); const lngs = weighted.map((point) => point.zone.center_lng);
  const minLat = Math.min(...lats); const maxLat = Math.max(...lats); const minLng = Math.min(...lngs); const maxLng = Math.max(...lngs);
  const gridFeatures = [];
  for (let row = 0; row < gridSize; row += 1) {
    const lat = minLat + ((maxLat - minLat) * row) / Math.max(gridSize - 1, 1);
    for (let column = 0; column < gridSize; column += 1) {
      const lng = minLng + ((maxLng - minLng) * column) / Math.max(gridSize - 1, 1);
      let numerator = 0; let denominator = 0;
      weighted.forEach((point) => {
        const dLat = lat - point.zone.center_lat; const dLng = (lng - point.zone.center_lng) * 0.56;
        const distanceSquared = Math.max(dLat * dLat + dLng * dLng, 0.0000001);
        const influence = 1 / distanceSquared;
        numerator += point.weight * influence; denominator += influence;
      });
      gridFeatures.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [lat, lng] }, properties: { weight: numerator / denominator, source: false } });
    }
  }
  const sourceFeatures = weighted.map((point) => ({ type: 'Feature', id: point.id, geometry: { type: 'Point', coordinates: [point.zone.center_lat, point.zone.center_lng] }, properties: { weight: point.weight, source: true } }));
  return { type: 'FeatureCollection', features: [...gridFeatures, ...sourceFeatures] };
}

export default function PotentialMap({ apiKey, zones, stores, scores, selectedZoneId, onSelectZone }) {
  const containerRef = useRef(null); const mapRef = useRef(null); const layersRef = useRef([]); const [status, setStatus] = useState(apiKey ? 'loading' : 'missing-key');
  const zonesById = useMemo(() => new Map(zones.map((zone) => [zone.zone_id, zone])), [zones]);

  useEffect(() => {
    if (!apiKey) { setStatus('missing-key'); return undefined; }
    let active = true;
    loadYandexMaps(apiKey).then((ymaps) => {
      if (!active || !containerRef.current) return;
      mapRef.current = new ymaps.Map(containerRef.current, { center: [55.751244, 37.618423], zoom: 11, controls: ['zoomControl'] }, { suppressMapOpenBlock: true });
      setStatus('ready');
    }).catch(() => active && setStatus('error'));
    return () => { active = false; layersRef.current.forEach((layer) => layer?.setMap ? layer.setMap(null) : mapRef.current?.geoObjects.remove(layer)); layersRef.current = []; mapRef.current?.destroy(); mapRef.current = null; };
  }, [apiKey]);

  useEffect(() => {
    const map = mapRef.current; const ymaps = window.ymaps;
    if (status !== 'ready' || !map || !ymaps) return undefined;
    layersRef.current.forEach((layer) => layer?.setMap ? layer.setMap(null) : map.geoObjects.remove(layer)); layersRef.current = [];
    const storeCollection = new ymaps.GeoObjectCollection();
    stores.forEach((store) => storeCollection.add(new ymaps.Placemark([store.lat, store.lng], { hintContent: store.address_label }, { preset: 'islands#greenHomeIcon' })));
    const recommendationCollection = new ymaps.GeoObjectCollection();
    scores.forEach((score) => { const zone = zonesById.get(score.zone_id); const marker = new ymaps.Placemark([zone.center_lat, zone.center_lng], { hintContent: `${zone.address_label} · ${score.score}`, iconContent: String(score.score) }, { preset: 'islands#circleIcon', iconColor: selectedZoneId === score.zone_id ? '#171717' : '#6c1eff' }); marker.events.add('click', () => onSelectZone(score.zone_id)); recommendationCollection.add(marker); });
    map.geoObjects.add(storeCollection); map.geoObjects.add(recommendationCollection); layersRef.current.push(storeCollection, recommendationCollection);
    ymaps.modules.require(['Heatmap'], (Heatmap) => { if (!mapRef.current) return; const heatmap = new Heatmap(buildHeatmapData(scores, zonesById), { radius: 62, dissipating: true, opacity: 0.84, intensityOfMidpoint: 0.35, gradient: { 0.1: 'rgba(218,66,52,.72)', 0.42: 'rgba(247,166,45,.78)', 0.68: 'rgba(250,221,75,.82)', 0.84: 'rgba(165,240,75,.86)', 1: 'rgba(54,169,76,.92)' } }); heatmap.setMap(map); layersRef.current.push(heatmap); });
    return () => { layersRef.current.forEach((layer) => layer?.setMap ? layer.setMap(null) : map.geoObjects.remove(layer)); layersRef.current = []; };
  }, [status, stores, scores, zonesById, selectedZoneId, onSelectZone]);

  useEffect(() => { const zone = zonesById.get(selectedZoneId); if (zone && mapRef.current) mapRef.current.panTo([zone.center_lat, zone.center_lng], { flying: true, duration: 350 }); }, [selectedZoneId, zonesById]);

  if (status === 'missing-key') return <MapFallback reason="missing-key" />;
  if (status === 'error') return <MapFallback reason="error" />;
  return <section className="map-canvas-shell" aria-label="Карта потенциала"><div ref={containerRef} className="map-canvas" /><div className="map-legend"><span><i className="legend-high" />Высокий</span><span><i className="legend-mid" />Средний</span><span><i className="legend-low" />Низкий</span><small>Цвет — относительный потенциал среди показанных адресов</small></div>{status === 'loading' && <div className="map-loading">Загружаем карту…</div>}</section>;
}
