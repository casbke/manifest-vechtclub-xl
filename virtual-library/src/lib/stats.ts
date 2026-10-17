import type { Book } from '../types'
import { daysBetween, finishYear } from './util'

export const isBook = (b: Book) => (b.kind ?? 'book') === 'book'

export function finishedBooks(books: Book[]) {
  return books.filter(b => isBook(b) && b.status === 'read' && b.reads.some(r => r.finish))
}
export function booksPerYear(books: Book[]) {
  const m = new Map<number, { count: number; pages: number }>()
  for (const b of finishedBooks(books)) {
    const y = finishYear(b)!
    const e = m.get(y) ?? { count: 0, pages: 0 }
    e.count++; e.pages += b.pages ?? 0
    m.set(y, e)
  }
  return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([year, v]) => ({ year, ...v }))
}
export function booksPerMonth(books: Book[], year: number) {
  const arr = Array.from({ length: 12 }, () => 0)
  for (const b of finishedBooks(books)) for (const r of b.reads) if (r.finish?.startsWith(String(year))) arr[Number(r.finish.slice(5, 7)) - 1]++
  return arr
}
export function ratingDistribution(books: Book[]) {
  const arr = [0, 0, 0, 0, 0]
  for (const b of finishedBooks(books)) if (b.rating) arr[Math.min(5, Math.max(1, Math.round(b.rating))) - 1]++
  return arr
}
export function averageRating(books: Book[]) {
  const rated = finishedBooks(books).filter(b => b.rating)
  return rated.length ? rated.reduce((s, b) => s + (b.rating ?? 0), 0) / rated.length : 0
}
export function byAuthor(books: Book[]) {
  const m = new Map<string, { read: number; owned: number; ratings: number[] }>()
  for (const b of books.filter(isBook)) for (const a of b.authors) {
    const e = m.get(a) ?? { read: 0, owned: 0, ratings: [] }
    if (b.status === 'read') { e.read++; if (b.rating) e.ratings.push(b.rating) }
    if (b.owned) e.owned++
    m.set(a, e)
  }
  return [...m.entries()].map(([author, v]) => ({ author, ...v, avg: v.ratings.length ? v.ratings.reduce((s, x) => s + x, 0) / v.ratings.length : 0 }))
}
export function languageSplit(books: Book[]) {
  const f = finishedBooks(books)
  return { en: f.filter(b => b.language === 'en').length, nl: f.filter(b => b.language === 'nl').length, other: f.filter(b => b.language === 'other').length }
}
export function readingSpeeds(books: Book[]) {
  const rows = finishedBooks(books).flatMap(b => b.reads.filter(r => r.start && r.finish).map(r => ({ book: b, days: daysBetween(r.start, r.finish)! })))
  rows.sort((a, b) => a.days - b.days)
  return { fastest: rows[0], slowest: rows.at(-1), rows }
}
export function pacePagesPerDay(books: Book[]) {
  const { rows } = readingSpeeds(books)
  // Median pages-per-day across reads, so one slow read alongside other books does not drag the estimate down.
  const rates = rows.filter(r => r.book.pages).map(r => (r.book.pages ?? 0) / r.days).sort((a, b) => a - b)
  if (!rates.length) return 40
  return Math.max(10, Math.round(rates[Math.floor(rates.length / 2)]))
}
export function seriesProgress(books: Book[]) {
  const m = new Map<string, Book[]>()
  for (const b of books.filter(isBook)) if (b.series?.name) { const arr = m.get(b.series.name) ?? []; arr.push(b); m.set(b.series.name, arr) }
  return [...m.entries()].map(([name, list]) => {
    list.sort((a, b) => (a.series?.position ?? 0) - (b.series?.position ?? 0))
    const maxPos = Math.max(...list.map(b => b.series?.position ?? 0))
    const known = SERIES_LENGTH[name] ?? (maxPos > 0 ? Math.ceil(maxPos) : list.length)
    return { name, books: list, read: list.filter(b => b.status === 'read').length, owned: list.filter(b => b.owned).length, total: Math.max(known, list.length) }
  }).sort((a, b) => b.books.length - a.books.length)
}
export const SERIES_LENGTH: Record<string, number> = {
  'Harry Potter': 7, 'The Wheel of Time': 14, 'The Poppy War': 3, 'The Lord of the Rings': 3, 'Sigma Force': 18, 'Dirk Pitt': 27, 'NUMA Files': 20,
  'Harry Hole': 13, 'Hannibal Lecter': 4, 'Daniel Leicester': 5, 'Camino': 2, 'The Midnight World': 1,
}
export function onThisDay(books: Book[], today = new Date()) {
  const mmdd = String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0')
  return books.filter(isBook).flatMap(b => b.reads.flatMap(r => [
    ...(r.start?.slice(5) === mmdd && !r.start.startsWith(String(today.getFullYear())) ? [{ book: b, what: 'started', when: r.start }] : []),
    ...(r.finish?.slice(5) === mmdd && !r.finish.startsWith(String(today.getFullYear())) ? [{ book: b, what: 'finished', when: r.finish }] : []),
  ]))
}
