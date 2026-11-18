import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { site } from '../data/site'
import { renderPage } from '../render/page'
import { renderAboutPage } from '../render/about/page'
import type { Page } from '../render/header'

// Resolved from the project root: Vite and Vitest both run there, and jsdom's import.meta.url isn't a file URL.
const helmetPath = join(process.cwd(), 'src/assets/helmet.svg')

/** Build-time: fills index.html's <!--app--> slot and adds the no-js → js swap. */
export function injectPage(html: string, page: Page = 'home'): string {
  const helmet = readFileSync(helmetPath, 'utf8')
  const body = page === 'about' ? renderAboutPage(site, helmet) : renderPage(site, helmet)
  return html
    .replace('<!--app-->', body)
    .replace('</head>', `<script>document.documentElement.className='js'</script>\n</head>`)
}
