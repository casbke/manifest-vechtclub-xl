import { useState } from 'react'
import type { Book, Copy, Format, Lang, Status } from '../types'
import { FORMAT_LABEL, LANG_LABEL, STATUS_LABEL } from '../types'
import { daysBetween, fmtDate, newId } from '../lib/util'
import { searchOpenLibrary, coverUrlFor, type OLResult } from '../lib/openlibrary'
import { Cover, Modal, Stars } from './ui'
import { useLibrary } from '../store/useLibrary'

export function BookDetail({ book, onClose, onEdit, toast }: { book: Book; onClose: () => void; onEdit: () => void; toast: (m: string) => void }) {
  const { save, remove } = useLibrary()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const current = book.reads.find(r => r.start && !r.finish)
  const today = new Date().toISOString().slice(0, 10)

  async function startReading() {
    await save({ ...book, status: 'reading', reads: [...book.reads, { start: today }] })
    toast('Started reading ' + book.title)
  }
  async function finishReading() {
    const reads = book.reads.map(r => r === current ? { ...r, finish: today } : r)
    if (!current) reads.push({ start: today, finish: today })
    await save({ ...book, status: 'read', reads })
    toast('Finished! Give it a rating.')
  }
  return (
    <Modal onClose={onClose} label={book.title}>
      <div className="p-5 sm:p-7 flex flex-col gap-5">
        <div className="flex gap-5 flex-col sm:flex-row">
          <Cover book={book} width={140} />
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="eyebrow">{book.series ? `${book.series.name}${book.series.position ? ` · Book ${book.series.position}` : ''}` : (book.genres[0] ?? 'Book')}</div>
            <h2 className="text-2xl leading-tight">{book.title}</h2>
            {book.originalTitle && <div className="text-muted text-sm">Original title: {book.originalTitle}</div>}
            <div>{book.authors.join(', ')}</div>
            <div className="flex items-center gap-3 flex-wrap text-sm text-muted">
              {book.year && <span>{book.year}</span>}
              {book.pages && <span className="tnum">{book.pages} pages</span>}
              <span>{LANG_LABEL[book.language]}</span>
              {book.isbn && <span className="font-mono text-xs">ISBN {book.isbn}</span>}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="chip" aria-pressed={book.status === 'read'}>{STATUS_LABEL[book.status]}</span>
              {book.owned ? <span className="chip">Owned{book.copies[0]?.format ? ` · ${FORMAT_LABEL[book.copies[0].format]}` : ''}</span> : <span className="chip">Not owned</span>}
              {book.copies.filter(c => c.shelf != null).map((c, i) => <span key={i} className="chip">📍 {c.bookcase} · shelf {c.shelf}</span>)}
              {book.copies[0]?.set && <span className="chip">Set: {book.copies[0].set}</span>}
            </div>
            <div className="flex items-center gap-2">
              <Stars value={book.rating} size={22} onChange={v => save({ ...book, rating: v || undefined })} />
              <span className="text-xs text-muted">tap to rate</span>
            </div>
            <div className="flex gap-2 flex-wrap pt-1">
              {book.status !== 'reading' && book.status !== 'read' && <button className="btn btn-primary btn-sm" onClick={startReading}>Start reading</button>}
              {book.status === 'reading' && <button className="btn btn-primary btn-sm" onClick={finishReading}>Mark finished</button>}
              {book.status === 'read' && <button className="btn btn-sm" onClick={startReading}>Reread</button>}
              {!book.owned && <button className="btn btn-sm" onClick={() => save({ ...book, owned: true, copies: book.copies.length ? book.copies : [{ format: 'paperback' }], status: book.status === 'want' ? 'unread' : book.status })}>I own this</button>}
              <button className="btn btn-sm" onClick={onEdit}>Edit</button>
            </div>
          </div>
        </div>

        {book.review && (
          <div className="card p-4">
            <div className="eyebrow mb-1">My review</div>
            <p className="whitespace-pre-wrap">{book.review}</p>
          </div>
        )}
        {book.description && <p className="text-muted">{book.description}</p>}

        {book.reads.length > 0 && (
          <div>
            <div className="eyebrow mb-2">Reading history</div>
            <ul className="flex flex-col gap-1 text-sm">
              {book.reads.map((r, i) => (
                <li key={i} className="flex gap-3 flex-wrap tnum">
                  <span>{r.start ? fmtDate(r.start) : '—'}</span><span className="text-muted">→</span><span>{r.finish ? fmtDate(r.finish) : 'in progress'}</span>
                  {r.start && r.finish && <span className="text-muted">{daysBetween(r.start, r.finish)} days</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {book.tags.length > 0 && <div className="flex gap-1 flex-wrap">{book.tags.map(t => <span key={t} className="chip">#{t}</span>)}</div>}

        <div className="flex justify-between items-center pt-2 border-t border-line">
          {!confirmDelete ? <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(true)}>Remove from library</button>
            : <span className="flex gap-2 items-center text-sm">Remove permanently? <button className="btn btn-sm" style={{ color: 'var(--danger)' }} onClick={async () => { await remove(book.id); onClose(); toast('Removed ' + book.title) }}>Yes, remove</button><button className="btn btn-sm" onClick={() => setConfirmDelete(false)}>Keep</button></span>}
          <button className="btn btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </Modal>
  )
}

const BLANK = (): Book => ({
  id: '', kind: 'book', title: '', authors: [], language: 'en', genres: [], tags: [], owned: false, copies: [], status: 'want', reads: [],
  addedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
})

export function BookForm({ book, onClose, toast }: { book?: Book; onClose: (saved?: Book) => void; toast: (m: string) => void }) {
  const { save, books } = useLibrary()
  const [b, setB] = useState<Book>(book ?? BLANK())
  const [authors, setAuthors] = useState(b.authors.join(', '))
  const [genres, setGenres] = useState(b.genres.join(', '))
  const [tags, setTags] = useState(b.tags.join(', '))
  const [seriesName, setSeriesName] = useState(b.series?.name ?? '')
  const [seriesPos, setSeriesPos] = useState(b.series?.position?.toString() ?? '')
  const [copy, setCopy] = useState<Copy>(b.copies[0] ?? { format: 'paperback', display: 'spine' })
  const [q, setQ] = useState('')
  const [results, setResults] = useState<OLResult[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchErr, setSearchErr] = useState('')
  const bookcases = Array.from(new Set(books.flatMap(x => x.copies.map(c => c.bookcase)).filter(Boolean))) as string[]

  async function doSearch() {
    if (!q.trim()) return
    setSearching(true); setSearchErr(''); setResults(null)
    try { setResults(await searchOpenLibrary(q)) }
    catch { setSearchErr('Open Library could not be reached from here. Inside the published page the internet is blocked; run the app locally to search, or fill in the fields by hand.') }
    finally { setSearching(false) }
  }
  function apply(r: OLResult) {
    setB(x => ({ ...x, title: x.title || r.title, year: x.year ?? r.year, pages: x.pages ?? r.pages, isbn: x.isbn ?? r.isbn, coverUrl: coverUrlFor(r) }))
    if (!authors) setAuthors(r.authors.join(', '))
    setResults(null)
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const title = b.title.trim()
    if (!title) return
    const final: Book = {
      ...b, title,
      id: b.id || newId(title),
      authors: authors.split(',').map(s => s.trim()).filter(Boolean),
      genres: genres.split(',').map(s => s.trim()).filter(Boolean),
      tags: tags.split(',').map(s => s.trim()).filter(Boolean),
      series: seriesName.trim() ? { name: seriesName.trim(), position: Number(seriesPos) || 0 } : undefined,
      copies: b.owned ? [{ ...copy, shelf: copy.shelf ? Number(copy.shelf) : undefined, position: copy.position ? Number(copy.position) : undefined }] : [],
      status: b.owned && b.status === 'want' && !b.reads.length ? 'unread' : b.status,
    }
    await save(final)
    toast(book ? 'Saved changes' : `Added ${final.title}`)
    onClose(final)
  }
  return (
    <Modal onClose={() => onClose()} label={book ? 'Edit book' : 'Add a book'}>
      <form onSubmit={submit} className="p-5 sm:p-7 flex flex-col gap-4">
        <h2 className="text-2xl">{book ? 'Edit book' : 'Add a book'}</h2>
        {!book && (
          <div className="card p-3 flex flex-col gap-2">
            <label htmlFor="ol-q" className="eyebrow">Look up on Open Library (title, author or ISBN)</label>
            <div className="flex gap-2">
              <input id="ol-q" className="field" value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. 9780008501860 or Babel Kuang" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); doSearch() } }} />
              <button type="button" className="btn" onClick={doSearch} disabled={searching}>{searching ? 'Searching…' : 'Search'}</button>
            </div>
            {searchErr && <p className="text-sm" style={{ color: 'var(--danger)' }}>{searchErr}</p>}
            {results && (results.length === 0 ? <p className="text-sm text-muted">No matches.</p> : (
              <ul className="flex flex-col divide-y divide-line max-h-56 overflow-y-auto">
                {results.map(r => <li key={r.key}><button type="button" className="w-full text-left py-2 px-1 hover:bg-surface-2 rounded flex justify-between gap-2" onClick={() => apply(r)}><span className="truncate">{r.title} <span className="text-muted">· {r.authors.join(', ')}</span></span><span className="text-muted tnum shrink-0">{r.year ?? ''}</span></button></li>)}
              </ul>
            ))}
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <L label="Title" id="f-title"><input id="f-title" className="field" required value={b.title} onChange={e => setB({ ...b, title: e.target.value })} /></L>
          <L label="Author(s), comma separated" id="f-authors"><input id="f-authors" className="field" value={authors} onChange={e => setAuthors(e.target.value)} /></L>
          <L label="Original title (if translated)" id="f-orig"><input id="f-orig" className="field" value={b.originalTitle ?? ''} onChange={e => setB({ ...b, originalTitle: e.target.value || undefined })} /></L>
          <L label="Language" id="f-lang"><select id="f-lang" className="field" value={b.language} onChange={e => setB({ ...b, language: e.target.value as Lang })}>{Object.entries(LANG_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></L>
          <L label="Series" id="f-series"><input id="f-series" className="field" value={seriesName} onChange={e => setSeriesName(e.target.value)} /></L>
          <L label="Number in series" id="f-pos"><input id="f-pos" className="field" inputMode="decimal" value={seriesPos} onChange={e => setSeriesPos(e.target.value)} /></L>
          <L label="Pages" id="f-pages"><input id="f-pages" className="field" inputMode="numeric" value={b.pages ?? ''} onChange={e => setB({ ...b, pages: Number(e.target.value) || undefined })} /></L>
          <L label="Year published" id="f-year"><input id="f-year" className="field" inputMode="numeric" value={b.year ?? ''} onChange={e => setB({ ...b, year: Number(e.target.value) || undefined })} /></L>
          <L label="Genres, comma separated" id="f-genres"><input id="f-genres" className="field" value={genres} onChange={e => setGenres(e.target.value)} /></L>
          <L label="Tags, comma separated" id="f-tags"><input id="f-tags" className="field" value={tags} onChange={e => setTags(e.target.value)} /></L>
          <L label="ISBN" id="f-isbn"><input id="f-isbn" className="field" value={b.isbn ?? ''} onChange={e => setB({ ...b, isbn: e.target.value || undefined })} /></L>
          <L label="Cover image URL" id="f-cover"><input id="f-cover" className="field" value={b.coverUrl ?? ''} onChange={e => setB({ ...b, coverUrl: e.target.value || undefined })} /></L>
          <L label="Status" id="f-status"><select id="f-status" className="field" value={b.status} onChange={e => setB({ ...b, status: e.target.value as Status })}>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></L>
          <L label="My rating" id="f-rating"><div className="py-2"><Stars value={b.rating} size={24} onChange={v => setB({ ...b, rating: v || undefined })} /></div></L>
        </div>
        <label className="flex items-center gap-2"><input type="checkbox" id="f-owned" checked={b.owned} onChange={e => setB({ ...b, owned: e.target.checked })} /> I own a copy</label>
        {b.owned && (
          <div className="card p-3 grid gap-3 sm:grid-cols-3">
            <L label="Format" id="f-format"><select id="f-format" className="field" value={copy.format} onChange={e => setCopy({ ...copy, format: e.target.value as Format })}>{Object.entries(FORMAT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></L>
            <L label="On the shelf as" id="f-display"><select id="f-display" className="field" value={copy.display ?? 'spine'} onChange={e => setCopy({ ...copy, display: e.target.value as Copy['display'] })}><option value="spine">Upright spine</option><option value="face">Cover facing out</option><option value="stack">Flat in a stack</option></select></L>
            <L label="Edition / set" id="f-set"><input id="f-set" className="field" list="sets" value={copy.set ?? ''} onChange={e => setCopy({ ...copy, set: e.target.value || undefined })} /><datalist id="sets">{Array.from(new Set(books.flatMap(x => x.copies.map(c => c.set)).filter(Boolean))).map(s => <option key={s as string} value={s as string} />)}</datalist></L>
            <L label="Bookcase" id="f-bookcase"><input id="f-bookcase" className="field" list="bookcases" value={copy.bookcase ?? ''} onChange={e => setCopy({ ...copy, bookcase: e.target.value || undefined })} /><datalist id="bookcases">{bookcases.map(s => <option key={s} value={s} />)}</datalist></L>
            <L label="Shelf number" id="f-shelf"><input id="f-shelf" className="field" inputMode="numeric" value={copy.shelf ?? ''} onChange={e => setCopy({ ...copy, shelf: Number(e.target.value) || undefined })} /></L>
            <L label="Position on shelf" id="f-position"><input id="f-position" className="field" inputMode="numeric" value={copy.position ?? ''} onChange={e => setCopy({ ...copy, position: Number(e.target.value) || undefined })} /></L>
          </div>
        )}
        <L label="My review / notes" id="f-review"><textarea id="f-review" className="field" rows={3} value={b.review ?? ''} onChange={e => setB({ ...b, review: e.target.value || undefined })} /></L>
        {b.status === 'read' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <L label="Started" id="f-start"><input id="f-start" type="date" className="field" value={b.reads[0]?.start ?? ''} onChange={e => setB({ ...b, reads: [{ ...(b.reads[0] ?? {}), start: e.target.value || undefined }, ...b.reads.slice(1)] })} /></L>
            <L label="Finished" id="f-finish"><input id="f-finish" type="date" className="field" value={b.reads[0]?.finish ?? ''} onChange={e => setB({ ...b, reads: [{ ...(b.reads[0] ?? {}), finish: e.target.value || undefined }, ...b.reads.slice(1)] })} /></L>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2 border-t border-line">
          <button type="button" className="btn" onClick={() => onClose()}>Cancel</button>
          <button type="submit" className="btn btn-primary">{book ? 'Save' : 'Add to library'}</button>
        </div>
      </form>
    </Modal>
  )
}

function L({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1 min-w-0"><label htmlFor={id} className="text-xs text-muted font-medium">{label}</label>{children}</div>
}
