import { useMemo, useState } from 'react'
import type { Book } from '../types'
import { useLibrary } from '../store/useLibrary'
import { byAuthor, finishedBooks, isBook, seriesProgress, pacePagesPerDay } from '../lib/stats'
import { fmtDate, lastFinish, newId } from '../lib/util'
import { DISCOVER } from '../seed'
import { Cover, Empty, Section, Stars } from './ui'
import { Grid } from './Library'

export function ReadView({ onOpen }: { onOpen: (b: Book) => void }) {
  const { books } = useLibrary()
  const finished = finishedBooks(books)
  const years = useMemo(() => {
    const m = new Map<string, Book[]>()
    for (const b of finished) { const y = lastFinish(b)!.slice(0, 4); m.set(y, [...(m.get(y) ?? []), b]) }
    return [...m.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([y, list]) => [y, list.sort((a, b) => (lastFinish(b) ?? '').localeCompare(lastFinish(a) ?? ''))] as const)
  }, [finished])
  const dnf = books.filter(b => b.status === 'dnf')
  if (!finished.length && !dnf.length) return <Empty title="No finished books yet" hint="Mark a book finished from its detail page, or import your Goodreads export in Settings." />
  return (
    <div className="flex flex-col gap-8">
      <header><h1 className="text-3xl">Read</h1><p className="text-muted">{finished.length} books finished, grouped by year.</p></header>
      {years.map(([y, list]) => {
        const pages = list.reduce((s, b) => s + (b.pages ?? 0), 0)
        const rated = list.filter(b => b.rating)
        const avg = rated.length ? (rated.reduce((s, b) => s + (b.rating ?? 0), 0) / rated.length).toFixed(1) : '–'
        const topGenre = mode(list.flatMap(b => b.genres))
        return (
          <section key={y} className="flex flex-col gap-3">
            <div className="flex items-baseline gap-4 flex-wrap border-b border-line pb-2">
              <h2 className="text-2xl font-display">{y}</h2>
              <span className="text-sm text-muted tnum">{list.length} books · {pages.toLocaleString('en-GB')} pages · avg {avg} ★{topGenre ? ` · mostly ${topGenre}` : ''}</span>
            </div>
            <Grid books={list} onOpen={onOpen} />
          </section>
        )
      })}
      {dnf.length > 0 && <Section title="Did not finish"><Grid books={dnf} onOpen={onOpen} /></Section>}
    </div>
  )
}

export function OwnedView({ onOpen, go }: { onOpen: (b: Book) => void; go: (v: string) => void }) {
  const { books } = useLibrary()
  const owned = books.filter(b => isBook(b) && b.owned)
  const tbr = owned.filter(b => b.status === 'unread' || b.status === 'want')
  const pace = pacePagesPerDay(books)
  const tbrPages = tbr.reduce((s, b) => s + (b.pages ?? 300), 0)
  const sets = useMemo(() => {
    const m = new Map<string, Book[]>()
    for (const b of owned) for (const c of b.copies) if (c.set) m.set(c.set, [...(m.get(c.set) ?? []), b])
    return [...m.entries()]
  }, [owned])
  const shelves = useMemo(() => {
    const m = new Map<string, Book[]>()
    for (const b of owned) for (const c of b.copies) if (c.shelf != null) { const k = `${c.bookcase ?? 'Bookcase'} · Shelf ${c.shelf}`; m.set(k, [...(m.get(k) ?? []), b]) }
    return [...m.entries()].sort()
  }, [owned])
  const dupes = useMemo(() => owned.filter(b => b.copies.length > 1), [owned])
  if (!owned.length) return <Empty title="No owned books yet" hint="Tick 'I own a copy' when adding a book." />
  return (
    <div className="flex flex-col gap-8">
      <header><h1 className="text-3xl">Owned</h1><p className="text-muted tnum">{owned.length} books on your shelves · {tbr.length} unread ({tbrPages.toLocaleString('en-GB')} pages, roughly {Math.max(1, Math.round(tbrPages / pace / 7))} weeks at your pace)</p></header>
      <Section title="To be read" action={<button className="btn btn-ghost btn-sm" onClick={() => go('library')}>Open shelf view</button>}>
        {tbr.length ? <Grid books={tbr} onOpen={onOpen} /> : <p className="text-muted">You have read everything you own. Time for the wishlist.</p>}
      </Section>
      {sets.length > 0 && (
        <Section title="Matching sets">
          <div className="grid gap-3 sm:grid-cols-2">
            {sets.map(([name, list]) => (
              <div key={name} className="card p-4 flex flex-col gap-2">
                <div className="font-medium">{name}</div>
                <div className="flex gap-1 flex-wrap">{list.sort((a, b) => (a.series?.position ?? 0) - (b.series?.position ?? 0)).map(b => <Cover key={b.id} book={b} width={40} onClick={() => onOpen(b)} />)}</div>
                <div className="text-xs text-muted tnum">{list.length} volumes · {list.filter(b => b.status === 'read').length} read</div>
              </div>
            ))}
          </div>
        </Section>
      )}
      {dupes.length > 0 && <Section title="Owned in more than one edition"><Grid books={dupes} onOpen={onOpen} /></Section>}
      <Section title="Shelf by shelf">
        {shelves.map(([label, list]) => (
          <div key={label} className="flex flex-col gap-2">
            <div className="eyebrow">{label} · {list.length}</div>
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>{list.map(b => <Cover key={b.id} book={b} width={64} onClick={() => onOpen(b)} />)}</div>
          </div>
        ))}
      </Section>
    </div>
  )
}

