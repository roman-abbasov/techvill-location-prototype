export default function Filters({ filters, cities, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });
  return <section className="filter-bar" aria-label="Фильтры локаций">
    <label><span>Город</span><select value={filters.city} onChange={(event) => set('city', event.target.value)}>{cities.map((city) => <option key={city}>{city}</option>)}</select></label>
    <label><span>Радиус <b>{filters.radiusKm} км</b></span><input type="range" min="1" max="20" value={filters.radiusKm} onChange={(event) => set('radiusKm', Number(event.target.value))} /></label>
    <label><span>Максимальная аренда <b>{filters.maxRent.toLocaleString('ru-RU')} ₽/м²</b></span><input type="range" min="2000" max="6500" step="100" value={filters.maxRent} onChange={(event) => set('maxRent', Number(event.target.value))} /></label>
  </section>;
}
