export type Lang = 'en' | 'nl' | 'other'
export type Format = 'hardcover' | 'paperback' | 'ebook' | 'audiobook' | 'other'
export type Display = 'spine' | 'face' | 'stack'
export type Status = 'read' | 'reading' | 'want' | 'unread' | 'dnf'

export interface Copy {
  format: Format
  edition?: string
  set?: string
  bookcase?: string
  shelf?: number
  position?: number
  display?: Display
}

export interface ReadLog {
  start?: string // ISO date
  finish?: string
}

export interface Book {
  id: string
  kind?: 'book' | 'object'
  title: string
  originalTitle?: string
  authors: string[]
  series?: { name: string; position: number }
  language: Lang
  pages?: number
  year?: number
  isbn?: string
  genres: string[]
  tags: string[]
  description?: string
  coverUrl?: string
  owned: boolean
  copies: Copy[]
  status: Status
  rating?: number // 0-5
  review?: string
  reads: ReadLog[]
  wishPriority?: number // 1 = highest
  emoji?: string // for shelf objects
  addedAt: string
  updatedAt: string
}

export interface Meta {
  goalYear: number
  goalBooks: number
  goalPages?: number
  readerName: string
}

export const DEFAULT_META: Meta = { goalYear: new Date().getFullYear(), goalBooks: 15, readerName: 'Cas' }

export const FORMAT_LABEL: Record<Format, string> = {
  hardcover: 'Hardcover', paperback: 'Paperback', ebook: 'E-book', audiobook: 'Audiobook', other: 'Other',
}
export const STATUS_LABEL: Record<Status, string> = {
  read: 'Finished', reading: 'Currently reading', want: 'Want to read', unread: 'Owned, unread', dnf: 'Did not finish',
}
export const LANG_LABEL: Record<Lang, string> = { en: 'English', nl: 'Dutch', other: 'Other' }
