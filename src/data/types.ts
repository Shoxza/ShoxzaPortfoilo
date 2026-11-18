export const PENDING = '__PENDING__'

export type ProjectKind = 'personal' | 'school'

export interface Link {
  label: string
  href: string
}

export type Visual =
  | { kind: 'lap-trace' }
  // width and height are the file's pixel size, so the panel keeps its space while it loads.
  | { kind: 'image'; src: string; alt: string; width: number; height: number }
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
