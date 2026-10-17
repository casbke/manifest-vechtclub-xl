import type { Book, Copy, Display, Format, Lang, Status } from './types'

const now = '2026-10-17T00:00:00.000Z'
const BC = 'Woonkamer'

type S = Partial<Book> & { title: string; authors: string[] }

let pos = 0
function copy(shelf: number, display: Display = 'spine', format: Format = 'paperback', set?: string, edition?: string): Copy {
  pos += 1
  return { format, display, bookcase: BC, shelf, position: pos, set, edition }
}
function slug(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}
function b(s: S): Book {
  const owned = s.owned ?? (s.copies?.length ?? 0) > 0
  const status: Status = s.status ?? (s.reads?.some(r => r.finish) ? 'read' : owned ? 'unread' : 'want')
  return {
    id: s.id ?? slug(s.title),
    kind: s.kind ?? 'book',
    title: s.title,
    originalTitle: s.originalTitle,
    authors: s.authors,
    series: s.series,
    language: (s.language ?? 'en') as Lang,
    pages: s.pages,
    year: s.year,
    genres: s.genres ?? [],
    tags: s.tags ?? [],
    description: s.description,
    owned,
    copies: s.copies ?? [],
    status,
    rating: s.rating,
    review: s.review,
    reads: s.reads ?? [],
    wishPriority: s.wishPriority,
    emoji: s.emoji,
    addedAt: s.addedAt ?? now,
    updatedAt: now,
  }
}
const r = (start: string, finish: string) => [{ start, finish }]

