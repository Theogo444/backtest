// ============================================================================
//  Footer.jsx — pied de page : marque, fraîcheur des données de marché,
//  liens internes (outils / ressources) et mentions légales.
// ============================================================================

import { Link } from 'react-router-dom'
import Logo from './Logo'

const TOOL_LINKS = [
  { to: '/simulateur-debutant', label: 'Simulateur débutant' },
  { to: '/simulateur', label: 'Simulateur avancé' },
  { to: '/comparateur', label: "Comparateur d'enveloppes" },
  { to: '/comparatif-courtiers', label: 'Comparatif courtiers' },
  { to: '/retraite', label: 'Objectif retraite' },
  { to: '/monte-carlo', label: 'Monte Carlo' },
]

const RESOURCE_LINKS = [
  { to: '/guides', label: 'Guides pour investir' },
  { to: '/glossaire', label: 'Glossaire' },
  { to: '/faq', label: 'FAQ' },
  { to: '/confidentialite', label: 'Politique de confidentialité' },
]

function FooterCol({ title, links }) {
  return (
    <nav aria-label={title}>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-navy-400">{title}</h3>
      <ul className="space-y-1.5 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="text-navy-600 transition hover:text-navy-900 dark:text-navy-300 dark:hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function Footer({ source, updatedAt }) {
  // Fraîcheur des données de marché (transparence : l'utilisateur sait sur
  // quoi reposent ses simulations).
  const dataLine =
    source === 'demo'
      ? 'Données de démonstration (séries synthétiques)'
      : updatedAt
        ? `Données de marché réelles · mises à jour le ${new Date(updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
        : 'Données de marché réelles (~25 ans d\'historique)'

  return (
    <footer className="mt-10 border-t border-navy-100 pt-8 dark:border-navy-800">
      <div className="grid gap-8 px-1 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Link to="/" className="inline-flex" aria-label="Sereo — accueil">
            <Logo variant="compact" size="sm" />
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-navy-500">
            Simulez, comparez et apprenez avant d'investir : PEA, compte-titres et assurance-vie,
            testés sur des données de marché réelles.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-navy-400">
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
            {dataLine}
          </p>
        </div>
        <FooterCol title="Outils" links={TOOL_LINKS} />
        <FooterCol title="Ressources" links={RESOURCE_LINKS} />
      </div>

      <div className="mt-8 grid gap-6 border-t border-navy-100 px-1 pt-6 text-xs leading-relaxed text-navy-400 dark:border-navy-800 md:grid-cols-2">
        <p>
          Vos simulations restent dans votre navigateur et ne sont pas envoyées sur un serveur. Si
          vous nous laissez votre email, il sert uniquement à vous envoyer nos ressources, avec
          votre accord.{' '}
          <Link
            to="/confidentialite"
            className="font-semibold text-navy-500 transition hover:text-navy-800 dark:hover:text-navy-200"
          >
            En savoir plus →
          </Link>
        </p>
        <p>
          Ce site est un outil pédagogique et de simulation. Il ne constitue pas un conseil en
          investissement ni une recommandation d'achat ou de vente. Les performances passées ne
          préjugent pas des performances futures. Pour une décision adaptée à votre situation,
          consultez un conseiller financier agréé.
        </p>
      </div>

      <p className="py-4 text-center text-xs text-navy-400">
        © 2026 Sereo — Simulateur de portefeuille — Tous droits réservés.
      </p>
    </footer>
  )
}
