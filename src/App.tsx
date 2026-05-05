import { useEffect, useMemo, useState } from 'react'
import { FilmCard } from './components/FilmCard'
import { useFilmStore } from './store/useFilmStore'

function App() {
  const films = useFilmStore((s) => s.films)
  const status = useFilmStore((s) => s.status)
  const error = useFilmStore((s) => s.error)
  const favourites = useFilmStore((s) => s.favourites)
  const fetchFilms = useFilmStore((s) => s.fetchFilms)

  const [query, setQuery] = useState('')
  const [showFavsOnly, setShowFavsOnly] = useState(false)

  useEffect(() => {
    fetchFilms()
  }, [fetchFilms])

  const filtered = useMemo(() => {
    const source = showFavsOnly ? Object.values(favourites) : films
    const q = query.trim().toLowerCase()
    if (!q) return source
    return source.filter(
      (f) =>
        f.title.toLowerCase().includes(q) ||
        f.original_title_romanised.toLowerCase().includes(q) ||
        f.director.toLowerCase().includes(q),
    )
  }, [films, favourites, query, showFavsOnly])

  const favCount = Object.keys(favourites).length

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Studio Ghibli Films</h1>
            <p className="text-sm text-slate-500">
              Powered by Ghibli API · Zustand · React 18 · Tailwind 3
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or director…"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:w-72"
            />
            <button
              type="button"
              onClick={() => setShowFavsOnly((v) => !v)}
              className={
                'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition ' +
                (showFavsOnly
                  ? 'bg-pink-500 text-white hover:bg-pink-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
              }
            >
              {showFavsOnly ? 'Showing favourites' : 'Show favourites'} ({favCount})
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {status === 'loading' && (
          <p className="py-12 text-center text-slate-500">Loading films…</p>
        )}

        {status === 'error' && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-medium">Failed to load films.</p>
            <p className="text-sm">{error}</p>
            <button
              type="button"
              onClick={() => fetchFilms({ force: true })}
              className="mt-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {status === 'success' && filtered.length === 0 && (
          <p className="py-12 text-center text-slate-500">
            {showFavsOnly ? 'No favourites yet — heart a few!' : 'No films match your search.'}
          </p>
        )}

        {status === 'success' && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((f) => (
              <FilmCard key={f.id} film={f} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
