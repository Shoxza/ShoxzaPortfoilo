// Fails when the built site goes over its size budget:
//   JS ≤ 30 KB gzipped, everything except fonts ≤ 300 KB gzipped.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const JS_LIMIT = 30 * 1024
const TOTAL_LIMIT = 300 * 1024

function walk(dir) {
  return readdirSync(dir).flatMap(f => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

// Not fetched on page load: fonts (not counted), images only link previews and
// home-screen icons request, and lazy-loaded photos (project screenshots in panels you have to
// open, Piper's gallery near the bottom of About).
const notFirstLoad = [/\.woff2?$/, /og\.png$/, /apple-touch-icon\.png$/, /[\\/]projects[\\/]/, /[\\/]piper[\\/]/]
const files = walk('dist').filter(f => !notFirstLoad.some(r => r.test(f)))
const gz = f => gzipSync(readFileSync(f)).length
const js = files.filter(f => f.endsWith('.js')).reduce((n, f) => n + gz(f), 0)
const total = files.reduce((n, f) => n + gz(f), 0)
const kb = n => `${(n / 1024).toFixed(1)} KB`

console.log(`JS (gzip):            ${kb(js)} / ${kb(JS_LIMIT)}`)
console.log(`Total excl. fonts:    ${kb(total)} / ${kb(TOTAL_LIMIT)}`)
if (js > JS_LIMIT || total > TOTAL_LIMIT) {
  console.error('Over budget.')
  process.exit(1)
}
console.log('Within budget.')
