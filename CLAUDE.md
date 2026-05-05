# CLAUDE.md

Guidance for Claude Code working in this repo. Conventions, gotchas, and "don't change this without thinking" notes.

## What this project is

A small demo app: fetches Studio Ghibli films from `https://ghibliapi.vercel.app/films`, displays them as cards, lets the user favourite/unfavourite them with Zustand-backed `localStorage` persistence. Intentionally minimal — it's a teaching example for a deliberately classic stack (React 18 + Tailwind 3), not a production app.

See [README.md](README.md) for the user-facing description.

## Pinned versions — do not bump without asking

| Package      | Pin     | Reason                                                                 |
| ------------ | ------- | ---------------------------------------------------------------------- |
| react / react-dom | `^18.3.1` | Project specifically demos React 18; `create-vite` defaults to 19. |
| @types/react / @types/react-dom | `^18.3.x` | Must match the React major.                            |
| tailwindcss  | `^3.4.x` | Tailwind 4 has a completely different config + PostCSS pipeline. The `tailwind.config.js`, `postcss.config.js`, and `@tailwind` directives in `src/index.css` only work for v3. |

Other deps (Vite 8, TS 6, Zustand 5, `@vitejs/plugin-react` 6) are whatever `create-vite` scaffolded — bumping these is fine if needed.

## Stack quick reference

- **Build:** Vite 8 (`npm run dev` → http://localhost:5173, `npm run build`)
- **State:** Zustand 5 with `persist` middleware
- **Styling:** Tailwind 3 utility classes only — no CSS modules, no styled-components
- **Network:** native `fetch` — **do not add axios** or another HTTP client
- **Types:** TypeScript strict; one root tsconfig with project refs to `tsconfig.app.json` and `tsconfig.node.json`

## Project layout

```
src/
├── App.tsx                # Layout, search, favourites toggle, grid
├── main.tsx               # React 18 createRoot
├── index.css              # @tailwind directives only
├── components/
│   └── FilmCard.tsx       # Single film card
└── store/
    └── useFilmStore.ts    # The single Zustand store
```

There is **one** Zustand store. Don't split it into multiple stores unless asked — the whole point is to demo Zustand's "one global store, selector subscriptions" pattern.

## Store conventions

- **Selector subscriptions**: components subscribe to the smallest slice they need (e.g. `useFilmStore((s) => s.favourites[id])`). This keeps re-renders local. Preserve this pattern when adding components.
- **State machine for fetches**: `status: 'idle' | 'loading' | 'success' | 'error'`, plus `error: string | null`. Don't replace this with a boolean `isLoading`.
- **`persist` whitelist** (`partialize`): persist `favourites`, `films`, and `lastFetchedAt`. **Do not persist** `status` or `error` — a previous session's `'loading'` would rehydrate and the load-guard (`if (status === 'loading') return`) would block the next fetch.
- **TTL caching**: `fetchFilms` skips the network when cached films are younger than `CACHE_TTL_MS` (currently 1 day). It accepts `{ force: true }` to bypass — used by the Retry button.
- **Favourites store full `Film` objects**, not just ids, so the "favourites only" view renders correctly before the `films` fetch resolves.

## Code style

- No comments unless the *why* is non-obvious (an invariant, a workaround, a constraint not visible in the code). Don't restate what the code does.
- No README/CLAUDE updates for trivial changes.
- Don't add error handling for impossible cases. The fetch try/catch handles real network/parse failures; that's the boundary.
- Tailwind classes inline; don't extract one-off `className` strings into constants.

## API notes

- Ghibli API: `https://ghibliapi.vercel.app/films` — has CORS enabled for `localhost:5173`, returns 22 films.
- Earlier iteration used AmiiboAPI; it was unreliable (intermittent CORS / connection timeouts). If reverting or cross-testing, expect to need a Vite proxy.

## Dev verification

After non-trivial changes, run:

```bash
npm run build    # tsc -b + vite build — type errors surface here
```

For UI changes, the dev server should already be running at http://localhost:5173 — HMR picks up most edits. If something looks broken, hard-reload the page (Cmd+Shift+R) to bust cached modules and the persisted store.

To reset persisted state during testing: `localStorage.removeItem('ghibli-favourites')` in the browser console, then reload.
