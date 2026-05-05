import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Film = {
  id: string
  title: string
  original_title: string
  original_title_romanised: string
  image: string
  movie_banner: string
  description: string
  director: string
  producer: string
  release_date: string
  running_time: string
  rt_score: string
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 1 day

type FilmStore = {
  films: Film[]
  lastFetchedAt: number | null
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
  favourites: Record<string, Film>
  fetchFilms: (opts?: { force?: boolean }) => Promise<void>
  toggleFavourite: (film: Film) => void
}

export const useFilmStore = create<FilmStore>()(
  persist(
    (set, get) => ({
      films: [],
      lastFetchedAt: null,
      status: 'idle',
      error: null,
      favourites: {},

      fetchFilms: async ({ force = false } = {}) => {
        const { status, films, lastFetchedAt } = get()
        if (status === 'loading') return

        const isFresh =
          !force &&
          films.length > 0 &&
          lastFetchedAt !== null &&
          Date.now() - lastFetchedAt < CACHE_TTL_MS

        if (isFresh) {
          if (status !== 'success') set({ status: 'success' })
          return
        }

        set({ status: 'loading', error: null })
        try {
          const res = await fetch('https://ghibliapi.vercel.app/films')
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = (await res.json()) as Film[]
          set({ films: data, status: 'success', lastFetchedAt: Date.now() })
        } catch (err) {
          set({
            status: 'error',
            error: err instanceof Error ? err.message : 'Unknown error',
          })
        }
      },

      toggleFavourite: (film) => {
        set((state) => {
          const next = { ...state.favourites }
          if (next[film.id]) delete next[film.id]
          else next[film.id] = film
          return { favourites: next }
        })
      },
    }),
    {
      name: 'ghibli-favourites',
      partialize: (state) => ({
        favourites: state.favourites,
        films: state.films,
        lastFetchedAt: state.lastFetchedAt,
      }),
    },
  ),
)
