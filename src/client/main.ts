import { initSelection } from './selection'

function start() {
  initSelection(document, { mobileQuery: matchMedia('(max-width: 859px)') })
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
else start()
