import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Book, Meta } from '../types'
import { createStore, type Store } from './store'
import { SEED } from '../seed'

interface LibraryCtx {
  books: Book[]
  meta: Meta
  kind: 'local' | 'cloud' | 'loading'
  loaded: boolean
  save(book: Book): Promise<void>
  saveMany(books: Book[]): Promise<void>
  remove(id: string): Promise<void>
  setMeta(meta: Meta): Promise<void>
  loadSeed(): Promise<void>
}

const Ctx = createContext<LibraryCtx | null>(null)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store | null>(null)
  const [tick, setTick] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let unsub = () => {}
    let cancelled = false
    createStore().then(async (s) => {
      if (cancelled) return
      unsub = s.subscribe(() => setTick(t => t + 1))
      setStore(s)
      await s.ready
      if (cancelled) return
      // A fresh local library starts with the real collection; the cloud store is seeded by Claude.
      if (s.kind === 'local' && s.getAll().length === 0) await s.putMany(SEED)
      setLoaded(true)
      setTick(t => t + 1)
    })
    return () => { cancelled = true; unsub() }
  }, [])

  const value = useMemo<LibraryCtx>(() => {
    const books = store ? store.getAll() : []
    const meta = store ? store.getMeta() : { goalYear: new Date().getFullYear(), goalBooks: 15, readerName: 'Cas' }
    return {
      books, meta, loaded,
      kind: store ? store.kind : 'loading',
      save: async (b) => { await store?.put({ ...b, updatedAt: new Date().toISOString() }) },
      saveMany: async (bs) => { await store?.putMany(bs) },
      remove: async (id) => { await store?.remove(id) },
      setMeta: async (m) => { await store?.setMeta(m) },
      loadSeed: async () => { await store?.putMany(SEED) },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, tick, loaded])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLibrary() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useLibrary outside provider')
  return v
}
