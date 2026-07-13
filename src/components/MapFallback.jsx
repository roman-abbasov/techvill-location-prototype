export default function MapFallback({ reason }) {
  const missingKey = reason === 'missing-key';
  return <section className="map-fallback" aria-label="Состояние Яндекс.Карт">
    <span className="map-fallback-icon">⌖</span>
    <div><p className="eyebrow">Яндекс.Карты</p><h3>{missingKey ? 'Добавьте ключ карты' : 'Не удалось загрузить Яндекс.Карты'}</h3>
    {missingKey ? <p>Укажите <code>VITE_YANDEX_MAPS_KEY</code> в локальном файле <code>.env</code>.</p> : <p>Проверьте ключ и подключение к интернету. Рейтинг и карточки продолжают работать.</p>}
    <a href="https://yandex.ru/dev/maps/" target="_blank" rel="noreferrer">Получить ключ <span>↗</span></a></div>
  </section>;
}
