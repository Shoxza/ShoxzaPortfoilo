/** Monaco corners in lap order, on a 0–100 grid. Simplified and recognisable, not survey-accurate. */
export const MONACO_CORNERS: { name: string; x: number; y: number }[] = [
  { name: 'Sainte Dévote', x: 42, y: 62 },
  { name: 'Beau Rivage', x: 55, y: 40 },
  { name: 'Massenet', x: 62, y: 22 },
  { name: 'Casino', x: 70, y: 18 },
  { name: 'Mirabeau', x: 78, y: 28 },
  { name: 'Fairmont Hairpin', x: 88, y: 34 },
  { name: 'Portier', x: 84, y: 48 },
  { name: 'Tunnel', x: 60, y: 58 },
  { name: 'Nouvelle Chicane', x: 45, y: 72 },
  { name: 'Tabac', x: 35, y: 80 },
  { name: 'Swimming Pool', x: 22, y: 84 },
  { name: 'La Rascasse', x: 10, y: 78 },
  { name: 'Anthony Noghès', x: 14, y: 68 },
]

const OUTLINE =
  'M30 66 L42 62 C48 55 52 46 55 40 C58 32 60 26 62 22 C65 18 68 17 70 18 C74 20 76 24 78 28 C82 32 86 30 88 34 C90 38 88 44 84 48 C78 54 70 56 60 58 C54 62 50 68 45 72 C41 76 38 79 35 80 C30 82 26 84 22 84 C16 84 12 82 10 78 C9 74 11 70 14 68 Z'

export function monacoSvg(): string {
  const dots = MONACO_CORNERS.map(c => `<circle class="corner" cx="${c.x}" cy="${c.y}" r="1.6"/>`).join('')
  return `<svg class="monaco" viewBox="0 8 100 84" role="img" aria-label="Simplified map of the Monaco circuit">
  <path class="monaco-track" d="${OUTLINE}"/>
  <path class="monaco-line" d="${OUTLINE}" pathLength="100"/>
  ${dots}
</svg>`
}
