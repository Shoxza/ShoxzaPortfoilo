export interface LatLon {
  lat: number
  lon: number
}

export const DENIED_MESSAGE = 'No worries. Gjøvik is at 60.8° N, 10.7° E.'

/** Great-circle distance in km. */
export function haversineKm(a: LatLon, b: LatLon): number {
  const R = 6371
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function distanceMessage(km: number): string {
  if (km < 5) return "You're basically in Gjøvik."
  const n = String(Math.round(km)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `You're about ${n} km from Gjøvik.`
}
