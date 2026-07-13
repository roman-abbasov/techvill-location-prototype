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

function heatmapData(scores, zonesById) {
  return { type: 'FeatureCollection', features: scores.map((score) => { const zone = zonesById.get(score.zone_id); return { type: 'Feature', id: score.zone_id, geometry: { type: 'Point', coordinates: [zone.center_lat, zone.center_lng] }, properties: { weight: score.score / 100 } }; }) };
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
    scores.forEach((score) => { const zone = zonesById.get(score.zone_id); const marker = new ymaps.Placemark([zone.center_lat, zone.center_lng], { hintContent: `${zone.address_label} · ${score.score}` }, { preset: selectedZoneId === score.zone_id ? 'islands#redStarIcon' : 'islands#yellowStarIcon' }); marker.events.add('click', () => onSelectZone(score.zone_id)); recommendationCollection.add(marker); });
    map.geoObjects.add(storeCollection); map.geoObjects.add(recommendationCollection); layersRef.current.push(storeCollection, recommendationCollection);
    ymaps.modules.require(['Heatmap'], (Heatmap) => { if (!mapRef.current) return; const heatmap = new Heatmap(heatmapData(scores, zonesById), { radius: 34, dissipating: true, opacity: 0.72, gradient: { 0.1: 'rgba(214,91,61,.18)', 0.4: 'rgba(232,194,68,.52)', 0.7: 'rgba(77,177,83,.65)', 1: 'rgba(23,130,71,.82)' } }); heatmap.setMap(map); layersRef.current.push(heatmap); });
    return () => { layersRef.current.forEach((layer) => layer?.setMap ? layer.setMap(null) : map.geoObjects.remove(layer)); layersRef.current = []; };
  }, [status, stores, scores, zonesById, selectedZoneId, onSelectZone]);

  useEffect(() => { const zone = zonesById.get(selectedZoneId); if (zone && mapRef.current) mapRef.current.panTo([zone.center_lat, zone.center_lng], { flying: true, duration: 350 }); }, [selectedZoneId, zonesById]);

  if (status === 'missing-key') return <MapFallback reason="missing-key" />;
  if (status === 'error') return <MapFallback reason="error" />;
  return <section className="map-canvas-shell" aria-label="Карта потенциала"><div ref={containerRef} className="map-canvas" /><div className="map-legend"><span><i className="legend-high" />Высокий</span><span><i className="legend-mid" />Средний</span><span><i className="legend-low" />Низкий</span></div>{status === 'loading' && <div className="map-loading">Загружаем карту…</div>}</section>;
}
