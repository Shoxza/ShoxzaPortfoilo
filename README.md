# Shoxza #26

My portfolio, built like a Formula 1 pit wall: **[www.shoxza.no](https://www.shoxza.no)**

I'm Ben Hughes-Tretnes, a junior web developer studying at NTNU Gjøvik.

- **Projects:** a timing tower lists my projects. Each one's tyre colour shows what kind of project it is, and picking one opens its details, screenshots and links.
- **Crew:** the teams I build websites for.
- **About:** my journey as a lap of Spa, plus teams I follow, my dog Piper and a few small toys.
- **Live ticker:** shows whether I'm online, the game I'm playing or the song on my Spotify (through [Lanyard](https://github.com/Phineas/lanyard)).

## Built with

- [Vite](https://vite.dev) and TypeScript, with no framework. The pages are rendered to HTML at build time from the data in `src/data/`, so the content shows without JavaScript.
- Plain CSS, [anime.js](https://animejs.com) for a few animations, and `prefers-reduced-motion` respected throughout.
- [Vitest](https://vitest.dev) and jsdom for tests.
- Hosted on [Vercel](https://vercel.com).

## Running it

```bash
npm install
npm run dev           # local dev server
npm test              # run the tests
npm run build         # type-check and build to dist/
npm run budget        # check the built site stays within its size budget
npm run launch-check  # check every required field in the data is filled in
```

## Where things are

| Folder | What's in it |
|---|---|
| `src/data/` | All the content: profile, projects, crew and the About page |
| `src/render/` | Turns the data into HTML at build time |
| `src/client/` | The small amount of JavaScript in the browser: project selection, carousels, ticker, About page toys |
| `src/styles/` | CSS |
| `public/` | Images, logos and icons |
| `tests/` | Tests |
