import type { Site } from './types'

// Site content: profile, projects and crew.
// Anything still PENDING blocks launch (see launch.ts).
export const site: Site = {
  profile: {
    handle: 'Shoxza',
    number: 26,
    title: 'Junior Web developer',
    tagline: 'Ben Hughes-Tretnes - Web Developer portfolio',
    location: 'NTNU Gjøvik, Norway',
    email: 'benjaminhughes19@hotmail.com',
    linkedin: 'https://www.linkedin.com/in/ben-hughes-tretnes-163a77387/',
    github: 'https://github.com/Shoxza',
    discordId: '250990757962448897',
  },
  projects: [
    {
      slug: 'raceassistant',
      name: 'RaceAssistant',
      kind: 'personal',
      year: 2026,
      stack: ['TypeScript', 'Node', 'Svelte'],
      description:
        'A personal race engineer for F1 26, Assetto Corsa Competizione and LeMans Ultimate. It reads live telemetry, makes radio calls and coaches you between runs.',
      features: [
        'Radio calls for fuel, gaps, tyres and pit window',
        'Lap recording with trace comparison',
        'Streamdeck Hotkeys for quick access',
        'Live timing dashboard for a second screen',
      ],
      radio: 'Engineer that talks back during the race: fuel, gaps, pit window. Helping with the hard strategy decisions.',
      links: [],
      // Screenshots taken 2026-11-18. The Live screen shows the dashboard's demo race (?demo).
      visual: {
        kind: 'images',
        images: [
          {
            src: '/projects/raceassistant-live.webp',
            alt: 'The Live screen during a race at Silverstone: a large green delta of minus 0.176 seconds, sector and lap times, the cars ahead and behind, the pit plan, tyre temperatures and fuel',
            width: 1200,
            height: 575,
            caption: 'Live timing for a second screen',
          },
          {
            src: '/projects/raceassistant-telemetry.webp',
            alt: 'The Laps page comparing two laps at Losail: time gap, speed and throttle and brake traces, with a debrief and the turns where time was lost',
            width: 1200,
            height: 577,
            caption: 'Two laps compared, with a debrief of where the time went',
          },
          {
            src: '/projects/raceassistant-settings.webp',
            alt: 'The Settings page: radio verbosity, the driver name and switches for each kind of radio call',
            width: 1200,
            height: 573,
            caption: 'Choose what the engineer talks about',
          },
        ],
      },
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
      // Screenshots taken 2026-11-18.
      visual: {
        kind: 'images',
        images: [
          {
            src: '/projects/anti-f1-spoiler-modal.webp',
            alt: "The extension's popup in Auto mode: not blocking right now, the next race weekend, and a choice between hiding all F1 content or only results",
            width: 313,
            height: 341,
            caption: 'Auto mode blocks on race weekends only and you choose when to block and how long',
          },
          {
            src: '/projects/anti-f1-spoiler-pre.webp',
            alt: "YouTube's front page without the extension, with F1 qualifying highlights and other F1 videos among the thumbnails",
            width: 1200,
            height: 494,
            caption: 'Before: F1 videos all over the front page',
          },
          {
            src: '/projects/anti-f1-spoiler-active.webp',
            alt: "The same YouTube page with the extension blocking: the F1 videos are gone and the extension's popup says 18 items were removed",
            width: 1200,
            height: 503,
            caption: 'After: 18 F1 videos removed',
          },
        ],
      },
    },
    {
      // The site only loads on NTNU's network or VPN, so no link yet.
      // Screenshots taken 2026-11-18.
      slug: 'hcai-lab',
      name: 'HCAI Lab website',
      kind: 'school',
      year: 2026,
      stack: ['React', 'Node', 'Express'],
      description:
        "A full-stack website for the HCAI lab at NTNU Gjøvik. It shows the lab's news, equipment and events, student portfolios, and the publications of the professors connected to the lab.",
      features: [
        'Automated news feed',
        'Moderation for equipment and events',
        'Student portfolios',
        "Professors' publications and how each one works with the lab",
      ],
      role: 'Full-stack, team project',
      radio: "Copy. News, kit, events and who's publishing what. All in one place, nobody chasing it by email.",
      links: [],
      // Add more screenshots to this list to get a carousel. Each one can also have
      // caption: '...' and href: 'https://...' (clicking the picture opens the link).
      visual: {
        kind: 'images',
        images: [
          {
            src: '/projects/hcai-lab.webp',
            alt: "The HCAI Lab website's front page: the lab's mission and links to people, news, events, equipment, portfolios and publications",
            width: 1200,
            height: 750,
          },
          {
            src: '/projects/hcai-lab-news.webp',
            alt: 'The News page: a feed of AI news articles, each with its date, a summary and a picture',
            width: 1200,
            height: 574,
            caption: 'The automated news feed',
          },
          {
            src: '/projects/hcai-lab-equipment.webp',
            alt: "The AI Equipment page: cards for the lab's PC, LOOI robot, 3D printer and sound equipment, each free to book",
            width: 1200,
            height: 574,
            caption: "The lab's equipment",
          },
          {
            src: '/projects/hcai-lab-equipment-booking.webp',
            alt: 'Booking the LOOI robot: a calendar with 18 to 20 November 2026 selected, and fields for name and email',
            width: 1200,
            height: 574,
            caption: 'Booking up to five working days',
          },
          {
            src: '/projects/hcai-lab-portfolio.webp',
            alt: 'The Portfolio page with a portfolio of the week and the list of student portfolios',
            width: 1200,
            height: 508,
            caption: 'Student portfolios',
          },
          {
            src: '/projects/hcai-lab-admin.webp',
            alt: 'The admin dashboard: counts of pending portfolios, articles to review, approved and total articles, a review queue and quick actions',
            width: 1200,
            height: 574,
            caption: 'The admin dashboard',
          },
          {
            src: '/projects/hcai-lab-admin-review.webp',
            alt: 'The admin review queue: a pending portfolio and new articles, each with approve and delete buttons',
            width: 1200,
            height: 576,
            caption: 'Approving content before it goes public',
          },
        ],
      },
    },
    {
      slug: 'poker-dice',
      name: 'Megaminds Poker Dice',
      kind: 'school',
      year: 2026,
      stack: ['MongoDB', 'Express', 'React', 'Node'],
      description: 'A full-stack MERN Poker dice game built as a team for the Full-stack Web Development exam.',
      features: [
        "Dice rolled on the server, so players can't cheat",
        'Matchmaking and tournaments',
        'ELO rating leaderboard',
        'Comments, JWT login and admin pages',
      ],
      role: 'Full-stack, team project',
      radio: "Dice are rolled on the server. Nobody's cheating on this table.",
      links: [],
      visual: null,
      
    },
    {
      slug: 'gtr',
      name: 'GTR',
      kind: 'volunteer',
      year: '2025-27',
      stack: ['HTML', 'SCSS', 'JS', 'PHP'],
      description: 'Gjøvik Technology Racing',
      features: [
        'Displaying sponsors and partners',
        'Marketing the team with the website',
        'Team page showing the members',
      ],
      role: 'HTML Website, team project',
      radio: "Car Passed the Shell Eco Marathon Check in the first year",
      links: ['https://www.gjoviktech.no'],
      visual: {
        kind: 'images',
        images: [
          {
            src: '/projects/gtr-home.webp',
            alt: 'GTR racing homepage with the 2026 car',
            width: 1200,
            height: 576,
            caption: 'GTR Homepage with the Aeroswan One Built for Shell Eco-marathon 2026 in Poland',
          },
        ]
      },
    },
    {
      slug: 'darling',
      name: 'Darling',
      kind: 'volunteer',
      year: '2026-27',
      stack: ['HTML', 'SCSS', 'React', 'Sanity'],
      description: 'Darling Student Association | Darling Linjeforening',
      features: [
        'Website for Design students at NTNU Gjøvik',
        'Marketing the Association with the website',
        'Giving Students and Businesses information about darlings events and services',
      ],
      role: 'React Website, Team lead',
      radio: "New Look!",
      links: ['https://www.darlinglinjeforening.no'],
      visual: {
        kind: 'images',
        images: [
          {
            src: '/projects/darling-home.webp',
            alt: 'Darling Student Association Homepage',
            width: 1200,
            height: 574,
            caption: 'Darlings Homepage',
          },
        ]
      },
    },
  ],
  crew: [
    {
      org: 'Gjøvik Technology Racing',
      role: 'Web developer',
      logo: { src: '/sponsors/gtr.webp', alt: 'Gjøvik Technology Racing' },
      seasons: [25, 26, 27],
    },
    {
      org: 'Darling',
      role: 'Web committee leader',
      logo: { src: '/sponsors/darling.svg', alt: 'Darling' },
      seasons: [26, 27],
    },
  ],
}
