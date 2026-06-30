// ============================================================================
//  BrokerComparator.jsx — comparatif des courtiers français (page entière).
//
//  Présente les 9 courtiers de data/brokers.js sous une forme agréable à lire :
//    1. un filtre par enveloppe (Tous / PEA / Compte-titres / Assurance-vie) ;
//    2. des fiches détaillées (frais, droits de garde, ETF offerts, points
//       forts / faibles, « idéal pour », CTA) ;
//    3. un tableau récapitulatif des frais, pour comparer d'un coup d'œil.
//
//  Frais INDICATIFS à jour de juin 2026 (cf. data/brokers.js). Aucune note maison.
// ============================================================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Scale, Check, X, ArrowRight, ExternalLink, Info, Sparkles, Wallet,
  Coins, ShieldCheck, PiggyBank, Landmark,
} from 'lucide-react'
import EmailCapture from '../marketing/EmailCapture'
import { BROKERS, ENVELOPE_LABELS, FEES_AS_OF, brokerOffers } from '../../data/brokers'

// Courtiers particulièrement adaptés à un premier investissement (PEA + frais bas).
const BEGINNER_PICKS = new Set(['trade-republic', 'bourse-direct'])

const ENVELOPE_META = {
  pea: { label: 'PEA', icon: PiggyBank, color: '#1e3a5f' },
  cto: { label: 'Compte-titres', icon: Wallet, color: '#d97706' },
  av: { label: 'Assurance-vie', icon: Landmark, color: '#0891b2' },
}

const FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'pea', label: 'PEA' },
  { id: 'cto', label: 'Compte-titres' },
  { id: 'av', label: 'Assurance-vie' },
]

