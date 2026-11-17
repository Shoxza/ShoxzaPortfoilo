const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/** Escapes text for safe use in HTML content and quoted attributes. */
export function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => map[c])
}
