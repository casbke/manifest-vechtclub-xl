import Dexie, { type Table } from 'dexie'
import type { Book, Meta } from '../types'
import { DEFAULT_META } from '../types'

export interface Store {
  kind: 'local' | 'cloud'
  ready: Promise<void>
  getAll(): Book[]
  getMeta(): Meta
  subscribe(cb: () => void): () => void
  put(book: Book): Promise<void>
  putMany(books: Book[]): Promise<void>
  remove(id: string): Promise<void>
  setMeta(meta: Meta): Promise<void>
}

abstract class BaseStore implements Store {
  abstract kind: 'local' | 'cloud'
  abstract ready: Promise<void>
  protected books = new Map<string, Book>()
  protected meta: Meta = DEFAULT_META
  private listeners = new Set<() => void>()
  getAll() { return [...this.books.values()] }
  getMeta() { return this.meta }
  subscribe(cb: () => void) { this.listeners.add(cb); return () => { this.listeners.delete(cb) } }
  protected notify() { for (const l of this.listeners) l() }
  abstract put(book: Book): Promise<void>
  abstract putMany(books: Book[]): Promise<void>
  abstract remove(id: string): Promise<void>
  abstract setMeta(meta: Meta): Promise<void>
}

// ───────────── Local: IndexedDB through Dexie ─────────────
class LibraryDB extends Dexie {
  books!: Table<Book, string>
  meta!: Table<Meta & { id: string }, string>
  constructor() {
    super('virtual-library')
    this.version(1).stores({ books: 'id, status, owned', meta: 'id' })
  }
}

export class LocalStore extends BaseStore {
  kind = 'local' as const
  private db = new LibraryDB()
  ready: Promise<void>
  constructor() {
    super()
    this.ready = this.load()
  }
  private async load() {
    const [books, meta] = await Promise.all([this.db.books.toArray(), this.db.meta.get('meta')])
    this.books = new Map(books.map(b => [b.id, b]))
    if (meta) { const { id: _id, ...m } = meta; this.meta = { ...DEFAULT_META, ...m } }
    this.notify()
  }
  async put(book: Book) { await this.db.books.put(book); this.books.set(book.id, book); this.notify() }
  async putMany(books: Book[]) { await this.db.books.bulkPut(books); for (const b of books) this.books.set(b.id, b); this.notify() }
  async remove(id: string) { await this.db.books.delete(id); this.books.delete(id); this.notify() }
  async setMeta(meta: Meta) { await this.db.meta.put({ ...meta, id: 'meta' }); this.meta = meta; this.notify() }
}

// ───────────── Cloud: the artifact's `db` capability ─────────────
type AnyDb = {
  collection(path: string): { onSnapshot(next: (s: any) => void, err?: (e: any) => void): () => void; doc(id?: string): any }
  doc(path: string): { get(): Promise<any>; set(d: Record<string, unknown>): Promise<void>; delete(): Promise<void>; onSnapshot(next: (s: any) => void, err?: (e: any) => void): () => void }
}

export class CloudStore extends BaseStore {
  kind = 'cloud' as const
  ready: Promise<void>
  constructor(private db: AnyDb) {
    super()
    this.ready = new Promise<void>((resolve) => {
      let first = true
      this.db.collection('books').onSnapshot((snap) => {
        const next = new Map<string, Book>()
        for (const d of snap.docs) { const data = d.data(); if (data) next.set(d.id, { ...(data as Book), id: d.id }) }
        this.books = next
        this.notify()
        if (first) { first = false; resolve() }
      }, () => { if (first) { first = false; resolve() } })
      this.db.doc('meta/settings').onSnapshot((snap) => {
        if (snap.exists) { this.meta = { ...DEFAULT_META, ...(snap.data() as Meta) }; this.notify() }
      }, () => {})
    })
  }
  private strip(b: Book): Record<string, unknown> {
    // Firestore-style stores reject undefined; drop those fields.
    return JSON.parse(JSON.stringify(b))
  }
  async put(book: Book) {
    this.books.set(book.id, book); this.notify()
    await this.db.doc('books/' + book.id).set(this.strip(book))
  }
  async putMany(books: Book[]) {
    for (const b of books) this.books.set(b.id, b)
    this.notify()
    for (const b of books) await this.db.doc('books/' + b.id).set(this.strip(b))
  }
  async remove(id: string) { this.books.delete(id); this.notify(); await this.db.doc('books/' + id).delete() }
  async setMeta(meta: Meta) { this.meta = meta; this.notify(); await this.db.doc('meta/settings').set(this.strip(meta as any)) }
}

export async function createStore(): Promise<Store> {
  const w = window as any
  if (w.claude && typeof w.claude.use === 'function') {
    try {
      const db = await w.claude.use('db')
      if (db) return new CloudStore(db)
    } catch { /* fall through to local */ }
  }
  return new LocalStore()
}
