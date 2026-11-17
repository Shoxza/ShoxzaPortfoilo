import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { site } from '../data/site'
import { renderPage } from '../render/page'

// Resolved from the project root: Vite and Vitest both run there, and jsdom's import.meta.url isn't a file URL.
const helmetPath = join(process.cwd(), 'src/assets/helmet.svg')

/** Build-time: fills index.html's <!--app--> slot and adds the no-js → js swap. */
export function injectPage(html: string): string {
  const helmet = readFileSync(helmetPath, 'utf8')
  return html
    .replace('<!--app-->', renderPage(site, helmet))
    .replace('</head>', `<script>document.documentElement.className='js'</script>\n</head>`)
}
