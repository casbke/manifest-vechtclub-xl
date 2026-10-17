# Prompt: Build My Virtual Library

You are a senior full-stack engineer and product designer. Build me a complete, polished, single-user **virtual library web app** that catalogs every book I have read and every book I own, and makes browsing my collection genuinely fun. Treat this as a real product, not a demo. Where I leave something unspecified, make a sensible, opinionated choice and tell me what you chose.

## 0. My real collection (use this as the seed data and the design reference)

I am a reader based in the Netherlands who reads in **English and Dutch**. Treat the books below as the starting catalog. Every one of them should exist in the seed with real metadata and covers pulled from Open Library or Google Books, marked as **owned**, and placed on the shelf positions I give. Where I have a whole series, add the volumes I did not list as "wishlist" so the Series section has something to show.

### My Goodreads
My Goodreads profile is https://www.goodreads.com/user/show/179624736. Goodreads has no public API, so:
- Build the Goodreads **CSV import** (My Books, then Import and export, then Export Library) as the primary way to load my read history, ratings, review text, date read, date added, shelves, and "owned copies".
- Also support pasting my public profile URL: fetch the public RSS feed at `https://www.goodreads.com/review/list_rss/<user id>?shelf=read` (and `currently-reading`, `to-read`) to sync new entries without a full re-export. If the profile is private, fall back to CSV with a clear message.
- Map Goodreads shelves to my statuses: `read` to Finished, `currently-reading` to Currently reading, `to-read` to Wishlist/Want to read, and any custom shelf to a Tag.

Read status below comes from my Goodreads Read shelf above; anything not on that shelf is owned but unread unless I say otherwise.

### My Goodreads "Read" shelf (37 books, newest first; ratings are mine; dates are start to finish)
Use these as the **source of truth for reading logs and ratings** in the seed. Reviews are in Dutch and must be stored verbatim. Titles marked *(NL)* were read in Dutch translation; store the Dutch title as the title and the English original in the original-title field.

