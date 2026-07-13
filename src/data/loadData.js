async function readJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Не удалось загрузить ${path}`);
  return response.json();
}

export async function loadPrototypeData(baseUrl = import.meta.env.BASE_URL) {
  const dataPath = (fileName) => `${baseUrl}data/${fileName}`;
  const [zones, stores, scores] = await Promise.all([
    readJson(dataPath('zones.json')),
    readJson(dataPath('stores.json')),
    readJson(dataPath('scores.json')),
  ]);
  return { zones, stores, scores };
}
