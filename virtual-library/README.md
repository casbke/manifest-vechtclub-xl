# Cas's Library

A personal virtual library: every book read, every book owned, drawn as real shelves.
Built from the prompt in `../virtual-library-prompt.md`, seeded with the collection from the
bookcase photo and the Goodreads Read and Want to Read shelves.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173 — Open Library search and real covers work here
npm test           # Goodreads CSV import tests
npm run build      # dist/index.html (single file) + dist/artifact.html (for publishing on claude.ai)
```

The app is a single-page React + TypeScript app (Vite, Tailwind v4, Dexie). It stores data in the
browser's IndexedDB when run locally, and in the artifact's shared database when published on
claude.ai, so the same page syncs across your phone and laptop.

## Sections

| Section | What it does |
|---|---|
| Home | Greeting, reading-goal ring with ahead/behind indicator, currently reading, "pick one for me" shuffle from your unread shelf, "on this day" anniversaries, recent finishes and additions |
| Library | Grid, table and **Shelf** views; search across title, author, series, notes and tags; filters for ownership, status, language, genre; eight sort orders |
| Shelf view | Spines sized by page count, colours derived from each title, face-out covers, flat stacks, non-book objects (the Dumbledore bust, the LEGO train). Arrange by your real shelves, by author, as a rainbow, or by year read |
| Read | Finished books grouped by year with count, pages, average rating and top genre |
| Owned | To-be-read pile with a time-to-finish estimate, matching sets, duplicate editions, shelf-by-shelf listing |
| Want to read | Priority-ordered wishlist with move up/down and a "Bought it" action |
| Series | Progress bar per series (read / owned / listed / missing), next-up suggestion |
| Authors | Chips for every author, most-read cards, per-author average rating |
| Statistics | Books and pages per year, month heat strip, rating distribution, Dutch vs English split, most-read and highest-rated authors, genres, publication decades, fastest/slowest/longest/shortest records, owned-vs-read |
| Discover | Suggestions with a "because you own…" reason; add to wishlist or dismiss |
| Settings | Reading goal, theme, Goodreads CSV import with preview and merge, JSON backup and restore |

Keyboard: `/` jumps to search, `n` adds a book, `Esc` closes dialogs.

## Adding books

Add a book by hand, or search Open Library by title, author or ISBN (works when the page can reach
the internet, so locally or self-hosted; the claude.ai artifact sandbox blocks outside requests and
falls back to generated covers).

## Data model

One document per book (`src/types.ts`): title, original title, authors, series + position, language,
pages, year, ISBN, genres, tags, cover URL, `owned` + `copies[]` (format, edition set, bookcase, shelf,
position, display mode), `status`, rating, review, `reads[]` (start/finish), wishlist priority.
Shelf objects are documents with `kind: 'object'`.

## Roadmap (not built yet)

Quotes and highlights, loans tracker, reading timeline, barcode scanning with the camera, public
share page, mood-based picker, "Reading Wrapped" yearly recap, StoryGraph/LibraryThing import,
a server backend with a REST API and Postgres for multi-device use outside claude.ai.
