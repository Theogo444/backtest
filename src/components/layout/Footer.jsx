// ============================================================================
//  Footer.jsx — pied de page : disclaimer légal + liens
// ============================================================================

import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-navy-100 pt-6 dark:border-navy-800">
      <div className="grid gap-6 px-1 py-6 text-sm text-navy-500 md:grid-cols-2">
        <div>
          <h3 className="mb-2 font-bold text-navy-700 dark:text-navy-200">Confidentialité</h3>
          <p className="leading-relaxed">
            Vos simulations restent dans votre navigateur et ne sont pas envoyées sur un serveur. Si vous
            nous laissez votre email, il sert uniquement à vous envoyer nos ressources, avec votre accord.
          </p>
          <Link
            to="/confidentialite"
            className="mt-2 inline-block font-semibold text-navy-700 transition hover:text-navy-900 dark:text-navy-200 dark:hover:text-white"
          >
            Lire la politique de confidentialité →
          </Link>
        </div>

        <div>
          <h3 className="mb-2 font-bold text-navy-700 dark:text-navy-200">Aucun conseil en investissement</h3>
          <p className="leading-relaxed">
            Ce site est un outil pédagogique et de simulation. Il ne constitue pas un conseil en
            investissement ni une recommandation d'achat ou de vente. Les performances passées ne préjugent
            pas des performances futures. Pour une décision adaptée à votre situation, consultez un
            conseiller financier agréé.
          </p>
        </div>
      </div>

      <p className="py-4 text-center text-xs text-navy-400">
        © {2026} Sereo — Simulateur de portefeuille FR — Tous droits réservés.
      </p>
    </footer>
  )
}