export default function BrokerComparator() {
  const [filter, setFilter] = useState('all')
  const brokers = filter === 'all' ? BROKERS : BROKERS.filter((b) => b.accounts.includes(filter))

  // Défilement vers le courtier ciblé quand on arrive via une ancre
  // (#broker-<id>) depuis un CTA d'une autre page.
  useEffect(() => {
    const id = window.location.hash.replace('#', '')
    if (!id) return
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <section>
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-navy-800 dark:text-white md:text-3xl">
          <Scale size={26} /> Comparatif des courtiers 2026
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          PEA, compte-titres ou assurance-vie : comparez les frais, les droits de garde et les
          enveloppes de 9 courtiers français pour choisir où ouvrir votre compte.
        </p>
      </header>

      {/* Comment lire ce comparatif */}
      <div className="panel mb-5">
        <div className="eyebrow text-navy-500">
          <Info size={14} /> Comment lire ce comparatif
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ReadGuide icon={Coins} title="Frais par ordre" text="Ce que vous payez à chaque achat ou vente. Décisif si vous investissez souvent." />
          <ReadGuide icon={ShieldCheck} title="Droits de garde" text="Frais annuels pour conserver vos titres. Les meilleurs courtiers facturent 0 €." />
          <ReadGuide icon={Sparkles} title="ETF offerts" text="Beaucoup de courtiers remboursent ou offrent l'achat de certains ETF : un vrai bonus en DCA." />
          <ReadGuide icon={Wallet} title="Enveloppes" text="PEA (exonéré après 5 ans), compte-titres (souple) ou assurance-vie (transmission)." />
        </div>
      </div>

      {/* Filtre par enveloppe */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-navy-400">
          Filtrer&nbsp;:
        </span>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
              filter === f.id
                ? 'border-navy-800 bg-navy-800 text-white'
                : 'border-navy-200 text-navy-600 hover:border-navy-400 dark:border-navy-700 dark:text-navy-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Fiches détaillées */}
      <div className="grid gap-4 lg:grid-cols-2">
        {brokers.map((b) => (
          <BrokerCard key={b.id} broker={b} envelope={filter === 'all' ? b.accounts[0] : filter} />
        ))}
      </div>

      {/* Tableau récapitulatif des frais */}
      <div className="card mt-6">
        <h2 className="mb-1 text-lg font-extrabold text-navy-800 dark:text-white">
          Récapitulatif des frais
        </h2>
        <p className="mb-4 text-sm text-navy-500 dark:text-navy-400">
          Les frais en un coup d'œil. Faites défiler horizontalement sur mobile.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-left text-xs uppercase text-navy-400 dark:border-navy-800">
                <th className="py-2 pr-3">Courtier</th>
                <th className="py-2 pr-3">Enveloppes</th>
                <th className="py-2 pr-3">Frais par ordre</th>
                <th className="py-2 pr-3">Droits de garde</th>
                <th className="py-2">ETF offerts</th>
              </tr>
            </thead>
            <tbody>
              {brokers.map((b) => {
                const env = filter === 'all' ? b.accounts[0] : filter
                const offers = brokerOffers(b, env)
                const primary = offers[0] || {}
                return (
                  <tr key={b.id} className="border-b border-navy-50 align-top last:border-0 dark:border-navy-800">
                    <td className="py-2.5 pr-3 font-bold text-navy-800 dark:text-white">
                      {b.name}
                      <span className="ml-1 text-[10px] font-semibold text-navy-400">
                        ({ENVELOPE_LABELS[env]}
                        {offers.length > 1 ? ` · ${offers.length} offres` : ''})
                      </span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="flex flex-wrap gap-1">
                        {b.accounts.map((a) => (
                          <span key={a} className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            a === env
                              ? 'bg-navy-800 text-white dark:bg-navy-200 dark:text-navy-900'
                              : 'bg-navy-100 text-navy-600 dark:bg-navy-700 dark:text-navy-200'
                          }`}>
                            {ENVELOPE_LABELS[a]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-navy-600 dark:text-navy-300">{primary.orderFee}</td>
                    <td className="py-2.5 pr-3 font-semibold text-navy-700 dark:text-navy-200">{primary.custodyFee}</td>
                    <td className="py-2.5 text-navy-600 dark:text-navy-300">{primary.etfDeal}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] leading-snug text-navy-400">
          Frais indicatifs ({FEES_AS_OF}), simplifiés à des fins pédagogiques et susceptibles d'évoluer.
          Vérifiez la grille tarifaire à jour sur le site du courtier avant d'ouvrir un compte.
        </p>
      </div>

      {/* Lead magnet : le comparatif PDF */}
      <EmailCapture
        className="mt-6"
        variant="band"
        source="broker_comparator"
        leadMagnet="le comparatif PEA 2026"
        title="Recevez le comparatif PEA 2026 (PDF)"
        subtitle="Notre sélection de courtiers, les frais à éviter et les bons ETF pour démarrer — à garder sous la main."
      />

      {/* Pour aller plus loin */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <CrossLink
          to="/comparateur"
          title="PEA, CTO ou assurance-vie ?"
          text="Comparez l'impact de la fiscalité sur vos gains à la sortie."
        />
        <CrossLink
          to="/simulateur-debutant"
          title="Simuler mon investissement"
          text="Voyez ce que votre épargne aurait pu devenir, courtier inclus."
        />
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
//  Sous-composants
// ---------------------------------------------------------------------------
function ReadGuide({ icon: Icon, title, text }) {
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-navy-100 dark:bg-navy-900 dark:ring-navy-800">
      <div className="flex items-center gap-1.5 text-sm font-bold text-navy-800 dark:text-white">
        <Icon size={15} className="text-navy-500 dark:text-navy-300" /> {title}
      </div>
      <p className="mt-1 text-xs leading-snug text-navy-500 dark:text-navy-400">{text}</p>
    </div>
  )
}

function BrokerCard({ broker, envelope }) {
  const isBeginner = BEGINNER_PICKS.has(broker.id)
  const offers = brokerOffers(broker, envelope)
  const [offerIdx, setOfferIdx] = useState(0)
  // Garde-fou si l'enveloppe (et donc le nombre d'offres) change.
  const idx = Math.min(offerIdx, Math.max(0, offers.length - 1))
  const offer = offers[idx] || {}
  const envMeta = ENVELOPE_META[envelope]

  return (
    <div id={`broker-${broker.id}`} className="card flex scroll-mt-24 flex-col">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold text-navy-800 dark:text-white">{broker.name}</h3>
            {isBeginner && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                Bon pour débuter
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm font-semibold text-navy-500 dark:text-navy-400">{broker.bestFor}</p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {broker.accounts.map((a) => {
            const Icon = ENVELOPE_META[a].icon
            const active = a === envelope
            return (
              <span
                key={a}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white"
                style={{ backgroundColor: ENVELOPE_META[a].color, opacity: active ? 1 : 0.4 }}
              >
                <Icon size={11} /> {ENVELOPE_META[a].label}
              </span>
            )
          })}
        </div>
      </div>

      {/* Sélecteur d'offre (système) pour l'enveloppe active */}
      {envMeta && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-white"
            style={{ backgroundColor: envMeta.color }}
          >
            <envMeta.icon size={12} /> Offre {envMeta.label}
          </span>
          {offers.length > 1 ? (
            <select
              value={idx}
              onChange={(e) => setOfferIdx(Number(e.target.value))}
              className="field flex-1 py-1 text-sm font-semibold"
              aria-label={`Choisir l'offre ${envMeta.label} de ${broker.name}`}
            >
              {offers.map((o, i) => (
                <option key={o.name} value={i}>{o.name}</option>
              ))}
            </select>
          ) : (
            <span className="text-sm font-semibold text-navy-700 dark:text-navy-200">{offer.name}</span>
          )}
        </div>
      )}

      {/* Frais clés de l'offre sélectionnée */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <FeeBox label="Par ordre" value={offer.orderFee} />
        <FeeBox label="Droits de garde" value={offer.custodyFee} />
        <FeeBox label="ETF offerts" value={offer.etfDeal} />
      </div>

      {/* Points forts / faibles */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <ul className="space-y-1">
          {broker.pros.map((p) => (
            <li key={p} className="flex items-start gap-1.5 text-[13px] text-navy-600 dark:text-navy-300">
              <Check size={14} className="mt-0.5 shrink-0 text-emerald-500" /> {p}
            </li>
          ))}
        </ul>
        <ul className="space-y-1">
          {broker.cons.map((c) => (
            <li key={c} className="flex items-start gap-1.5 text-[13px] text-navy-500 dark:text-navy-400">
              <X size={14} className="mt-0.5 shrink-0 text-loss" /> {c}
            </li>
          ))}
        </ul>
      </div>

      <a href={broker.url} target="_blank" rel="sponsored nofollow noopener" className="btn-primary mt-4 w-full">
        Découvrir {broker.name} <ExternalLink size={15} />
      </a>
    </div>
  )
}

function FeeBox({ label, value }) {
  return (
    <div className="rounded-lg bg-navy-50/70 p-2 ring-1 ring-navy-100 dark:bg-navy-800/50 dark:ring-navy-800">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-navy-400">{label}</div>
      <div className="mt-0.5 text-xs font-semibold leading-snug text-navy-700 dark:text-navy-200">{value}</div>
    </div>
  )
}

function CrossLink({ to, title, text }) {
  return (
    <Link
      to={to}
      className="card card-link group flex items-center justify-between gap-3"
    >
      <div>
        <div className="text-sm font-bold text-navy-800 dark:text-white">{title}</div>
        <p className="mt-0.5 text-xs text-navy-500 dark:text-navy-400">{text}</p>
      </div>
      <ArrowRight size={18} className="shrink-0 text-navy-400 transition group-hover:translate-x-0.5" />
    </Link>
  )
}
