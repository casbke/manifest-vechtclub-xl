import { useCallback, useEffect, useState } from 'react'
import type { Book } from './types'
import { LibraryProvider, useLibrary } from './store/useLibrary'
import { Dashboard } from './components/Dashboard'
import { Library } from './components/Library'
import { ReadView, OwnedView, WishlistView, SeriesView, AuthorsView, DiscoverView } from './components/Views'
import { StatsView } from './components/StatsView'
import { SettingsView } from './components/SettingsView'
import { BookDetail, BookForm } from './components/BookDetail'

type ViewName = 'home' | 'library' | 'read' | 'owned' | 'wishlist' | 'series' | 'authors' | 'stats' | 'discover' | 'settings'
const NAV: { id: ViewName; label: string; icon: string; tab?: boolean }[] = [
  { id: 'home', label: 'Home', icon: '⌂', tab: true },
  { id: 'library', label: 'Library', icon: '▤', tab: true },
  { id: 'read', label: 'Read', icon: '✓' },
  { id: 'owned', label: 'Owned', icon: '▣', tab: true },
  { id: 'wishlist', label: 'Want to read', icon: '☆' },
  { id: 'series', label: 'Series', icon: '≡' },
  { id: 'authors', label: 'Authors', icon: '✎' },
  { id: 'stats', label: 'Statistics', icon: '▮', tab: true },
  { id: 'discover', label: 'Discover', icon: '✦' },
  { id: 'settings', label: 'Settings', icon: '⚙', tab: true },
]

export default function App() {
  return <LibraryProvider><Shell /></LibraryProvider>
}

function Shell() {
  const { books, loaded } = useLibrary()
  const [view, setView] = useState<ViewName>(() => (NAV.some(n => n.id === location.hash.slice(1)) ? location.hash.slice(1) : 'home') as ViewName)
  const [openId, setOpenId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Book | null | 'new'>(null)
  const [toastMsg, setToastMsg] = useState('')
  const [theme, setThemeState] = useState(() => { try { return localStorage.getItem('theme') ?? 'system' } catch { return 'system' } })

  const toast = useCallback((m: string) => { setToastMsg(m); window.setTimeout(() => setToastMsg(''), 2800) }, [])
  const go = useCallback((v: string) => { setView(v as ViewName); try { history.replaceState(null, '', '#' + v) } catch { /* ignore */ } window.scrollTo({ top: 0 }) }, [])
  const setTheme = (t: string) => { setThemeState(t); try { localStorage.setItem('theme', t) } catch { /* ignore */ } }

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || openId || editing) return
      if (e.key === '/') { e.preventDefault(); go('library'); setTimeout(() => document.getElementById('lib-search')?.focus(), 50) }
      if (e.key === 'n') { e.preventDefault(); setEditing('new') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, openId, editing])

  const openBook = books.find(b => b.id === openId) ?? null
  const onOpen = (b: Book) => setOpenId(b.id)

  return (
    <div className="min-h-full flex">
      <aside className="hidden md:flex flex-col gap-1 w-56 shrink-0 p-4 sticky top-0 h-screen border-r border-line" style={{ paddingTop: 'calc(16px + env(safe-area-inset-top, 0px))', background: 'var(--surface)' }}>
        <div className="px-3 pb-4"><div className="font-display text-xl leading-tight">Cas's Library</div><div className="text-xs text-muted tnum">{books.filter(b => (b.kind ?? 'book') === 'book').length} books</div></div>
        {NAV.map(n => <button key={n.id} className="nav-item" aria-current={view === n.id ? 'page' : undefined} onClick={() => go(n.id)}><span aria-hidden className="w-5 text-center opacity-70">{n.icon}</span>{n.label}</button>)}
        <button className="btn btn-primary mt-4 justify-center" onClick={() => setEditing('new')}>+ Add a book</button>
      </aside>

      <main className="flex-1 min-w-0" style={{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))', paddingBlock: '20px 96px' }}>
        <div className="mx-auto max-w-6xl">
          {!loaded ? <div className="text-muted p-8 text-center">Opening the library…</div> : (
            view === 'home' ? <Dashboard onOpen={onOpen} go={go} /> :
            view === 'library' ? <Library onOpen={onOpen} onAdd={() => setEditing('new')} /> :
            view === 'read' ? <ReadView onOpen={onOpen} /> :
            view === 'owned' ? <OwnedView onOpen={onOpen} go={go} /> :
            view === 'wishlist' ? <WishlistView onOpen={onOpen} toast={toast} /> :
            view === 'series' ? <SeriesView onOpen={onOpen} /> :
            view === 'authors' ? <AuthorsView onOpen={onOpen} /> :
            view === 'stats' ? <StatsView onOpen={onOpen} /> :
            view === 'discover' ? <DiscoverView toast={toast} /> :
            <SettingsView toast={toast} theme={theme} setTheme={setTheme} />
          )}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex border-t border-line z-30" style={{ background: 'var(--surface)', paddingBottom: 'env(safe-area-inset-bottom, 0px)', paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)' }} aria-label="Sections">
        {NAV.filter(n => n.tab).map(n => <button key={n.id} className="tab-item" aria-current={view === n.id ? 'page' : undefined} onClick={() => go(n.id)}><span aria-hidden className="text-lg leading-none">{n.icon}</span>{n.label}</button>)}
      </nav>
      <div className="md:hidden fixed right-4 z-30" style={{ bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}>
        <button className="btn btn-primary rounded-full shadow-lg" style={{ width: 52, height: 52, justifyContent: 'center', fontSize: 24 }} aria-label="Add a book" onClick={() => setEditing('new')}>+</button>
      </div>

      {openBook && !editing && <BookDetail book={openBook} onClose={() => setOpenId(null)} onEdit={() => setEditing(openBook)} toast={toast} />}
      {editing && <BookForm book={editing === 'new' ? undefined : editing} onClose={(saved) => { setEditing(null); if (saved) setOpenId(saved.id) }} toast={toast} />}
      {toastMsg && <div className="toast" role="status">{toastMsg}</div>}
    </div>
  )
}
