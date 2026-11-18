import { PENDING, type Site } from './types'

/** Lists the required fields still missing. An empty list means the site may launch. */
export function launchCheck(site: Site): string[] {
  const missing: string[] = []
  for (const [key, value] of Object.entries(site.profile)) {
    if (value === PENDING) missing.push(`profile.${key}`)
  }
  for (const p of site.projects) {
    if (p.radio === PENDING) missing.push(`${p.slug}.radio`)
    if (p.features.length === 0) missing.push(`${p.slug}.features`)
  }
  return missing
}
