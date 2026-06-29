// ============================================================================
//  GuidesIndex.jsx — liste des guides (/guides).
// ============================================================================

import { Head } from 'vite-react-ssg'
import { Link } from 'react-router-dom'
import { Clock, ArrowRight, Newspaper } from 'lucide-react'
import { GUIDES } from '../data/guides'

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function GuidesIndex() {
  return (
    <>
      <Head>
        <title>Guides pour investir en France : PEA, ETF, fiscalité | Conseils gratuits</title>
        <meta
          name="description"
          content="Tous nos guides pour investir efficacement en France : choisir son PEA, comprendre la fiscalité, investir en DCA sur ETF, PEA ou CTO… Conseils clairs et gratuits."
        />
        <link rel="canonical" href="https://simulateur-portefeuille.fr/guides" />
      </Head>

      <header className="card bg-gradient-to-br from-navy-800 to-navy-950 text-white ring-navy-800">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-navy-200">
          <Newspaper size={16} /> Guides
        </div>
        <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">
          Apprendre à investir efficacement en France
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-navy-100 md:text-base">
          Des guides clairs et concrets pour choisir la bonne enveloppe (PEA, CTO, assurance-vie),
          la bonne stratégie et les bons outils — sans jargon.
        </p>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {GUIDES.map((g) => (
          <Link key={g.slug} to={`/guides/${g.slug}`} className="card group flex flex-col">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-[11px] font-bold text-navy-700 dark:bg-navy-800 dark:text-navy-200">
                {g.category}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-navy-400">
                <Clock size={12} /> {g.readingTime} min
              </span>
            </div>
            <h2 className="mt-3 text-lg font-bold text-navy-800 group-hover:text-navy-600 dark:text-white">
              {g.title}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-600 dark:text-navy-300">
              {g.excerpt}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-navy-400">{formatDate(g.date)}</span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 group-hover:gap-2 dark:text-navy-200">
                Lire <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </section>

    </>
  )
}