export function WishlistView({ onOpen, toast }: { onOpen: (b: Book) => void; toast: (m: string) => void }) {
  const { books, save } = useLibrary()
  const want = books.filter(b => isBook(b) && b.status === 'want').sort((a, b) => (a.wishPriority ?? 99) - (b.wishPriority ?? 99) || a.addedAt.localeCompare(b.addedAt))
  async function move(b: Book, dir: -1 | 1) {
    const i = want.indexOf(b); const j = i + dir
    if (j < 0 || j >= want.length) return
    const other = want[j]
    const pa = b.wishPriority ?? i + 1, pb = other.wishPriority ?? j + 1
    await save({ ...b, wishPriority: pb }); await save({ ...other, wishPriority: pa })
  }
  if (!want.length) return <Empty title="Wishlist is empty" hint="Set a book's status to Want to read and it shows up here, in your priority order." />
  return (
    <div className="flex flex-col gap-6">
      <header><h1 className="text-3xl">Want to read</h1><p className="text-muted">{want.length} books in priority order. Owned books you have not read yet are marked.</p></header>
      <ol className="flex flex-col gap-2">
        {want.map((b, i) => (
          <li key={b.id} className="card p-3 flex items-center gap-3">
            <span className="text-muted tnum w-6 text-right font-display text-lg">{i + 1}</span>
            <Cover book={b} width={44} onClick={() => onOpen(b)} />
            <div className="flex-1 min-w-0">
              <button className="font-medium text-left truncate block w-full" style={{ background: 'none', border: 0, padding: 0 }} onClick={() => onOpen(b)}>{b.title}</button>
              <div className="text-sm text-muted truncate">{b.authors.join(', ')}{b.year ? ` · ${b.year}` : ''}{b.pages ? ` · ${b.pages} p.` : ''}</div>
              {b.owned && <span className="chip mt-1">On your shelf, unread</span>}
            </div>
            <div className="flex flex-col gap-1">
              <button className="btn btn-ghost btn-sm" aria-label="Move up" onClick={() => move(b, -1)} disabled={i === 0}>↑</button>
              <button className="btn btn-ghost btn-sm" aria-label="Move down" onClick={() => move(b, 1)} disabled={i === want.length - 1}>↓</button>
            </div>
            {!b.owned && <button className="btn btn-sm hidden sm:inline-flex" onClick={async () => { await save({ ...b, owned: true, copies: [{ format: 'paperback', display: 'spine' }], status: 'unread' }); toast(`${b.title} moved to Owned`) }}>Bought it</button>}
          </li>
        ))}
      </ol>
    </div>
  )
}

