// Kept apart from world.ts so the browser code can project points without shipping the outline.

/** Height of the world map in its own units (80°N to 58°S). */
const MAP_H = 138

/** Latitude/longitude → world map units (plate carrée, 1 unit per degree, top edge at 80°N). */
export function project(lat: number, lon: number): { x: number; y: number } {
  return { x: +(lon + 180).toFixed(2), y: +(80 - lat).toFixed(2) }
}

/**
 * A viewBox that shows both points with some room around them, shaped to the box it's drawn in
 * (width / height), so "slice" scaling never crops either point.
 */
export function fitView(
  a: { x: number; y: number },
  b: { x: number; y: number },
  aspect: number,
  pad = 20,
): { x: number; y: number; w: number; h: number } {
  let w = Math.abs(a.x - b.x) + pad * 2
  let h = Math.abs(a.y - b.y) + pad * 2
  if (w / h < aspect) w = h * aspect
  else h = w / aspect
  const cx = (a.x + b.x) / 2
  // Keep the view inside the map's top and bottom edges (there's no land drawn past them).
  const y = h >= MAP_H ? (MAP_H - h) / 2 : Math.min(Math.max((a.y + b.y) / 2 - h / 2, 0), MAP_H - h)
  return { x: +(cx - w / 2).toFixed(2), y: +y.toFixed(2), w: +w.toFixed(2), h: +h.toFixed(2) }
}
