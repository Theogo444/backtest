// ============================================================================
//  Home.jsx — page d'accueil éditoriale.
//  Vitrine + hub de distribution (SEO) + point de conversion (affiliation + email).
//  Direction : finance perso premium, sobre. Rythme de sections (sombre / blanc
//  / panneau teinté) pour éviter l'effet « suite uniforme de cartes ».
// ============================================================================

import { Head } from 'vite-react-ssg'
import { Link } from 'react-router-dom'
import {
  Rocket, LineChart, Scale, Landmark, Dices, ArrowRight, ShieldCheck,
  PiggyBank, Wallet, Clock, Check, Database, BadgeCheck, Sparkles,
} from 'lucide-react'
import EmailCapture from '../components/marketing/EmailCapture'
import { BROKERS } from '../data/affiliates'
import { GUIDES } from '../data/guides'

// --------- Outils mis en avant (les 2 simulateurs : cœur du produit) ---------
const FEATURED = [
  {
    to: '/simulateur-debutant', icon: Rocket, badge: 'Le plus simple',
    name: 'Simulateur débutant',
    desc: 'Choisissez un courtier, une enveloppe et un plan : un résultat clair, sans jargon.',
    points: ['Guidé pas à pas', 'Résultat net en un clic'],
    cta: 'Simuler mon investissement',
  },
  {
    to: '/simulateur', icon: LineChart, badge: '8 stratégies',
    name: 'Simulateur avancé',
    desc: 'Backtestez DCA, lump sum, value averaging, momentum… sur des données réelles.',
    points: ['CAGR, volatilité, max drawdown', 'Vos propres actifs'],
    cta: 'Backtester une stratégie',
  },
]

// --------- Outils complémentaires (cartes compactes) ---------
const TOOLS = [
  { to: '/comparateur', icon: Scale, name: 'Comparateur d\'enveloppes', desc: 'PEA, CTO ou assurance-vie : le rendement net après impôts.', cta: 'Comparer PEA vs CTO' },
  { to: '/retraite', icon: Landmark, name: 'Objectif retraite', desc: 'Quel effort mensuel pour atteindre votre capital ?', cta: 'Calculer mon effort' },
  { to: '/monte-carlo', icon: Dices, name: 'Monte Carlo', desc: 'Vos chances réelles d\'atteindre l\'objectif.', cta: 'Voir mes probabilités' },
]

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

// Sur-titre + titre + sous-titre d'une section (hiérarchie homogène).
function SectionHead({ eyebrow, title, subtitle, children }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="eyebrow text-navy-400">{eyebrow}</div>}
        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-navy-800 dark:text-white md:text-2xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-navy-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// Aperçu produit statique (carte résultat mockée) — illustre la valeur de l'outil.
