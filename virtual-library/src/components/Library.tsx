import { useMemo, useState } from 'react'
import type { Book, Status } from '../types'
import { STATUS_LABEL, LANG_LABEL, FORMAT_LABEL } from '../types'
import { useLibrary } from '../store/useLibrary'
import { isBook } from '../lib/stats'
import { authorSort, fmtDate, lastFinish, sortTitle } from '../lib/util'
import { Cover, Empty, Stars } from './ui'
import { ShelfView } from './ShelfView'

type View = 'grid' | 'list' | 'shelf'
type Sort = 'title' | 'author' | 'added' | 'finished' | 'rating' | 'pages' | 'year' | 'series'

export function Library({ onOpen, onAdd, initialFilter }: { onOpen: (b: Book) => void; onAdd: () => void; initialFilter?: Partial<Filters> }) {
  const { books, loaded, kind, loadSeed } = useLibrary()
  const [view, setView] = useState<View>(() => { try { return (localStorage.getItem('lib.view') as View) || 'grid' } catch { return 'grid' } })
  const [shelfMode, setShelfMode] = useState<'physical' | 'author' | 'color' | 'read'>('physical')
  const [sort, setSort] = useState<Sort>('added')
  const [f, setF] = useState<Filters>({ q: '', owned: 'any', status: [], lang: [], genre: [], ...initialFilter })
  const [showFilters, setShowFilters] = useState(false)

  const genres = useMemo(() => Array.from(new Set(books.flatMap(b => b.genres))).sort(), [books])
  const list = useMemo(() => {
    let out = books.filter(isBook)
    const q = f.q.trim().toLowerCase()
    if (q) out = out.filter(b => [b.title, b.originalTitle, ...b.authors, b.series?.name, b.review, ...b.tags, ...b.genres].filter(Boolean).join(' ').toLowerCase().includes(q))
    if (f.owned !== 'any') out = out.filter(b => b.owned === (f.owned === 'yes'))
    if (f.status.length) out = out.filter(b => f.status.includes(b.status))
    if (f.lang.length) out = out.filter(b => f.lang.includes(b.language))
    if (f.genre.length) out = out.filter(b => b.genres.some(g => f.genre.includes(g)))
    const cmp: Record<Sort, (a: Book, b: Book) => number> = {
      title: (a, b) => sortTitle(a.title).localeCompare(sortTitle(b.title)),
      author: (a, b) => authorSort(a.authors[0] ?? '').localeCompare(authorSort(b.authors[0] ?? '')) || (a.series?.position ?? 0) - (b.series?.position ?? 0),
      added: (a, b) => b.addedAt.localeCompare(a.addedAt) || a.title.localeCompare(b.title),
      finished: (a, b) => (lastFinish(b) ?? '').localeCompare(lastFinish(a) ?? ''),
      rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
      pages: (a, b) => (b.pages ?? 0) - (a.pages ?? 0),
      year: (a, b) => (a.year ?? 9999) - (b.year ?? 9999),
      series: (a, b) => (a.series?.name ?? 'zzz').localeCompare(b.series?.name ?? 'zzz') || (a.series?.position ?? 0) - (b.series?.position ?? 0),
    }
    return [...out].sort(cmp[sort])
  }, [books, f, sort])

  function setViewPersist(v: View) { setView(v); try { localStorage.setItem('lib.view', v) } catch { /* ignore */ } }
  const toggle = <K extends 'status' | 'lang' | 'genre'>(k: K, v: Filters[K][number]) => setF(x => ({ ...x, [k]: (x[k] as string[]).includes(v) ? (x[k] as string[]).filter(y => y !== v) : [...(x[k] as string[]), v] }))
  const active = (f.owned !== 'any' ? 1 : 0) + f.status.length + f.lang.length + f.genre.length

  if (loaded && books.length === 0) {
    return <Empty title="Your library is empty" hint={kind === 'cloud' ? 'Claude will load your collection into this page. If it stays empty, load the starter library built from your shelves and Goodreads.' : 'Add your first book or load the starter library.'}>
      <div className="flex gap-2"><button className="btn btn-primary" onClick={onAdd}>Add a book</button><button className="btn" onClick={loadSeed}>Load my starter library</button></div>
    </Empty>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-3xl">Library</h1>
          <div className="flex gap-2 items-center">
            <div className="flex rounded-lg border border-line overflow-hidden" role="tablist" aria-label="View">
              {(['grid', 'list', 'shelf'] as View[]).map(v => <button key={v} role="tab" aria-selected={view === v} className="px-3 py-1.5 text-sm capitalize" style={{ background: view === v ? 'var(--accent)' : 'var(--surface)', color: view === v ? 'var(--accent-ink)' : 'inherit', border: 0 }} onClick={() => setViewPersist(v)}>{v}</button>)}
            </div>
            <button className="btn btn-primary" onClick={onAdd}>+ Add</button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <input id="lib-search" className="field flex-1 min-w-[200px]" placeholder="Search title, author, series, notes…  ( / )" value={f.q} onChange={e => setF({ ...f, q: e.target.value })} />
          <select id="lib-sort" className="field w-auto" value={sort} onChange={e => setSort(e.target.value as Sort)} aria-label="Sort by">
            <option value="added">Recently added</option><option value="title">Title</option><option value="author">Author</option><option value="finished">Recently finished</option><option value="rating">Rating</option><option value="pages">Page count</option><option value="year">Publication year</option><option value="series">Series order</option>
          </select>
          <button className="btn" aria-expanded={showFilters} onClick={() => setShowFilters(s => !s)}>Filters{active ? ` (${active})` : ''}</button>
        </div>
        {showFilters && (
          <div className="card p-3 flex flex-col gap-3">
            <FilterRow label="Ownership">{(['any', 'yes', 'no'] as const).map(v => <button key={v} className="chip" aria-pressed={f.owned === v} onClick={() => setF({ ...f, owned: v })}>{v === 'any' ? 'Any' : v === 'yes' ? 'Owned' : 'Not owned'}</button>)}</FilterRow>
            <FilterRow label="Status">{(Object.keys(STATUS_LABEL) as Status[]).map(s => <button key={s} className="chip" aria-pressed={f.status.includes(s)} onClick={() => toggle('status', s)}>{STATUS_LABEL[s]}</button>)}</FilterRow>
            <FilterRow label="Language">{(['en', 'nl'] as const).map(l => <button key={l} className="chip" aria-pressed={f.lang.includes(l)} onClick={() => toggle('lang', l)}>{LANG_LABEL[l]}</button>)}</FilterRow>
            <FilterRow label="Genre">{genres.map(g => <button key={g} className="chip" aria-pressed={f.genre.includes(g)} onClick={() => toggle('genre', g)}>{g}</button>)}</FilterRow>
            {active > 0 && <button className="btn btn-ghost btn-sm self-start" onClick={() => setF({ q: f.q, owned: 'any', status: [], lang: [], genre: [] })}>Clear filters</button>}
          </div>
        )}
        <div className="text-sm text-muted tnum">{list.length} {list.length === 1 ? 'book' : 'books'}</div>
      </div>

      {view === 'shelf' && (
        <div className="flex gap-2 flex-wrap">
          {([['physical', 'My real shelves'], ['author', 'By author'], ['color', 'Rainbow'], ['read', 'By year read']] as const).map(([m, l]) => <button key={m} className="chip" aria-pressed={shelfMode === m} onClick={() => setShelfMode(m)}>{l}</button>)}
        </div>
      )}
      {list.length === 0 ? <Empty title="No books match" hint="Try fewer filters or a different search." /> :
        view === 'grid' ? <Grid books={list} onOpen={onOpen} /> : view === 'list' ? <Table books={list} onOpen={onOpen} /> : <ShelfView books={shelfMode === 'physical' ? books.filter(b => list.includes(b) || b.kind === 'object') : list} mode={shelfMode} onOpen={onOpen} />}
    </div>
  )
}

