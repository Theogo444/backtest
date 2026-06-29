// ============================================================================
//  Faq.jsx — foire aux questions (accordéon par thème) + schema.org FAQPage
//  Beaucoup de questions classées par catégorie, avec recherche et filtre.
// ============================================================================

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  HelpCircle, ChevronDown, Search, Rocket, Scale, Wallet, LineChart,
  Sparkles, Landmark, ShieldCheck, ArrowRight,
} from 'lucide-react'

// Catégories de questions. Les réponses sont du texte simple (réutilisé dans
// le balisage FAQPage pour le SEO).
const CATEGORIES = [
  {
    id: 'debuter',
    label: 'Débuter en bourse',
    icon: Rocket,
    questions: [
      {
        q: "Faut-il être riche pour commencer à investir ?",
        a: "Non. On peut débuter avec quelques dizaines d'euros par mois. La plupart des courtiers ne fixent aucun minimum, et les ETF permettent d'être diversifié dès le premier euro. Ce qui compte le plus n'est pas le montant de départ, mais la régularité et la durée : investir un peu chaque mois pendant 20 ans est bien plus efficace qu'attendre d'avoir une grosse somme.",
      },
      {
        q: "Avec combien d'argent peut-on débuter ?",
        a: "50 à 100 € par mois suffisent pour se lancer sérieusement. L'essentiel est de n'investir que de l'argent dont vous n'aurez pas besoin avant plusieurs années, et de toujours garder à côté une épargne de précaution (3 à 6 mois de dépenses) sur un livret disponible.",
      },
      {
        q: "Quel est le meilleur placement pour un débutant ?",
        a: "Pour la plupart des débutants, un ETF « Monde » (type MSCI World) logé dans un PEA est un excellent point de départ : il investit d'un coup dans plus de 1 500 grandes entreprises mondiales, à très faibles frais, et bénéficie de la fiscalité avantageuse du PEA. C'est simple, diversifié et peu coûteux.",
      },
      {
        q: "Peut-on tout perdre en bourse ?",
        a: "Avec un ETF diversifié sur des milliers d'entreprises, le risque de tout perdre est quasi nul : il faudrait que l'économie mondiale entière disparaisse. En revanche, la valeur fluctue : il est normal de voir son portefeuille baisser de 30 à 50 % lors d'une crise. Historiquement, les marchés mondiaux se sont toujours redressés et ont progressé sur le long terme — d'où l'importance de ne pas vendre dans la panique.",
      },
      {
        q: "À quel âge faut-il commencer à investir ?",
        a: "Le plus tôt possible. Grâce aux intérêts composés, chaque année gagnée compte énormément : 100 € placés à 25 ans valent bien plus que 100 € placés à 40 ans. Mais il n'est jamais trop tard : même à 50 ans, investir sur 15 ou 20 ans reste tout à fait pertinent pour préparer sa retraite.",
      },
      {
        q: "Combien de temps faut-il laisser son argent investi ?",
        a: "Au minimum 5 ans, idéalement 10 ans ou plus. La bourse récompense la patience : plus l'horizon est long, plus le risque de finir en perte diminue et plus les intérêts composés jouent en votre faveur. C'est un placement de fond, pas un moyen de s'enrichir vite.",
      },
    ],
  },
  {
    id: 'fiscalite',
    label: 'Enveloppes & fiscalité',
    icon: Scale,
    questions: [
      {
        q: "PEA, compte-titres ou assurance-vie : lequel choisir ?",
        a: "Le PEA est souvent le meilleur choix pour investir en actions et ETF européens sur le long terme, grâce à son exonération d'impôt après 5 ans. Le compte-titres (CTO) est plus souple (actions du monde entier, aucun plafond) mais sans avantage fiscal. L'assurance-vie est intéressante pour la souplesse, les fonds euros sécurisés et la transmission. Beaucoup d'investisseurs combinent PEA + assurance-vie. Notre comparateur d'enveloppes vous aide à trancher selon votre situation.",
      },
      {
        q: "Quand les gains d'un PEA sont-ils exonérés d'impôt ?",
        a: "Après 5 ans de détention du plan (la date qui compte est celle de l'ouverture, pas celle de chaque versement). Passé ce délai, les plus-values et dividendes sont exonérés d'impôt sur le revenu. Seuls les prélèvements sociaux de 17,2 % restent dus au moment du retrait.",
      },
      {
        q: "Que se passe-t-il si je retire avant 5 ans sur un PEA ?",
        a: "Un retrait avant 5 ans entraîne en principe la clôture du plan et l'imposition des gains à la flat tax de 30 %. Depuis la loi PACTE, certains retraits après 5 ans n'entraînent plus la clôture. En pratique : ouvrez votre PEA le plus tôt possible (même avec une petite somme) pour « prendre date » et lancer le compteur des 5 ans.",
      },
      {
        q: "Comment sont imposés les gains d'un compte-titres (CTO) ?",
        a: "À la « flat tax » (PFU) de 30 %, qui comprend 12,8 % d'impôt sur le revenu et 17,2 % de prélèvements sociaux. Vous pouvez aussi opter pour le barème progressif de l'impôt si c'est plus avantageux pour vous. L'impôt n'est dû que lorsque vous vendez et réalisez une plus-value.",
      },
      {
        q: "Quel est le plafond de versement du PEA ?",
        a: "150 000 € de versements pour un PEA classique (les gains, eux, peuvent faire monter la valeur bien au-delà). Il existe aussi le PEA-PME, plafonné à 225 000 € en cumulé avec le PEA classique.",
      },
      {
        q: "Peut-on avoir plusieurs PEA ?",
        a: "Non : une personne ne peut détenir qu'un seul PEA. En revanche, vous pouvez cumuler un PEA et un PEA-PME, et ouvrir autant de comptes-titres et d'assurances-vie que vous le souhaitez, y compris chez plusieurs courtiers.",
      },
      {
        q: "L'argent d'une assurance-vie est-il bloqué 8 ans ?",
        a: "Non, c'est une idée reçue : votre argent reste disponible à tout moment. Le cap des 8 ans n'est pas un blocage, mais le moment où la fiscalité devient la plus douce : abattement annuel de 4 600 € sur les gains (9 200 € pour un couple) et taux réduit à 7,5 %.",
      },
    ],
  },
  {
    id: 'courtiers',
    label: 'Courtiers & frais',
    icon: Wallet,
    questions: [
      {
        q: "Comment choisir son courtier ?",
        a: "Regardez d'abord : les enveloppes proposées (PEA, CTO, assurance-vie), les frais de courtage par ordre, les éventuels droits de garde, et la qualité de l'interface. Pour un débutant qui investit en ETF, privilégiez un courtier proposant le PEA avec des frais bas. Notre comparatif des courtiers détaille les frais réels de 9 acteurs français.",
      },
      {
        q: "Les frais ont-ils vraiment de l'importance ?",
        a: "Énormément, sur le long terme. 1 % de frais en plus chaque année peut représenter des dizaines de milliers d'euros en moins au bout de 25 ans, à cause des intérêts composés. C'est pourquoi les ETF (frais souvent inférieurs à 0,30 %/an) sont si appréciés, et pourquoi le choix d'un courtier peu cher compte autant.",
      },
      {
        q: "Mon argent est-il en danger si mon courtier fait faillite ?",
        a: "Vos titres (actions, ETF) vous appartiennent et sont conservés séparément des comptes du courtier : en cas de faillite, ils sont en principe transférés vers un autre établissement. En France, une garantie couvre par ailleurs les titres jusqu'à 70 000 € et les espèces jusqu'à 100 000 € par déposant et par établissement. Choisir un courtier régulé (AMF/ACPR) est essentiel.",
      },
      {
        q: "Qu'est-ce qu'un ETF (ou tracker) ?",
        a: "Un ETF est un fonds coté en bourse qui réplique automatiquement la performance d'un indice, comme le MSCI World ou le S&P 500. En achetant une seule part, vous investissez d'un coup dans des centaines ou milliers d'entreprises, à très faibles frais. C'est l'outil de prédilection de l'investissement passif de long terme.",
      },
      {
        q: "C'est quoi les frais de courtage et les droits de garde ?",
        a: "Les frais de courtage sont prélevés à chaque ordre d'achat ou de vente (un montant fixe, ex. 0,99 €, ou un pourcentage). Les droits de garde sont des frais annuels que certains courtiers facturent pour conserver vos titres — de plus en plus de courtiers les ont supprimés. Notre simulateur déduit ces frais du résultat affiché.",
      },
    ],
  },
  {
    id: 'strategies',
    label: "Stratégies d'investissement",
    icon: LineChart,
    questions: [
      {
        q: "Vaut-il mieux investir en une fois ou progressivement ?",
        a: "Statistiquement, investir tout d'un coup (lump sum) rapporte un peu plus en moyenne, car les marchés montent plus souvent qu'ils ne baissent. Mais investir progressivement (DCA) réduit le risque de mal tomber et est psychologiquement plus confortable. Pour la plupart des gens qui épargnent au fil de leurs revenus, le DCA est la solution la plus naturelle et la plus sereine.",
      },
      {
        q: "Qu'est-ce que le DCA (investissement programmé) ?",
        a: "Le DCA (Dollar Cost Averaging) consiste à investir un montant fixe à intervalle régulier — par exemple 200 € chaque mois — quel que soit le niveau du marché. Cela lisse votre prix d'achat dans le temps, vous évite de chercher le « bon moment » et automatise votre épargne. C'est la méthode la plus simple pour débuter.",
      },
      {
        q: "Faut-il essayer de « timer » le marché ?",
        a: "Non, pour l'immense majorité des investisseurs. Prévoir les hauts et les bas du marché est extrêmement difficile, même pour les professionnels. Rater seulement quelques-uns des meilleurs jours de bourse suffit à plomber la performance sur 20 ans. La maxime consacrée : « ce n'est pas le timing du marché qui compte, mais le temps passé dans le marché ».",
      },
      {
        q: "Faut-il réinvestir les dividendes ?",
        a: "Oui, sur le long terme c'est très puissant. Réinvestis, les dividendes achètent de nouvelles parts qui génèrent à leur tour des gains : c'est l'effet boule de neige des intérêts composés. De nombreux ETF dits « capitalisants » le font automatiquement pour vous, ce qui est aussi pratique fiscalement dans un PEA.",
      },
      {
        q: "Qu'est-ce que la diversification et pourquoi est-ce important ?",
        a: "Diversifier, c'est répartir son argent sur de nombreux actifs (secteurs, pays, entreprises) plutôt que de tout miser sur un seul. Ainsi, la mauvaise performance de l'un est compensée par les autres, ce qui réduit le risque. Un ETF Monde diversifie pour vous en une seule ligne — c'est l'un de ses grands atouts.",
      },
    ],
  },
  {
    id: 'simulateur',
    label: 'Le simulateur de ce site',
    icon: Sparkles,
    questions: [
      {
        q: "Sur quelles données reposent les simulations ?",
        a: "Sur des données de marché réelles : nous utilisons les cours de clôture mensuels historiques sur environ 25 ans pour des dizaines d'actifs (indices, ETF, actions). Quand l'historique réel n'est pas disponible, une série de secours cohérente prend le relais. Les résultats reflètent donc des performances réellement observées par le passé.",
      },
      {
        q: "Les performances passées garantissent-elles les performances futures ?",
        a: "Non, et c'est essentiel à garder en tête. Un backtest montre ce qui se serait passé si vous aviez investi dans le passé : c'est utile pour comprendre les ordres de grandeur et le comportement d'une stratégie, mais cela ne prédit pas l'avenir. Les marchés peuvent se comporter différemment demain.",
      },
      {
        q: "Les frais et les impôts sont-ils pris en compte ?",
        a: "Oui. Le simulateur déduit les frais du courtier que vous choisissez ainsi que l'imposition de l'enveloppe sélectionnée (PEA, CTO ou assurance-vie). La valeur finale affichée est donc nette de frais et d'impôts, pour être au plus proche de ce que vous toucheriez réellement.",
      },
      {
        q: "Le simulateur tient-il compte de l'inflation ?",
        a: "Cela dépend de l'outil : le simulateur avancé propose une option pour raisonner en euros constants (corrigés de l'inflation), et le planificateur retraite raisonne directement en euros d'aujourd'hui. L'inflation érode le pouvoir d'achat, c'est pourquoi en tenir compte donne une vision plus réaliste.",
      },
      {
        q: "Mes données personnelles sont-elles enregistrées ?",
        a: "Les simulations se font entièrement dans votre navigateur : vos paramètres ne sont pas envoyés sur un serveur. Si vous choisissez de recevoir notre comparatif par email, seule votre adresse est collectée, avec votre consentement, pour vous l'envoyer (voir notre politique de confidentialité).",
      },
    ],
  },
  {
    id: 'retraite',
    label: 'Retraite & long terme',
    icon: Landmark,
    questions: [
      {
        q: "Comment préparer sa retraite avec un placement ?",
        a: "Le principe est simple : pendant votre vie active, vous épargnez régulièrement pour vous constituer un capital (phase d'accumulation). À la retraite, vous puisez progressivement dans ce capital pour compléter vos revenus (phase de décumulation). Notre simulateur retraite calcule l'effort d'épargne mensuel nécessaire pour atteindre le revenu que vous visez.",
      },
      {
        q: "Que sont les phases d'accumulation et de décumulation ?",
        a: "L'accumulation est la période où vous versez et faites croître votre épargne (avant la retraite). La décumulation est la période où vous retirez de l'argent pour vivre (à la retraite). Un bon plan dimensionne le capital pour que la décumulation dure aussi longtemps que nécessaire — et, si vous le souhaitez, qu'il reste un héritage à transmettre.",
      },
      {
        q: "Combien faut-il épargner chaque mois pour ma retraite ?",
        a: "Cela dépend de votre âge, du revenu complémentaire visé, de la durée de la retraite et du rendement espéré. Plutôt que de deviner, utilisez notre planificateur retraite : renseignez votre situation et il calcule l'épargne mensuelle nécessaire selon trois scénarios de rendement (prudent, neutre, optimiste).",
      },
    ],
  },
  {
    id: 'pratique',
    label: 'Questions pratiques',
    icon: ShieldCheck,
    questions: [
      {
        q: "Ce site donne-t-il des conseils en investissement personnalisés ?",
        a: "Non. Ce site est un outil pédagogique et de simulation. Il ne constitue pas un conseil en investissement personnalisé ni une recommandation d'achat. Pour une décision adaptée à votre situation personnelle, rapprochez-vous d'un conseiller financier agréé.",
      },
      {
        q: "Le site et les simulateurs sont-ils gratuits ?",
        a: "Oui, tous les simulateurs, comparateurs et guides sont gratuits et accessibles sans inscription. Vous pouvez aussi recevoir gratuitement notre comparatif des courtiers au format PDF en laissant votre email.",
      },
      {
        q: "Comment recevoir le comparatif des courtiers et rester informé ?",
        a: "Laissez votre adresse email dans l'un des encarts du site : vous recevrez le comparatif PEA au format PDF (frais des courtiers, meilleurs ETF, pièges à éviter), ainsi que nos conseils pour bien investir. Désinscription en un clic à tout moment.",
      },
    ],
  },
]

