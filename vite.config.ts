/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite'
import { injectPage } from './src/build/inject'

/** Renders the whole page from src/data into index.html, so it works without JavaScript. */
function renderFromData(): Plugin {
  return {
    name: 'render-from-data',
    transformIndexHtml: {
      order: 'pre',
      handler: (html, ctx) => injectPage(html, ctx.path.endsWith('about.html') ? 'about' : 'home'),
    },
    handleHotUpdate({ file, server }) {
      if (/src[\\/](data|render|assets)[\\/]/.test(file)) server.ws.send({ type: 'full-reload' })
    },
  }
}

export default defineConfig({
  plugins: [renderFromData()],
  build: {
    rollupOptions: { input: { main: 'index.html', about: 'about.html' } },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