export const SEED: Book[] = [
  // ───────────── Shelf 1: Harry Potter + figures ─────────────
  b({ title: "Harry Potter and the Chamber of Secrets", authors: ['J.K. Rowling'], series: { name: 'Harry Potter', position: 2 }, pages: 360, year: 1998, genres: ['Fantasy', 'Young adult'], copies: [copy(1, 'stack', 'paperback', 'Bloomsbury HP paperbacks')], rating: 5, reads: r('2024-11-26', '2024-12-12') }),
  b({ title: "Harry Potter and the Prisoner of Azkaban", authors: ['J.K. Rowling'], series: { name: 'Harry Potter', position: 3 }, pages: 468, year: 1999, genres: ['Fantasy', 'Young adult'], copies: [copy(1, 'stack', 'paperback', 'Bloomsbury HP paperbacks')], rating: 4, reads: r('2025-02-14', '2025-02-27') }),
  b({ title: "Harry Potter and the Goblet of Fire", authors: ['J.K. Rowling'], series: { name: 'Harry Potter', position: 4 }, pages: 636, year: 2000, genres: ['Fantasy', 'Young adult'], copies: [copy(1, 'stack', 'paperback', 'Bloomsbury HP paperbacks')], rating: 5, reads: r('2025-03-18', '2025-04-06') }),
  b({ title: "Harry Potter and the Order of the Phoenix", authors: ['J.K. Rowling'], series: { name: 'Harry Potter', position: 5 }, pages: 816, year: 2003, genres: ['Fantasy', 'Young adult'], copies: [copy(1, 'stack', 'paperback', 'Bloomsbury HP paperbacks')], rating: 5, reads: r('2025-04-25', '2025-05-24') }),
  b({ id: 'obj-dumbledore', kind: 'object', title: 'Dumbledore bust', authors: [], emoji: '🧙', copies: [copy(1, 'spine', 'other')], status: 'unread', genres: [] }),
  b({ title: "Harry Potter and the Half-Blood Prince", authors: ['J.K. Rowling'], series: { name: 'Harry Potter', position: 6 }, pages: 560, year: 2005, genres: ['Fantasy', 'Young adult'], copies: [copy(1, 'spine', 'paperback', 'Bloomsbury HP paperbacks')], rating: 4, reads: r('2025-06-07', '2025-06-17') }),
  b({ title: "Harry Potter and the Deathly Hallows", authors: ['J.K. Rowling'], series: { name: 'Harry Potter', position: 7 }, pages: 620, year: 2007, genres: ['Fantasy', 'Young adult'], copies: [copy(1, 'spine', 'paperback', 'Bloomsbury HP paperbacks')], rating: 5, reads: r('2025-06-19', '2025-07-06') }),
  b({ id: 'obj-lego-express', kind: 'object', title: 'LEGO Hogwarts Express', authors: [], emoji: '🚂', copies: [copy(1, 'spine', 'other')], status: 'unread', genres: [] }),

  // ───────────── Shelf 2: R.F. Kuang showcase ─────────────
  b({ title: 'The Poppy War', authors: ['R.F. Kuang'], series: { name: 'The Poppy War', position: 1 }, pages: 544, year: 2018, genres: ['Fantasy', 'Military fantasy'], copies: [copy(2, 'face', 'hardcover', 'Poppy War special editions', 'Special edition')], rating: 4, reads: r('2025-07-28', '2025-08-16') }),
  b({ title: 'The Dragon Republic', authors: ['R.F. Kuang'], series: { name: 'The Poppy War', position: 2 }, pages: 672, year: 2019, genres: ['Fantasy', 'Military fantasy'], copies: [copy(2, 'face', 'hardcover', 'Poppy War special editions', 'Special edition')], rating: 5, reads: r('2025-12-07', '2026-02-25') }),
  b({ title: 'Katabasis', authors: ['R.F. Kuang'], pages: 560, year: 2025, genres: ['Fantasy', 'Dark academia'], copies: [copy(2, 'face', 'hardcover')], rating: 5, reads: r('2026-03-08', '2026-04-08'), review: 'Wat een fantastisch boek weer van R.F Kuang! Een verhaal met heel veel wendingen, diepgaande karakters en met heel veel diepte in omgeving en verhaal. 5 sterren dik en dubbel verdiend.' }),
  b({ title: 'The Burning God', authors: ['R.F. Kuang'], series: { name: 'The Poppy War', position: 3 }, pages: 640, year: 2020, genres: ['Fantasy', 'Military fantasy'], copies: [copy(2, 'spine', 'hardcover', 'Poppy War special editions', 'Special edition')] }),
  b({ title: 'Babel', authors: ['R.F. Kuang'], pages: 560, year: 2022, genres: ['Fantasy', 'Dark academia', 'Historical'], copies: [copy(2, 'spine', 'hardcover')], status: 'want', wishPriority: 4 }),
  b({ title: 'Yellowface', authors: ['R.F. Kuang'], pages: 336, year: 2023, genres: ['Literary fiction', 'Satire'], copies: [copy(2, 'spine', 'hardcover')] }),

  // ───────────── Shelf 3: mixed ─────────────
  b({ title: 'A Little History of Archaeology', authors: ['Brian Fagan'], series: { name: 'Little Histories', position: 0 }, pages: 296, year: 2018, genres: ['Non-fiction', 'History'], copies: [copy(3, 'spine', 'paperback', 'Yale Little Histories')] }),
  b({ title: 'Een kleine geschiedenis van de wereld', originalTitle: 'A Little History of the World', authors: ['E.H. Gombrich'], series: { name: 'Little Histories', position: 0 }, language: 'nl', pages: 304, year: 1936, genres: ['Non-fiction', 'History'], copies: [copy(3, 'spine', 'paperback', 'Yale Little Histories')], status: 'want', wishPriority: 6 }),
  b({ title: 'A Little History of Science', authors: ['William Bynum'], series: { name: 'Little Histories', position: 0 }, pages: 288, year: 2012, genres: ['Non-fiction', 'Science', 'History'], copies: [copy(3, 'spine', 'paperback', 'Yale Little Histories')], rating: 3, reads: r('2025-05-25', '2025-07-14') }),
  b({ title: 'A Brief History of Intelligence', authors: ['Max S. Bennett'], pages: 432, year: 2023, genres: ['Non-fiction', 'Science', 'Neuroscience'], copies: [copy(3, 'stack', 'paperback')] }),
  b({ title: 'The Story of a Heart', authors: ['Rachel Clarke'], pages: 272, year: 2024, genres: ['Non-fiction', 'Memoir', 'Medicine'], copies: [copy(3, 'stack', 'paperback')] }),
  b({ title: 'The Year of the Locust', authors: ['Terry Hayes'], pages: 672, year: 2023, genres: ['Thriller', 'Espionage'], copies: [copy(3, 'stack', 'paperback')], rating: 5, reads: r('2025-07-15', '2025-07-26') }),
  b({ title: 'Macbeth', authors: ['Jo Nesbø'], series: { name: 'Hogarth Shakespeare', position: 0 }, pages: 464, year: 2018, genres: ['Crime', 'Thriller', 'Retelling'], copies: [copy(3, 'stack', 'paperback')], rating: 4, reads: r('2025-04-07', '2025-04-25') }),
  b({ title: 'Erebus: The Story of a Ship', authors: ['Michael Palin'], pages: 352, year: 2018, genres: ['Non-fiction', 'History', 'Exploration'], copies: [copy(3, 'stack', 'paperback')] }),
  b({ title: 'China', authors: ['Edward Rutherfurd'], pages: 784, year: 2021, genres: ['Historical fiction', 'Saga'], copies: [copy(3, 'stack', 'paperback')] }),
  b({ title: 'The Eye of the World', authors: ['Robert Jordan'], series: { name: 'The Wheel of Time', position: 1 }, pages: 782, year: 1990, genres: ['Fantasy', 'Epic fantasy'], copies: [copy(3, 'stack', 'paperback', 'Wheel of Time paperbacks')], rating: 5, reads: r('2026-04-08', '2026-06-17'), review: 'Wat een serie! Ik kan niet wachten op het volgende boek te starten en ik ga zo snel mogelijk beginnen met het kijken van de serie op Amazon. Het verhaal blijft constant spannend.' }),
  b({ title: 'The Great Hunt', authors: ['Robert Jordan'], series: { name: 'The Wheel of Time', position: 2 }, pages: 705, year: 1990, genres: ['Fantasy', 'Epic fantasy'], copies: [copy(3, 'stack', 'paperback', 'Wheel of Time paperbacks')] }),
  b({ title: 'The Life Impossible', authors: ['Matt Haig'], pages: 336, year: 2024, genres: ['Literary fiction', 'Magical realism'], copies: [copy(3, 'spine', 'hardcover')], rating: 4, reads: r('2025-03-06', '2025-03-17') }),
  b({ title: 'How to Stop Time', authors: ['Matt Haig'], pages: 336, year: 2017, genres: ['Literary fiction', 'Historical'], copies: [copy(3, 'spine', 'paperback')], rating: 4, reads: r('2024-07-08', '2024-07-20') }),
  b({ title: 'The Humans', authors: ['Matt Haig'], pages: 304, year: 2013, genres: ['Literary fiction', 'Science fiction'], copies: [copy(3, 'spine', 'paperback')] }),
  b({ title: 'Nighthawk', authors: ['Clive Cussler', 'Graham Brown'], series: { name: 'NUMA Files', position: 14 }, pages: 416, year: 2017, genres: ['Thriller', 'Adventure'], copies: [copy(3, 'spine', 'paperback')], rating: 5, reads: r('2024-01-12', '2024-01-19') }),
  b({ title: 'Journey of the Pharaohs', authors: ['Clive Cussler', 'Graham Brown'], series: { name: 'NUMA Files', position: 17 }, pages: 416, year: 2020, genres: ['Thriller', 'Adventure'], copies: [copy(3, 'spine', 'paperback')], rating: 4, reads: r('2024-02-20', '2024-03-10') }),
  b({ title: 'Crescent Dawn', authors: ['Clive Cussler', 'Dirk Cussler'], series: { name: 'Dirk Pitt', position: 21 }, pages: 544, year: 2010, genres: ['Thriller', 'Adventure'], copies: [copy(3, 'spine', 'paperback')], rating: 3, reads: r('2024-12-12', '2025-02-05') }),
  b({ title: 'Duivelse zee', originalTitle: "Clive Cussler's The Devil's Sea", authors: ['Dirk Cussler'], series: { name: 'Dirk Pitt', position: 26 }, language: 'nl', pages: 416, year: 2021, genres: ['Thriller', 'Adventure'], copies: [copy(3, 'spine', 'paperback')], rating: 4, reads: r('2025-10-27', '2025-11-19') }),
  b({ title: 'A Quiet Death in Italy', authors: ['Tom Benjamin'], series: { name: 'Daniel Leicester', position: 1 }, pages: 352, year: 2020, genres: ['Crime', 'Mystery'], copies: [copy(3, 'spine', 'paperback')], rating: 2, reads: r('2025-02-27', '2025-03-05') }),
  b({ title: 'De partner', originalTitle: 'The Partner', authors: ['John Grisham'], language: 'nl', pages: 400, year: 1997, genres: ['Thriller', 'Legal thriller'], copies: [copy(3, 'spine', 'paperback')], rating: 5, reads: r('2024-01-02', '2024-01-12') }),
  b({ title: 'The Hobbit', authors: ['J.R.R. Tolkien'], pages: 300, year: 1937, genres: ['Fantasy', 'Classic'], copies: [copy(3, 'stack', 'hardcover', 'Tolkien HarperCollins hardcovers')], rating: 4, reads: r('2025-08-16', '2025-08-28') }),
  b({ title: 'The Fellowship of the Ring', authors: ['J.R.R. Tolkien'], series: { name: 'The Lord of the Rings', position: 1 }, pages: 432, year: 1954, genres: ['Fantasy', 'Epic fantasy', 'Classic'], copies: [copy(3, 'stack', 'hardcover', 'Tolkien HarperCollins hardcovers')], rating: 4, reads: r('2025-08-29', '2025-10-21') }),
  b({ title: 'The Two Towers', authors: ['J.R.R. Tolkien'], series: { name: 'The Lord of the Rings', position: 2 }, pages: 352, year: 1954, genres: ['Fantasy', 'Epic fantasy', 'Classic'], copies: [copy(3, 'stack', 'hardcover', 'Tolkien HarperCollins hardcovers')] }),
  b({ title: 'The Return of the King', authors: ['J.R.R. Tolkien'], series: { name: 'The Lord of the Rings', position: 3 }, pages: 416, year: 1955, genres: ['Fantasy', 'Epic fantasy', 'Classic'], copies: [copy(3, 'stack', 'hardcover', 'Tolkien HarperCollins hardcovers')] }),

  // ───────────── Read, not on the photographed shelves ─────────────
  b({ title: 'Tuesdays with Morrie', authors: ['Mitch Albom'], pages: 192, year: 1997, genres: ['Memoir', 'Non-fiction'], rating: 5, reads: r('2026-09-19', '2026-09-21') }),
  b({ title: 'Het zesde uitsterven', originalTitle: 'The 6th Extinction', authors: ['James Rollins'], series: { name: 'Sigma Force', position: 10 }, language: 'nl', pages: 448, year: 2014, genres: ['Thriller', 'Adventure', 'Science'], rating: 4, reads: r('2026-06-26', '2026-08-19') }),
  b({ title: 'Piaggio', authors: ['Hendrik Groen'], language: 'nl', pages: 128, year: 2024, genres: ['Fiction', 'Novella'], rating: 5, reads: r('2026-06-19', '2026-06-19'), review: 'Super leuk kort boekje! Een erg inspirerend verhaal, leest makkelijk weg en bevat de perfecte combinatie van avontuur, wendingen en romantiek!' }),
  b({ title: 'Astrophysics for People in a Hurry', authors: ['Neil deGrasse Tyson'], pages: 224, year: 2017, genres: ['Non-fiction', 'Science', 'Astronomy'], rating: 5, reads: r('2025-11-19', '2026-06-18'), review: 'Prachtig boek! Het begin ervaar ik als erg lastig vanwege de verdieping en het gebruik van bepaalde termen, maar Neil Degrasse Tyson heeft mooi werk geleverd! De titel klopt.' }),
  b({ title: 'Amazonia', authors: ['James Rollins'], pages: 528, year: 2002, genres: ['Thriller', 'Adventure'], rating: 5, reads: r('2025-05-25', '2025-06-07') }),
  b({ title: 'Roadtrip', originalTitle: 'Two Steps Onward', authors: ['Graeme Simsion', 'Anne Buist'], series: { name: 'Camino', position: 2 }, language: 'nl', pages: 320, year: 2021, genres: ['Fiction', 'Travel'], rating: 3, reads: r('2025-02-06', '2025-02-11') }),
  b({ title: "Harry Potter and the Philosopher's Stone", authors: ['J.K. Rowling'], series: { name: 'Harry Potter', position: 1 }, pages: 332, year: 1997, genres: ['Fantasy', 'Young adult'], rating: 5, reads: r('2024-11-09', '2024-11-20') }),
  b({ title: 'Killing Moon', authors: ['Jo Nesbø'], series: { name: 'Harry Hole', position: 13 }, pages: 464, year: 2022, genres: ['Crime', 'Thriller'], rating: 5, reads: r('2024-10-04', '2024-11-06') }),
  b({ title: 'Map of Bones', authors: ['James Rollins'], series: { name: 'Sigma Force', position: 2 }, pages: 528, year: 2005, genres: ['Thriller', 'Adventure'], rating: 3, reads: r('2024-08-05', '2024-09-11') }),
  b({ title: 'Ik ben Pelgrim', originalTitle: 'I Am Pilgrim', authors: ['Terry Hayes'], language: 'nl', pages: 704, year: 2013, genres: ['Thriller', 'Espionage'], rating: 5, reads: r('2024-07-24', '2024-09-10') }),
  b({ title: 'When Breath Becomes Air', authors: ['Paul Kalanithi'], pages: 256, year: 2016, genres: ['Memoir', 'Non-fiction', 'Medicine'], rating: 3, reads: r('2024-02-06', '2024-02-18') }),
  b({ title: 'De bekentenis', originalTitle: 'The Confession', authors: ['John Grisham'], language: 'nl', pages: 480, year: 2010, genres: ['Thriller', 'Legal thriller'], rating: 4, reads: r('2024-01-14', '2024-01-29') }),
  b({ title: 'The Midnight Library', authors: ['Matt Haig'], series: { name: 'The Midnight World', position: 1 }, pages: 304, year: 2020, genres: ['Literary fiction', 'Magical realism'], rating: 5, reads: r('2023-12-02', '2023-12-18') }),
  b({ title: 'Raise the Titanic!', authors: ['Clive Cussler'], series: { name: 'Dirk Pitt', position: 4 }, pages: 512, year: 1976, genres: ['Thriller', 'Adventure'], rating: 5, reads: r('2023-11-14', '2023-11-28') }),

  // ───────────── Want to read (Goodreads order) ─────────────
  b({ title: 'Taipei Story', authors: ['R.F. Kuang'], pages: 400, year: 2026, genres: ['Literary fiction'], status: 'want', wishPriority: 1 }),
  b({ title: 'Yesteryear', authors: ['Caro Claire Burke'], pages: 368, year: 2026, genres: ['Fiction', 'Time travel'], status: 'want', wishPriority: 2 }),
  b({ title: 'Crime and Punishment', authors: ['Fyodor Dostoevsky'], pages: 671, year: 1866, genres: ['Classic', 'Literary fiction'], status: 'want', wishPriority: 3 }),
  b({ title: 'The Drowning Faith', authors: ['R.F. Kuang'], series: { name: 'The Poppy War', position: 2.5 }, pages: 96, year: 2020, genres: ['Fantasy', 'Short stories'], status: 'want', wishPriority: 5 }),
  b({ title: 'History: A Very Short Introduction', authors: ['John H. Arnold'], series: { name: 'Very Short Introductions', position: 0 }, pages: 144, year: 2000, genres: ['Non-fiction', 'History'], status: 'want', wishPriority: 7 }),
  b({ title: 'The Memory Collectors', authors: ['Dete Meserve'], pages: 320, year: 2025, genres: ['Fiction', 'Mystery'], status: 'want', wishPriority: 8 }),
  b({ title: 'The Martian', authors: ['Andy Weir'], pages: 369, year: 2014, genres: ['Science fiction'], status: 'want', wishPriority: 9 }),
  b({ title: 'Hannibal', authors: ['Thomas Harris'], series: { name: 'Hannibal Lecter', position: 3 }, pages: 486, year: 1999, genres: ['Thriller', 'Horror'], status: 'want', wishPriority: 10 }),
]

