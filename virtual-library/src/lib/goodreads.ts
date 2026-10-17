import type { Book, Lang } from '../types'
import { slug } from './util'

/** Minimal RFC 4180 CSV parser (handles quoted fields with commas and newlines). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else quoted = false
      } else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some(f => f !== '')) rows.push(row)
      row = []
    } else field += c
  }
  row.push(field)
  if (row.some(f => f !== '')) rows.push(row)
  return rows
}

function grDate(s: string): string | undefined {
  if (!s) return undefined
  const m = s.match(/^(\d{4})\/(\d{2})\/(\d{2})$/)
  return m ? `${m[1]}-${m[2]}-${m[3]}` : undefined
}
function cleanIsbn(s: string) {
  return s.replace(/^="?|"?$/g, '').replace(/[^0-9Xx]/g, '') || undefined
}
function parseSeries(title: string): { title: string; series?: { name: string; position: number } } {
  const m = title.match(/^(.*?)\s*\(([^()]+?),?\s*#(\d+(?:\.\d+)?)\)\s*$/)
  if (!m) return { title }
  return { title: m[1].trim(), series: { name: m[2].trim(), position: Number(m[3]) } }
}
function detectLang(title: string, authors: string[]): Lang {
  const nlWords = /\b(de|het|een|van|en|ik|ben|zee|uitsterven|bekentenis|partner|geschiedenis)\b/i
  return nlWords.test(title) && !/^the\b/i.test(title) ? 'nl' : 'en'
}

export interface ImportResult { books: Book[]; skipped: number }

/** Convert a Goodreads "Export Library" CSV into Book records, merging with existing ones by title+author. */
export function importGoodreads(csv: string, existing: Book[]): ImportResult {
  const rows = parseCsv(csv)
  if (rows.length < 2) return { books: [], skipped: 0 }
  const header = rows[0].map(h => h.trim())
  const col = (name: string) => header.indexOf(name)
  const cTitle = col('Title'), cAuthor = col('Author'), cAdd = col('Additional Authors'), cIsbn13 = col('ISBN13'), cIsbn = col('ISBN')
  const cRating = col('My Rating'), cPages = col('Number of Pages'), cYear = col('Original Publication Year'), cYear2 = col('Year Published')
  const cRead = col('Date Read'), cAdded = col('Date Added'), cShelf = col('Exclusive Shelf'), cShelves = col('Bookshelves'), cReview = col('My Review'), cOwned = col('Owned Copies')
  if (cTitle < 0 || cAuthor < 0) throw new Error('This does not look like a Goodreads export (no Title/Author columns).')

  const byKey = new Map<string, Book>()
  for (const b of existing) byKey.set(key(b.title, b.authors[0]), b)
  const out: Book[] = []
  let skipped = 0
  const now = new Date().toISOString()

  for (const r of rows.slice(1)) {
    const rawTitle = r[cTitle]?.trim()
    if (!rawTitle) { skipped++; continue }
    const { title, series } = parseSeries(rawTitle)
    const authors = [r[cAuthor], ...(cAdd >= 0 ? r[cAdd].split(',') : [])].map(a => a?.trim()).filter(Boolean)
    const shelf = cShelf >= 0 ? r[cShelf] : 'read'
    const rating = cRating >= 0 ? Number(r[cRating]) || undefined : undefined
    const read = cRead >= 0 ? grDate(r[cRead]) : undefined
    const added = cAdded >= 0 ? grDate(r[cAdded]) : undefined
    const pages = cPages >= 0 ? Number(r[cPages]) || undefined : undefined
    const year = (cYear >= 0 && Number(r[cYear])) || (cYear2 >= 0 && Number(r[cYear2])) || undefined
    const tags = cShelves >= 0 ? r[cShelves].split(',').map(s => s.trim()).filter(s => s && !['read', 'to-read', 'currently-reading'].includes(s)) : []
    const ownedCopies = cOwned >= 0 ? Number(r[cOwned]) || 0 : 0
    const isbn = cIsbn13 >= 0 ? cleanIsbn(r[cIsbn13]) : (cIsbn >= 0 ? cleanIsbn(r[cIsbn]) : undefined)
    const status = shelf === 'read' ? 'read' : shelf === 'currently-reading' ? 'reading' : 'want'

    const prev = byKey.get(key(title, authors[0]))
    const base: Book = prev ?? {
      id: slug(title) + (series ? '-' + series.position : ''),
      kind: 'book', title, authors, series, language: detectLang(title, authors), pages, year, genres: [], tags: [],
      owned: ownedCopies > 0, copies: [], status, reads: [], addedAt: added ? added + 'T12:00:00.000Z' : now, updatedAt: now,
    }
    const reads = [...base.reads]
    if (read && !reads.some(x => x.finish === read)) reads.push({ finish: read })
    const merged: Book = {
      ...base,
      series: base.series ?? series,
      pages: base.pages ?? pages,
      year: base.year ?? year,
      isbn: base.isbn ?? isbn,
      tags: Array.from(new Set([...base.tags, ...tags])),
      rating: rating ?? base.rating,
      review: (cReview >= 0 && r[cReview]?.trim()) || base.review,
      owned: base.owned || ownedCopies > 0,
      status: status === 'read' ? 'read' : base.status === 'read' ? 'read' : status,
      reads,
      updatedAt: now,
    }
    byKey.set(key(title, authors[0]), merged)
    out.push(merged)
  }
  return { books: out, skipped }
}

function key(title: string, author?: string) {
  return (title + '|' + (author ?? '')).toLowerCase().replace(/[^a-z0-9|]/g, '')
}
