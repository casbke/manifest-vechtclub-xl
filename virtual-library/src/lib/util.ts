import type { Book } from '../types'

export function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

// A curated set of cloth-binding colours; each pairs with a legible ink.
export const COVER_PALETTE: { bg: string; ink: string }[] = [
  { bg: '#7b2d26', ink: '#f6e7c8' }, { bg: '#1f3a5f', ink: '#e8eef7' }, { bg: '#2f5d3a', ink: '#eaf2e3' },
  { bg: '#5a3e6b', ink: '#efe6f4' }, { bg: '#8a5a1a', ink: '#f8eedc' }, { bg: '#24474f', ink: '#e4f0f2' },
  { bg: '#9a3b4f', ink: '#fbe9ee' }, { bg: '#3c3c3c', ink: '#efe9dd' }, { bg: '#b56a2a', ink: '#fff3e4' },
  { bg: '#1d5c5a', ink: '#e3f3f1' }, { bg: '#5f5120', ink: '#f6f0d8' }, { bg: '#4b2f21', ink: '#f2e6d8' },
]
export function coverColors(book: Pick<Book, 'title' | 'authors'>) {
  const h = hash(book.title + '|' + (book.authors[0] ?? ''))
  return COVER_PALETTE[h % COVER_PALETTE.length]
}

export function spineWidth(pages?: number) {
  const p = pages ?? 320
  return Math.max(16, Math.min(58, Math.round(14 + p / 22)))
}
export function spineHeight(pages?: number, display?: string) {
  const h = hash(String(pages ?? 0) + (display ?? ''))
  return 128 + (h % 5) * 6 // small natural variance between editions
}

export function fmtDate(iso?: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!iso) return ''
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''))
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', opts)
}
export function daysBetween(a?: string, b?: string) {
  if (!a || !b) return undefined
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.max(1, Math.round(ms / 86400000) + 1)
}
export function finishYear(b: Book): number | undefined {
  const f = lastFinish(b)
  return f ? Number(f.slice(0, 4)) : undefined
}
export function lastFinish(b: Book): string | undefined {
  return b.reads.map(r => r.finish).filter(Boolean).sort().at(-1)
}
export function authorSort(name: string) {
  const parts = name.trim().split(/\s+/)
  return (parts.at(-1) ?? name) + ', ' + parts.slice(0, -1).join(' ')
}
export function sortTitle(t: string) {
  return t.replace(/^(the|a|an|de|het|een)\s+/i, '')
}
export function slug(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}
export function newId(title: string) {
  return slug(title) + '-' + Math.random().toString(36).slice(2, 7)
}
export function stars(r?: number) {
  if (!r) return ''
  return '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r))
}
export function pct(n: number, d: number) { return d === 0 ? 0 : Math.round((n / d) * 100) }

export function pickRandom<T>(arr: T[]): T | undefined {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined
}
