import type { Book } from '../types'

export interface OLResult { title: string; authors: string[]; year?: number; pages?: number; isbn?: string; coverId?: number; key: string }

/** Search Open Library. Works when the page may reach the internet (local dev / self-hosted); fails quietly inside the artifact sandbox. */
export async function searchOpenLibrary(q: string): Promise<OLResult[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=12&fields=key,title,author_name,first_publish_year,number_of_pages_median,isbn,cover_i`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Open Library returned ' + res.status)
  const json = await res.json()
  return (json.docs ?? []).map((d: any) => ({
    key: d.key, title: d.title, authors: d.author_name ?? [], year: d.first_publish_year,
    pages: d.number_of_pages_median, isbn: d.isbn?.find((i: string) => i.length === 13) ?? d.isbn?.[0], coverId: d.cover_i,
  }))
}
export function coverUrlFor(r: { coverId?: number; isbn?: string }, size: 'S' | 'M' | 'L' = 'M') {
  if (r.coverId) return `https://covers.openlibrary.org/b/id/${r.coverId}-${size}.jpg`
  if (r.isbn) return `https://covers.openlibrary.org/b/isbn/${r.isbn}-${size}.jpg`
  return undefined
}
export async function lookupIsbn(isbn: string): Promise<Partial<Book> | null> {
  const clean = isbn.replace(/[^0-9Xx]/g, '')
  const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${clean}&format=json&jscmd=data`)
  if (!res.ok) return null
  const json = await res.json()
  const d = json['ISBN:' + clean]
  if (!d) return null
  return {
    title: d.title, authors: (d.authors ?? []).map((a: any) => a.name), pages: d.number_of_pages,
    year: d.publish_date ? Number(String(d.publish_date).match(/\d{4}/)?.[0]) : undefined, isbn: clean,
    coverUrl: d.cover?.medium,
  }
}
