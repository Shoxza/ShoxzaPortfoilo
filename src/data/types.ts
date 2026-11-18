import type { Shot } from '../render/carousel'

export const PENDING = '__PENDING__'

// The tyre compound shows the kind: personal = soft (red), school = medium (yellow),
// work = hard (white), volunteer = supersoft (purple).
export type ProjectKind = 'personal' | 'school' | 'work' | 'volunteer'

/**
 * A link under a project. Either just the address, which shows as the site's name:
 *   'https://www.gjoviktech.no'                      → "gjoviktech.no"
 * or with your own text:
 *   { label: 'Live site', href: 'https://www.gjoviktech.no' }
 * The first link is the main one: the project's title and screenshots open it too.
 */
export type Link = string | { label: string; href: string }

export type Visual =
  | { kind: 'lap-trace' }
  // Screenshots: one shows on its own, two or more become a carousel. Each can have a caption and
  // a link (href) that opens when the picture is clicked.
  | { kind: 'images'; images: Shot[] }
  | null

export interface Project {
  slug: string
  name: string
  kind: ProjectKind
  /**
   * 2026 for one year, '2026–' for still being worked on, '2025–27' for a span.
   * A plain hyphen ('2026-') works too and shows as a dash.
   */
  year: number | string
  stack: string[]
  description: string
  features: string[]
  role?: string
  radio: string
  links: Link[]
  visual: Visual
}

export interface CrewRole {
  org: string
  role: string
  logo: { src: string; alt: string }
  seasons: number[]
}

export interface Profile {
  handle: 'Shoxza'
  number: 26
  title: string
  tagline: string
  location: string
  email: string
  linkedin: string
  github: string
  discordId: string
}

export interface Site {
  profile: Profile
  projects: Project[]
  crew: CrewRole[]
}
