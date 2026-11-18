// About page content. Every fact here comes from the owner (2026-11-18). Never invent content.

export interface Stop {
  id: 'ni' | 'vestnes' | 'ntnu' | 'gtr' | 'berlin' | 'assistant' | 'award' | 'dyplink' | 'darling' | 'india'
  name: string
  line: string
  year: string
  status: 'driven' | 'next'
}

export interface Ticket {
  team: string
  league: 'Hockey' | 'NBA' | 'MLB'
  fact: string
  colors: [string, string]
}

export interface About {
  name: string
  intro: string
  stops: Stop[]
  alsoOnTheWay: string[]
  setup: { wheel: string; sims: string[]; track: string }
  tickets: Ticket[]
  gameNight: { text: string; games: [string, string] }
  pet: { name: string; breed: string; photo?: { src: string; alt: string } }
  gjovik: { lat: number; lon: number }
}

export const about: About = {
  name: 'Ben Hughes-Tretnes',
  intro: 'Junior developer from Norway',
  // The lap of Spa, in order (from the owner's CV). The 2026 order is Claude's proposal.
  stops: [
    { id: 'ni', name: 'Northern Ireland', line: 'Where it started.', year: '', status: 'driven' },
    { id: 'vestnes', name: 'Vestnes', line: 'Moved to Norway, grew up.', year: '', status: 'driven' },
    { id: 'ntnu', name: 'NTNU Gjøvik', line: 'Bachelor in web development.', year: '2024–27', status: 'driven' },
    { id: 'gtr', name: 'Gjøvik Technology Racing', line: 'Web developer.', year: '2025–', status: 'driven' },
    { id: 'berlin', name: 'Berlin', line: 'Study visit.', year: '2025', status: 'driven' },
    { id: 'assistant', name: 'NTNU', line: 'Student assistant in web coding and interactive design.', year: '2026', status: 'driven' },
    { id: 'award', name: 'Marketer of the Year', line: 'Gjøvik Technology Racing.', year: '2026', status: 'driven' },
    { id: 'dyplink', name: 'Dyplink AS', line: 'Full-stack internship: from planning to MVP.', year: 'Aug–Sep 2026', status: 'driven' },
    { id: 'darling', name: 'Darling', line: 'WebKom leader.', year: '2026–', status: 'driven' },
    { id: 'india', name: 'India', line: 'Next corner: bachelor thesis.', year: 'Jan 2027', status: 'next' },
  ],
  alsoOnTheWay: [
    'shop assistant at XL-Dale Malo (summers 2017–21)',
    'ICT service apprentice and trade certificate at Romsdal VGS (2021–23)',
    'general study competence at Molde VGS (2023–24)',
  ],
  setup: {
    wheel: 'Logitech G29, on a desk',
    sims: ['F1', 'Assetto Corsa Competizione', 'Le Mans Ultimate'],
    track: 'Monaco',
  },
  // Team colours only, never logos.
  tickets: [
    { team: 'Gjøvik Hockey', league: 'Hockey', fact: 'Local hockey in Gjøvik.', colors: ['#1d2b4f', '#c8d3e0'] },
    { team: 'OKC Thunder', league: 'NBA', fact: 'My NBA team.', colors: ['#007ac1', '#ef3b24'] },
    { team: 'San Diego Padres', league: 'MLB', fact: "I've been to a Padres game.", colors: ['#2f241d', '#ffc425'] },
  ],
  gameNight: {
    text: 'Every couple of weeks with friends. Usually: Exploding Kittens or Horrible Therapist.',
    games: ['Exploding Kittens', 'Horrible Therapist'],
  },
  pet: { name: 'Piper', breed: 'Jack Russell' },
  gjovik: { lat: 60.7957, lon: 10.6915 },
}
