import { useFilmStore, type Film } from '../store/useFilmStore'

type Props = { film: Film }

export function FilmCard({ film }: Props) {
  const isFav = useFilmStore((s) => Boolean(s.favourites[film.id]))
  const toggle = useFilmStore((s) => s.toggleFavourite)

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <img
        src={film.image}
        alt={film.title}
        loading="lazy"
        className="aspect-[2/3] w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-slate-800">{film.title}</h3>
        <p className="text-xs italic text-slate-500">
          {film.original_title_romanised} · {film.release_date}
        </p>
        <p className="mt-2 line-clamp-3 text-sm text-slate-600">{film.description}</p>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>Dir. {film.director}</span>
          <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800">
            ★ {film.rt_score}
          </span>
        </div>
        <div className="mt-auto pt-3">
          <button
            type="button"
            onClick={() => toggle(film)}
            className={
              'w-full rounded-md px-3 py-1.5 text-sm font-medium transition ' +
              (isFav
                ? 'bg-pink-500 text-white hover:bg-pink-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
            }
          >
            {isFav ? '♥ Favourited' : '♡ Favourite'}
          </button>
        </div>
      </div>
    </article>
  )
}
