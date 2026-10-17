import { useMemo } from 'react'
import type { Book } from '../types'
import { coverColors, spineHeight, spineWidth } from '../lib/util'
import { Cover } from './ui'

type Mode = 'physical' | 'author' | 'color' | 'read'

export function ShelfView({ books, mode, onOpen }: { books: Book[]; mode: Mode; onOpen: (b: Book) => void }) {
  const shelves = useMemo(() => arrange(books, mode), [books, mode])
  return (
    <div className="shelf-room" role="list" aria-label="Bookshelves">
      {shelves.map(s => (
        <div key={s.label} role="listitem">
          <div className="flex items-center justify-between px-2 pb-1">
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.label}</span>
            <span className="text-xs tnum" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.items.filter(i => i.kind !== 'object').reduce((n, i) => n + i.books.length, 0)} books</span>
          </div>
          <div className="shelf-row">
            {s.items.map(item => item.kind === 'object' ? <ShelfObject key={item.id} book={item.books[0]} /> : item.kind === 'stack' ? <Stack key={item.id} books={item.books} onOpen={onOpen} /> : item.kind === 'face' ? <Cover key={item.id} book={item.books[0]} width={82} className="face" onClick={() => onOpen(item.books[0])} /> : <Spine key={item.id} book={item.books[0]} onOpen={onOpen} />)}
          </div>
          <div className="shelf-board" />
        </div>
      ))}
    </div>
  )
}

function Spine({ book, onOpen }: { book: Book; onOpen: (b: Book) => void }) {
  const c = coverColors(book)
  const w = spineWidth(book.pages)
  const h = spineHeight(book.pages, 'spine')
  return (
    <button type="button" className="spine" style={{ width: w, height: h, background: c.bg, border: 0, padding: 0 }} onClick={() => onOpen(book)} title={`${book.title} · ${book.authors.join(', ')}`}>
      <span className="spine-text" style={{ color: c.ink, maxHeight: h - 12 }}>{book.title}</span>
      {book.status === 'read' && <span aria-hidden className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full" style={{ width: 5, height: 5, background: 'var(--brass)' }} />}
    </button>
  )
}

function Stack({ books, onOpen }: { books: Book[]; onOpen: (b: Book) => void }) {
  return (
    <div className="stack" role="group" aria-label={`Stack of ${books.length} books`}>
      {books.map(b => {
        const c = coverColors(b)
        const w = 76 + Math.min(40, Math.round((b.pages ?? 300) / 20))
        return <button key={b.id} type="button" className="stack-book" style={{ width: w, background: c.bg, color: c.ink, border: 0 }} onClick={() => onOpen(b)} title={b.title}>{shortTitle(b.title)}</button>
      })}
    </div>
  )
}

function ShelfObject({ book }: { book: Book }) {
  return (
    <div className="shelf-object" title={book.title}>
      <span className="obj-emoji" aria-hidden>{book.emoji ?? '🏺'}</span>
      <span style={{ maxWidth: 70, lineHeight: 1.1 }}>{book.title}</span>
    </div>
  )
}

interface Item { id: string; kind: 'spine' | 'face' | 'stack' | 'object'; books: Book[] }
interface Shelf { label: string; items: Item[] }

function arrange(books: Book[], mode: Mode): Shelf[] {
  if (mode === 'physical') {
    const owned = books.filter(b => b.copies.some(c => c.shelf != null))
    const byShelf = new Map<string, { book: Book; pos: number; display: string }[]>()
    for (const b of owned) for (const c of b.copies) if (c.shelf != null) {
      const k = `${c.bookcase ?? 'Bookcase'} · Shelf ${c.shelf}`
      const arr = byShelf.get(k) ?? []
      arr.push({ book: b, pos: c.position ?? 0, display: b.kind === 'object' ? 'object' : (c.display ?? 'spine') })
      byShelf.set(k, arr)
    }
    const shelves: Shelf[] = [...byShelf.entries()].sort().map(([label, arr]) => {
      arr.sort((a, b) => a.pos - b.pos)
      const items: Item[] = []
      for (const e of arr) {
        const last = items.at(-1)
        if (e.display === 'stack' && last?.kind === 'stack' && last.books.length < 6) { last.books.push(e.book); continue }
        items.push({ id: e.book.id, kind: e.display as Item['kind'], books: [e.book] })
      }
      return { label, items }
    })
    const loose = books.filter(b => (b.kind ?? 'book') === 'book' && b.owned && !b.copies.some(c => c.shelf != null))
    if (loose.length) shelves.push({ label: 'Owned, not yet placed on a shelf', items: loose.map(b => ({ id: b.id, kind: 'spine', books: [b] })) })
    return shelves
  }
  const list = books.filter(b => (b.kind ?? 'book') === 'book')
  let sorted: Book[]
  let label = (b: Book) => ''
  if (mode === 'author') {
    sorted = [...list].sort((a, b) => (a.authors[0] ?? '').split(' ').at(-1)!.localeCompare((b.authors[0] ?? '').split(' ').at(-1)!) || (a.series?.position ?? 0) - (b.series?.position ?? 0))
    label = b => ((b.authors[0] ?? '?').split(' ').at(-1) ?? '?')[0].toUpperCase()
  } else if (mode === 'color') {
    sorted = [...list].sort((a, b) => hue(coverColors(a).bg) - hue(coverColors(b).bg))
    label = () => 'Rainbow'
  } else {
    sorted = [...list].filter(b => b.status === 'read').sort((a, b) => (lastFinish(a) ?? '').localeCompare(lastFinish(b) ?? ''))
    label = b => (lastFinish(b) ?? '????').slice(0, 4)
  }
  const shelves: Shelf[] = []
  const perShelf = 14
  for (const b of sorted) {
    const l = label(b)
    let s = shelves.at(-1)
    if (!s || (mode !== 'color' && s.label !== l && !s.label.startsWith(l + ' ')) || s.items.length >= perShelf) {
      s = { label: mode === 'color' ? `Shelf ${shelves.length + 1}` : l, items: [] }
      shelves.push(s)
    }
    s.items.push({ id: b.id, kind: 'spine', books: [b] })
  }
  // Merge tiny letter shelves for author mode
  if (mode === 'author') {
    const merged: Shelf[] = []
    for (const s of shelves) {
      const last = merged.at(-1)
      if (last && last.items.length + s.items.length <= perShelf) { last.items.push(...s.items); last.label = last.label.split(' ')[0] + ' – ' + s.label }
      else merged.push({ ...s })
    }
    return merged
  }
  return shelves
}
function lastFinish(b: Book) { return b.reads.map(r => r.finish).filter(Boolean).sort().at(-1) }
function hue(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  if (max === min) return 0
  const d = max - min
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return h * 60
}

function shortTitle(t: string) { return t.replace(/^Harry Potter and the /, 'HP: ').replace(/:.*$/, '') }
