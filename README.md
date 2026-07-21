# Cognita

Cognita is a personal learning operating system: a permanent study log, a
proper spaced-repetition flashcard system, and honest progress statistics —
all running entirely offline, in one browser tab, with no account, no server,
and no external services.

It is built for exactly one user. There is no authentication, no billing, no
multi-user support, and none of the trappings of a SaaS product — just a
calm, fast, private tool meant to be used for years.

## Features

- **Dashboard** — today's study status, current streak, cards due, recent
  sessions, and a single "what's next" action.
- **Study Log** — a permanent, searchable ledger of every study session
  (topic, duration, notes, takeaway), grouped by date, with weekly / monthly
  / yearly / average-session aggregates.
- **Flashcards** — manually authored cards reviewed through a proper
  simplified SM-2 spaced-repetition scheduler (Again / Hard / Good / Easy),
  with due/upcoming views and per-card review history.
- **Statistics** — streaks (current and longest), totals, a 7-day activity
  chart, and a topic-time breakdown, all rendered with plain CSS (no
  charting library).
- **Search** — one search box across study sessions, flashcards, and topics.
- **Backup** — export everything to a single JSON file; import it back with
  a confirmation step and safe handling of corrupted or incompatible files.
- **Offline-first PWA** — installable on desktop and mobile, works with no
  network connection after the first load, self-hosted fonts (no
  Google Fonts calls at runtime).

## Architecture

No backend. No database server. No API keys. Everything is persisted to
`localStorage` on the device, in a small set of namespaced keys defined in
`src/storage/keys.ts`.

The codebase is layered so each concern can be reasoned about (and tested)
independently:

```
UI (pages/components)
   │  reads state from, calls mutation functions on
   ▼
Hooks (src/hooks) — React state + error handling around the repos
   │
   ▼
Repos (src/storage) — localStorage persistence, validation, safe read/write
   │
   ▼
Domain logic (src/scheduling, src/statistics, src/utils) — pure functions,
no I/O, fully unit-testable in isolation
```

- **`src/types`** — the domain model (`StudySession`, `Flashcard`,
  `ReviewLogEntry`, `AppData`). This is the single source of truth for what
  gets persisted; a change here is a schema change.
- **`src/storage`** — `localStorageClient.ts` is a defensive wrapper around
  `window.localStorage` that never lets a corrupted or missing value crash
  the app (invalid JSON or a value failing its type guard just falls back to
  a safe default). `studySessionsRepo.ts`, `flashcardsRepo.ts`, and
  `reviewLogRepo.ts` are small CRUD repositories on top of it.
  `backupRepo.ts` handles export/import, including schema-version and
  shape validation for imported files.
- **`src/scheduling`** — the spaced-repetition engine. `sm2.ts` is the pure
  SM-2 ease-factor/interval algorithm; `scheduler.ts` applies it to a
  `Flashcard` and produces a review-log entry; `reviewQueue.ts` manages the
  in-session review queue (so grading "Again" brings a card back later in
  the *same* session, independent of its longer-term due date).
- **`src/statistics`** — `streaks.ts` (current/longest streak from the set
  of "active" calendar days) and `aggregates.ts` (totals, weekly/monthly/
  yearly minutes, topic breakdown, current focus topic, daily series for the
  activity chart).
- **`src/hooks`** — `useStudySessions` / `useFlashcards` wrap the repos in
  React state and route storage failures to `useToast` instead of throwing;
  `useHashRoute` is a ~20-line hash router (a routing library would be dead
  weight for six fixed pages); `useKeyboardShortcut` powers the space-to-
  reveal shortcut in flashcard review.
- **`src/components`** and **`src/pages`** — presentation, grouped by
  feature (`dashboard`, `studylog`, `flashcards`, `statistics`, `search`,
  `common`, `layout`). Every component has a co-located `*.module.css` file
  scoped by Vite's built-in CSS Modules support — no CSS-in-JS, no utility
  framework, just plain CSS with a shared set of primitives
  (`src/styles/primitives.css`) for buttons, fields, cards, and badges.

### Design system

Dark, minimal, mobile-first, capped at a 700px reading width. Colors,
spacing, and typography are CSS custom properties in
`src/styles/variables.css`. Headings use Young Serif, body text IBM Plex
Sans, and numbers/dates/durations IBM Plex Mono (self-hosted as WOFF2 under
`public/fonts` — no runtime dependency on Google Fonts, so the type still
loads offline).