| # | Title | Author | Series | Rating | Read |
|---|-------|--------|--------|--------|------|
| 1 | Tuesdays with Morrie | Mitch Albom | | 5 | 2026-09-19 to 2026-09-21 |
| 2 | Het zesde uitsterven *(NL, orig. The 6th Extinction)* | James Rollins | Sigma Force #10 | 4 | 2026-06-26 to 2026-08-19 |
| 3 | Piaggio | Hendrik Groen | | 5 | 2026-06-19 to 2026-06-19 |
| 4 | The Eye of the World | Robert Jordan | The Wheel of Time #1 | 5 | 2026-04-08 to 2026-06-17 |
| 5 | Astrophysics for People in a Hurry | Neil deGrasse Tyson | | 5 | 2025-11-19 to 2026-06-18 |
| 6 | Katabasis | R.F. Kuang | | 5 | 2026-03-08 to 2026-04-08 |
| 7 | The Dragon Republic | R.F. Kuang | The Poppy War #2 | 5 | 2025-12-07 to 2026-02-25 |
| 8 | Clive Cusslers Duivelse zee *(NL, orig. Clive Cussler's The Devil's Sea)* | Dirk Cussler | Dirk Pitt #26 | 4 | 2025-10-27 to 2025-11-19 |
| 9 | The Fellowship of the Ring | J.R.R. Tolkien | The Lord of the Rings #1 | 4 | 2025-08-29 to 2025-10-21 |
| 10 | The Hobbit | J.R.R. Tolkien | | 4 | 2025-08-16 to 2025-08-28 |
| 11 | The Poppy War | R.F. Kuang | The Poppy War #1 | 4 | 2025-07-28 to 2025-08-16 |
| 12 | The Year of the Locust | Terry Hayes | | 5 | 2025-07-15 to 2025-07-26 |
| 13 | A Little History of Science | William Bynum | Little Histories | 3 | 2025-05-25 to 2025-07-14 |
| 14 | Harry Potter and the Deathly Hallows | J.K. Rowling | Harry Potter #7 | 5 | 2025-06-19 to 2025-07-06 |
| 15 | Harry Potter and the Half-Blood Prince | J.K. Rowling | Harry Potter #6 | 4 | 2025-06-07 to 2025-06-17 |
| 16 | Amazonia | James Rollins | | 5 | 2025-05-25 to 2025-06-07 |
| 17 | Harry Potter and the Order of the Phoenix | J.K. Rowling | Harry Potter #5 | 5 | 2025-04-25 to 2025-05-24 |
| 18 | Macbeth: Macbeth Re-told | Jo Nesbø | Hogarth Shakespeare | 4 | 2025-04-07 to 2025-04-25 |
| 19 | Harry Potter and the Goblet of Fire | J.K. Rowling | Harry Potter #4 | 5 | 2025-03-18 to 2025-04-06 |
| 20 | The Life Impossible | Matt Haig | | 4 | 2025-03-06 to 2025-03-17 |
| 21 | A Quiet Death in Italy | Tom Benjamin | Daniel Leicester #1 | 2 | 2025-02-27 to 2025-03-05 |
| 22 | Harry Potter and the Prisoner of Azkaban | J.K. Rowling | Harry Potter #3 | 4 | 2025-02-14 to 2025-02-27 |
| 23 | Roadtrip *(NL, orig. Two Steps Onward)* | Graeme Simsion & Anne Buist | Camino #2 | 3 | 2025-02-06 to 2025-02-11 |
| 24 | Crescent Dawn | Clive Cussler & Dirk Cussler | Dirk Pitt #21 | 3 | 2024-12-12 to 2025-02-05 |
| 25 | Harry Potter and the Chamber of Secrets | J.K. Rowling | Harry Potter #2 | 5 | 2024-11-26 to 2024-12-12 |
| 26 | Harry Potter and the Philosopher's Stone | J.K. Rowling | Harry Potter #1 | 5 | 2024-11-09 to 2024-11-20 |
| 27 | Killing Moon | Jo Nesbø | Harry Hole #13 | 5 | 2024-10-04 to 2024-11-06 |
| 28 | Map of Bones | James Rollins | Sigma Force #2 | 3 | 2024-08-05 to 2024-09-11 |
| 29 | Ik ben Pelgrim *(NL, orig. I Am Pilgrim)* | Terry Hayes | | 5 | 2024-07-24 to 2024-09-10 |
| 30 | How to Stop Time | Matt Haig | | 4 | 2024-07-08 to 2024-07-20 |
| 31 | Journey of the Pharaohs | Clive Cussler & Graham Brown | NUMA Files #17 | 4 | 2024-02-20 to 2024-03-10 |
| 32 | When Breath Becomes Air | Paul Kalanithi | | 3 | 2024-02-06 to 2024-02-18 |
| 33 | De bekentenis *(NL, orig. The Confession)* | John Grisham | | 4 | 2024-01-14 to 2024-01-29 |
| 34 | Nighthawk | Clive Cussler & Graham Brown | NUMA Files #14 | 5 | 2024-01-12 to 2024-01-19 |
| 35 | De partner *(NL, orig. The Partner)* | John Grisham | | 5 | 2024-01-02 to 2024-01-12 |
| 36 | The Midnight Library | Matt Haig | | 5 | 2023-12-02 to 2023-12-18 |
| 37 | Raise the Titanic! | Clive Cussler | Dirk Pitt #4 | 5 | 2023-11-14 to 2023-11-28 |