export function SeriesView({ onOpen }: { onOpen: (b: Book) => void }) {
  const { books } = useLibrary()
  const series = seriesProgress(books)
  if (!series.length) return <Empty title="No series yet" hint="Give books a series name and number and they will be tracked here." />
  return (
    <div className="flex flex-col gap-6">
      <header><h1 className="text-3xl">Series</h1><p className="text-muted">Progress through every series you have started.</p></header>
      <div className="grid gap-4 md:grid-cols-2">
        {series.map(s => {
          const next = s.books.find(b => b.status !== 'read' && (b.series?.position ?? 0) > Math.max(0, ...s.books.filter(x => x.status === 'read').map(x => x.series?.position ?? 0)))
          return (
            <div key={s.name} className="card p-4 flex flex-col gap-3">
              <div className="flex items-baseline justify-between gap-2"><h2 className="text-lg">{s.name}</h2><span className="text-sm text-muted tnum">{s.read} of {s.total} read</span></div>
              <div className="flex gap-0.5 h-3 rounded overflow-hidden" style={{ background: 'var(--surface-2)' }} role="img" aria-label={`${s.read} read, ${s.owned} owned, ${s.total} in series`}>
                {Array.from({ length: s.total }, (_, i) => {
                  const pos = i + 1
                  const unordered = s.books.every(x => !x.series?.position)
                  const b = unordered ? s.books[i] : s.books.find(x => Math.floor(x.series?.position ?? 0) === pos)
                  const color = b?.status === 'read' ? 'var(--accent)' : b?.owned ? 'var(--brass)' : b ? 'var(--muted)' : 'transparent'
                  return <div key={i} className="flex-1" style={{ background: color }} title={b ? `#${pos} ${b.title}` : `#${pos} missing`} />
                })}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>{s.books.map(b => <div key={b.id} className="relative shrink-0"><Cover book={b} width={48} onClick={() => onOpen(b)} />{b.status === 'read' && <span className="absolute -top-1 -right-1 text-xs rounded-full px-1" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>✓</span>}</div>)}</div>
              <div className="text-xs text-muted flex gap-3 flex-wrap"><span><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: 'var(--accent)' }} />read</span><span><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: 'var(--brass)' }} />owned</span><span><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: 'var(--muted)' }} />listed</span>{next && <span>· Next up: <strong>{next.title}</strong></span>}{s.total > s.books.length && <span>· {s.total - s.books.length} volumes not in your library</span>}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AuthorsView({ onOpen }: { onOpen: (b: Book) => void }) {
  const { books } = useLibrary()
  const [sel, setSel] = useState<string | null>(null)
  const authors = byAuthor(books).sort((a, b) => (b.read + b.owned) - (a.read + a.owned) || a.author.localeCompare(b.author))
  const selBooks = sel ? books.filter(b => b.authors.includes(sel)) : []
  return (
    <div className="flex flex-col gap-6">
      <header><h1 className="text-3xl">Authors</h1><p className="text-muted tnum">{authors.length} authors across your library.</p></header>
      <div className="flex gap-2 flex-wrap">{authors.map(a => <button key={a.author} className="chip" aria-pressed={sel === a.author} onClick={() => setSel(sel === a.author ? null : a.author)}>{a.author} <span className="tnum opacity-70">{a.read + a.owned - Math.min(a.read, a.owned) || a.read || a.owned}</span></button>)}</div>
      {sel ? (
        <Section title={sel}>
          <div className="text-sm text-muted">{selBooks.filter(b => b.status === 'read').length} read · {selBooks.filter(b => b.owned).length} owned{authors.find(a => a.author === sel)?.avg ? ` · average ${authors.find(a => a.author === sel)!.avg.toFixed(1)} ★` : ''}</div>
          <Grid books={selBooks} onOpen={onOpen} />
        </Section>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {authors.slice(0, 12).map(a => (
            <button key={a.author} className="card p-4 text-left flex flex-col gap-1" onClick={() => setSel(a.author)}>
              <div className="font-medium">{a.author}</div>
              <div className="text-sm text-muted tnum">{a.read} read · {a.owned} owned</div>
              {a.avg > 0 && <Stars value={Math.round(a.avg)} size={12} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function DiscoverView({ toast }: { toast: (m: string) => void }) {
  const { books, save } = useLibrary()
  const [dismissed, setDismissed] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('discover.dismissed') ?? '[]') } catch { return [] } })
  const have = new Set(books.map(b => b.title.toLowerCase()))
  const list = DISCOVER.filter(s => !have.has(s.title.toLowerCase()) && !dismissed.includes(s.title))
  function dismiss(t: string) { const d = [...dismissed, t]; setDismissed(d); try { localStorage.setItem('discover.dismissed', JSON.stringify(d)) } catch { /* ignore */ } }
  async function wish(s: typeof DISCOVER[number]) {
    const fake: Book = { id: newId(s.title), kind: 'book', title: s.title, authors: [s.author], language: /deugen|pogingen/i.test(s.title) ? 'nl' : 'en', genres: [], tags: ['discover'], owned: false, copies: [], status: 'want', reads: [], addedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    await save(fake); toast(`${s.title} added to your wishlist`)
  }
  return (
    <div className="flex flex-col gap-6">
      <header><h1 className="text-3xl">Discover</h1><p className="text-muted">Suggestions drawn from what you own, what you rated highly, and the gaps in your series.</p></header>
      {list.length === 0 ? <Empty title="You have seen them all" hint="Add more books and ratings and new suggestions will follow." /> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(s => (
            <div key={s.title} className="card p-4 flex flex-col gap-2">
              <Cover book={{ title: s.title, authors: [s.author] } as Book} width={64} />
              <div className="font-medium leading-tight">{s.title}</div>
              <div className="text-sm text-muted">{s.author}</div>
              <div className="text-xs" style={{ color: 'var(--accent)' }}>Because {s.because}</div>
              <div className="flex gap-2 mt-auto pt-2"><button className="btn btn-sm btn-primary" onClick={() => wish(s)}>Want to read</button><button className="btn btn-sm btn-ghost" onClick={() => dismiss(s.title)}>Not for me</button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function mode(arr: string[]) {
  const m = new Map<string, number>()
  for (const a of arr) m.set(a, (m.get(a) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
}