### Progressive Web App

`public/manifest.json` and a hand-written `public/sw.js` (no Workbox) make
Cognita installable. The service worker precaches the app shell (HTML,
manifest, icons, fonts) on install, and opportunistically caches hashed
build assets the first time they're fetched (stale-while-revalidate), so
after one online visit the whole app works with no network at all.

## Folder structure

```
public/
  fonts/            self-hosted WOFF2 files
  icons/            PWA icons (generated, see below)
  manifest.json
  sw.js             hand-written service worker
src/
  components/       presentational components, grouped by feature
  context/          ToastContext (app-wide notifications)
  hooks/            React state layered on top of the repos
  pages/            one file per top-level route
  scheduling/        SM-2 algorithm, scheduler, review queue
  statistics/       streaks and aggregate calculations
  storage/          localStorage client + repositories + backup
  styles/           design tokens, global styles, shared primitives, fonts
  types/            domain model
  utils/            date, id, search, grouping, validation helpers
  test/             Vitest setup
```

## Development

Requires Node 18+.

```bash
npm install
npm run dev        # start the Vite dev server
npm run build       # type-check, then produce a production build in dist/
npm run preview     # serve the production build locally
```

## Testing

```bash
npm test            # run the full Vitest suite once
npm run test:watch  # watch mode
```

The suite (Vitest + Testing Library + jsdom) covers, among other things:

- SM-2 scheduling: ease-factor updates, Again/Hard/Good/Easy interval
  progression, and requeue behavior within a review session
- Streak and statistics calculations (weekly/monthly totals, topic
  breakdown, current-focus derivation)
- Persistence: repositories round-tripping through `localStorage`,
  including corrupted-data fallback behavior
- Backup export/import, including rejecting invalid JSON, the wrong shape,
  and backups from a newer schema version
- Global search across sessions and flashcards
- Full page-level flows: logging/editing/deleting a study session, adding
  and reviewing flashcards end-to-end, importing a backup through the UI
- Graceful service-worker registration when the API is unavailable

## Backup

Cognita stores everything locally, so backing up regularly matters. Go to
**Settings**:

- **Export** downloads a single `cognita-backup-YYYY-MM-DD.json` file
  containing every study session, flashcard, and review log.
- **Import** reads a backup file back in. You're shown what it contains
  (session/flashcard counts, export date) and asked to confirm before it
  **replaces** all data currently stored in the browser. Malformed JSON, a
  file that doesn't match the backup schema, or a backup from a newer,
  incompatible version are all rejected with a clear message — nothing is
  ever partially imported.

## Deployment

Cognita is a static site — the production build in `dist/` can be hosted
anywhere that serves static files (Vercel, Netlify, GitHub Pages, or just a
local file server). There is no server-side code and nothing to configure
beyond serving `dist/` with `index.html` as the SPA fallback for unknown
paths (the app itself only ever uses hash-based routes, e.g. `/#/statistics`,
so no rewrite rules are actually required).

## Future roadmap

The current version deliberately does **not** implement the following, but
the architecture is laid out so each can be added later without a rewrite:

- **PDF / document library** — a new `src/storage/documentsRepo.ts` alongside
  the existing repos, with its own entry in `src/types`.
- **EPUB support, OCR** — additional import pipelines feeding the same
  document model.
- **AI chat with documents, AI tutors, AI-generated quizzes, local LLM
  integration** — the storage layer already isolates all persistence behind
  repository functions, so an AI layer would sit above them (reading
  sessions/flashcards/documents) without touching how data is stored.
- **Knowledge graph, semantic search** — additive indexes over the existing
  `StudySession` / `Flashcard` / document records; `src/utils/search.ts` is
  already isolated from the UI, so a smarter search backend is a drop-in
  replacement.
- **Document annotations** — a new record type referencing a document by id,
  following the same repo/hook pattern as flashcards.
- **Reading goals, calendar planning** — new aggregate functions in
  `src/statistics`, following the existing pattern of pure, testable
  functions over the session/flashcard arrays.
- **Cross-device sync, mobile companion app** — the storage layer is the
  seam: repositories currently read/write `localStorage` directly, but
  every call is already routed through a small, swappable interface
  (`readJSON`/`writeJSON` in `src/storage/localStorageClient.ts`), so a
  sync-capable backend could be introduced behind that same interface
  without changing any UI or domain code.

## License

Personal project — not published or licensed for reuse.
