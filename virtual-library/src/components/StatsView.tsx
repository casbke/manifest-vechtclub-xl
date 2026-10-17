import type { Book } from '../types'
import { useLibrary } from '../store/useLibrary'
import { averageRating, booksPerMonth, booksPerYear, byAuthor, finishedBooks, languageSplit, ratingDistribution, readingSpeeds, isBook } from '../lib/stats'
import { Bars, HBars, MonthHeat } from './Charts'
import { Empty, Section, Stat } from './ui'

export function StatsView({ onOpen }: { onOpen: (b: Book) => void }) {
  const { books, meta } = useLibrary()
  const finished = finishedBooks(books)
  if (!finished.length) return <Empty title="No statistics yet" hint="Finish a few books and this page fills up." />
  const perYear = booksPerYear(books)
  const pages = finished.reduce((s, b) => s + (b.pages ?? 0), 0)
  const speeds = readingSpeeds(books)
  const longest = [...finished].sort((a, b) => (b.pages ?? 0) - (a.pages ?? 0))[0]
  const shortest = [...finished].filter(b => b.pages).sort((a, b) => (a.pages ?? 0) - (b.pages ?? 0))[0]
  const lang = languageSplit(books)
  const authors = byAuthor(books).filter(a => a.read >= 1).sort((a, b) => b.read - a.read).slice(0, 8)
  const bestAuthors = byAuthor(books).filter(a => a.ratings.length >= 2).sort((a, b) => b.avg - a.avg).slice(0, 6)
  const genres = new Map<string, number>()
  for (const b of finished) for (const g of b.genres) genres.set(g, (genres.get(g) ?? 0) + 1)
  const topGenres = [...genres.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
  const owned = books.filter(b => isBook(b) && b.owned)
  const ownedRead = owned.filter(b => b.status === 'read').length
  const readNotOwned = finished.filter(b => !b.owned).length
  const decades = new Map<string, number>()
  for (const b of finished) if (b.year) { const d = Math.floor(b.year / 10) * 10 + 's'; decades.set(d, (decades.get(d) ?? 0) + 1) }
  const year = meta.goalYear

  return (
    <div className="flex flex-col gap-8">
      <header><h1 className="text-3xl">Statistics</h1><p className="text-muted">Everything your reading log says about you.</p></header>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Stat label="Books finished" value={finished.length} sub={`${perYear.at(-1)?.count ?? 0} in ${perYear.at(-1)?.year ?? ''}`} />
        <Stat label="Pages read" value={pages.toLocaleString('en-GB')} sub={`about ${Math.round(pages / Math.max(1, finished.length))} per book`} />
        <Stat label="Average rating" value={averageRating(books).toFixed(2) + ' ★'} sub={`${finished.filter(b => b.rating === 5).length} five-star reads`} />
        <Stat label="Five-star rate" value={Math.round((finished.filter(b => b.rating === 5).length / finished.length) * 100) + '%'} sub="of rated finishes" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Books per year"><div className="card p-4"><Bars label="Books finished per year" data={perYear.map(y => ({ label: String(y.year), value: y.count }))} /></div></Section>
        <Section title="Pages per year"><div className="card p-4"><Bars label="Pages read per year" data={perYear.map(y => ({ label: String(y.year), value: y.pages }))} format={v => v.toLocaleString('en-GB')} /></div></Section>
      </div>
      <Section title={`Finishes per month in ${year}`}><div className="card p-4"><MonthHeat values={booksPerMonth(books, year)} year={year} /></div></Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Rating distribution"><div className="card p-4"><Bars label="Rating distribution" color="var(--brass)" data={ratingDistribution(books).map((v, i) => ({ label: '★'.repeat(i + 1), value: v }))} /></div></Section>
        <Section title="Language">
          <div className="card p-4 flex flex-col gap-3">
            <div className="flex h-6 rounded overflow-hidden gap-0.5" role="img" aria-label={`${lang.en} in English, ${lang.nl} in Dutch`}>
              <div style={{ flex: lang.en, background: 'var(--chart-1)' }} />
              <div style={{ flex: lang.nl, background: 'var(--chart-2)' }} />
            </div>
            <div className="flex gap-4 text-sm"><span><span className="inline-block w-3 h-3 rounded-sm mr-1 align-middle" style={{ background: 'var(--chart-1)' }} />English <strong className="tnum">{lang.en}</strong></span><span><span className="inline-block w-3 h-3 rounded-sm mr-1 align-middle" style={{ background: 'var(--chart-2)' }} />Dutch <strong className="tnum">{lang.nl}</strong></span></div>
            <p className="text-sm text-muted">{Math.round((lang.nl / finished.length) * 100)}% of your reading is in Dutch translation.</p>
          </div>
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Most-read authors"><div className="card p-4"><HBars label="Books read per author" data={authors.map(a => ({ label: a.author, value: a.read }))} /></div></Section>
        <Section title="Highest-rated authors (2+ books)"><div className="card p-4"><HBars label="Average rating per author" color="var(--brass)" data={bestAuthors.map(a => ({ label: a.author, value: Math.round(a.avg * 10) / 10, sub: `${a.ratings.length} rated` }))} format={v => v.toFixed(1)} /></div></Section>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Genres"><div className="card p-4"><HBars label="Finished books per genre" data={topGenres.map(([g, v]) => ({ label: g, value: v }))} /></div></Section>
        <Section title="Publication decades"><div className="card p-4"><Bars label="Finished books by publication decade" data={[...decades.entries()].sort().map(([d, v]) => ({ label: d, value: v }))} /></div></Section>
      </div>

      <Section title="Records">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {speeds.fastest && <Record label="Fastest read" book={speeds.fastest.book} value={`${speeds.fastest.days} day${speeds.fastest.days > 1 ? 's' : ''}`} onOpen={onOpen} />}
          {speeds.slowest && <Record label="Slowest read" book={speeds.slowest.book} value={`${speeds.slowest.days} days`} onOpen={onOpen} />}
          {longest && <Record label="Longest book" book={longest} value={`${longest.pages} pages`} onOpen={onOpen} />}
          {shortest && <Record label="Shortest book" book={shortest} value={`${shortest.pages} pages`} onOpen={onOpen} />}
        </div>
      </Section>

      <Section title="Owned vs read">
        <div className="card p-4 grid gap-3 sm:grid-cols-3 text-center">
          <div><div className="text-2xl font-display tnum">{owned.length - ownedRead}</div><div className="text-sm text-muted">owned, unread</div></div>
          <div><div className="text-2xl font-display tnum" style={{ color: 'var(--accent)' }}>{ownedRead}</div><div className="text-sm text-muted">owned and read</div></div>
          <div><div className="text-2xl font-display tnum">{readNotOwned}</div><div className="text-sm text-muted">read, not on your shelf</div></div>
        </div>
      </Section>
    </div>
  )
}

function Record({ label, book, value, onOpen }: { label: string; book: Book; value: string; onOpen: (b: Book) => void }) {
  return (
    <button className="card p-4 text-left flex flex-col gap-1 min-w-0" onClick={() => onOpen(book)}>
      <div className="eyebrow">{label}</div>
      <div className="text-xl font-display tnum">{value}</div>
      <div className="text-sm truncate">{book.title}</div>
    </button>
  )
}
