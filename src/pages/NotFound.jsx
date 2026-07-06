// ============================================================================
//  NotFound.jsx — page 404.
//  Pré-rendue en HTML statique (route `/404` → dist/404.html) : Vercel la sert
//  avec un vrai statut HTTP 404 pour toute URL inconnue. `noindex` empêche son
//  indexation. La même vue s'affiche aussi côté client via la route catch-all.
// ============================================================================

import { Link } from 'react-router-dom'
import { Compass, Home, LineChart, Newspaper } from 'lucide-react'
import Seo from '../components/Seo'

const SUGGESTIONS = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/simulateur-debutant', label: 'Simulateur débutant', icon: LineChart },
  { to: '/guides', label: 'Guides', icon: Newspaper },
]

export default function NotFound() {
  return (
    <>
      <Seo
        title="Page introuvable (404)"
        description="Cette page n'existe pas ou a été déplacée. Retrouvez nos simulateurs, comparateurs et guides pour investir en France."
        noindex
      />

      <section className="mx-auto max-w-xl py-12 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-100 text-navy-600 dark:bg-navy-800 dark:text-navy-300">
          <Compass size={28} />
        </div>
        <p className="text-sm font-bold uppercase tracking-wide text-navy-400">Erreur 404</p>
        <h1 className="mt-1 text-2xl font-extrabold text-navy-800 dark:text-white md:text-3xl">
          Cette page n'existe pas
        </h1>
        <p className="mt-3 text-navy-500 dark:text-navy-400">
          Le lien est peut-être cassé ou la page a été déplacée. Repartez d'un bon pied :
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {SUGGESTIONS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="card flex flex-col items-center gap-2 py-5 text-sm font-semibold text-navy-700 transition hover:border-navy-300 hover:shadow-md dark:text-navy-200"
            >
              <Icon size={22} className="text-navy-500 dark:text-navy-300" />
              {label}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
