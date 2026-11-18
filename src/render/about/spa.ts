/**
 * Circuit de Spa-Francorchamps outline, turned a quarter so it lies wide, in a 1000 x 430 box.
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

export const SPA_VIEWBOX = { w: 1000, h: 430 }

const RAW: [number, number][] = [
  [715.8, 148.0],
  [768.5, 117.8],
  [770.8, 117.5],
  [772.9, 118.9],
  [773.9, 121.6],
  [773.1, 124.7],
  [768.1, 134.7],
  [756.5, 158.7],
  [749.4, 170.3],
  [740.5, 182.4],
  [731.4, 193.2],
  [722.1, 201.7],
  [667.2, 247.7],
  [664.1, 251.0],
  [660.7, 256.5],
  [654.3, 266.5],
  [649.9, 270.8],
  [644.1, 274.5],
  [638.8, 276.8],
  [632.8, 278.4],
  [621.8, 279.7],
  [617.9, 280.5],
  [614.3, 281.8],
  [609.6, 284.4],
  [573.2, 307.1],
  [550.1, 321.6],
  [541.4, 325.6],
  [535.0, 328.2],
  [524.7, 331.2],
  [461.3, 349.3],
  [365.1, 377.2],
  [342.0, 383.7],
  [338.2, 384.0],
  [334.0, 383.3],
  [330.7, 381.1],
  [327.9, 377.9],
  [325.7, 373.7],
  [323.3, 371.3],
  [320.5, 369.6],
  [316.3, 368.3],
  [312.2, 368.5],
  [287.2, 374.1],
  [282.9, 374.0],
  [279.0, 373.1],
  [274.7, 370.1],
  [271.8, 366.5],
  [227.9, 303.0],
  [226.2, 299.0],
  [226.1, 295.0],
  [227.3, 290.8],
  [229.8, 287.3],
  [233.4, 284.8],
  [237.1, 283.8],
  [241.0, 283.6],
  [244.6, 284.8],
  [248.4, 287.1],
  [251.0, 290.3],
  [268.1, 318.0],
  [271.2, 321.1],
  [274.3, 322.7],
  [277.9, 323.4],
  [282.4, 323.1],
  [316.1, 311.6],
  [329.8, 308.0],
  [372.3, 299.9],
  [396.7, 295.9],
  [400.9, 295.0],
  [405.3, 293.0],
  [409.0, 290.3],
  [412.9, 286.3],
  [415.8, 281.8],
  [417.7, 276.9],
  [418.6, 271.8],
  [419.7, 255.2],
  [419.0, 248.9],
  [417.3, 243.1],
  [414.8, 237.2],
  [411.6, 232.4],
  [406.5, 226.8],
  [401.3, 223.2],
  [393.9, 219.3],
  [354.6, 203.6],
  [319.7, 189.6],
  [314.2, 186.6],
  [310.5, 183.0],
  [307.7, 178.1],
  [306.3, 173.2],
  [306.2, 168.7],
  [307.1, 164.1],
  [308.9, 160.2],
  [313.1, 153.7],
  [314.9, 149.5],
  [315.8, 144.4],
  [315.2, 139.2],
  [313.7, 134.6],
  [310.9, 130.5],
  [307.7, 128.0],
  [303.4, 124.9],
  [263.0, 99.1],
  [260.6, 96.6],
  [259.0, 93.4],
  [258.1, 89.7],
  [258.4, 85.4],
  [260.1, 81.8],
  [272.8, 64.4],
  [280.3, 54.1],
  [283.6, 51.6],
  [287.6, 48.9],
  [291.5, 47.3],
  [296.2, 46.2],
  [300.9, 46.0],
  [306.6, 46.8],
  [311.5, 48.6],
  [317.7, 50.9],
  [327.2, 54.4],
  [337.9, 60.4],
  [347.3, 66.9],
  [358.5, 77.0],
  [374.8, 93.7],
  [382.5, 103.5],
  [387.4, 111.8],
  [409.8, 154.8],
  [413.7, 161.1],
  [418.3, 167.0],
  [423.5, 172.4],
  [429.0, 177.1],
  [434.9, 181.5],
  [445.6, 187.3],
  [455.9, 191.9],
  [479.7, 202.6],
  [484.9, 204.5],
  [490.4, 205.6],
  [497.4, 205.9],
  [503.7, 204.7],
  [520.0, 198.4],
  [538.0, 191.5],
  [560.4, 183.1],
  [568.7, 181.0],
  [578.6, 179.0],
  [587.8, 177.8],
  [595.6, 177.0],
  [631.7, 174.6],
  [634.1, 175.0],
  [635.7, 176.5],
  [636.3, 178.7],
  [635.7, 182.5],
  [635.7, 186.4],
  [636.3, 189.0],
  [638.2, 190.8],
  [640.5, 191.3],
  [643.4, 190.2],
  [665.8, 176.5],
  [715.8, 148.0],
]

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
