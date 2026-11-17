import { PENDING, type Profile } from '../data/types'
import { esc } from './escape'

export function renderContact(p: Profile): string {
  const links: [string, string][] = []
  if (p.email !== PENDING) links.push(['Email', `mailto:${p.email}`])
  links.push(['GitHub', p.github])
  if (p.linkedin !== PENDING) links.push(['LinkedIn', p.linkedin])
  const items = links
    .map(([label, href]) => `<li><a href="${esc(href)}"${href.startsWith('http') ? ' rel="noopener"' : ''}>${label}</a></li>`)
    .join('')
  return `<section id="contact" class="contact" aria-labelledby="contact-h">
  <h2 id="contact-h">Contact</h2>
  <ul class="contact-links">${items}</ul>
</section>`
}