function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0">
      <div className="rounded-2xl bg-white p-5 shadow-float ring-1 ring-navy-900/5 dark:bg-navy-900 dark:ring-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-800 text-white">
              <LineChart size={16} />
            </span>
            <div className="leading-tight">
              <div className="text-xs font-bold text-navy-800 dark:text-white">MSCI World · DCA</div>
              <div className="text-[10px] text-navy-400">200 €/mois · 10 ans</div>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            +60 %
          </span>
        </div>

        <div className="mt-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-navy-400">
            Capital final estimé
          </div>
          <div className="tnum text-3xl font-extrabold text-navy-900 dark:text-white">38 400 €</div>
        </div>

        <svg viewBox="0 0 300 90" className="mt-3 h-24 w-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 78 L40 70 L75 73 L110 58 L150 62 L190 41 L225 47 L265 23 L300 12 L300 90 L0 90 Z" fill="url(#heroSpark)" />
          <path d="M0 78 L40 70 L75 73 L110 58 L150 62 L190 41 L225 47 L265 23 L300 12" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-navy-100 pt-3 dark:border-navy-800">
          {[['Versé', '24 000 €'], ['CAGR', '~8 %/an'], ['Durée', '10 ans']].map(([k, v]) => (
            <div key={k}>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-navy-400">{k}</div>
              <div className="tnum text-sm font-bold text-navy-800 dark:text-white">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[10px] text-navy-400">
          Exemple illustratif — les résultats varient selon la période.
        </div>
      </div>
    </div>
  )
}

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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-800 to-navy-950 text-white ring-1 ring-navy-800">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative grid items-center gap-8 px-6 py-10 md:px-10 md:py-14 lg:grid-cols-2 lg:gap-10">
          <div>
            <span className="eyebrow rounded-full bg-white/10 px-3 py-1 text-emerald-300">
              <Sparkles size={13} /> Outils gratuits · données réelles
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-[1.1] tracking-tight md:text-5xl">
              Investir efficacement en France,<br className="hidden md:block" /> sans se tromper d'enveloppe
            </h1>
            <p className="mt-4 max-w-xl text-base text-navy-100 md:text-lg">
              PEA, compte-titres ou assurance-vie ? Quelle stratégie, quels frais, quel rendement
              espérer ? Testez tout sur des données de marché réelles avant d'investir un seul euro.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/simulateur-debutant" className="btn-primary bg-white !text-navy-900 hover:bg-navy-50">
                Lancer ma simulation <ArrowRight size={16} />
              </Link>
              <Link to="/comparateur" className="btn-secondary border-white/30 bg-white/10 !text-white hover:bg-white/20">
                Comparer PEA, CTO &amp; assurance-vie
              </Link>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-navy-200">
              <li className="inline-flex items-center gap-1.5"><BadgeCheck size={15} className="text-emerald-300" /> 100 % gratuit</li>
              <li className="inline-flex items-center gap-1.5"><Check size={15} className="text-emerald-300" /> Sans inscription</li>
              <li className="inline-flex items-center gap-1.5"><Database size={15} className="text-emerald-300" /> ~25 ans de données</li>
              <li className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-emerald-300" /> Données protégées</li>
            </ul>
          </div>
          <HeroPreview />
        </div>
      </section>

      {/* --------------------------- Outils (produit en avant) --------------------------- */}
      <section className="mt-12">
        <SectionHead
          eyebrow="Vos outils"
          title="Simulez avant d'investir"
          subtitle="Des résultats basés sur ~25 ans de données de marché réelles."
        />

        {/* 2 simulateurs en vedette */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {FEATURED.map((t) => {
            const Icon = t.icon
            return (
              <Link key={t.to} to={t.to} className="card card-link group flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-800 text-white">
                    <Icon size={22} />
                  </span>
                  <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-[11px] font-bold text-navy-700 dark:bg-navy-800 dark:text-navy-200">
                    {t.badge}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-navy-800 dark:text-white">{t.name}</h3>
                <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">{t.desc}</p>
                <ul className="mt-3 flex-1 space-y-1.5 text-sm text-navy-600 dark:text-navy-300">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <Check size={15} className="shrink-0 text-emerald-500" /> {p}
                    </li>
                  ))}
                </ul>
                <span className="btn-primary mt-5 w-full group-hover:bg-navy-700">
                  {t.cta} <ArrowRight size={16} />
                </span>
              </Link>
            )
          })}
        </div>

        {/* 3 outils complémentaires */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {TOOLS.map((t) => {
            const Icon = t.icon
            return (
              <Link key={t.to} to={t.to} className="card card-link group flex flex-col items-start">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100 text-navy-800 dark:bg-navy-800 dark:text-white">
                  <Icon size={20} />
                </span>
                <div className="mt-3 text-base font-bold text-navy-800 dark:text-white">{t.name}</div>
                <p className="mt-1 flex-1 text-sm text-navy-600 dark:text-navy-300">{t.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 group-hover:gap-2 dark:text-navy-200">
                  {t.cta} <ArrowRight size={14} />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ----------------- Capture email #1 — bande forte (pic d'intention) ----------------- */}
      <EmailCapture
        className="mt-12"
        variant="band"
        source="home_band"
        leadMagnet="le comparatif PEA 2026"
        title="Recevez le comparatif PEA 2026"
        subtitle="Frais réels, ETF éligibles et le bon courtier selon votre profil — en un PDF clair."
        bullets={[
          'Les frais des principaux courtiers comparés',
          'Comment éviter les erreurs qui coûtent cher',
        ]}
      />

      {/* ---------------------- Orientation enveloppes (panneau teinté) ---------------------- */}
      <section className="mt-12">
        <div className="panel">
          <SectionHead
            eyebrow="Choisir son enveloppe"
            title="Quelle enveloppe pour votre projet ?"
            subtitle="Le bon véhicule dépend de votre horizon et de votre fiscalité."
          />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {ENVELOPES.map((e) => {
              const Icon = e.icon
              return (
                <Link
                  key={e.name}
                  to="/comparateur"
                  className="card card-link group flex flex-col"
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
                    Voir la fiscalité <ArrowRight size={14} />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ----------------------- Courtiers (affiliation) ----------------------- */}
      <section className="mt-12">
        <SectionHead
          eyebrow="Passer à l'action"
          title="Quel courtier choisir pour ouvrir un PEA ?"
          subtitle="Une sélection de courtiers réputés pour leurs frais réduits. Comparez avant d'ouvrir."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {BROKERS.map((b) => (
            <div key={b.id} className="card flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-lg font-extrabold text-navy-800 dark:text-white">{b.name}</span>
                <span className="rounded-full bg-navy-100 px-2 py-0.5 text-[11px] font-bold text-navy-700 dark:bg-navy-800 dark:text-navy-200">
                  {b.envelope}
                </span>
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
              <Link
                to={`/comparatif-courtiers#broker-${b.id}`}
                className="btn-primary mt-3 w-full"
              >
                Voir l'offre {b.name} <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-5 text-center">
          <Link to="/comparatif-courtiers" className="btn-secondary">
            Comparer les 9 courtiers <ArrowRight size={16} />
          </Link>
        </div>
        <p className="mt-3 text-center text-xs text-navy-400">
          Comparez les frais et les programmes de chaque courtier avant d'ouvrir un compte.
          Certains partenariats peuvent nous rémunérer, sans surcoût pour vous, et n'influencent pas notre sélection.
        </p>
      </section>

      {/* --------------------------- Guides --------------------------- */}
      <section className="mt-12">
        <SectionHead
          eyebrow="Apprendre"
          title="Nos guides pour bien démarrer"
          subtitle="Des conseils clairs pour choisir votre enveloppe et votre stratégie."
        >
          <Link
            to="/guides"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-navy-700 hover:gap-2 dark:text-navy-200 sm:inline-flex"
          >
            Tous les guides <ArrowRight size={14} />
          </Link>
        </SectionHead>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {GUIDES.slice(0, 3).map((g) => (
            <Link key={g.slug} to={`/guides/${g.slug}`} className="card card-link group flex flex-col">
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
                Lire le guide <ArrowRight size={14} />
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

      {/* ----------------- Capture email #2 — rappel compact (peu intrusif) ----------------- */}
      <EmailCapture
        className="mt-8"
        variant="compact"
        source="home_compact"
        leadMagnet="le comparatif PEA 2026"
        title="Pas encore décidé sur votre PEA ?"
        subtitle="Recevez le comparatif PEA 2026 (PDF) : frais, ETF éligibles, bon courtier."
      />

      {/* --------------------------- Contenu SEO --------------------------- */}
      <section className="card mt-12">
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
            Simuler mon investissement <ArrowRight size={16} />
          </Link>
          <Link to="/glossaire" className="btn-secondary">
            Comprendre le vocabulaire
          </Link>
        </div>
      </section>
    </>
  )
}
