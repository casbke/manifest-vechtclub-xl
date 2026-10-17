import { useRef, useState } from 'react'
import { useLibrary } from '../store/useLibrary'
import { importGoodreads } from '../lib/goodreads'
import type { Book } from '../types'

export function SettingsView({ toast, theme, setTheme }: { toast: (m: string) => void; theme: string; setTheme: (t: string) => void }) {
  const { books, meta, setMeta, saveMany, loadSeed, kind } = useLibrary()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<{ books: Book[]; skipped: number; fresh: number } | null>(null)
  const [err, setErr] = useState('')
  const [exportText, setExportText] = useState('')
  const [goal, setGoal] = useState(String(meta.goalBooks))
  const [name, setName] = useState(meta.readerName)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setErr(''); setPreview(null)
    try {
      const text = await f.text()
      const res = importGoodreads(text, books)
      const ids = new Set(books.map(b => b.id))
      setPreview({ ...res, fresh: res.books.filter(b => !ids.has(b.id)).length })
    } catch (ex: any) { setErr(ex.message ?? 'Could not read that file.') }
    finally { if (fileRef.current) fileRef.current.value = '' }
  }
  async function commit() {
    if (!preview) return
    await saveMany(preview.books)
    toast(`Imported ${preview.books.length} books from Goodreads`)
    setPreview(null)
  }
  async function doExport() {
    const json = JSON.stringify({ exportedAt: new Date().toISOString(), meta, books }, null, 2)
    const w = window as any
    try {
      const dl = w.claude?.use ? await w.claude.use('downloads') : null
      if (dl) { await dl.save({ filename: 'virtual-library.json', data: json }); toast('Export saved'); return }
    } catch { /* fall through */ }
    try {
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
      const a = document.createElement('a'); a.href = url; a.download = 'virtual-library.json'; a.click(); URL.revokeObjectURL(url)
    } catch { /* ignore */ }
    setExportText(json)
  }
  async function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    try { const data = JSON.parse(await f.text()); if (Array.isArray(data.books)) { await saveMany(data.books); toast(`Restored ${data.books.length} books`) } else setErr('That JSON has no books array.') }
    catch { setErr('Could not parse that JSON file.') }
  }
  async function copyExport() {
    try { await navigator.clipboard.writeText(exportText); toast('Copied to clipboard') } catch { toast('Select the text and copy it manually') }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <header><h1 className="text-3xl">Settings</h1><p className="text-muted">Storage: {kind === 'cloud' ? 'synced with this page (shared across your devices)' : 'this browser only (IndexedDB)'} · {books.length} records</p></header>

      <section className="card p-5 flex flex-col gap-3">
        <h2 className="text-lg">Reading goal</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm"><span className="text-muted">Your name</span><input id="s-name" className="field" value={name} onChange={e => setName(e.target.value)} /></label>
          <label className="flex flex-col gap-1 text-sm"><span className="text-muted">Books in {meta.goalYear}</span><input id="s-goal" className="field" inputMode="numeric" value={goal} onChange={e => setGoal(e.target.value)} /></label>
          <div className="flex items-end"><button className="btn btn-primary" onClick={async () => { await setMeta({ ...meta, goalBooks: Number(goal) || meta.goalBooks, readerName: name || meta.readerName }); toast('Saved') }}>Save</button></div>
        </div>
      </section>

      <section className="card p-5 flex flex-col gap-3">
        <h2 className="text-lg">Appearance</h2>
        <div className="flex gap-2">{(['system', 'light', 'dark'] as const).map(t => <button key={t} className="chip capitalize" aria-pressed={theme === t} onClick={() => setTheme(t)}>{t}</button>)}</div>
      </section>

      <section className="card p-5 flex flex-col gap-3">
        <h2 className="text-lg">Import from Goodreads</h2>
        <p className="text-sm text-muted">On Goodreads go to My Books, then Import and export, then Export Library. Upload the CSV here. Books already in your library are merged by title and author, so nothing is duplicated.</p>
        <input ref={fileRef} id="s-gr" type="file" accept=".csv,text/csv" onChange={onFile} className="text-sm" />
        {err && <p className="text-sm" style={{ color: 'var(--danger)' }}>{err}</p>}
        {preview && (
          <div className="rounded-lg p-3 flex flex-col gap-2" style={{ background: 'var(--accent-soft)' }}>
            <div className="text-sm tnum"><strong>{preview.books.length}</strong> rows read · <strong>{preview.fresh}</strong> new books · <strong>{preview.books.length - preview.fresh}</strong> updates to existing books{preview.skipped ? ` · ${preview.skipped} empty rows skipped` : ''}</div>
            <ul className="text-xs max-h-40 overflow-y-auto flex flex-col gap-0.5">{preview.books.slice(0, 60).map(b => <li key={b.id} className="truncate">{b.title} <span className="text-muted">· {b.authors[0]} · {b.status}{b.rating ? ` · ${b.rating}★` : ''}</span></li>)}{preview.books.length > 60 && <li className="text-muted">…and {preview.books.length - 60} more</li>}</ul>
            <div className="flex gap-2"><button className="btn btn-primary btn-sm" onClick={commit}>Import these</button><button className="btn btn-sm" onClick={() => setPreview(null)}>Cancel</button></div>
          </div>
        )}
      </section>

      <section className="card p-5 flex flex-col gap-3">
        <h2 className="text-lg">Backup and restore</h2>
        <div className="flex gap-2 flex-wrap">
          <button className="btn" onClick={doExport}>Export library as JSON</button>
          <label className="btn cursor-pointer">Restore from JSON<input id="s-json" type="file" accept="application/json" className="hidden" onChange={importJson} /></label>
          <button className="btn" onClick={async () => { await loadSeed(); toast('Starter library loaded') }}>Reload starter library</button>
        </div>
        {exportText && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted">If no download started, copy the export below and save it as a file.</p>
            <textarea id="s-export" className="field font-mono text-xs" rows={6} readOnly value={exportText} />
            <button className="btn btn-sm self-start" onClick={copyExport}>Copy to clipboard</button>
          </div>
        )}
      </section>

      <section className="card p-5 flex flex-col gap-2 text-sm text-muted">
        <h2 className="text-lg text-fg">About</h2>
        <p>Covers are generated from each title so the shelf looks right without any network access. Add a cover image URL or an ISBN to a book to use a real cover where the page is allowed to load one.</p>
        <p>Keyboard: <kbd>/</kbd> search, <kbd>n</kbd> add a book, <kbd>Esc</kbd> close.</p>
      </section>
    </div>
  )
}
