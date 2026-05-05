# Ghibli Favourites

A small demo app that fetches Studio Ghibli films from the [Ghibli API](https://ghibliapi.vercel.app/) and lets you favourite them. Built to demonstrate **Zustand** for state management on top of a deliberately classic React 18 + Tailwind 3 stack.

## Stack

| Tool         | Version | Notes                                                  |
| ------------ | ------- | ------------------------------------------------------ |
| React        | 18.3.x  | Pinned — `create-vite` now defaults to React 19        |
| Vite         | 8.x     | Latest from `npm create vite@latest`                   |
| TypeScript   | 6.x     | Scaffolded default                                     |
| Tailwind CSS | 3.4.x   | Pinned — Tailwind 4 has a different config + PostCSS pipeline |
| Zustand      | 5.x     | With `persist` middleware for favourites               |

Data is fetched with the native `fetch` API — no `axios`.

## Features

- Lists all 22 Ghibli films with poster, director, release year, and RT score.
- Search by title, romanised title, or director.
- Favourite / unfavourite any film with one click.
- Toggle a "favourites only" view.
- Favourites persist across reloads via `localStorage` (Zustand `persist` middleware).
- Films are cached for 24 hours — reloads within that window render instantly from `localStorage` with no network call. The Retry button on the error state forces a fresh fetch regardless of cache age.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle into dist/
npm run preview  # serve the production build locally
```

## Project layout

```
src/
├── App.tsx                    # Layout, search input, favourites toggle, grid
├── main.tsx                   # React 18 createRoot entry
├── index.css                  # Tailwind directives
├── components/
│   └── FilmCard.tsx           # Single film card + favourite button
└── store/
    └── useFilmStore.ts        # Zustand store: films, status, favourites, lastFetchedAt, fetchFilms, toggleFavourite
```

## How the Zustand store works

The store holds these slices of state:

- `films` — the array fetched from the API.
- `lastFetchedAt` — millisecond timestamp of the last successful fetch, used for TTL caching.
- `status` / `error` — a small state machine (`idle` → `loading` → `success` | `error`) so the UI can render loading and error states cleanly.
- `favourites` — a `Record<id, Film>` keyed by the film's UUID. Storing the full film (rather than just the id) means the "favourites only" view still works after a hard reload, before the films list has been re-fetched.

The `persist` middleware whitelists `favourites`, `films`, and `lastFetchedAt` (via `partialize`). `status` and `error` are deliberately excluded so a previous session's `'loading'` state doesn't rehydrate and block the next fetch.

`fetchFilms` checks the cache before hitting the network: if `films` are present and `Date.now() - lastFetchedAt < CACHE_TTL_MS` (24h by default), it short-circuits and just flips `status` to `'success'`. Pass `{ force: true }` to bypass — the Retry button does this on errors. To change the TTL, edit `CACHE_TTL_MS` in `src/store/useFilmStore.ts`.

Components subscribe to the smallest slice they need, e.g.:

```ts
const isFav = useFilmStore((s) => Boolean(s.favourites[film.id]))
const toggle = useFilmStore((s) => s.toggleFavourite)
```

This means toggling one card's favourite only re-renders that card, not the whole grid.

## Notes on the React 18 pin

`create-vite` now scaffolds with React 19 by default. To pin to 18.x, the following were overridden in `package.json` after scaffolding:

```jsonc
"dependencies": {
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
},
"devDependencies": {
  "@types/react": "^18.3.18",
  "@types/react-dom": "^18.3.5"
}
```

Then `npm install` was re-run. Everything else from the scaffold (`@vitejs/plugin-react` 6, Vite 8) works unchanged with React 18.
