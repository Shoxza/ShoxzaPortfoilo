import { PENDING, type Site } from './types'

// Every fact here comes from the owner or the projects' READMEs. Never invent content.
// Anything still PENDING blocks launch (see launch.ts).
export const site: Site = {
  profile: {
    handle: 'Shoxza',
    number: 26,
    title: 'Junior developer',
    location: 'Gjøvik, Norway',
    email: PENDING,
    linkedin: PENDING,
    github: 'https://github.com/Shoxza',
    discordId: PENDING,
  },
  projects: [
    {
      slug: 'raceassistant',
      name: 'RaceAssistant',
      kind: 'personal',
      year: 2026,
      stack: ['TypeScript', 'Node'],
      description:
        'A personal race engineer for F1 26. It reads live telemetry, makes radio calls and coaches you between runs.',
      features: [
        'Radio calls for fuel, gaps, tyres and pit window',
        'Lap recording with trace comparison',
        'Live timing dashboard for a second screen',
      ],
      radio: 'Copy. This one talks back during the race: fuel, gaps, pit window. Quiet in the corners unless you ask.',
      links: [],
      visual: { kind: 'lap-trace' },
    },
    {
      slug: 'anti-f1-spoiler',
      name: 'Anti F1 Spoiler',
      kind: 'personal',
      year: 2026,
      stack: ['TypeScript', 'WebExtensions'],
      description:
        "A browser extension that hides F1 content on YouTube and Instagram until you've watched the race.",
      features: [
        "Hides F1 content on YouTube and Instagram until you've watched the race",
        'Works in Firefox and Chrome/Edge from one TypeScript codebase',
      ],
      radio: "Don't check your phone. Results are hidden until you've watched it.",
      links: [],
      visual: null,
    },
    {
      slug: 'poker-dice',
      name: 'Megaminds Poker Dice',
      kind: 'school',
      year: 2026,
      stack: ['MongoDB', 'Express', 'React', 'Node'],
      description: 'A full-stack MERN dice game built as a team for the IDG2100 exam.',
      features: [],
      role: 'Full-stack, team project',
      radio: PENDING,
      links: [],
      visual: null,
    },
  ],
  crew: [
    {
      org: 'Gjøvik Tech Racing',
      role: 'Web developer',
      logo: { src: '/sponsors/gtr.webp', alt: 'Gjøvik Tech Racing' },
      seasons: [25, 26, 27],
    },
    {
      org: 'Darling',
      role: 'Web committee leader',
      logo: { src: '/sponsors/darling.svg', alt: 'Darling' },
      seasons: [26, 27],
    },
  ],
  seasonsShown: [25, 26, 27],
}