My reviews (store verbatim, Dutch):
- **Piaggio**: "Super leuk kort boekje! Een erg inspirerend verhaal, leest makkelijk weg en bevat de perfecte combinatie van avontuur, wendingen en romantiek!"
- **The Eye of the World**: "Wat een serie! Ik kan niet wachten op het volgende boek te starten en ik ga zo snel mogelijk beginnen met het kijken van de serie op Amazon. Het verhaal blijft constant spannend..." (truncated in my export; the CSV import will bring the full text)
- **Astrophysics for People in a Hurry**: "Prachtig boek! Het begin ervaar ik als erg lastig vanwege de verdieping en het gebruik van bepaalde termen, maar Neil Degrasse Tyson heeft mooi werk geleverd! De titel klopt..." (truncated)
- **Katabasis**: "Wat een fantastisch boek weer van R.F Kuang! Een verhaal met heel veel wendingen, diepgaande karakters en met heel veel diepte in omgeving en verhaal. 5 sterren dik en dubbel..." (truncated)

### My Goodreads "Want to Read" shelf (in my priority order)
1. Taipei Story - R.F. Kuang (2026)
2. Yesteryear - Caro Claire Burke (2026)
3. Crime and Punishment - Fyodor Dostoevsky
4. Babel - R.F. Kuang (I own this one; it is on my Kuang shelf unread)
5. The Drowning Faith - R.F. Kuang (The Poppy War #2.5, novella collection)
6. A Little History of the World - E.H. Gombrich (I own the Dutch edition, unread)
7. History: A Very Short Introduction - John H. Arnold
8. The Memory Collectors - Dete Meserve (2025)
9. The Martian - Andy Weir
10. Hannibal - Thomas Harris (Hannibal Lecter #3)

Seed these as Want to read with the priority above. Items 4 and 6 must show up as **owned but unread** (on my TBR), not as wishlist purchases.

### Reading pattern facts the Statistics section should surface from this data
- Roughly 11 to 14 books a year since late 2023, with a 2025 reading goal that the dashboard should default to 15 books for 2026.
- My five-star rate is high (about half). Average rating per author: R.F. Kuang, Terry Hayes, Matt Haig and Clive Cussler should rank at the top.
- Longest read: Astrophysics for People in a Hurry (seven months, read alongside other books). Shortest: Piaggio (one day). The Statistics "fastest and slowest" tiles must handle overlapping reads correctly.
- About a quarter of my reading is in Dutch translation; show a Dutch versus English split.
- Two long series in progress: The Wheel of Time (1 of 14 read) and Harry Potter (7 of 7 read). Sigma Force, Dirk Pitt and NUMA Files are read out of order, so Series pages must handle non-sequential reading gracefully.

### Bookcase: living room, black bookcase, shelves numbered top to bottom

**Shelf 1 (top)** - Harry Potter and figures
- J.K. Rowling, *Harry Potter and the Chamber of Secrets* (Bloomsbury paperback, UK edition) - owned, read
- J.K. Rowling, *Harry Potter and the Prisoner of Azkaban* (Bloomsbury paperback) - owned, read
- J.K. Rowling, *Harry Potter and the Goblet of Fire* (Bloomsbury paperback) - owned, read
- J.K. Rowling, *Harry Potter and the Order of the Phoenix* (Bloomsbury paperback) - owned, read
- J.K. Rowling, *Harry Potter and the Half-Blood Prince* (Bloomsbury paperback) - owned, read
- J.K. Rowling, *Harry Potter and the Deathly Hallows* (Bloomsbury paperback) - owned, read
- *Harry Potter and the Philosopher's Stone* is not on this shelf but I have read it; seed it as read, ownership unknown, so the series shows 7 of 7 read and 6 of 7 owned.
- Non-book items on this shelf: a white Dumbledore bust and a LEGO Hogwarts Express / Platform 9¾ set. Support **"shelf objects"** (decor, figures, LEGO) as non-book items with a photo so the Shelf View can show them in their real place.

**Shelf 2 (middle)** - R.F. Kuang
- R.F. Kuang, *The Poppy War* (hardcover, special edition) - owned
- R.F. Kuang, *The Dragon Republic* (hardcover, special edition) - owned
- R.F. Kuang, *The Burning God* - add as owned (same edition set) to complete the trilogy
- R.F. Kuang, *Katabasis* (hardcover, 2025) - owned
- R.F. Kuang, *Babel* - owned, unread (on my Want to Read shelf)
- R.F. Kuang, *Yellowface* - owned, unread (best guess from the spine)
- This is an **author showcase shelf**: covers face out. Shelf View must support "face-out" display for a shelf or for individual books.

**Shelf 3 (bottom)** - mixed non-fiction, thrillers, fantasy
- William Bynum, *A Little History of Science* (Yale Little Histories, paperback) - owned
- Brian Fagan, *A Little History of Archaeology* (Yale Little Histories, paperback) - owned
- E.H. Gombrich, *Een kleine geschiedenis van de wereld* (Dutch translation of *A Little History of the World*, paperback) - owned, unread, language Dutch, original title in English
- Max S. Bennett, *A Brief History of Intelligence* (paperback) - owned
- Rachel Clarke, *The Story of a Heart* (paperback) - owned
- Terry Hayes, *The Year of the Locust* (paperback) - owned
- Jo Nesbø, *Macbeth* (Vintage paperback, Hogarth Shakespeare) - owned
- Michael Palin, *Erebus: The Story of a Ship* (paperback) - owned
- Edward Rutherfurd, *China* (paperback) - owned
- Robert Jordan, *The Eye of the World* (The Wheel of Time, Book 1) - owned
- Robert Jordan, *The Great Hunt* (The Wheel of Time, Book 2) - owned; add books 3 to 14 to the wishlist so the Series page shows a long, mostly empty progress bar
- Matt Haig, *The Life Impossible* (hardcover) - owned
- Matt Haig, *How to Stop Time* (paperback) - owned
- Matt Haig, *The Humans* (paperback) - owned
- Clive Cussler (with Graham Brown, Dirk Cussler and others), four to five NUMA Files / Dirk Pitt paperbacks - owned. Use the ones from my Read shelf first (*Nighthawk*, *Journey of the Pharaohs*, *Crescent Dawn*, *Raise the Titanic!*, *Duivelse zee*) and treat any extra spine as unread
- Tom Benjamin, *A Quiet Death in Italy* - owned, read (2 stars). One John Grisham paperback - owned; use *De partner* or *De bekentenis* from my Read shelf
- J.R.R. Tolkien, *The Hobbit* (HarperCollins hardcover, matching set) - owned, read
- J.R.R. Tolkien, *The Fellowship of the Ring* (matching hardcover) - owned, read
- J.R.R. Tolkien, *The Two Towers* (matching hardcover) - owned, read
- J.R.R. Tolkien, *The Return of the King* (matching hardcover) - owned, read
- Mixed stacking: this shelf has books standing and books stacked flat. Shelf View must support **horizontal stacks** as well as upright spines.

**Shelf 4** - Dutch non-fiction (partly visible): a Dutch book about insects and other Dutch-language titles. Seed two or three real Dutch non-fiction titles here and make sure every language-dependent feature (sorting, search, "Een"/"De"/"Het" article handling in sort titles) works for Dutch.

### What this collection says about my taste (use it for recommendations)
- Epic and literary fantasy: Tolkien, Robert Jordan, R.F. Kuang, Harry Potter.
- Accessible non-fiction and popular science/history: the Yale Little Histories, Bennett, Palin, Clarke, deGrasse Tyson.
- Fast adventure thrillers: Clive Cussler, James Rollins, Terry Hayes, John Grisham, Jo Nesbø.
- Warm, short, life-affirming fiction: Matt Haig, Mitch Albom, Hendrik Groen. Big historical sagas: Edward Rutherfurd.
- I collect **matching editions and special editions**, so edition and set tracking matters to me.

### Recommendations section ("Similar books")
Add a **Discover** section that suggests books I do not own yet, based on my shelves and my Goodreads data. Seed it with these as a starting list, each with a one-line "because you own ..." reason, and let me dismiss, wishlist, or mark as already read:
- Brandon Sanderson, *The Way of Kings* and *Mistborn: The Final Empire* (because: Wheel of Time, Tolkien)
- Patrick Rothfuss, *The Name of the Wind* (because: Wheel of Time)
- Susanna Clarke, *Piranesi* and *Jonathan Strange & Mr Norrell* (because: Katabasis, Babel)
- Shelley Parker-Chan, *She Who Became the Sun* (because: The Poppy War)
- Pierce Brown, *Red Rising* (because: Poppy War, fast pacing)
- J.R.R. Tolkien, *The Silmarillion* (because: matching Tolkien set)
- Nigel Warburton, *A Little History of Philosophy* and Niall Kishtainy, *A Little History of Economics* (because: Yale Little Histories)
- Yuval Noah Harari, *Sapiens*; Bill Bryson, *A Short History of Nearly Everything* (because: Bynum, Bennett)
- Andy Weir, *Project Hail Mary* (because: The Martian is on my Want to Read list, Astrophysics for People in a Hurry)
- James Rollins, *Sandstorm* (Sigma Force #1) (because: Map of Bones and Het zesde uitsterven read out of order)
- Jo Nesbø, *The Snowman* (because: Killing Moon five stars)
- Mitch Albom, *The Five People You Meet in Heaven* (because: Tuesdays with Morrie five stars)
- Hendrik Groen, *Pogingen iets van het leven te maken* (Dutch, because: Piaggio five stars)
- Carlo Rovelli, *Seven Brief Lessons on Physics* (because: Astrophysics for People in a Hurry)
- Ken Follett, *The Pillars of the Earth* (because: Rutherfurd)
- Rutger Bregman, *De meeste mensen deugen* (Dutch, because: Dutch non-fiction shelf)
Explain in the README how the recommendation logic works (shared authors, series gaps, genre overlap, and Goodreads "readers also enjoyed" data when available) and keep it fully offline-capable with the seeded list.

## 1. Goals

- One place to track **books I've read**, **books I own**, and the overlap between them (owned-and-read, owned-but-unread, read-but-don't-own).
- Make adding books nearly effortless (ISBN scan, title search, bulk CSV import).
- Make browsing feel like walking through a real library, with beautiful cover art and a shelf view.
- Give me rich statistics and insight into my reading habits.
- Work great on desktop and phone, in light and dark mode, and offline for viewing.
- All my data stays mine: easy export and backup at any time.
- Bilingual collection: Dutch and English titles side by side, with original-title and translated-title fields, language filters, and stats per language.

## 2. Tech stack

- Frontend: React + TypeScript + Vite, Tailwind CSS, Framer Motion for animations, TanStack Query for data fetching, Zustand or similar for client state.
- Backend: Node (Fastify or Express) + TypeScript, or Next.js full-stack if you prefer. Explain your choice in one paragraph.
- Database: SQLite via Prisma or Drizzle for local/self-hosted use, with a one-line switch to PostgreSQL.
- Auth: simple single-user login (email + password, or a passphrase) with session cookies. Design the schema so multi-user could be added later, but do not build it now.
- Installable as a PWA with a service worker that caches the app shell, cover images, and the catalog for offline reading.
- Testing: Vitest + React Testing Library for the frontend, integration tests for the API, and a few Playwright end-to-end tests for critical flows (add book, edit book, import CSV, search).
- Tooling: ESLint, Prettier, a `README.md` with setup steps, `.env.example`, and a Dockerfile + `docker-compose.yml`.

## 3. Data model

Design a normalized schema with at least these entities. Include migrations and seed data: the real collection from section 0 first, then pad to about 60 books total with realistic titles that fit my taste, including some duplicates in different formats.

**Book**
- id, title, subtitle, original title, authors (many-to-many), ISBN-10, ISBN-13, publisher, publication year, original publication year, language, page count, description/blurb, cover image URL (and a locally cached copy), genres/subjects (many-to-many), series name + series position, edition notes, external IDs (Open Library ID, Google Books ID, Goodreads ID).

**Copy** (a physical or digital copy I own; one book can have many copies)
- id, book id, format (hardcover, paperback, trade paperback, mass market, ebook, audiobook, PDF, other), condition (new, like new, good, fair, poor), acquisition date, acquisition source (bookstore, gift, secondhand, library sale, online), price paid, currency, signed (yes/no), notes, physical location (room, bookcase, shelf, position), status (on shelf, lent out, lost, sold, donated).

**ReadingLog** (one book can be read multiple times)
- id, book id, status (want to read, currently reading, finished, did not finish, paused), start date, finish date, pages read or percent progress, current page, format read in (if different from owned copy), rating (0 to 5 in half stars), review text (Markdown), spoiler flag, reread number.

**Tag / Shelf** (custom, user-created, color-coded, many-to-many with books)

**Quote / Highlight**
- id, book id, text, page or location, chapter, note, favorite flag, date added.

**Loan**
- id, copy id, borrower name, borrower contact, date lent, due date, date returned, reminder sent flag, notes.

**Wishlist item**
- book id, priority (low, medium, high), reason/note, target price, date added.

**Reading goal**
- year, target books, target pages, optional per-genre or per-tag targets.

**Author**
- id, name, sort name, bio, birth year, death year, country/nationality, photo URL, external IDs.

## 4. Sections of the app

Build these as top-level sections in a sidebar (desktop) and a bottom tab bar (mobile).

1. **Home / Dashboard**
   - Greeting with time of day, "currently reading" cards with progress bars and a "log pages" quick action.
   - This year's reading goal ring with books and pages progress and an on-track / behind indicator.
   - Recently added, recently finished, and a "pick up where you left off" row.
   - A "Random book from your unread shelf" button with a fun shuffle animation.
   - A small "On this day" widget: books I started or finished on this date in previous years.

2. **Library (All Books)**
   - Three view modes with a toggle: **Grid** (cover wall), **List/Table** (sortable columns, inline edit), and **Shelf** (see section 5).
   - Faceted filters in a side panel: ownership (owned / not owned), read status, format, genre, tag, author, series, language, rating range, page count range, publication decade, acquisition year, location, lent out.
   - Sort by: title, author surname, date added, date finished, rating, page count, publication year, series order, color of cover (yes, really: extract the dominant cover color and sort by hue).
   - Instant full-text search across title, author, description, notes, quotes, and reviews, with typo tolerance and keyboard navigation.
   - Saved filter presets (e.g. "Unread paperbacks under 300 pages").
   - Bulk select mode: add tags, change status, move location, export selected.

3. **Read**
   - Everything with a finished or DNF reading log, grouped by year with a year summary header (count, pages, average rating, top genre).
   - Toggle to include rereads.
   - A "DNF graveyard" subsection with the reason I stopped.

4. **Owned**
   - Everything with at least one copy. Default sort by physical location so it mirrors my real shelves.
   - "Unread owned" (TBR) highlighted, with total unread pages and an estimate of how long it would take at my average pace.
   - Duplicate detector: same book owned in multiple formats or editions.
   - **Sets and editions**: group copies into a named set (e.g. "Tolkien HarperCollins matching hardcovers", "Bloomsbury HP paperbacks") and show which volumes of a set I still miss. Flag special or signed editions.
   - Shelf map: a visual diagram of my rooms, bookcases, and shelves, showing what sits where. Clicking a shelf filters the library.

5. **Shelf View (the fun one)**
   - Render books as spines on wooden (or configurable) shelves, with spine width proportional to page count and spine color pulled from the cover's dominant color. Title and author text printed on the spine, rotated.
   - Hover or tap a spine to pull the book slightly forward and show the cover and quick stats; click to open details.
   - Shelves can be ordered by my real physical arrangement, by author, by color (rainbow shelf), or by date read.
   - Smooth horizontal scroll with momentum; a mini-map to jump between shelves.
   - Optional "3D tilt" effect using CSS perspective. Must stay performant with 1,000+ books (virtualize).
   - Support three placements per book that mirror my real shelves: **upright spine**, **face-out cover** (for showcase shelves like my R.F. Kuang shelf), and **flat in a stack**. Support non-book **shelf objects** (busts, LEGO sets, plants) with a photo.
   - A "Photo to shelf" helper: I upload a photo of a real shelf, pick the books on it from my library, and the app records their shelf and order. Full OCR of spines is a stretch goal; the manual picker is required.

6. **Currently Reading**
   - Progress logging by page or percent, with a sparkline of daily pages.
   - Estimated finish date based on recent pace.
   - Session timer: start/stop a reading session; auto-log duration and pages.
   - Quick-add quotes while reading.

7. **Wishlist**
   - Priority sorting, notes, and a "move to owned" action that creates a Copy in one click.
   - Optional price tracking: store the current price I found and the store, with a manual refresh.
   - "Gift list" share link: a read-only public page I can send to friends and family.

8. **Series**
   - Every series I have any book from, with a progress bar (owned / read / total in series), missing volumes highlighted, and next-to-read suggestion.
   - Pull series metadata from Open Library where possible; allow manual override.

9. **Authors**
   - Author pages with bio, photo, country, and all their books I own or have read, plus a "bibliography I'm missing" list.
   - A world map showing where my authors come from, with bubble size by number of books read.

10. **Quotes & Highlights**
    - Masonry wall of quotes with the cover thumbnail, filterable by book, tag, and favorite.
    - "Random quote" button and a daily quote on the dashboard.
    - Export quotes as Markdown or a styled PNG card to share.

11. **Statistics**
    - Books and pages per year and per month (bar charts), with a comparison overlay of previous years.
    - Rating distribution, average rating by genre, by author, by decade published.
    - Genre breakdown (treemap or donut), format breakdown, language breakdown.
    - Longest and shortest book, fastest and slowest read, longest reading streak, current streak.
    - "Pages read" heatmap calendar (GitHub-style) for the current year.
    - Author gender and nationality diversity (optional fields; never guessed automatically).
    - Owned vs read Venn diagram with clickable regions.
    - Oldest and newest publication year read; a timeline of publication years of what I read.
    - A yearly "Reading Wrapped" page: a scrollable, animated story-style recap for a chosen year that I can export as images.

12. **Loans**
    - Who has what, when it is due, overdue highlighted in red.
    - One-click "mark returned" and a lending history per copy and per borrower.
    - Optional email or push reminder when a due date passes.

13. **Timeline**
    - A vertical, scrollable timeline of my reading life: every start and finish date, acquisitions, and milestones (100th book, first five-star of the year). Zoomable from decades to days.

14. **Import / Export / Settings**
    - Import CSV from Goodreads, StoryGraph, and LibraryThing with a column-mapping step and preview before commit; detect duplicates by ISBN or title+author.
    - Import by pasting a list of ISBNs or titles.
    - **Goodreads sync** by public profile URL via the RSS feeds described in section 0, with a "last synced" timestamp and a diff preview.
    - Export the whole library as CSV, JSON, and a printable PDF catalog. Scheduled automatic JSON backups to a chosen folder.
    - Settings: theme (light, dark, system, plus a few shelf wood textures and accent colors), default view, reading pace settings, goal settings, metadata provider preferences, date format, units.

## 5. Adding books

- **ISBN barcode scanning** using the device camera in the browser (use a library such as `@zxing/browser` or the BarcodeDetector API with a fallback). Scanning should fetch metadata and show a confirm card in under two seconds.
- **Search by title or author** with live results from Open Library and Google Books, showing cover, year, and publisher so I can pick the right edition.
- **Manual entry** with every field editable, plus cover upload or paste from URL.
- **Metadata refresh** per book: re-pull and show a diff of what would change before applying.
- **Cover handling**: download and cache covers locally, generate a blurred placeholder, extract dominant color, and generate a fallback cover with title and author in a nice typographic layout when no cover exists.
- Any add flow must let me set, in one screen: owned or not, which format, read status, rating, tags, location.

## 6. Delightful details

- Keyboard shortcuts everywhere (`/` to search, `n` to add, `g` then `l` for Library, `?` for the cheat sheet).
- Command palette (Cmd/Ctrl+K) to jump to any book, author, or section, or run actions.
- Drag and drop books between shelves in Shelf View to update their physical location.
- Satisfying micro-interactions: a book "closes" when you mark it finished, confetti when a goal is hit, a gentle page-flip transition between details tabs.
- Book detail page with a hero cover, parallax background from the blurred cover, tabs for Overview / My Reading / Copies / Quotes / Notes / Similar books.
- "Similar books" from my own library based on shared genres, tags, and authors.
- Mood-based picker: answer three quick questions (length, tone, fiction or not) and get three suggestions from my unread shelf.
- Shareable public profile page (opt-in) showing selected shelves, with Open Graph images.
- Rich Markdown notes per book with image support.
- Undo for destructive actions (toast with Undo for 8 seconds), and a Trash section with 30-day recovery.
- Fully accessible: semantic HTML, focus states, ARIA labels, reduced-motion support, color contrast that passes WCAG AA, screen-reader friendly shelf view.
- Fast: first load under 2 seconds on a mid-range phone, virtualized lists, optimistic updates.

## 7. API

- RESTful JSON API (or tRPC) with full CRUD for every entity, pagination, filtering, and sorting that mirror the UI filters.
- Endpoint for metadata lookup by ISBN and by query that proxies Open Library and Google Books, with caching and rate-limit handling.
- Endpoint for stats that returns pre-aggregated data for the Statistics section.
- OpenAPI spec generated and served at `/docs`.

## 8. Deliverables

1. Complete source code, organized in a monorepo or clear `client/` and `server/` folders.
2. `README.md` with: what it is, screenshots or GIFs, local setup, Docker setup, how to import from Goodreads, how to back up, and a feature list.
3. Database migrations and a seed script.
4. Tests as described above, with instructions to run them.
5. A short `ARCHITECTURE.md` explaining the main decisions and how to add a new section or field.
6. A `ROADMAP.md` listing anything you intentionally left out, in priority order.

## 9. How to work

- Start by restating the plan as a phased build (Phase 1: schema, API, add book, Library grid, Read and Owned sections. Phase 2: Shelf View, Statistics, Import/Export. Phase 3: everything else). Then build Phase 1 fully before moving on.
- After each phase, give me a summary of what works, how to run it, and any open questions. Do not stop at mockups; everything must actually run.
- Prefer boring, well-maintained libraries. No paid services required; all external APIs must have a free tier (Open Library, Google Books).
- Ask me at most three clarifying questions up front, then proceed with stated assumptions.

## 10. Acceptance criteria

- I can scan a physical book's barcode on my phone and see it on my shelf within 10 seconds.
- I can import my Goodreads export and see correct read dates, ratings, and shelves without duplicates, and the seeded books from section 0 merge with it instead of duplicating.
- The Shelf View reproduces my three photographed shelves recognisably: HP stack plus figures on top, face-out R.F. Kuang shelf in the middle, mixed shelf with the Tolkien stack at the bottom.
- Shelf View scrolls smoothly with 1,000 seeded books.
- Every section listed above exists and is reachable, with real data from the seed.
- The app works offline for browsing after one online load.
- `npm test` passes and `docker compose up` brings up a working app.
