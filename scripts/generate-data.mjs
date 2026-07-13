import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buildRecommendation, calculateCannibalizationRisk, calculateEconomics, calculateScoreBreakdown } from '../src/domain/scoring.js';

const locations = [
  ['Хамовники', 'Комсомольский проспект, 28', 55.7279, 37.5773],
  ['Тверской', 'ул. Фадеева, 4А', 55.7781, 37.5992],
  ['Басманный', 'ул. Покровка, 31', 55.7596, 37.6535],
  ['Пресненский', 'Шмитовский проезд, 16', 55.7568, 37.5489],
  ['Даниловский', 'ул. Ленинская Слобода, 26', 55.7095, 37.6538],
  ['Аэропорт', 'Ленинградский проспект, 62', 55.8007, 37.5313],
  ['Сокол', 'ул. Алабяна, 7', 55.8011, 37.5041],
  ['Раменки', 'Мичуринский проспект, 21', 55.7017, 37.5038],
  ['Академический', 'ул. Дмитрия Ульянова, 20', 55.6871, 37.5745],
  ['Черёмушки', 'Профсоюзная ул., 43', 55.6756, 37.5626],
  ['Марьина Роща', 'Шереметьевская ул., 20', 55.7978, 37.6167],
  ['Лефортово', 'Авиамоторная ул., 14', 55.7521, 37.7168],
  ['Сокольники', 'Русаковская ул., 24', 55.7895, 37.6794],
  ['Мещанский', 'Олимпийский проспект, 16', 55.7829, 37.6237],
  ['Южнопортовый', '7-я Кожуховская ул., 9', 55.7049, 37.6737],
  ['Хорошёво-Мнёвники', 'ул. Народного Ополчения, 21', 55.7769, 37.4803],
  ['Нагатино-Садовники', 'Нагатинская ул., 16', 55.6814, 37.6299],
  ['Измайлово', 'Первомайская ул., 42', 55.7937, 37.7906],
];

const storeLocations = [
  ['ул. Остоженка, 27',55.7363,37.5931],['Тверская ул., 25',55.7704,37.5964],['Чистопрудный б-р, 12',55.7617,37.6424],['Красная Пресня, 32',55.7635,37.5672],
  ['Автозаводская ул., 8',55.7074,37.6573],['Ленинградский пр-т, 47',55.7959,37.5418],['Волоколамское ш., 3',55.8083,37.4974],['Мосфильмовская ул., 35',55.7064,37.5096],
  ['Ленинский пр-т, 57',55.6916,37.5753],['Новочерёмушкинская ул., 44',55.6804,37.5712],['Сущёвский Вал, 23',55.7939,37.6079],['Солдатская ул., 6',55.7611,37.7043],
  ['Стромынка, 14',55.7915,37.6913],['Проспект Мира, 40',55.7798,37.6331],['Велозаводская ул., 6',55.7108,37.6641],['Маршала Жукова, 30',55.7731,37.4896],
  ['Каширское ш., 28',55.6637,37.6359],['9-я Парковая ул., 32',55.7972,37.7984],['Большая Грузинская, 57',55.7728,37.5825],['Большая Тульская, 13',55.7089,37.6228],
];

const factorNames = {
  population_density: 'Плотность населения', avg_income_index: 'Доход аудитории', foot_traffic_score: 'Пешеходный трафик',
  car_traffic_score: 'Автомобильный трафик', distance_to_metro_m: 'Близость метро', new_developments_nearby: 'Новая застройка',
  delivery_orders_density: 'Спрос в доставке', competitors_count_300m: 'Конкуренты рядом', rent_price_per_sqm: 'Ставка аренды',
};