export interface Filters { q: string; owned: 'any' | 'yes' | 'no'; status: Status[]; lang: ('en' | 'nl' | 'other')[]; genre: string[] }

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex gap-2 items-start flex-wrap"><span className="eyebrow w-20 pt-1 shrink-0">{label}</span><div className="flex gap-1.5 flex-wrap">{children}</div></div>
}

export function Grid({ books, onOpen }: { books: Book[]; onOpen: (b: Book) => void }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))' }}>
      {books.map(b => (
        <div key={b.id} className="flex flex-col gap-1 min-w-0">
          <Cover book={b} width={104} className="w-full" onClick={() => onOpen(b)} />
          <div className="text-xs font-medium leading-tight line-clamp-2">{b.title}</div>
          <div className="text-xs text-muted truncate">{b.authors[0]}</div>
          <div className="flex items-center gap-1 text-xs">{b.rating ? <Stars value={b.rating} size={11} /> : <span className="text-muted">{STATUS_LABEL[b.status]}</span>}</div>
        </div>
      ))}
    </div>
  )
}

export function Table({ books, onOpen }: { books: Book[]; onOpen: (b: Book) => void }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth: 640 }}>
        <thead><tr className="text-left text-xs text-muted border-b border-line"><th className="p-3 font-medium">Title</th><th className="p-3 font-medium">Author</th><th className="p-3 font-medium">Status</th><th className="p-3 font-medium">Rating</th><th className="p-3 font-medium tnum">Pages</th><th className="p-3 font-medium">Format</th><th className="p-3 font-medium">Finished</th></tr></thead>
        <tbody>
          {books.map(b => (
            <tr key={b.id} className="border-b border-line last:border-0 hover:bg-surface-2 cursor-pointer" onClick={() => onOpen(b)}>
              <td className="p-3"><div className="flex items-center gap-2"><Cover book={b} width={22} /><span className="font-medium">{b.title}</span>{b.series && <span className="text-xs text-muted">#{b.series.position}</span>}</div></td>
              <td className="p-3 text-muted">{b.authors.join(', ')}</td>
              <td className="p-3"><span className="chip">{STATUS_LABEL[b.status]}</span></td>
              <td className="p-3"><Stars value={b.rating} size={12} /></td>
              <td className="p-3 tnum">{b.pages ?? ''}</td>
              <td className="p-3 text-muted">{b.owned ? FORMAT_LABEL[b.copies[0]?.format ?? 'other'] : '—'}</td>
              <td className="p-3 tnum text-muted">{fmtDate(lastFinish(b))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
