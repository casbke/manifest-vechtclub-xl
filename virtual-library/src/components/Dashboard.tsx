import { useState } from 'react'
import type { Book } from '../types'
import { useLibrary } from '../store/useLibrary'
import { finishedBooks, onThisDay, pacePagesPerDay, isBook } from '../lib/stats'
import { fmtDate, lastFinish, pickRandom } from '../lib/util'
import { Cover, Ring, Section, Stars } from './ui'

export function Dashboard({ onOpen, go }: { onOpen: (b: Book) => void; go: (v: string) => void }) {
  const { books, meta } = useLibrary()
  const [pick, setPick] = useState<Book | null>(null)
  const [spinning, setSpinning] = useState(false)
  const hour = new Date().getHours()
  const greeting = hour < 6 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const year = meta.goalYear
  const finished = finishedBooks(books)
  const thisYear = finished.filter(b => lastFinish(b)?.startsWith(String(year)))
  const pagesThisYear = thisYear.reduce((s, b) => s + (b.pages ?? 0), 0)
  const dayOfYear = Math.floor((Date.now() - new Date(year, 0, 1).getTime()) / 86400000) + 1
  const expected = Math.round((meta.goalBooks * Math.min(dayOfYear, 365)) / 365)
  const diff = thisYear.length - expected
  const reading = books.filter(b => b.status === 'reading')
  const tbr = books.filter(b => isBook(b) && b.owned && (b.status === 'unread' || b.status === 'want'))
  const recentFinished = [...finished].sort((a, b) => (lastFinish(b) ?? '').localeCompare(lastFinish(a) ?? '')).slice(0, 6)
  const recentAdded = [...books.filter(isBook)].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, 6)
  const anniversaries = onThisDay(books)
  const pace = pacePagesPerDay(books)
  const tbrPages = tbr.reduce((s, b) => s + (b.pages ?? 300), 0)

  function shuffle() {
    setSpinning(true)
    let n = 0
    const t = setInterval(() => { setPick(pickRandom(tbr) ?? null); if (++n > 8) { clearInterval(t); setSpinning(false) } }, 90)
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <div className="eyebrow">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        <h1 className="text-3xl sm:text-4xl">{greeting}, {meta.readerName}.</h1>
        <p className="text-muted">{books.filter(isBook).length} books in your library · {finished.length} finished · {tbr.length} waiting on the shelf</p>
      </header>

      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="card p-5 flex items-center gap-5">
          <Ring value={thisYear.length} max={meta.goalBooks} size={120} stroke={12}>
            <div className="text-3xl font-display tnum leading-none">{thisYear.length}</div>
            <div className="text-xs text-muted">of {meta.goalBooks}</div>
          </Ring>
          <div className="flex flex-col gap-1">
            <div className="eyebrow">{year} reading goal</div>
            <div className="text-lg font-display">{diff >= 0 ? `${diff === 0 ? 'Right on' : diff + ' ahead of'} schedule` : `${-diff} behind schedule`}</div>
            <div className="text-sm text-muted tnum">{pagesThisYear.toLocaleString('en-GB')} pages so far</div>
            <button className="btn btn-ghost btn-sm self-start -ml-2" onClick={() => go('settings')}>Change goal</button>
          </div>
        </div>
        <div className="card p-5 flex flex-col gap-3">
          <div className="flex items-baseline justify-between"><div className="eyebrow">Currently reading</div><button className="btn btn-ghost btn-sm" onClick={() => go('library')}>Library</button></div>
          {reading.length === 0 ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <p className="text-muted flex-1">Nothing on the go. Your unread shelf holds {tbr.length} books, about {Math.round(tbrPages / pace / 30)} months of reading at your pace of {pace} pages a day.</p>
              <button className="btn btn-primary" onClick={shuffle} disabled={!tbr.length}>{spinning ? 'Shuffling…' : 'Pick one for me'}</button>
            </div>
          ) : (
            <div className="flex gap-4 flex-wrap">
              {reading.map(b => <button key={b.id} className="flex gap-3 items-center text-left" style={{ background: 'none', border: 0, padding: 0 }} onClick={() => onOpen(b)}><Cover book={b} width={56} /><div><div className="font-medium">{b.title}</div><div className="text-sm text-muted">{b.authors.join(', ')}</div><div className="text-xs text-muted">since {fmtDate(b.reads.find(r => !r.finish)?.start)}</div></div></button>)}
              <button className="btn btn-sm self-center" onClick={shuffle} disabled={!tbr.length}>Pick my next book</button>
            </div>
          )}
          {pick && (
            <div className="flex gap-3 items-center p-3 rounded-lg" style={{ background: 'var(--accent-soft)' }}>
              <Cover book={pick} width={48} onClick={() => onOpen(pick)} />
              <div className="flex-1 min-w-0"><div className="eyebrow" style={{ color: 'var(--accent)' }}>Your next read</div><div className="font-medium truncate">{pick.title}</div><div className="text-sm text-muted truncate">{pick.authors.join(', ')}{pick.pages ? ` · ${pick.pages} pages` : ''}</div></div>
              <button className="btn btn-sm" onClick={() => onOpen(pick)}>Open</button>
            </div>
          )}
        </div>
      </div>

      {anniversaries.length > 0 && (
        <div className="card p-4 flex gap-3 items-start" style={{ borderColor: 'var(--brass)' }}>
          <span className="text-2xl" aria-hidden>🗓️</span>
          <div><div className="eyebrow">On this day</div>{anniversaries.map((a, i) => <div key={i}>You {a.what} <button className="underline" style={{ background: 'none', border: 0, padding: 0, color: 'var(--accent)' }} onClick={() => onOpen(a.book)}>{a.book.title}</button> in {a.when.slice(0, 4)}.</div>)}</div>
        </div>
      )}

      <Section title="Recently finished" action={<button className="btn btn-ghost btn-sm" onClick={() => go('read')}>All read books</button>}>
        <Row books={recentFinished} onOpen={onOpen} sub={b => <><Stars value={b.rating} size={12} /> <span className="text-muted">{fmtDate(lastFinish(b), { month: 'short', year: 'numeric' })}</span></>} />
      </Section>
      <Section title="Recently added" action={<button className="btn btn-ghost btn-sm" onClick={() => go('owned')}>Owned</button>}>
        <Row books={recentAdded} onOpen={onOpen} sub={b => <span className="text-muted">{b.authors[0]}</span>} />
      </Section>
    </div>
  )
}

function Row({ books, onOpen, sub }: { books: Book[]; onOpen: (b: Book) => void; sub: (b: Book) => React.ReactNode }) {
  if (!books.length) return <p className="text-muted">Nothing here yet.</p>
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'thin' }}>
      {books.map(b => (
        <div key={b.id} className="flex flex-col gap-1 shrink-0" style={{ width: 96 }}>
          <Cover book={b} width={96} onClick={() => onOpen(b)} />
          <div className="text-xs font-medium leading-tight line-clamp-2">{b.title}</div>
          <div className="text-xs">{sub(b)}</div>
        </div>
      ))}
    </div>
  )
}
