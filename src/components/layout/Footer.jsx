// ============================================================================
//  Footer.jsx — pied de page : disclaimer légal + liens
// ============================================================================

import { Link } from 'react-router-dom'

export default function Footer({ source, updatedAt }) {
  const updatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : null
  return (
    <footer className="mt-10 border-t border-navy-100 pt-6 dark:border-navy-800">
      <div className="grid gap-6 px-1 py-6 text-sm text-navy-500 md:grid-cols-3">
        <div>
          <h3 className="mb-2 font-bold text-navy-700 dark:text-navy-200">Simulateur de Portefeuille FR</h3>
          <p className="leading-relaxed">
            Backtestez gratuitement vos stratégies d'investissement (DCA, Value Averaging, Lump Sum…) sur
            PEA, CTO ou Assurance-vie. Outil pédagogique pour particuliers français.
          </p>
          <p className="mt-2 text-xs">
            Données :{' '}
            <span className="font-semibold">
              {source === 'real'
                ? 'historique réel mensuel (Yahoo Finance) + cours récents (Marketstack)'
                : source === 'live'
                  ? 'historique de démonstration + cours réels (Marketstack)'
                  : 'jeu de démonstration local'}
            </span>
            {(source === 'real' || source === 'live') && updatedLabel && (
              <span className="block text-navy-400">Cours actualisés le {updatedLabel}.</span>
            )}
          </p>
        </div>

        <div>
          <h3 className="mb-2 font-bold text-navy-700 dark:text-navy-200">Navigation</h3>
          <ul className="space-y-1">
            {[
              ['/', 'Accueil'],
              ['/simulateur-debutant', 'Simulateur débutant'],
              ['/simulateur', 'Simulateur avancé'],
              ['/comparateur', 'Comparateur d\'enveloppes'],
              ['/retraite', 'Objectif retraite'],
              ['/monte-carlo', 'Monte Carlo'],
              ['/guides', 'Guides'],
              ['/glossaire', 'Glossaire'],
              ['/confidentialite', 'Confidentialité'],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="transition hover:text-navy-800 dark:hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-2 font-bold text-navy-700 dark:text-navy-200">Avertissement</h3>
          <p className="leading-relaxed">
            Les performances passées ne préjugent pas des performances futures. Les données peuvent être
            simulées à des fins de démonstration.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-navy-100/60 px-4 py-3 text-center text-xs font-medium text-navy-600 dark:bg-navy-900 dark:text-navy-400">
        ⚠️ Ce site est à but éducatif uniquement et ne constitue pas un conseil en investissement.
      </div>

      <p className="py-4 text-center text-xs text-navy-400">
        © {2026} Simulateur de Portefeuille FR — Tous droits réservés.
      </p>
    </footer>
  )
}
