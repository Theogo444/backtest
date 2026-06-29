// ============================================================================
//  BeginnerSimulator.jsx — simulateur guidé pour débutants.
//  Parcours en étapes : courtier → enveloppe → actifs → montant & plan →
//  résultat clair, avec graphique simple et phrase de synthèse.
//
//  Réutilise le moteur du simulateur avancé (useSimulation) et le calcul fiscal
//  (compareEnvelopes). Les frais du courtier choisi alimentent le moteur.
// ============================================================================

import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
} from 'recharts'
import {
  Rocket, Coins, CalendarClock, TrendingDown, PiggyBank, Wallet, Landmark,
  Check, ArrowRight, Info, Star, AlertTriangle, Sparkles,
} from 'lucide-react'
import AssetSearch from './AssetSearch'
import ShareResult from '../marketing/ShareResult'
import EmailCapture from '../marketing/EmailCapture'
import { useSimulation } from '../../hooks/useSimulation'
import { compareEnvelopes } from '../../utils/fiscalite'
import { formatEUR, formatPct } from '../../utils/metrics'
import { BROKERS, getBroker, brokerFeeConfig, ENVELOPE_LABELS, FEES_AS_OF } from '../../data/brokers'
import { encodeBeginnerState, decodeBeginnerState, buildShareUrl } from '../../utils/share'

// ---------------------------------------------------------------------------
//  Métadonnées éditoriales
// ---------------------------------------------------------------------------
const ENVELOPE_INFO = {
  pea: {
    label: 'PEA', icon: PiggyBank,
    tip: "Actions et ETF européens. Vos gains sont exonérés d'impôt après 5 ans (hors prélèvements sociaux de 17,2 %).",
  },
  cto: {
    label: 'Compte-titres', icon: Wallet,
    tip: "Accès au monde entier, aucun plafond. Vos gains sont imposés à la « flat tax » de 30 %.",
  },
  av: {
    label: 'Assurance-vie', icon: Landmark,
    tip: "Fonds euros et ETF. Fiscalité douce après 8 ans et atout pour la transmission, mais des frais de gestion annuels.",
  },
}

const PLANS = [
  {
    id: 'lump-sum', name: 'En une fois', icon: Coins, kind: 'oneoff',
    tagline: "J'investis tout mon capital maintenant",
    explain:
      "Vous placez la totalité de votre argent en une seule fois, aujourd'hui. C'est simple et historiquement payant quand on investit tôt — mais plus exposé si le marché baisse juste après votre achat.",
    amountLabel: 'Montant investi en une fois',
  },
  {
    id: 'dca', name: 'Un peu chaque mois', icon: CalendarClock, kind: 'monthly',
    tagline: "J'investis la même somme tous les mois (DCA)",
    explain:
      "Vous investissez un montant fixe chaque mois, quel que soit le niveau du marché. Vous lissez votre prix d'achat et supprimez le stress du « bon moment ». C'est la méthode la plus simple et la plus rassurante pour débuter.",
    amountLabel: 'Montant investi chaque mois',
  },
  {
    id: 'dca-dynamic', name: 'Renforcé dans les creux', icon: TrendingDown, kind: 'monthly',
    tagline: "Comme le DCA, mais j'investis plus quand ça baisse",
    explain:
      "Même principe que le DCA, mais vous investissez davantage les mois de baisse et moins les mois de hausse : vous essayez d'acheter « en solde ». Un peu plus exigeant émotionnellement, mais malin sur le long terme.",
    amountLabel: 'Montant de base chaque mois',
  },
]

const DURATIONS = [
  { id: '5y', label: '5 ans' },
  { id: '10y', label: '10 ans' },
  { id: '20y', label: '20 ans' },
]

const MONTHLY_PICKS = [50, 100, 200, 500]
const ONEOFF_PICKS = [1000, 5000, 10000, 20000]

