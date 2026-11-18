import { site } from '../src/data/site'
import { launchCheck } from '../src/data/launch'

const missing = launchCheck(site)
if (missing.length) {
  console.log('Not ready to launch. Missing:')
  for (const m of missing) console.log(`  - ${m}`)
  process.exit(1)
}
console.log('Launch check passed: every required field is filled in.')