export interface Suggestion { title: string; author: string; because: string }
export const DISCOVER: Suggestion[] = [
  { title: 'The Way of Kings', author: 'Brandon Sanderson', because: 'you loved The Eye of the World and the Tolkien set' },
  { title: 'Mistborn: The Final Empire', author: 'Brandon Sanderson', because: 'epic fantasy with a tight magic system, like The Poppy War' },
  { title: 'The Name of the Wind', author: 'Patrick Rothfuss', because: 'you gave The Eye of the World five stars' },
  { title: 'Piranesi', author: 'Susanna Clarke', because: 'Katabasis and Babel are on your shelf' },
  { title: 'She Who Became the Sun', author: 'Shelley Parker-Chan', because: 'you read The Poppy War trilogy' },
  { title: 'Red Rising', author: 'Pierce Brown', because: 'fast pacing like The Year of the Locust, fantasy stakes like Kuang' },
  { title: 'The Silmarillion', author: 'J.R.R. Tolkien', because: 'it completes your matching Tolkien hardcovers' },
  { title: 'A Little History of Philosophy', author: 'Nigel Warburton', because: 'you collect the Yale Little Histories' },
  { title: 'A Little History of Economics', author: 'Niall Kishtainy', because: 'you collect the Yale Little Histories' },
  { title: 'Sapiens', author: 'Yuval Noah Harari', because: 'you enjoy accessible big-picture non-fiction like Bynum and Bennett' },
  { title: 'A Short History of Nearly Everything', author: 'Bill Bryson', because: 'Astrophysics for People in a Hurry got five stars' },
  { title: 'Project Hail Mary', author: 'Andy Weir', because: 'The Martian is on your Want to Read list' },
  { title: 'Sandstorm', author: 'James Rollins', because: 'you read Sigma Force out of order; this is book 1' },
  { title: 'The Snowman', author: 'Jo Nesbø', because: 'Killing Moon got five stars' },
  { title: 'The Five People You Meet in Heaven', author: 'Mitch Albom', because: 'Tuesdays with Morrie got five stars' },
  { title: 'Pogingen iets van het leven te maken', author: 'Hendrik Groen', because: 'Piaggio got five stars' },
  { title: 'Seven Brief Lessons on Physics', author: 'Carlo Rovelli', because: 'short, clear science like Astrophysics for People in a Hurry' },
  { title: 'The Pillars of the Earth', author: 'Ken Follett', because: 'you own Rutherfurd\'s China' },
  { title: 'De meeste mensen deugen', author: 'Rutger Bregman', because: 'Dutch non-fiction you can read in one go' },
]
