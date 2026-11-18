import type { Shot } from '../render/carousel'

export const PENDING = '__PENDING__'

export type ProjectKind = 'personal' | 'school'

export interface Link {
  label: string
  href: string
}

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
  year: number
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
  title: 'Junior developer'
  tagline: 'Web Developer portfolio'
  location: 'NTNU Gjøvik, Norway'
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
