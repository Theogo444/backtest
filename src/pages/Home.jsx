// ============================================================================
//  Home.jsx — page d'accueil éditoriale.
//  Vitrine + hub de distribution (SEO) + point de conversion (affiliation).
// ============================================================================

import { Head } from 'vite-react-ssg'
import { Link } from 'react-router-dom'
import {
  Rocket, LineChart, Scale, Landmark, Dices, ArrowRight, ShieldCheck,
  PiggyBank, Wallet, Star, TrendingUp, Clock,
} from 'lucide-react'
import AdSlot from '../components/layout/AdSlot'
import { BROKERS } from '../data/affiliates'
import { GUIDES } from '../data/guides'

const ENVELOPES = [
  {
    icon: PiggyBank,
    name: 'PEA',
    tag: 'Le préféré des particuliers',
    desc: 'Actions et ETF européens, exonération d\'impôt sur les gains après 5 ans (hors prélèvements sociaux). Idéal pour investir long terme sur les marchés.',
  },
  {
    icon: Wallet,
    name: 'CTO',
    tag: 'Le plus flexible',
    desc: 'Compte-titres ordinaire : accès au monde entier (US, émergents…), aucun plafond, mais flat tax de 30 % sur les gains. Le complément du PEA.',
  },
  {
    icon: Landmark,
    name: 'Assurance-vie',
    tag: 'Souplesse et transmission',
    desc: 'Fonds euros et unités de compte, fiscalité avantageuse après 8 ans (abattement annuel) et atout majeur pour la succession.',
  },
]

const TOOLS = [
  { to: '/simulateur-debutant', icon: Rocket, name: 'Simulateur débutant', desc: 'Courtier, enveloppe et plan : résultat clair en un clic.' },
  { to: '/simulateur', icon: LineChart, name: 'Simulateur avancé', desc: 'Backtestez 8 stratégies sur vos actifs.' },
  { to: '/comparateur', icon: Scale, name: 'Comparateur d\'enveloppes', desc: 'PEA vs CTO vs Assurance-vie.' },
  { to: '/retraite', icon: Landmark, name: 'Objectif retraite', desc: 'Quel effort mensuel pour votre capital ?' },
  { to: '/monte-carlo', icon: Dices, name: 'Monte Carlo', desc: 'Vos chances d\'atteindre l\'objectif.' },
]