// Liste à plat de toutes les Q/R (pour la recherche et le schema)
const ALL = CATEGORIES.flatMap((c, ci) =>
  c.questions.map((item, qi) => ({ ...item, cat: c.label, key: `${ci}-${qi}` })),
)

export default function Faq() {
  const [open, setOpen] = useState(null)
  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState('all')

  // Balisage schema.org FAQPage (SEO) injecté dans le <head>
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = 'faq-page-schema'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: ALL.map((t) => ({
        '@type': 'Question',
        name: t.q,
        acceptedAnswer: { '@type': 'Answer', text: t.a },
      })),
    })
    document.head.appendChild(script)
    return () => {
      const el = document.getElementById('faq-page-schema')
      if (el) el.remove()
    }
  }, [])

  const q = query.trim().toLowerCase()
  const visibleCategories = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        ...c,
        questions: c.questions.filter(
          (item) =>
            (activeCat === 'all' || activeCat === c.id) &&
            (q === '' || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)),
        ),
      })).filter((c) => c.questions.length > 0),
    [q, activeCat],
  )

  const totalVisible = visibleCategories.reduce((n, c) => n + c.questions.length, 0)

  return (
    <section>
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-navy-800 dark:text-white md:text-3xl">
          <HelpCircle size={26} /> Foire aux questions
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          Toutes les réponses pour investir sereinement : débuter, choisir son enveloppe et son courtier,
          comprendre les stratégies, préparer sa retraite. {ALL.length} questions classées par thème.
        </p>
      </header>

      {/* Recherche */}
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-navy-200 bg-white px-3 py-2 dark:border-navy-700 dark:bg-navy-800 md:max-w-md">
        <Search size={16} className="text-navy-400" />
        <input
          type="text"
          value={query}
          placeholder="Rechercher une question…"
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {/* Filtre par thème */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        <CatChip label="Tous" active={activeCat === 'all'} onClick={() => setActiveCat('all')} />
        {CATEGORIES.map((c) => (
          <CatChip key={c.id} label={c.label} icon={c.icon} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} />
        ))}
      </div>

      {/* Questions par catégorie */}
      {totalVisible === 0 ? (
        <p className="text-sm text-navy-400">Aucune question ne correspond à « {query} ».</p>
      ) : (
        <div className="space-y-6">
          {visibleCategories.map((c) => {
            const Icon = c.icon
            const ci = CATEGORIES.findIndex((x) => x.id === c.id)
            return (
              <div key={c.id}>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-navy-700 dark:text-navy-200">
                  <Icon size={16} /> {c.label}
                </h2>
                <div className="space-y-2">
                  {c.questions.map((item) => {
                    const qi = CATEGORIES[ci].questions.indexOf(item)
                    const key = `${ci}-${qi}`
                    const isOpen = open === key
                    return (
                      <div key={key} className="card overflow-hidden !p-0">
                        <button
                          onClick={() => setOpen(isOpen ? null : key)}
                          aria-expanded={isOpen}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                        >
                          <span className="font-semibold text-navy-800 dark:text-white">{item.q}</span>
                          <ChevronDown
                            size={18}
                            className={`shrink-0 text-navy-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {isOpen && (
                          <div className="border-t border-navy-100 px-4 py-3 text-sm leading-relaxed text-navy-600 dark:border-navy-800 dark:text-navy-300">
                            {item.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Renvois vers les outils */}
      <div className="mt-8 rounded-2xl border-l-4 border-l-navy-800 bg-navy-50/70 p-4 dark:border-l-navy-300 dark:bg-navy-900/50">
        <h2 className="text-sm font-bold text-navy-800 dark:text-white">Encore une question ? Passez à la pratique</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/simulateur-debutant" className="btn-secondary">
            Simulateur débutant <ArrowRight size={15} />
          </Link>
          <Link to="/comparatif-courtiers" className="btn-secondary">
            Comparatif des courtiers <ArrowRight size={15} />
          </Link>
          <Link to="/comparateur" className="btn-secondary">
            Comparateur d'enveloppes <ArrowRight size={15} />
          </Link>
          <Link to="/glossaire" className="btn-secondary">
            Glossaire <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}

function CatChip({ label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? 'border-navy-800 bg-navy-800 text-white'
          : 'border-navy-200 text-navy-600 hover:border-navy-400 dark:border-navy-700 dark:text-navy-300'
      }`}
    >
      {Icon && <Icon size={13} />} {label}
    </button>
  )
}
