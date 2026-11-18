// Kept apart from world.ts so the browser code can project points without shipping the outline.

/** Size of the world map in its own units (180°W to 180°E, 80°N to 58°S). */
const MAP_W = 360
const MAP_H = 138

/** Latitude/longitude → world map units (plate carrée, 1 unit per degree, top edge at 80°N). */
export function project(lat: number, lon: number): { x: number; y: number } {
  return { x: +(lon + 180).toFixed(2), y: +(80 - lat).toFixed(2) }
}

/**
 * A viewBox that shows both points, shaped to the box it's drawn in (width / height) so "slice"
 * scaling never crops either point. mx and my are the share of the view kept clear on each side
 * (room for the pin labels and the route's arc); minW is the closest it zooms in, in degrees.
 */
export function fitView(
  a: { x: number; y: number },
  b: { x: number; y: number },
  aspect: number,
  { mx = 0.2, my = 0.2, minW = 0 }: { mx?: number; my?: number; minW?: number } = {},
): { x: number; y: number; w: number; h: number } {
  let w = Math.max(Math.abs(a.x - b.x) / (1 - 2 * mx), minW)
  let h = Math.abs(a.y - b.y) / (1 - 2 * my)
  if (w / h < aspect) w = h * aspect
  else h = w / aspect
  // Keep the view inside the map's edges (there's no land drawn past them).
  const cx = w >= MAP_W ? MAP_W / 2 : Math.min(Math.max((a.x + b.x) / 2, w / 2), MAP_W - w / 2)
  const y = h >= MAP_H ? (MAP_H - h) / 2 : Math.min(Math.max((a.y + b.y) / 2 - h / 2, 0), MAP_H - h)
  return { x: +(cx - w / 2).toFixed(2), y: +y.toFixed(2), w: +w.toFixed(2), h: +h.toFixed(2) }
}