// ---------------------------------------------------------------------------
//  Composant principal
// ---------------------------------------------------------------------------
export default function BeginnerSimulator({ marketData }) {
  const { assets, loading } = marketData

  const [brokerId, setBrokerId] = useState('bourse-direct')
  const [envelope, setEnvelope] = useState('pea')
  const [selectedAssets, setSelectedAssets] = useState([{ id: 'msci-world', allocation: 100 }])
  const [autoRebalance, setAutoRebalance] = useState(false)
  const [planId, setPlanId] = useState('dca')
  const [amount, setAmount] = useState(200)
  const [period, setPeriod] = useState('10y')

  const broker = getBroker(brokerId)
  const plan = PLANS.find((p) => p.id === planId) || PLANS[0]

  // Le courtier choisi ne propose pas l'enveloppe courante → on bascule.
  useEffect(() => {
    if (!broker.accounts.includes(envelope)) setEnvelope(broker.accounts[0])
  }, [brokerId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Restauration des paramètres depuis l'URL partagée (une seule fois).
  const [searchParams] = useSearchParams()
  const restored = useRef(false)
  useEffect(() => {
    if (restored.current) return
    restored.current = true
    const s = decodeBeginnerState(searchParams)
    if (!s) return
    if (s.brokerId) setBrokerId(s.brokerId)
    if (s.envelope) setEnvelope(s.envelope)
    if (s.selectedAssets) setSelectedAssets(s.selectedAssets)
    if (s.planId) setPlanId(s.planId)
    if (s.amount != null) setAmount(s.amount)
    if (s.period) setPeriod(s.period)
    if (s.autoRebalance) setAutoRebalance(s.autoRebalance)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Configuration moteur (frais du courtier + enveloppe).
  const cfg = useMemo(() => {
    const { fees, feeAnnualMgmt } = brokerFeeConfig(broker, envelope)
    const a = Number(amount) || 0
    const params =
      plan.id === 'lump-sum'
        ? { initialAmount: a }
        : plan.id === 'dca'
          ? { initialAmount: 0, dcaAmount: a, frequency: 'monthly' }
          : { initialAmount: 0, baseAmount: a, multiplier: 2, threshold: 10 }
    return {
      selectedAssets,
      allAssets: assets,
      strategy: plan.id,
      params,
      period,
      fees,
      feeAnnualMgmt,
      reinvestDividends: true,
      adjustInflation: false,
      autoRebalance,
      benchmarkId: 'msci-world',
    }
  }, [broker, envelope, amount, plan.id, selectedAssets, assets, period, autoRebalance])

  const result = useSimulation(cfg)

  const getAsset = (id) => assets.find((a) => a.id === id)
  const assetNames = selectedAssets.map((s) => getAsset(s.id)?.name).filter(Boolean)
  const ineligible = selectedAssets
    .map((s) => getAsset(s.id))
    .filter((a) => a && a.envelopes && a.envelopes[envelope] === false)

  const summary = useMemo(() => {
    if (!result) return null
    const { finalValue, totalInvested, cagr } = result.metrics
    const years = Math.max(1, Math.round(result.years))
    const comp = compareEnvelopes({ finalValue, invested: totalInvested, years, ctoMethod: 'pfu' })
    const env = comp.envelopes.find((e) => e.id === envelope) || comp.envelopes[0]
    const netGain = env.netFinal - totalInvested
    return {
      years, totalInvested,
      grossFinal: finalValue,
      tax: env.tax,
      netFinal: env.netFinal,
      netGain,
      multiple: totalInvested > 0 ? env.netFinal / totalInvested : 0,
      cagr,
    }
  }, [result, envelope])

  const chartData = useMemo(() => {
    if (!result) return []
    return result.valueSeries.map((pt) => ({
      date: pt.date,
      year: pt.date.slice(0, 4),
      investi: Math.round(pt.invested),
      valeur: Math.round(pt.value),
    }))
  }, [result])

  const picks = plan.kind === 'monthly' ? MONTHLY_PICKS : ONEOFF_PICKS

  // Lien partageable + carte PNG (reflètent les choix courants).
  const shareUrl = buildShareUrl(
    '/simulateur-debutant',
    encodeBeginnerState({ brokerId, envelope, selectedAssets, planId, amount, period, autoRebalance }),
  )
  const shareCard = summary
    ? {
        eyebrow: `${broker.name} · ${ENVELOPE_LABELS[envelope]}`,
        headline: `${plan.kind === 'monthly' ? `${formatEUR(Number(amount) || 0)}/mois` : formatEUR(Number(amount) || 0)} sur ${assetNames.length <= 1 ? assetNames[0] || 'votre portefeuille' : `${assetNames.length} actifs`} pendant ${summary.years} ans`,
        bigValue: formatEUR(summary.netFinal),
        bigLabel: `Valeur finale nette · ${formatEUR(summary.totalInvested)} investis`,
        stats: [
          { label: 'Plus-value nette', value: formatEUR(summary.netGain, 0) },
          { label: 'Votre argent ×', value: summary.multiple > 0 ? `${summary.multiple.toFixed(1)}×` : '—' },
          { label: 'Rendement/an', value: summary.cagr != null ? formatPct(summary.cagr, true) : '—' },
        ],
        footer: 'simulateur-portefeuille.fr',
      }
    : null

  return (
    <section>
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-navy-800 dark:text-white md:text-3xl">
          <Rocket size={26} /> Simulateur débutant
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          En 4 étapes simples, voyez ce que votre épargne aurait pu devenir. Choisissez, et le
          résultat s'actualise tout seul.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ----------------------- Colonne configuration ----------------------- */}
        <div className="space-y-4 lg:col-span-1">
          {/* Étape 1 — Courtier */}
          <div className="card">
            <StepTitle n={1} title="Choisissez votre courtier" />
            <p className="mb-3 text-xs text-navy-400">
              C'est l'intermédiaire chez qui vous ouvrez votre compte. Ses frais réduisent vos gains.
            </p>
            <div className="space-y-2">
              {BROKERS.map((b) => (
                <BrokerOption
                  key={b.id}
                  broker={b}
                  selected={b.id === brokerId}
                  onSelect={() => setBrokerId(b.id)}
                />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-navy-400">
              Frais indicatifs ({FEES_AS_OF}), à vérifier sur le site du courtier.
            </p>
          </div>

          {/* Étape 2 — Enveloppe */}
          <div className="card">
            <StepTitle n={2} title="Choisissez votre enveloppe" />
            <p className="mb-3 text-xs text-navy-400">
              Le « compte » fiscal dans lequel vous investissez. Il détermine vos impôts à la sortie.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {['pea', 'cto', 'av'].map((env) => {
                const available = broker.accounts.includes(env)
                const Icon = ENVELOPE_INFO[env].icon
                const active = envelope === env
                return (
                  <button
                    key={env}
                    disabled={!available}
                    onClick={() => setEnvelope(env)}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-center transition ${
                      active
                        ? 'border-navy-800 bg-navy-800 text-white'
                        : available
                          ? 'border-navy-200 text-navy-600 hover:border-navy-400 dark:border-navy-700 dark:text-navy-300'
                          : 'cursor-not-allowed border-navy-100 text-navy-300 opacity-50 dark:border-navy-800'
                    }`}
                    title={available ? '' : `${broker.name} ne propose pas cette enveloppe`}
                  >
                    <Icon size={18} />
                    <span className="text-xs font-bold">{ENVELOPE_INFO[env].label}</span>
                  </button>
                )
              })}
            </div>
            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-navy-500 dark:text-navy-400">
              <Info size={13} className="mt-0.5 shrink-0" /> {ENVELOPE_INFO[envelope].tip}
            </p>
          </div>

          {/* Étape 3 — Actifs */}
          <div>
            <StepTitle n={3} title="Dans quoi investissez-vous ?" className="mb-2 px-1" />
            <AssetSearch
              allAssets={assets}
              selectedAssets={selectedAssets}
              onChange={setSelectedAssets}
              autoRebalance={autoRebalance}
              onToggleRebalance={setAutoRebalance}
            />
            <p className="mt-2 flex items-start gap-1.5 px-1 text-[11px] leading-snug text-navy-500 dark:text-navy-400">
              <Sparkles size={13} className="mt-0.5 shrink-0" />
              Pas sûr ? Un <strong className="mx-1 font-semibold">ETF Monde (MSCI World)</strong> est
              le grand classique pour débuter : il investit dans plus de 1 500 entreprises mondiales.
            </p>
            {ineligible.length > 0 && (
              <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] leading-snug text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                {ineligible.map((a) => a.name).join(', ')} n'{ineligible.length > 1 ? 'sont' : 'est'} pas
                éligible{ineligible.length > 1 ? 's' : ''} au {ENVELOPE_LABELS[envelope]}. Le résultat
                reste indicatif.
              </p>
            )}
          </div>

          {/* Étape 4 — Montant & plan */}
          <div className="card">
            <StepTitle n={4} title="Combien et comment ?" />

            <label className="label mt-1">{plan.amountLabel}</label>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center rounded-lg border border-navy-200 bg-white px-3 py-2 focus-within:border-navy-500 dark:border-navy-700 dark:bg-navy-800">
                <input
                  type="number" min="0" step="10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent text-lg font-bold tabular-nums outline-none"
                />
                <span className="text-sm font-semibold text-navy-400">
                  {plan.kind === 'monthly' ? '€/mois' : '€'}
                </span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {picks.map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                    Number(amount) === v
                      ? 'border-navy-800 bg-navy-800 text-white'
                      : 'border-navy-200 text-navy-600 hover:border-navy-400 dark:border-navy-700 dark:text-navy-300'
                  }`}
                >
                  {formatEUR(v)}
                </button>
              ))}
            </div>

            <label className="label mt-4">Votre plan d'investissement</label>
            <div className="space-y-2">
              {PLANS.map((p) => (
                <PlanOption
                  key={p.id}
                  plan={p}
                  selected={p.id === planId}
                  onSelect={() => setPlanId(p.id)}
                />
              ))}
            </div>

            <label className="label mt-4">Pendant combien de temps ?</label>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setPeriod(d.id)}
                  className={`rounded-lg border px-2 py-2 text-sm font-semibold transition ${
                    period === d.id
                      ? 'border-navy-800 bg-navy-800 text-white'
                      : 'border-navy-200 text-navy-600 hover:border-navy-400 dark:border-navy-700 dark:text-navy-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-navy-400">
              La simulation s'appuie sur les {period.replace('y', '')} dernières années de marché réelles.
            </p>
          </div>
        </div>

        {/* ----------------------- Colonne résultat ----------------------- */}
        <div className="space-y-4 lg:col-span-2">
          {loading ? (
            <div className="card h-64 animate-pulse" />
          ) : !summary ? (
            <div className="card flex items-start gap-3 text-sm text-navy-500">
              <Info size={18} className="mt-0.5 shrink-0 text-navy-400" />
              <p>Sélectionnez au moins un actif pour voir le résultat.</p>
            </div>
          ) : (
            <>
              <ResultPanel
                broker={broker}
                envelope={envelope}
                plan={plan}
                amount={Number(amount) || 0}
                assetNames={assetNames}
                summary={summary}
                chartData={chartData}
              />

              {/* Partage du résultat (lien + image) */}
              <ShareResult
                url={shareUrl}
                card={shareCard}
                trackingId="simulateur_debutant"
                title="Ma simulation d'investissement"
              />

              {/* Capture email contextuelle */}
              <EmailCapture
                variant="band"
                source="simulator_beginner"
                leadMagnet="le comparatif PEA 2026"
                title="Recevez le comparatif PEA 2026"
                subtitle="Le bon courtier, les bons ETF et les frais à éviter — pour bien démarrer."
              />
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
//  Sous-composants
// ---------------------------------------------------------------------------
function StepTitle({ n, title, className = 'mb-3' }) {
  return (
    <h2 className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-navy-700 dark:text-navy-200 ${className}`}>
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-800 text-[11px] font-bold text-white">
        {n}
      </span>
      {title}
    </h2>
  )
}

function BrokerOption({ broker, selected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-lg border p-2.5 text-left transition ${
        selected
          ? 'border-navy-800 bg-navy-50 ring-1 ring-navy-800 dark:bg-navy-800/60'
          : 'border-navy-200 hover:border-navy-400 dark:border-navy-700'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-navy-800 dark:text-white">{broker.name}</span>
          {selected && <Check size={14} className="text-gain" />}
        </span>
        <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
          <Star size={11} fill="currentColor" /> {broker.rating.toFixed(1)}
        </span>
      </div>
      <div className="mt-0.5 flex flex-wrap items-center gap-1">
        {broker.accounts.map((a) => (
          <span key={a} className="rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-bold text-navy-600 dark:bg-navy-700 dark:text-navy-200">
            {ENVELOPE_LABELS[a]}
          </span>
        ))}
      </div>
      <div className="mt-1 text-[11px] text-navy-500 dark:text-navy-400">{broker.feeSummary}</div>
    </button>
  )
}

function PlanOption({ plan, selected, onSelect }) {
  const Icon = plan.icon
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-lg border p-3 text-left transition ${
        selected
          ? 'border-navy-800 bg-navy-50 ring-1 ring-navy-800 dark:bg-navy-800/60'
          : 'border-navy-200 hover:border-navy-400 dark:border-navy-700'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} className="shrink-0 text-navy-700 dark:text-navy-200" />
        <span className="text-sm font-bold text-navy-800 dark:text-white">{plan.name}</span>
        {selected && <Check size={14} className="ml-auto text-gain" />}
      </div>
      <p className="mt-0.5 text-[11px] font-semibold text-navy-500 dark:text-navy-400">{plan.tagline}</p>
      {selected && (
        <p className="mt-1.5 text-[11px] leading-snug text-navy-500 dark:text-navy-400">{plan.explain}</p>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
//  Panneau de résultat
// ---------------------------------------------------------------------------
function ResultPanel({ broker, envelope, plan, amount, assetNames, summary, chartData }) {
  const positive = summary.netGain >= 0
  const amountPhrase =
    plan.kind === 'monthly' ? `${formatEUR(amount)} par mois` : `${formatEUR(amount)} en une fois`
  const assetsPhrase =
    assetNames.length === 0
      ? 'votre portefeuille'
      : assetNames.length === 1
        ? assetNames[0]
        : `votre portefeuille (${assetNames.length} actifs)`

  return (
    <>
      {/* Phrase de synthèse */}
      <div className="card bg-gradient-to-br from-navy-800 to-navy-950 text-white ring-navy-800">
        <div className="text-xs font-semibold uppercase tracking-wide text-navy-200">Votre résultat</div>
        <p className="mt-2 text-lg leading-relaxed md:text-xl">
          Avec <strong className="font-extrabold">{broker.name}</strong>, sur un{' '}
          <strong className="font-extrabold">{ENVELOPE_LABELS[envelope]}</strong>, en investissant{' '}
          <strong className="font-extrabold">{amountPhrase}</strong> sur{' '}
          <strong className="font-extrabold">{assetsPhrase}</strong> pendant{' '}
          <strong className="font-extrabold">{summary.years} ans</strong>, vous auriez obtenu environ{' '}
          <span className="whitespace-nowrap rounded bg-white/15 px-1.5 font-extrabold">
            {formatEUR(summary.netFinal)}
          </span>
          .
        </p>
        <p className="mt-2 text-sm text-navy-200">
          Soit{' '}
          <strong className={positive ? 'text-emerald-300' : 'text-red-300'}>
            {formatEUR(summary.netGain, 0)} {positive ? 'de gains' : 'de pertes'}
          </strong>{' '}
          nets de frais et d'impôts, à partir de {formatEUR(summary.totalInvested)} investis.
        </p>
      </div>

      {/* Chiffres clés */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KeyStat label="Total investi" value={formatEUR(summary.totalInvested)} />
        <KeyStat label="Valeur finale nette" value={formatEUR(summary.netFinal)} tone="navy" />
        <KeyStat
          label="Plus-value nette"
          value={formatEUR(summary.netGain, 0)}
          tone={positive ? 'gain' : 'loss'}
        />
        <KeyStat
          label="Votre argent ×"
          value={summary.multiple > 0 ? `${summary.multiple.toFixed(1)}×` : '—'}
          tone="gain"
        />
      </div>

      {/* Graphique simple */}
      <div className="card">
        <h3 className="mb-1 text-sm font-bold text-navy-700 dark:text-navy-200">
          L'évolution de votre épargne
        </h3>
        <p className="mb-3 text-xs text-navy-400">
          En bleu, ce que vous auriez versé ; en vert, la valeur de votre portefeuille.
        </p>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gValeur" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="gInvesti" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e3a5f" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#1e3a5f" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#94a3b833" vertical={false} />
              <XAxis
                dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false} tickLine={false} minTickGap={28}
              />
              <YAxis
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                tick={{ fill: '#94a3b8', fontSize: 11 }} width={40}
                axisLine={false} tickLine={false}
              />
              <RTooltip
                formatter={(v, name) => [formatEUR(v), name === 'valeur' ? 'Valeur' : 'Investi']}
                labelFormatter={(l) => `Année ${l}`}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Area type="monotone" dataKey="investi" stroke="#1e3a5f" strokeWidth={1.5} fill="url(#gInvesti)" />
              <Area type="monotone" dataKey="valeur" stroke="#16a34a" strokeWidth={2} fill="url(#gValeur)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Détail frais & impôt + rendement */}
      <div className="card">
        <h3 className="mb-3 text-sm font-bold text-navy-700 dark:text-navy-200">Ce qui a été pris en compte</h3>
        <div className="space-y-2 text-sm">
          <DetailRow label={`Frais du courtier (${broker.name})`} value={broker.feeSummary} />
          <DetailRow
            label={`Impôt à la sortie (${ENVELOPE_LABELS[envelope]})`}
            value={summary.tax > 0 ? `− ${formatEUR(summary.tax)}` : 'aucun'}
            tone={summary.tax > 0 ? 'loss' : 'gain'}
          />
          <DetailRow
            label="Rendement annualisé (votre versement)"
            value={summary.cagr != null ? formatPct(summary.cagr, true) : '—'}
            tone={summary.cagr >= 0 ? 'gain' : 'loss'}
          />
        </div>
        <p className="mt-3 text-[11px] leading-snug text-navy-400">
          Les frais du courtier et l'impôt de l'enveloppe sont déjà déduits du résultat affiché.
          Performances passées sur données réelles : elles ne préjugent pas des performances futures.
        </p>
      </div>

      {/* CTA affiliation */}
      <div className="card border-l-4 border-l-navy-800 bg-navy-50/60 dark:bg-navy-900/60">
        <div className="text-xs font-semibold uppercase tracking-wide text-navy-500">Passer à l'action</div>
        <div className="mt-1 text-lg font-extrabold text-navy-800 dark:text-white">
          Ouvrir un {ENVELOPE_LABELS[envelope]} chez {broker.name}
        </div>
        <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">{broker.bestFor}.</p>
        <a href={broker.url} rel="sponsored nofollow" className="btn-primary mt-3">
          Ouvrir un compte <ArrowRight size={16} />
        </a>
        <p className="mt-2 text-[11px] text-navy-400">
          Lien partenaire — sans surcoût pour vous. N'influence pas notre sélection.
        </p>
      </div>
    </>
  )
}

function KeyStat({ label, value, tone }) {
  const color =
    tone === 'gain' ? 'text-gain' : tone === 'loss' ? 'text-loss' : 'text-navy-800 dark:text-white'
  return (
    <div className="card flex flex-col py-3">
      <div className="min-h-[2rem] text-[11px] font-semibold uppercase leading-tight text-navy-400">{label}</div>
      <div className={`mt-auto text-lg font-extrabold tabular-nums ${color}`}>{value}</div>
    </div>
  )
}

function DetailRow({ label, value, tone }) {
  const color = tone === 'gain' ? 'text-gain' : tone === 'loss' ? 'text-loss' : 'text-navy-700 dark:text-navy-200'
  return (
    <div className="flex items-center justify-between gap-3 border-b border-navy-50 pb-2 last:border-0 dark:border-navy-800">
      <span className="text-navy-500 dark:text-navy-400">{label}</span>
      <span className={`text-right font-semibold tabular-nums ${color}`}>{value}</span>
    </div>
  )
}
