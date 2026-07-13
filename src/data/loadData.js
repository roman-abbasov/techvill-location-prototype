async function readJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Не удалось загрузить ${path}`);
  return response.json();
}

export async function loadPrototypeData() {
  const [zones, stores, scores] = await Promise.all([
    readJson('/data/zones.json'),
    readJson('/data/stores.json'),
    readJson('/data/scores.json'),
  ]);
  return { zones, stores, scores };
}
