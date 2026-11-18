/**
 * Circuit de Spa-Francorchamps outline, turned to the official F1 map orientation (La Source bottom left, Les Combes top right), in a 1000 x 560 box.
 * Derived from be-1925.geojson in https://github.com/bacinger/f1-circuits, under this licence:
 *
 * Copyright (c) 2019-2025 Tomislav Bacinger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export const SPA_VIEWBOX = { w: 1000, h: 560 }

const RAW: [number, number][] = [
  [178.5, 470.3],
  [103.4, 528.6],
  [99.9, 529.5],
  [96.3, 527.8],
  [94.2, 523.8],
  [94.7, 518.9],
  [100.3, 502.3],
  [113.1, 462.5],
  [121.5, 443.0],
  [132.7, 422.3],
  [144.5, 403.6],
  [157.0, 388.4],
  [232.1, 305.1],
  [236.2, 299.3],
  [240.3, 290.0],
  [248.0, 273.1],
  [253.9, 265.5],
  [262.1, 258.5],
  [269.8, 253.7],
  [278.8, 250.0],
  [295.6, 245.5],
  [301.4, 243.5],
  [306.7, 240.6],
  [313.5, 235.6],
  [365.0, 192.5],
  [397.6, 164.9],
  [410.2, 156.8],
  [419.6, 151.4],
  [434.9, 144.5],
  [529.3, 102.6],
  [672.4, 38.4],
  [706.8, 23.3],
  [712.6, 22.0],
  [719.3, 22.2],
  [724.9, 24.9],
  [729.9, 29.2],
  [734.2, 35.2],
  [738.5, 38.4],
  [743.2, 40.5],
  [750.0, 41.6],
  [756.3, 40.4],
  [793.8, 26.2],
  [800.5, 25.5],
  [806.8, 26.0],
  [814.1, 29.7],
  [819.4, 34.7],
  [901.3, 123.6],
  [904.8, 129.4],
  [905.8, 135.6],
  [904.9, 142.4],
  [901.8, 148.3],
  [896.7, 153.0],
  [891.2, 155.3],
  [885.2, 156.5],
  [879.4, 155.4],
  [873.0, 152.7],
  [868.2, 148.3],
  [835.7, 109.1],
  [830.2, 104.9],
  [825.1, 103.1],
  [819.3, 102.8],
  [812.4, 104.3],
  [762.7, 129.5],
  [742.2, 138.0],
  [678.1, 159.8],
  [641.1, 171.4],
  [634.8, 173.7],
  [628.4, 177.7],
  [623.2, 182.7],
  [618.1, 189.8],
  [614.5, 197.4],
  [612.7, 205.4],
  [612.4, 213.5],
  [614.3, 239.5],
  [616.8, 249.1],
  [620.7, 257.7],
  [625.8, 266.3],
  [631.8, 273.1],
  [641.0, 280.7],
  [649.8, 285.1],
  [662.1, 289.5],
  [726.5, 305.3],
  [783.7, 319.4],
  [792.8, 322.9],
  [799.4, 327.6],
  [804.8, 334.6],
  [808.0, 341.9],
  [809.2, 348.9],
  [808.8, 356.2],
  [806.8, 362.7],
  [801.7, 373.6],
  [799.8, 380.6],
  [799.6, 388.7],
  [801.6, 396.6],
  [805.0, 403.4],
  [810.2, 409.1],
  [815.7, 412.3],
  [823.0, 416.2],
  [891.3, 447.4],
  [895.6, 450.8],
  [898.8, 455.4],
  [901.0, 460.9],
  [901.4, 467.6],
  [899.6, 473.6],
  [883.7, 503.3],
  [874.3, 520.9],
  [869.7, 525.5],
  [864.1, 530.6],
  [858.4, 533.9],
  [851.4, 536.7],
  [844.1, 538.0],
  [835.1, 538.0],
  [827.1, 536.3],
  [817.0, 534.1],
  [801.5, 530.7],
  [783.6, 523.7],
  [767.6, 515.7],
  [748.0, 502.5],
  [719.1, 480.1],
  [705.0, 466.6],
  [695.6, 454.8],
  [651.5, 393.0],
  [644.1, 384.1],
  [635.7, 376.0],
  [626.5, 368.7],
  [616.9, 362.6],
  [606.8, 357.1],
  [588.9, 350.4],
  [572.0, 345.5],
  [532.7, 334.1],
  [524.2, 332.3],
  [515.5, 331.8],
  [504.6, 332.9],
  [495.0, 336.1],
  [471.1, 349.4],
  [444.7, 364.0],
  [411.8, 382.0],
  [399.4, 387.0],
  [384.5, 392.3],
  [370.5, 396.1],
  [358.6, 399.1],
  [303.1, 410.7],
  [299.3, 410.6],
  [296.5, 408.6],
  [295.1, 405.3],
  [295.2, 399.3],
  [294.3, 393.2],
  [292.8, 389.3],
  [289.5, 387.0],
  [285.8, 386.7],
  [281.6, 389.0],
  [249.8, 415.2],
  [178.5, 470.3],
]
/**
 * Spa's named corners on this outline, as a share of the lap from the start line (measured on
 * the drawn track). A journey stop can be pinned to one with `corner`.
 */
export const SPA_CORNERS = {
  'La Source': 0.037,
  'Eau Rouge': 0.143,
  'Les Combes': 0.332,
  Bruxelles: 0.409,
  Pouhon: 0.548,
  Stavelot: 0.694,
  Blanchimont: 0.79,
  // Real-life turn 18: the right-hander into the Bus Stop chicane.
  'Turn 18': 0.939,
  'Bus Stop': 0.949,
  // Just before the start/finish line, after the chicane.
  'Start/finish': 0.985,
} as const
export type SpaCorner = keyof typeof SPA_CORNERS

export const SPA_POINTS: { x: number; y: number }[] = RAW.map(([x, y]) => ({ x, y }))

const SEGMENTS = SPA_POINTS.slice(1).map((p, i) => Math.hypot(p.x - SPA_POINTS[i].x, p.y - SPA_POINTS[i].y))
const LENGTH = SEGMENTS.reduce((a, b) => a + b, 0)

/** The point a fraction (0–1) of the way round the lap, plus the index of the segment it's on. */
export function pointAlong(frac: number): { x: number; y: number; segment: number } {
  let t = Math.min(Math.max(frac, 0), 1) * LENGTH
  for (let i = 0; i < SEGMENTS.length; i++) {
    if (t <= SEGMENTS[i]) {
      const r = SEGMENTS[i] ? t / SEGMENTS[i] : 0
      const a = SPA_POINTS[i]
      const b = SPA_POINTS[i + 1]
      return { x: +(a.x + (b.x - a.x) * r).toFixed(1), y: +(a.y + (b.y - a.y) * r).toFixed(1), segment: i }
    }
    t -= SEGMENTS[i]
  }
  const last = SPA_POINTS[SPA_POINTS.length - 1]
  return { ...last, segment: SEGMENTS.length - 1 }
}

export function pointAt(frac: number): { x: number; y: number } {
  const { x, y } = pointAlong(frac)
  return { x, y }
}