export function mulberry32(seed) {
  return function random() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const between = (random, min, max) => Math.round(min + random() * (max - min));

function features(random) {
  return {
    population_density: between(random, 6500, 22000), avg_income_index: +(0.8 + random() * 0.7).toFixed(2),
    competitors_count_300m: between(random, 0, 5), foot_traffic_score: between(random, 35, 94), car_traffic_score: between(random, 25, 88),
    distance_to_metro_m: between(random, 180, 1600), new_developments_nearby: between(random, 0, 4),
    delivery_orders_density: between(random, 55, 335), rent_price_per_sqm: between(random, 2300, 6200),
  };
}

function polygon(lat, lng) {
  const dLat = 0.0022; const dLng = 0.0035;
  return [[lat-dLat,lng-dLng],[lat-dLat,lng+dLng],[lat+dLat,lng+dLng],[lat+dLat,lng-dLng]];
}

function haversine(aLat, aLng, bLat, bLng) {
  const rad = (v) => v * Math.PI / 180; const earth = 6371000;
  const dLat = rad(bLat-aLat); const dLng = rad(bLng-aLng);
  const a = Math.sin(dLat/2)**2 + Math.cos(rad(aLat))*Math.cos(rad(bLat))*Math.sin(dLng/2)**2;
  return earth * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function contributions(f) {
  const values = {
    population_density:(f.population_density-12000)/10000, avg_income_index:(f.avg_income_index-1.05), foot_traffic_score:(f.foot_traffic_score-55)/45,
    car_traffic_score:(f.car_traffic_score-50)/60, distance_to_metro_m:(850-f.distance_to_metro_m)/900, new_developments_nearby:(f.new_developments_nearby-1.5)/3,
    delivery_orders_density:(f.delivery_orders_density-150)/220, competitors_count_300m:(1.5-f.competitors_count_300m)/4, rent_price_per_sqm:(4200-f.rent_price_per_sqm)/3500,
  };
  return Object.entries(values).map(([factor, value]) => ({ factor: factorNames[factor], impact: value >= 0 ? 'positive' : 'negative', weight: +Math.min(0.95, Math.max(0.12, Math.abs(value))).toFixed(2) }));
}

function explanation(zone, score, factors, risk) {
  const positive = factors.filter((f) => f.impact === 'positive').sort((a,b)=>b.weight-a.weight).slice(0,2).map((f)=>f.factor.toLowerCase());
  const negative = factors.filter((f) => f.impact === 'negative').sort((a,b)=>b.weight-a.weight)[0];
  const riskText = { low:'низкий', medium:'средний', high:'высокий' }[risk];
  return `${zone.address_label} получает ${score} баллов: сильнее всего помогают ${positive.join(' и ')}. ${negative ? `Главное ограничение — ${negative.factor.toLowerCase()}. ` : ''}Риск каннибализации оценивается как ${riskText}.`;
}

export function generateDataset(seed = 20260713) {
  const random = mulberry32(seed);
  const zones = locations.map(([district,address,lat,lng], i) => ({ zone_id:`z_${String(i+1).padStart(3,'0')}`, city:'Москва', district, address_label:address, center_lat:lat, center_lng:lng, distance_from_center_km:+(haversine(55.751244,37.618423,lat,lng)/1000).toFixed(1), geometry:polygon(lat,lng), features:features(random) }));
  const stores = storeLocations.map(([address,lat,lng], i) => ({ store_id:`s_${String(i+1).padStart(3,'0')}`, lat, lng, address_label:address, opened_date:`202${i%5}-0${i%9+1}-01`, monthly_revenue:between(random,2400000,5900000), features:features(random) }));
  const scores = zones.map((zone) => {
    const nearest = stores.map((store)=>({store,distance:haversine(zone.center_lat,zone.center_lng,store.lat,store.lng)})).sort((a,b)=>a.distance-b.distance)[0];
    const breakdown=calculateScoreBreakdown(zone.features); const risk=calculateCannibalizationRisk(nearest.store.monthly_revenue,nearest.distance);
    const revenue=Math.round((1850000+breakdown.score*31000+zone.features.delivery_orders_density*1800)/10000)*10000;
    const economics=calculateEconomics(zone.features,revenue);
    const recommendation=buildRecommendation({zone,breakdown,economics,revenueForecast:revenue,risk,nearestStore:nearest.store,distanceM:Math.round(nearest.distance)});
    return { zone_id:zone.zone_id, score:breakdown.score, revenue_forecast:revenue, payback_months:economics.paybackMonths, economics, cannibalization_risk:risk, nearest_own_store:{store_id:nearest.store.store_id,distance_m:Math.round(nearest.distance)}, factor_breakdown:breakdown.factors, recommendation };
  });
  return { zones, stores, scores };
}

async function writeDataset() {
  const dataset=generateDataset(); const output=new URL('../public/data/',import.meta.url); await mkdir(output,{recursive:true});
  await Promise.all(Object.entries(dataset).map(([name,data])=>writeFile(new URL(`${name}.json`,output),JSON.stringify(data,null,2),'utf8')));
  console.log(`Generated ${dataset.zones.length} zones, ${dataset.stores.length} stores, ${dataset.scores.length} scores`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await writeDataset();
