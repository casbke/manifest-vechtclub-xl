import { describe, expect, it } from 'vitest'
import { importGoodreads, parseCsv } from './goodreads'

const CSV = `Book Id,Title,Author,Additional Authors,ISBN,ISBN13,My Rating,Number of Pages,Year Published,Original Publication Year,Date Read,Date Added,Bookshelves,Exclusive Shelf,My Review,Owned Copies
1,"Katabasis",R.F. Kuang,,"=""""","=""9780008501860""",5,560,2025,2025,2026/04/08,2026/03/08,,read,"Wat een fantastisch boek, met een ""komma"" erin",1
2,"The Eye of the World (The Wheel of Time, #1)",Robert Jordan,,,,5,782,1990,1990,2026/06/17,2026/04/08,fantasy,read,,0
3,"The Martian",Andy Weir,,,,0,369,2014,2014,,2026/01/01,,to-read,,0`

describe('parseCsv', () => {
  it('handles quotes, commas and escaped quotes', () => {
    const rows = parseCsv(CSV)
    expect(rows).toHaveLength(4)
    expect(rows[1][14]).toBe('Wat een fantastisch boek, met een "komma" erin')
  })
})

describe('importGoodreads', () => {
  it('maps shelves, series, ratings and dates', () => {
    const { books } = importGoodreads(CSV, [])
    expect(books).toHaveLength(3)
    const eye = books.find(b => b.title === 'The Eye of the World')!
    expect(eye.series).toEqual({ name: 'The Wheel of Time', position: 1 })
    expect(eye.status).toBe('read')
    expect(eye.reads[0].finish).toBe('2026-06-17')
    expect(eye.tags).toEqual(['fantasy'])
    const kat = books.find(b => b.title === 'Katabasis')!
    expect(kat.isbn).toBe('9780008501860')
    expect(kat.owned).toBe(true)
    expect(kat.rating).toBe(5)
    expect(books.find(b => b.title === 'The Martian')!.status).toBe('want')
  })
  it('merges into existing books by title and author without duplicating', () => {
    const first = importGoodreads(CSV, []).books
    const second = importGoodreads(CSV, first).books
    expect(second.map(b => b.id).sort()).toEqual(first.map(b => b.id).sort())
    expect(second.find(b => b.title === 'Katabasis')!.reads).toHaveLength(1)
  })
})
