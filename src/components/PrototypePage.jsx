import { useEffect, useMemo, useState } from 'react';
import { loadPrototypeData } from '../data/loadData.js';
import { filterRecommendations } from '../domain/filtering.js';
import Filters from './Filters.jsx';
import RecommendationList from './RecommendationList.jsx';
import LocationDetails from './LocationDetails.jsx';
import PotentialMap from './PotentialMap.jsx';

export default function PrototypePage({ initialData = null }) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ city: 'Москва', radiusKm: 15, maxRent: 6500 });
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  useEffect(() => { if (!initialData) loadPrototypeData().then(setData).catch((err) => setError(err.message)); }, [initialData]);
  const zonesById = useMemo(() => new Map((data?.zones ?? []).map((zone) => [zone.zone_id, zone])), [data]);
  const storesById = useMemo(() => new Map((data?.stores ?? []).map((store) => [store.store_id, store])), [data]);
  const filteredScores = useMemo(() => data ? filterRecommendations(data.scores, zonesById, filters) : [], [data, zonesById, filters]);
  useEffect(() => { if (selectedZoneId && !filteredScores.some((score) => score.zone_id === selectedZoneId)) setSelectedZoneId(null); }, [filteredScores, selectedZoneId]);
  const selectedScore = filteredScores.find((score) => score.zone_id === selectedZoneId);
  return <div className="prototype-page" id="panel-Прототип" role="tabpanel">
    <header className="prototype-intro"><div><h1>Потенциал новых точек</h1></div><div className="model-note"><span className="live-dot" /> Модель рассчитана <b>offline</b></div></header>
    <aside className="prototype-disclaimer" aria-labelledby="prototype-disclaimer-title">
      <span className="disclaimer-mark" aria-hidden="true">i</span>
      <div>
        <h2 id="prototype-disclaimer-title">Важно о прототипе</h2>
        <p>Здесь я подтянул Яндекс API со своим ключом и хотел наиболее наглядно продемонстрировать прототип. Помимо прочего пытался на основе <strong>Yandex Maps API Heatmap Module</strong> отрисовать именно тепловую карту. Далеко от идеала (я не программист), но я уверен с командой на обсуждении можно будет прийти либо к такому, но более приемлемому варианту либо вообще пересмотреть формат отображения и отрисовки.</p>
        <p>Для просмотра как работают рекомендации <strong>нужно кликнуть</strong> в предложенную локацию.</p>
        <p><strong>Сразу оговорюсь</strong> - какие-то данные могут не совпадать с действительностью (например, я не вписывал в прототип точный список розничных магазинов и алгоритм может врать, что рядом другой магазин). Цель была и есть - просто наглядно продемонстрировать моё видение функционала.</p>
      </div>
    </aside>
    {error && <section className="load-state"><h2>Не удалось загрузить данные</h2><p>{error}</p></section>}
    {!data && !error && <section className="load-state"><p>Загружаем геоданные…</p></section>}
    {data && <>
    <Filters filters={filters} cities={[...new Set(data.zones.map((zone) => zone.city))]} onChange={setFilters} />
    <div className="workspace-grid"><PotentialMap apiKey={import.meta.env.VITE_YANDEX_MAPS_KEY ?? ''} zones={data.zones} stores={data.stores} scores={filteredScores} selectedZoneId={selectedZoneId} onSelectZone={setSelectedZoneId} /><RecommendationList scores={filteredScores} zonesById={zonesById} selectedZoneId={selectedZoneId} onSelect={setSelectedZoneId} /></div>
    {selectedScore && <LocationDetails zone={zonesById.get(selectedScore.zone_id)} score={selectedScore} nearestStore={storesById.get(selectedScore.nearest_own_store.store_id)} onClose={() => setSelectedZoneId(null)} />}
    </>}
  </div>;
}
