import { useEffect, useMemo, useState } from 'react';
import { loadPrototypeData } from '../data/loadData.js';
import { filterRecommendations } from '../domain/filtering.js';
import Filters from './Filters.jsx';
import RecommendationList from './RecommendationList.jsx';
import LocationDetails from './LocationDetails.jsx';

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
    <header className="prototype-intro"><div><p className="eyebrow">AI location intelligence</p><h1>Потенциал новых точек</h1></div><div className="model-note"><span className="live-dot" /> Модель рассчитана <b>offline</b></div></header>
    {error && <section className="load-state"><h2>Не удалось загрузить данные</h2><p>{error}</p></section>}
    {!data && !error && <section className="load-state"><p>Загружаем геоданные…</p></section>}
    {data && <>
    <Filters filters={filters} cities={[...new Set(data.zones.map((zone) => zone.city))]} onChange={setFilters} />
    <div className="workspace-grid"><section className="map-preview" aria-label="Карта потенциала"><div className="map-preview-grid" /><div className="map-legend"><span><i className="legend-high" />Высокий</span><span><i className="legend-mid" />Средний</span><span><i className="legend-low" />Низкий</span></div><p>Яндекс.Карта подключается на следующем этапе</p></section><RecommendationList scores={filteredScores} zonesById={zonesById} selectedZoneId={selectedZoneId} onSelect={setSelectedZoneId} /></div>
    {selectedScore && <LocationDetails zone={zonesById.get(selectedScore.zone_id)} score={selectedScore} nearestStore={storesById.get(selectedScore.nearest_own_store.store_id)} onClose={() => setSelectedZoneId(null)} />}
    </>}
  </div>;
}
