// ============================================================================
//  Glossary.jsx — glossaire au format accordéon (FAQ) + schema.org FAQPage
// ============================================================================

import { useState } from 'react'
import { Head } from 'vite-react-ssg'
import { BookOpen, ChevronDown, Search } from 'lucide-react'

// Définitions pédagogiques (terme → définition)
const TERMS = [
  {
    term: 'DCA (Dollar Cost Averaging)',
    def: "Stratégie consistant à investir un montant fixe à intervalles réguliers (par exemple 200 € chaque mois), quel que soit le niveau du marché. Elle lisse le prix d'achat moyen et réduit le risque de mal choisir son point d'entrée.",
  },
  {
    term: 'Value Averaging',
    def: "Variante du DCA où l'on ajuste les versements pour que la valeur du portefeuille suive une courbe cible prédéfinie (ex. +500 €/mois). On investit davantage quand le marché baisse et moins (voire on vend) quand il dépasse l'objectif.",
  },
  {
    term: 'PEA (Plan d\'Épargne en Actions)',
    def: "Enveloppe fiscale française dédiée aux actions européennes. Après 5 ans de détention, les plus-values sont exonérées d'impôt sur le revenu (seuls les prélèvements sociaux de 17,2 % restent dus). Plafond de versements : 150 000 €.",
  },
  {
    term: 'CTO (Compte-Titres Ordinaire)',
    def: "Compte d'investissement sans avantage fiscal mais sans contrainte (tous types d'actifs, pas de plafond). Les plus-values sont imposées à la flat tax (PFU) de 30 %, ou au barème progressif de l'impôt sur le revenu sur option.",
  },
  {
    term: 'Assurance-vie',
    def: "Enveloppe d'épargne très souple. Après 8 ans, elle bénéficie d'un abattement annuel sur les gains (4 600 € pour une personne seule, 9 200 € pour un couple) et d'un taux d'imposition réduit de 7,5 %. Outil privilégié pour la transmission.",
  },
  {
    term: 'ETF (Tracker)',
    def: "Fonds coté en bourse qui réplique la performance d'un indice (ex. MSCI World, S&P 500). Les ETF offrent une diversification immédiate à très faibles frais, idéaux pour une stratégie passive.",
  },
  {
    term: 'CAGR (Taux de croissance annuel composé)',
    def: "Rendement annuel moyen lissé d'un investissement sur plusieurs années, en tenant compte des intérêts composés. Un CAGR de 7 % signifie que le capital a crû comme s'il avait progressé de 7 % chaque année.",
  },
  {
    term: 'Max Drawdown',
    def: "Plus forte baisse subie par un portefeuille entre un sommet et le creux qui suit. C'est une mesure du risque « ressenti » : un max drawdown de −50 % signifie que le capital a perdu la moitié de sa valeur à un moment.",
  },
  {
    term: 'Ratio de Sharpe',
    def: "Mesure du rendement obtenu par unité de risque. Il rapporte le rendement excédentaire (au-delà d'un placement sans risque comme le Livret A) à la volatilité. Plus il est élevé, meilleur est le couple rendement/risque.",
  },
  {
    term: 'Volatilité',
    def: "Amplitude des variations de prix d'un actif, généralement exprimée en pourcentage annualisé. Une forte volatilité signifie des fluctuations importantes, donc un risque plus élevé (mais potentiellement plus de rendement).",
  },
  {
    term: 'Dividende',
    def: "Part des bénéfices qu'une entreprise reverse à ses actionnaires. Réinvestis, les dividendes contribuent fortement à la performance long terme grâce aux intérêts composés.",
  },
  {
    term: 'Rééquilibrage',
    def: "Action de ramener périodiquement un portefeuille à son allocation cible en vendant les actifs qui ont surperformé pour racheter ceux qui ont sous-performé. Cela maintient le niveau de risque et discipline l'investisseur.",
  },
  {
    term: 'Lump Sum',
    def: "Investissement de la totalité du capital disponible en une seule fois. Historiquement, le lump sum bat souvent le DCA car le marché monte plus souvent qu'il ne baisse, mais il expose davantage au risque de timing.",
  },
  {
    term: 'Momentum',
    def: "Stratégie misant sur la persistance des tendances : on achète les actifs qui ont le mieux performé récemment, en partant du principe qu'ils continueront sur leur lancée à court/moyen terme.",
  },
  {
    term: 'Flat Tax',
    def: "Terme courant désignant le Prélèvement Forfaitaire Unique (PFU) de 30 % appliqué aux revenus du capital (plus-values, dividendes, intérêts) : 12,8 % d'impôt sur le revenu + 17,2 % de prélèvements sociaux.",
  },
  {
    term: 'PFU (Prélèvement Forfaitaire Unique)',
    def: "Régime d'imposition forfaitaire des revenus mobiliers à 30 % (la « flat tax »). Le contribuable peut renoncer au PFU pour opter pour le barème progressif de l'impôt si c'est plus avantageux.",
  },
  {
    term: 'Prélèvements sociaux',
    def: "Contributions sociales (CSG, CRDS, etc.) prélevées sur les revenus du capital, au taux global de 17,2 %. Elles s'appliquent même lorsque les plus-values sont exonérées d'impôt sur le revenu (cas du PEA de plus de 5 ans).",
  },
]

export default function Glossary() {
  const [open, setOpen] = useState(0)
  const [query, setQuery] = useState('')

  // Balisage schema.org FAQPage — via <Head> pour être présent dans le HTML
  // pré-rendu (les crawlers le voient sans exécuter le JavaScript).
  const faqSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: TERMS.map((t) => ({
      '@type': 'Question',
      name: t.term,
      acceptedAnswer: { '@type': 'Answer', text: t.def },
    })),
  })

  const filtered = TERMS.filter(
    (t) =>
      query.trim() === '' ||
      t.term.toLowerCase().includes(query.toLowerCase()) ||
      t.def.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <section>
      <Head>
        <script type="application/ld+json">{faqSchema}</script>
      </Head>
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-navy-800 dark:text-white md:text-3xl">
          <BookOpen size={26} /> Glossaire de l'investisseur
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          Tous les termes essentiels de l'investissement et de la fiscalité française, expliqués simplement.
        </p>
      </header>

      {/* Recherche */}
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-navy-200 bg-white px-3 py-2 dark:border-navy-700 dark:bg-navy-800 md:max-w-md">
        <Search size={16} className="text-navy-400" />
        <input
          type="text"
          value={query}
          placeholder="Rechercher un terme…"
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {/* Accordéon FAQ */}
      <div className="space-y-2">
        {filtered.map((t) => {
          const idx = TERMS.indexOf(t)
          const isOpen = open === idx
          return (
            <div key={t.term} className="card !p-0 overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="font-semibold text-navy-800 dark:text-white">{t.term}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-navy-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isOpen && (
                <div className="border-t border-navy-100 px-4 py-3 text-sm leading-relaxed text-navy-600 dark:border-navy-800 dark:text-navy-300">
                  {t.def}
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && <p className="text-sm text-navy-400">Aucun terme trouvé pour « {query} ».</p>}
      </div>
    </section>
  )
}
