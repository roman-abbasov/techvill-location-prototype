export function filterRecommendations(scores, zonesById, filters) {
  return scores
    .filter((score) => {
      const zone = zonesById.get(score.zone_id);
      return zone
        && zone.city === filters.city
        && zone.distance_from_center_km <= filters.radiusKm
        && zone.features.rent_price_per_sqm <= filters.maxRent;
    })
    .sort((a, b) => b.score - a.score);
}
