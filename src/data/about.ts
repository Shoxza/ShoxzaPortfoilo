// About page content. Every fact here comes from the owner (2026-11-18). Never invent content.

export interface Stop {
  id: 'ni' | 'vestnes' | 'gjovik' | 'berlin' | 'india'
  name: string
  short: string
  line: string
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
  setup: { wheel: string; sims: string[]; track: string }
  tickets: Ticket[]
  gameNight: { text: string; games: [string, string] }
  pet: { name: string; breed: string; photo?: { src: string; alt: string } }
  gjovik: { lat: number; lon: number }
}

export const about: About = {
  name: 'Ben Hughes Tretnes',
  intro: 'Junior developer from Norway',
  stops: [
    { id: 'ni', name: 'Northern Ireland', short: 'Northern Ireland', line: "Where I'm from.", status: 'driven' },
    { id: 'vestnes', name: 'Vestnes, Møre og Romsdal', short: 'Vestnes', line: 'Where I grew up.', status: 'driven' },
    {
      id: 'gjovik',
      name: 'Gjøvik, NTNU',
      short: 'Gjøvik',
      line: 'Studying web development at NTNU. Web developer for Gjøvik Tech Racing, web committee leader at Darling.',
      status: 'driven',
    },
    { id: 'berlin', name: 'Berlin', short: 'Berlin', line: 'Study visit.', status: 'driven' },
    { id: 'india', name: 'India', short: 'India', line: 'Next corner: bachelor thesis, from January 2027.', status: 'next' },
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
