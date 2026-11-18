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
  /** Picks the sport icon on the stub and the word on its back. */
  league: 'F1' | 'Football' | 'Hockey' | 'NBA' | 'MLB'
  /** One line under the team name; leave it '' for none. */
  fact: string
  /** [ticket, accent]: the stub's background and the band along its bottom edge. */
  colors: [string, string]
  /** Optional team logo (a file in public/sports/), drawn to suit the stub's colour. */
  logo?: { src: string; width: number; height: number }
}

export interface Photo {
  src: string
  alt: string
  width: number
  height: number
  /** Optional caption, shown under the photo (Piper's carousel). Owner's words only. */
  caption?: string
}

export interface About {
  /** The big hello at the top of the page. */
  greeting: string
  intro: string
  /** Optional portrait beside the greeting. */
  photo?: Photo
  /** Full name, shown on the driver card under the map. */
  name: string
  /** Birth date (YYYY-MM-DD). When set, the driver card shows the age, worked out on each build. */
  born?: string
  stops: Stop[]
  alsoOnTheWay: string[]
  setup: { wheel: string; sims: string[]; track: string }
  tickets: Ticket[]
  gameNight: { text: string; games: [string, string] }
  /** The Piper card is a photo carousel; it only appears once there are photos. */
  pet: { name: string; breed: string; tagline: string; photos: Photo[] }
  gjovik: { lat: number; lon: number }
}

export const about: About = {
  greeting: "Hi, I'm Ben",
  intro:
    'This is my journey so far, as a lap of Spa-Francorchamps. Every turn is a stop, from where it started till what is next.',
  // Portrait from the owner (2026-11-18), cropped square and converted to WebP.
  photo: { src: '/about/ben.webp', alt: 'Ben in an NTNU hoodie with the Darling logo on the sleeve', width: 440, height: 440 },
  name: 'Ben Hughes-Tretnes',
  born: '2003-02-19',
  // The lap of Spa, in order (from the owner's CV). The 2026 order is Claude's proposal.
  stops: [
    { id: 'ni', name: 'Ireland', line: 'Born', year: '', status: 'driven' },
    { id: 'vestnes', name: 'Vestnes', line: 'Moved to Norway, grew up.', year: '', status: 'driven' },
    { id: 'ntnu', name: 'NTNU Gjøvik', line: 'Bachelor in web development.', year: '2024–27', status: 'driven' },
    { id: 'gtr', name: 'Gjøvik Technology Racing', line: 'Web developer.', year: '2025–', status: 'driven' },
    { id: 'berlin', name: 'Berlin', line: 'Study visit.', year: '2025', status: 'driven' },
    { id: 'assistant', name: 'NTNU', line: 'Student assistant in web coding and interactive design.', year: '2026', status: 'driven' },
    { id: 'award', name: 'Marketer of the Year', line: 'Gjøvik Technology Racing.', year: '2026', status: 'driven' },
    { id: 'dyplink', name: 'Dyplink AS', line: 'Full-stack internship: from planning to MVP.', year: 'Aug–Sep 2026', status: 'driven' },
    { id: 'darling', name: 'Darling', line: 'WebKom leader.', year: '2026–', status: 'driven' },
    { id: 'india', name: 'Goa, India', line: 'Next corner: bachelor thesis.', year: 'Jan 2027', status: 'next' },
  ],
  alsoOnTheWay: [
    'Shop assistant at XL-Dale Malo (summers 2017–21)',
    'IT apprentice and trade certificate at Romsdal VGS (2021–23)',
    'High School Diploma at Molde VGS (2023–24)',
  ],
  setup: {
    wheel: 'Logitech G29, on a desk',
    sims: ['F1', 'Assetto Corsa Competizione', 'Le Mans Ultimate'],
    track: 'Monaco',
  },
  // Teams I follow, as ticket stubs. Logos are the owner's files (2026-11-18); Red Bull Racing's had
  // its navy background cut out, and the Padres SD is recoloured white to show on the brown stub.
  tickets: [
    {
      team: 'RedBull Racing',
      league: 'F1',
      fact: "DUDUDUDU",
      colors: ['#121F45', '#ffc906'],
      logo: { src: '/sports/red-bull-racing.webp', width: 199, height: 96 },
    },
    {
      team: 'OKC Thunder',
      league: 'NBA',
      fact: 'My favorite NBA team',
      colors: ['#007ac1', '#ef3b24'],
      logo: { src: '/sports/okc-thunder.svg', width: 247, height: 227 },
    },
    {
      team: 'Gjøvik Hockey',
      league: 'Hockey',
      fact: 'Hockey team i support in Gjøvik.',
      colors: ['#14284b', '#f2b51d'],
      logo: { src: '/sports/gjovik-hockey.webp', width: 106, height: 96 },
    },
    {
      team: 'San Diego Padres',
      league: 'MLB',
      fact: "They might be cursed",
      colors: ['#2f241d', '#ffc425'],
      logo: { src: '/sports/padres.webp', width: 76, height: 96 },
    },
    // To add a football team: copy these lines, remove the // marks and fill them in.
    // The logo line is optional; put the image in public/sports/ and give its pixel size.
    // {
    //   team: 'Team name',
    //   league: 'Football',
    //   fact: 'One line about them',
    //   colors: ['#000000', '#ffffff'],
    //   logo: { src: '/sports/team.webp', width: 96, height: 96 },
    // },
  ],
  gameNight: {
    text: 'Every couple of weeks with friends. Usually: Exploding Kittens or Horrible Therapist.',
    games: ['Exploding Kittens', 'Horrible Therapist'],
  },
  // From the owner (2026-11-18); the grass one goes first, as asked. Cropped square, WebP.
  pet: {
    name: 'Piper',
    breed: 'Jack Russell',
    tagline: 'the best dog ever!',
    photos: [
      {
        src: '/piper/grass.webp',
        alt: 'Piper running through tall grass and dandelions',
        width: 480,
        height: 480,
        caption: 'Jack Russell at full speed. Dandelions optional.',
      },
      {
        src: '/piper/puppy.webp',
        alt: 'Piper as a puppy in a green knitted jumper',
        width: 480,
        height: 480,
        caption: 'Puppy Piper, dressed for winter.',
      },
      {
        src: '/piper/garden.webp',
        alt: 'Piper lying on the lawn with a frisbee, eyeing a football',
        width: 480,
        height: 480,
        caption: 'Frisbee secured. Football next.',
      },
      {
        src: '/piper/sofa.webp',
        alt: 'Piper on her back on the sofa, up close, with a paw in the frame',
        width: 480,
        height: 637,
        caption: 'Sofa mode, paw included.',
      },
    ],
  },
  gjovik: { lat: 60.7957, lon: 10.6915 },
}
