/**
 * Circuit de Monaco outline, turned so the start straight runs up to Sainte Dévote at the top,
 * in a 100 x 44.4 box. Derived from mc-1929.geojson in https://github.com/bacinger/f1-circuits,
 * under this licence:
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

export const MONACO_VIEWBOX = { w: 100, h: 44.4 }

/** The lap in order, from the start/finish straight. */
const RAW: [number, number][] = [
  [12.4, 19.09], [13.8, 17.36], [15.87, 14.88], [18.73, 11.82], [20.75, 10.01], [22.37, 8.7],
  [24.13, 7.43], [25.52, 6.72], [26.83, 6.15], [27.59, 5.76], [28.2, 5.36], [28.99, 4.58],
  [29.49, 4.11], [29.94, 4.0], [30.52, 4.24], [31.69, 5.04], [32.55, 5.92], [33.83, 7.03],
  [35.62, 8.58], [37.29, 9.88], [41.99, 12.77], [44.57, 14.43], [46.71, 16.15], [48.07, 17.43],
  [49.43, 18.15], [53.71, 19.94], [55.5, 20.8], [57.75, 22.39], [59.49, 23.85], [61.18, 25.2],
  [62.3, 25.81], [63.97, 26.28], [65.8, 26.34], [67.1, 26.12], [68.19, 25.58], [69.06, 24.72],
  [69.78, 23.8], [70.42, 22.61], [70.91, 21.35], [70.82, 20.15], [70.85, 18.9], [70.84, 18.32],
  [70.87, 17.73], [71.29, 16.78], [71.8, 16.14], [72.47, 15.79], [73.52, 15.47], [74.34, 15.33],
  [76.56, 15.19], [88.32, 14.02], [89.15, 13.93], [89.79, 14.33], [90.19, 15.15], [90.22, 15.94],
  [89.93, 16.8], [89.33, 17.46], [88.79, 17.97], [88.39, 18.43], [88.1, 19.18], [87.98, 19.86],
  [87.68, 21.19], [87.31, 22.24], [87.01, 22.79], [86.92, 23.22], [87.12, 23.62], [87.55, 23.88],
  [88.08, 23.9], [88.55, 23.62], [88.73, 23.14], [88.65, 22.38], [89.16, 19.46], [89.4, 18.9],
  [89.8, 18.53], [90.2, 18.36], [90.62, 18.25], [91.52, 18.59], [92.66, 19.35], [93.34, 19.7],
  [94.06, 20.05], [95.02, 20.58], [95.82, 21.35], [96.0, 21.99], [95.47, 22.77], [91.34, 26.21],
  [86.69, 29.28], [83.5, 30.99], [81.01, 31.96], [77.78, 32.66], [74.72, 32.87], [70.68, 32.84],
  [66.28, 31.54], [63.88, 30.57], [59.32, 28.64], [56.52, 27.1], [52.76, 24.49], [50.51, 22.66],
  [49.27, 21.72], [48.77, 21.82], [48.47, 22.07], [48.08, 22.3], [47.62, 22.45], [47.02, 22.12],
  [46.3, 21.55], [46.05, 20.42], [45.71, 19.98], [39.55, 14.72], [36.46, 12.15], [33.58, 9.81],
  [32.78, 9.15], [32.25, 8.73], [31.54, 8.7], [29.91, 9.15], [28.38, 9.64], [26.94, 10.24],
  [26.02, 10.77], [24.5, 11.81], [22.18, 13.88], [21.62, 14.42], [21.38, 14.94], [21.3, 15.62],
  [21.43, 16.87], [21.42, 17.78], [21.12, 18.45], [20.48, 19.18], [16.33, 24.46], [15.66, 25.46],
  [15.45, 25.77], [15.06, 26.08], [14.57, 26.13], [13.81, 25.95], [13.14, 25.69], [12.71, 25.88],
  [12.09, 26.6], [10.98, 28.59], [10.22, 30.17], [9.73, 31.53], [9.27, 33.52], [9.15, 35.61],
  [9.41, 36.82], [9.8, 38.1], [10.0, 38.73], [9.95, 39.19], [9.41, 40.15], [8.88, 40.4],
  [8.27, 40.21], [6.17, 38.84], [5.11, 37.98], [4.5, 37.33], [4.05, 36.66], [4.0, 36.03],
  [4.03, 35.6], [4.57, 35.09], [4.93, 34.61], [5.32, 33.95], [5.65, 31.81], [6.18, 29.98],
  [6.56, 28.6], [7.7, 26.45], [11.21, 20.84],
]

export const MONACO_POINTS: { x: number; y: number }[] = RAW.map(([x, y]) => ({ x, y }))

/** Named corners in lap order, each on a point of the outline. */
export const MONACO_CORNERS: { name: string; x: number; y: number }[] = [
  { name: 'Sainte Dévote', x: 29.49, y: 4.11 },
  { name: 'Beau Rivage', x: 53.71, y: 19.94 },
  { name: 'Massenet', x: 68.19, y: 25.58 },
  { name: 'Casino', x: 71.29, y: 16.78 },
  { name: 'Mirabeau', x: 89.15, y: 13.93 },
  { name: 'Fairmont Hairpin', x: 87.55, y: 23.88 },
  { name: 'Portier', x: 96.0, y: 21.99 },
  { name: 'Tunnel', x: 74.72, y: 32.87 },
  { name: 'Nouvelle Chicane', x: 47.62, y: 22.45 },
  { name: 'Tabac', x: 32.25, y: 8.73 },
  { name: 'Swimming Pool', x: 21.3, y: 15.62 },
  { name: 'La Rascasse', x: 8.88, y: 40.4 },
  { name: 'Anthony Noghès', x: 4.0, y: 36.03 },
]

const OUTLINE = 'M' + MONACO_POINTS.map(p => `${p.x} ${p.y}`).join(' L') + ' Z'

export function monacoSvg(): string {
  const dots = MONACO_CORNERS.map(c => `<circle class="corner" cx="${c.x}" cy="${c.y}" r="1.3"/>`).join('')
  const s = MONACO_POINTS[0]
  return `<svg class="monaco" viewBox="0 0 ${MONACO_VIEWBOX.w} ${MONACO_VIEWBOX.h}" role="img" aria-label="Map of the Monaco circuit">
  <path class="monaco-track" d="${OUTLINE}"/>
  <path class="monaco-line" d="${OUTLINE}" pathLength="100"/>
  <circle class="monaco-start" cx="${s.x}" cy="${s.y}" r="1"/>
  ${dots}
</svg>`
}