export default function Home() {
  return (
    <>
      <Head>
        <title>Investir efficacement en France : PEA, CTO, Assurance-vie | Guide & outils gratuits</title>
        <meta
          name="description"
          content="Apprenez à investir efficacement en France. Outils gratuits pour backtester vos stratégies, comparer PEA / CTO / Assurance-vie et préparer votre retraite."
        />
        <link rel="canonical" href="https://simulateur-portefeuille.fr/" />
      </Head>

      {/* ----------------------------- Hero ----------------------------- */}
      <section className="card overflow-hidden bg-gradient-to-br from-navy-800 to-navy-950 text-white ring-navy-800">
        <div className="mx-auto max-w-3xl py-8 text-center md:py-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
            <TrendingUp size={14} /> 100 % gratuit · sans inscription
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight md:text-5xl">
            Investir efficacement en France,<br className="hidden md:block" /> sans se tromper d'enveloppe
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-navy-100 md:text-lg">
            PEA, compte-titres ou assurance-vie ? Quelle stratégie, quels frais, quel rendement
            espérer ? Testez tout avec des données de marché réelles avant d'investir un seul euro.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/simulateur-debutant" className="btn-primary bg-white !text-navy-900 hover:bg-navy-50">
              Simuler mon investissement <ArrowRight size={16} />
            </Link>
            <Link to="/comparateur" className="btn-secondary border-white/30 bg-white/10 !text-white hover:bg-white/20">
              Comparer les enveloppes
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------- Orientation enveloppes ---------------------- */}
      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-navy-800 dark:text-white md:text-2xl">
          Quelle enveloppe pour votre projet ?
        </h2>
        <p className="mt-1 text-sm text-navy-500">
          Le bon véhicule d'investissement dépend de votre horizon et de votre fiscalité.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {ENVELOPES.map((e) => {
            const Icon = e.icon
            return (
              <Link
                key={e.name}
                to="/comparateur"
                className="card group flex flex-col hover:ring-navy-300 dark:hover:ring-navy-600"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100 text-navy-800 dark:bg-navy-800 dark:text-white">
                    <Icon size={20} />
                  </span>
                  <div>
                    <div className="text-base font-bold text-navy-800 dark:text-white">{e.name}</div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-navy-400">{e.tag}</div>
                  </div>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-600 dark:text-navy-300">{e.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 group-hover:gap-2 dark:text-navy-200">
                  Comparer la fiscalité <ArrowRight size={14} />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* AdSense slot: HOME_MID_RECTANGLE */}
      <AdSlot format="rectangle" position="HOME_MID_RECTANGLE" className="my-8" />

      {/* --------------------------- Outils --------------------------- */}
      <section className="mt-4">
        <h2 className="text-xl font-extrabold text-navy-800 dark:text-white md:text-2xl">
          Vos outils gratuits
        </h2>
        <p className="mt-1 text-sm text-navy-500">
          Des simulations basées sur ~25 ans de données de marché réelles.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TOOLS.map((t) => {
            const Icon = t.icon
            return (
              <Link key={t.to} to={t.to} className="card group flex flex-col items-start">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-white">
                  <Icon size={20} />
                </span>
                <div className="mt-3 text-base font-bold text-navy-800 dark:text-white">{t.name}</div>
                <p className="mt-1 flex-1 text-sm text-navy-600 dark:text-navy-300">{t.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 group-hover:gap-2 dark:text-navy-200">
                  Ouvrir <ArrowRight size={14} />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ----------------------- Courtiers (affiliation) ----------------------- */}
      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-navy-800 dark:text-white md:text-2xl">
          Quel courtier choisir pour ouvrir un PEA ?
        </h2>
        <p className="mt-1 text-sm text-navy-500">
          Une sélection de courtiers réputés pour leurs frais réduits. Comparez avant d'ouvrir.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {BROKERS.map((b) => (
            <div key={b.id} className="card flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-lg font-extrabold text-navy-800 dark:text-white">{b.name}</span>
                <span className="rounded-full bg-navy-100 px-2 py-0.5 text-[11px] font-bold text-navy-700 dark:bg-navy-800 dark:text-navy-200">
                  {b.envelope}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-amber-500">
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-bold text-navy-700 dark:text-navy-200">{b.rating.toFixed(1)}</span>
                <span className="text-xs text-navy-400">/ 5</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-navy-700 dark:text-navy-200">{b.highlight}</p>
              <ul className="mt-2 flex-1 space-y-1 text-sm text-navy-600 dark:text-navy-300">
                {b.pros.map((p) => (
                  <li key={p} className="flex items-start gap-1.5">
                    <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-500" /> {p}
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-xs text-navy-400">Frais : {b.fees}</div>
              <a
                href={b.url}
                rel="sponsored nofollow"
                className="btn-primary mt-3 w-full"
              >
                Ouvrir un {b.envelope} <ArrowRight size={16} />
              </a>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-navy-400">
          Certains liens sont des partenariats : ouvrir un compte via ces liens peut nous rémunérer,
          sans surcoût pour vous. Cela n'influence pas notre sélection.
        </p>
      </section>

      {/* --------------------------- Guides --------------------------- */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-navy-800 dark:text-white md:text-2xl">
              Nos guides pour bien démarrer
            </h2>
            <p className="mt-1 text-sm text-navy-500">
              Des conseils clairs pour choisir votre enveloppe et votre stratégie.
            </p>
          </div>
          <Link
            to="/guides"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-navy-700 hover:gap-2 dark:text-navy-200 sm:inline-flex"
          >
            Tous les guides <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {GUIDES.slice(0, 3).map((g) => (
            <Link key={g.slug} to={`/guides/${g.slug}`} className="card group flex flex-col">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-[11px] font-bold text-navy-700 dark:bg-navy-800 dark:text-navy-200">
                  {g.category}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-navy-400">
                  <Clock size={12} /> {g.readingTime} min
                </span>
              </div>
              <h3 className="mt-3 text-base font-bold text-navy-800 group-hover:text-navy-600 dark:text-white">
                {g.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-navy-600 dark:text-navy-300">{g.excerpt}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 group-hover:gap-2 dark:text-navy-200">
                Lire <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
        <Link
          to="/guides"
          className="btn-secondary mt-5 w-full sm:hidden"
        >
          Tous les guides <ArrowRight size={14} />
        </Link>
      </section>

      {/* --------------------------- Contenu SEO --------------------------- */}
      <section className="card mt-10">
        <h2 className="text-xl font-extrabold text-navy-800 dark:text-white md:text-2xl">
          Comment investir efficacement quand on débute ?
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-navy-600 dark:text-navy-300">
          <p>
            Investir efficacement, ce n'est pas chercher le « bon coup » : c'est combiner trois
            leviers simples. <strong>D'abord la bonne enveloppe</strong> — un PEA pour profiter de
            l'exonération d'impôt après 5 ans, un compte-titres pour accéder aux marchés
            internationaux, une assurance-vie pour la souplesse et la transmission. Le choix de
            l'enveloppe a souvent plus d'impact sur votre rendement net que le choix des supports.
          </p>
          <p>
            <strong>Ensuite la stratégie.</strong> L'investissement progressif (DCA), qui consiste à
            placer une somme fixe chaque mois, lisse les points d'entrée et réduit le risque de
            mal tomber. Notre simulateur vous permet de comparer le DCA, l'investissement en une
            fois (lump sum), le value averaging ou le rééquilibrage, sur des données réelles, et de
            mesurer le rendement (CAGR), la volatilité et la pire perte (max drawdown).
          </p>
          <p>
            <strong>Enfin les frais.</strong> Quelques dixièmes de pour cent de frais par an, sur
            20 ans, peuvent coûter plusieurs milliers d'euros. Choisir un courtier à frais réduits
            et des ETF peu coûteux fait une vraie différence. Utilisez nos outils pour tout tester
            avant d'investir — gratuitement et sans inscription.
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link to="/simulateur" className="btn-primary">
            Lancer une simulation <ArrowRight size={16} />
          </Link>
          <Link to="/glossaire" className="btn-secondary">
            Comprendre le vocabulaire
          </Link>
        </div>
      </section>
    </>
  )
}
