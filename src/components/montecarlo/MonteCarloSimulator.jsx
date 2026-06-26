// ============================================================================
//  MonteCarloSimulator.jsx — projection probabiliste (Monte-Carlo)
//  Réutilise les paramètres du simulateur principal (rendement & volatilité
//  historiques de l'allocation choisie).
// ============================================================================

import { useState, useMemo } from 'react'
import { Dices, RefreshCw, Target } from 'lucide-react'
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
} from 'recharts'
import AdSlot from '../layout/AdSlot'
import { useSimulation } from '../../hooks/useSimulation'
import { runMonteCarlo, estimateParams } from '../../utils/montecarlo'
import { formatEUR, formatPct } from '../../utils/metrics'

export default function MonteCarloSimulator({ config, marketData }) {
  const result = useSimulation({ ...config, allAssets: marketData.assets })

  // Paramètres historiques estimés à partir de l'allocation du simulateur
  const params = useMemo(
    () => (result ? estimateParams(result.blendedIndex) : { monthlyMean: 0.006, monthlyVol: 0.04 }),
    [result],
  )

  const defaultMonthly =
    config.strategy === 'dca' ? Number(config.params.dcaAmount) || 0 : 0

  const [settings, setSettings] = useState({
    simulations: 1000,
    years: 20,
    initialAmount: Number(config.params.initialAmount) || 10000,
    monthlyContribution: defaultMonthly,
    targetValue: 100000,
  })
  const [runSeed, setRunSeed] = useState(1)

  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }))

  const mc = useMemo(() => {
    return runMonteCarlo({
      months: settings.years * 12,
      simulations: settings.simulations,
      monthlyMean: params.monthlyMean,
      monthlyVol: params.monthlyVol,
      initialAmount: settings.initialAmount,
      monthlyContribution: settings.monthlyContribution,
      targetValue: settings.targetValue,
    })
    // runSeed force une nouvelle exécution (l'aléa change à chaque clic)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, params, runSeed])

  // Données de l'éventail (bandes empilées + médiane)
  const fanData = mc.bands.map((b) => ({
    month: b.month,
    lo: b.p10,
    seg1: b.p25 - b.p10,
    seg2: b.p75 - b.p25,
    seg3: b.p90 - b.p75,
    p50: b.p50,
  }))

  const annualReturn = params.monthlyMean * 12
  const annualVol = params.monthlyVol * Math.sqrt(12)

  return (
    <section>
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-navy-800 dark:text-white md:text-3xl">
          <Dices size={26} /> Monte Carlo
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          Des milliers de scénarios de marché aléatoires basés sur l'historique de votre allocation
          {result && <> ({result.assetObjs.map((a) => a.name).join(', ')})</>}.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Réglages */}
        <div className="card space-y-3 lg:col-span-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-navy-700 dark:text-navy-200">Réglages</h2>

          <div>
            <label className="label">Nombre de simulations : {settings.simulations}</label>
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={settings.simulations}
              onChange={(e) => set('simulations', Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer accent-navy-700"
            />
          </div>

          <Field label="Horizon" value={settings.years} onChange={(v) => set('years', Number(v))} suffix="ans" />
          <Field label="Capital initial" value={settings.initialAmount} onChange={(v) => set('initialAmount', Number(v))} step={1000} suffix="€" />
          <Field label="Versement mensuel" value={settings.monthlyContribution} onChange={(v) => set('monthlyContribution', Number(v))} step={50} suffix="€" />
          <Field label="Objectif à atteindre" value={settings.targetValue} onChange={(v) => set('targetValue', Number(v))} step={5000} suffix="€" />

          <div className="rounded-lg bg-navy-50 px-3 py-2 text-xs text-navy-500 dark:bg-navy-800">
            Hypothèses (historique) : rendement{' '}
            <strong className="text-navy-700 dark:text-navy-200">{formatPct(annualReturn, true)}</strong>/an, volatilité{' '}
            <strong className="text-navy-700 dark:text-navy-200">{formatPct(annualVol)}</strong>.
          </div>

          <button onClick={() => setRunSeed((s) => s + 1)} className="btn-primary w-full">
            <RefreshCw size={15} /> Relancer les simulations
          </button>
        </div>

        {/* Résultats */}
        <div className="space-y-4 lg:col-span-2">
          {/* Cartes */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Médiane" value={formatEUR(mc.median)} tone="neutral" />
            <StatCard label="Pessimiste (10 %)" value={formatEUR(mc.p10)} tone="loss" />
            <StatCard label="Optimiste (90 %)" value={formatEUR(mc.p90)} tone="gain" />
            <StatCard
              label="Total investi"
              value={formatEUR(mc.totalInvested)}
              tone="neutral"
            />
          </div>

          {/* Probabilité d'objectif */}
          {mc.probReachTarget != null && (
            <div className="card flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy-800 text-white">
                <Target size={24} />
              </div>
              <div>
                <div className="text-sm text-navy-500">
                  Probabilité d'atteindre <strong>{formatEUR(settings.targetValue)}</strong> en {settings.years} ans
                </div>
                <div
                  className={`text-3xl font-extrabold ${
                    mc.probReachTarget >= 0.5 ? 'text-gain' : mc.probReachTarget >= 0.25 ? 'text-amber-500' : 'text-loss'
                  }`}
                >
                  {formatPct(mc.probReachTarget)}
                </div>
              </div>
            </div>
          )}

          {/* Éventail */}
          <div className="card">
            <h3 className="mb-2 text-sm font-bold text-navy-700 dark:text-navy-200">Éventail des trajectoires possibles</h3>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <ComposedChart data={fanData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#94a3b833" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(m) => `${Math.round(m / 12)}a`}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    minTickGap={30}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fill: '#94a3b8', fontSize: 11 }} width={48} axisLine={false} tickLine={false} />
                  <RTooltip
                    formatter={(v, n) => {
                      const labels = { p50: 'Médiane', seg3: '90ᵉ pct.', seg1: '10ᵉ pct.' }
                      if (n === 'lo' || n === 'seg2') return null
                      return [formatEUR(v), labels[n] || n]
                    }}
                    labelFormatter={(m) => `Année ${Math.round(m / 12)}`}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  {/* Base transparente puis bandes de percentiles empilées */}
                  <Area type="monotone" dataKey="lo" stackId="1" stroke="none" fill="transparent" />
                  <Area type="monotone" dataKey="seg1" stackId="1" stroke="none" fill="#1e3a5f" fillOpacity={0.12} />
                  <Area type="monotone" dataKey="seg2" stackId="1" stroke="none" fill="#1e3a5f" fillOpacity={0.28} />
                  <Area type="monotone" dataKey="seg3" stackId="1" stroke="none" fill="#1e3a5f" fillOpacity={0.12} />
                  <Line type="monotone" dataKey="p50" stroke="#1e3a5f" strokeWidth={2.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-navy-400">
              Zone foncée : 50 % des scénarios (25ᵉ–75ᵉ percentile). Zone claire : 80 % (10ᵉ–90ᵉ percentile). Ligne :
              médiane.
            </p>
          </div>

          {/* AdSense slot: MONTECARLO_RECTANGLE */}
          <AdSlot format="rectangle" position="MONTECARLO_RECTANGLE" />
        </div>
      </div>
    </section>
  )
}

function Field({ label, value, onChange, suffix, step = 1 }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-1">
        <input type="number" value={value} step={step} onChange={(e) => onChange(e.target.value)} className="field" />
        {suffix && <span className="text-xs text-navy-400">{suffix}</span>}
      </div>
    </div>
  )
}

function StatCard({ label, value, tone }) {
  const toneClass = tone === 'gain' ? 'text-gain' : tone === 'loss' ? 'text-loss' : 'text-navy-800 dark:text-white'
  return (
    <div className="card">
      <div className="text-xs font-semibold uppercase text-navy-400">{label}</div>
      <div className={`text-lg font-extrabold tabular-nums ${toneClass}`}>{value}</div>
    </div>
  )
}
