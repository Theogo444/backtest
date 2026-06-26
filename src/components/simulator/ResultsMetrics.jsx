// ============================================================================
//  ResultsMetrics.jsx — cartes de métriques clés
// ============================================================================

import { TrendingUp, TrendingDown, Wallet, PiggyBank, Activity, ArrowDownRight, Percent, BarChart3, ShieldCheck } from 'lucide-react'
import Tooltip from '../ui/Tooltip'
import { formatEUR, formatPct, metricBenchmarks } from '../../utils/metrics'

const CHIP_TONE = {
  gain: 'bg-gain/15 text-gain',
  loss: 'bg-loss/15 text-loss',
  neutral: 'bg-navy-100 text-navy-500 dark:bg-navy-800 dark:text-navy-300',
}

// Petite pastille d'évaluation (Bon / Correct / Sévère…)
function RatingChip({ rating }) {
  if (!rating || rating.label === '—') return null
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${CHIP_TONE[rating.tone] || CHIP_TONE.neutral}`}>
      {rating.label}
    </span>
  )
}

function MetricCard({ icon: Icon, label, value, sub, tooltip, tone = 'neutral', rating, reference }) {
  const toneClass =
    tone === 'gain' ? 'text-gain' : tone === 'loss' ? 'text-loss' : 'text-navy-800 dark:text-white'
  // La référence est ajoutée à l'infobulle pour servir de repère pédagogique
  const fullTooltip = reference ? (
    <>
      {tooltip}
      <span className="mt-1.5 block border-t border-navy-700 pt-1.5 text-navy-300">{reference}</span>
    </>
  ) : (
    tooltip
  )
  return (
    <div className="card">
      <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-navy-400">
        {Icon && <Icon size={13} />}
        <span>{label}</span>
        {(tooltip || reference) && <Tooltip text={fullTooltip} />}
      </div>
      <div className="flex items-center gap-2">
        <div className={`text-xl font-extrabold tabular-nums ${toneClass}`}>{value}</div>
        {rating && <RatingChip rating={rating} />}
      </div>
      {sub && <div className="mt-0.5 text-xs text-navy-400">{sub}</div>}
    </div>
  )
}

export default function ResultsMetrics({ metrics, adjustInflation }) {
  if (!metrics) return null

  const gainTone = metrics.gainAbs >= 0 ? 'gain' : 'loss'
  const bench = metricBenchmarks(metrics)
  const profile = bench.profile

  return (
    <div className="space-y-3">
    {/* Bandeau de profil de risque déduit de la volatilité */}
    <div
      className="flex flex-col gap-1 rounded-xl border-l-4 bg-white px-4 py-3 shadow-sm dark:bg-navy-800 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
      style={{ borderColor: profile.color }}
    >
      <div className="flex items-center gap-2">
        <ShieldCheck size={18} style={{ color: profile.color }} />
        <span className="text-sm text-navy-500 dark:text-navy-300">
          Profil de risque estimé :{' '}
          <strong className="font-bold" style={{ color: profile.color }}>
            {profile.label}
          </strong>
        </span>
        <Tooltip text="Profil déduit de la volatilité annualisée de votre portefeuille. Les repères des métriques ci-dessous (Sharpe, drawdown, performance…) sont calés sur ce profil." />
      </div>
      <span className="text-xs text-navy-400">{profile.desc}</span>
    </div>

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <MetricCard
        icon={Wallet}
        label="Valeur finale"
        value={formatEUR(metrics.finalValue)}
        sub={adjustInflation ? 'en euros constants' : 'valeur brute'}
        tooltip="Valeur du portefeuille à la fin de la période (avant impôts)."
      />
      <MetricCard
        icon={PiggyBank}
        label="Total investi"
        value={formatEUR(metrics.totalInvested)}
        tooltip="Somme totale de vos apports sur la période."
      />
      <MetricCard
        icon={metrics.gainAbs >= 0 ? TrendingUp : TrendingDown}
        label="Plus-value"
        value={formatEUR(metrics.gainAbs)}
        sub={formatPct(metrics.gainRel, true)}
        tone={gainTone}
        tooltip="Gain (ou perte) en euros et en pourcentage du total investi."
      />
      <MetricCard
        icon={Percent}
        label="Performance annualisée"
        value={metrics.cagr != null ? formatPct(metrics.cagr, true) : '—'}
        sub="TRI (money-weighted)"
        tone={metrics.cagr >= 0 ? 'gain' : 'loss'}
        tooltip="Taux de rendement annuel composé tenant compte du calendrier de vos apports (TRI)."
        rating={bench.cagr.rating}
        reference={bench.cagr.reference}
      />
      <MetricCard
        icon={BarChart3}
        label="Meilleure année"
        value={metrics.bestYear ? formatPct(metrics.bestYear.return, true) : '—'}
        sub={metrics.bestYear ? String(metrics.bestYear.year) : ''}
        tone="gain"
        tooltip="Meilleure performance annuelle de l'actif sous-jacent sur la période."
      />
      <MetricCard
        icon={BarChart3}
        label="Pire année"
        value={metrics.worstYear ? formatPct(metrics.worstYear.return, true) : '—'}
        sub={metrics.worstYear ? String(metrics.worstYear.year) : ''}
        tone="loss"
        tooltip="Pire performance annuelle de l'actif sous-jacent sur la période."
      />
      <MetricCard
        icon={Activity}
        label="Ratio de Sharpe"
        value={metrics.sharpe != null ? metrics.sharpe.toFixed(2) : '—'}
        sub="rendement / risque"
        tone={bench.sharpe.rating.tone}
        tooltip="Rendement excédentaire (au-delà du Livret A) par unité de risque. Plus c'est élevé, mieux c'est."
        rating={bench.sharpe.rating}
        reference={bench.sharpe.reference}
      />
      <MetricCard
        icon={ArrowDownRight}
        label="Max Drawdown"
        value={formatPct(metrics.maxDrawdown)}
        tone="loss"
        tooltip="Plus forte baisse subie depuis un sommet. Mesure la douleur maximale."
        rating={bench.maxDrawdown.rating}
        reference={bench.maxDrawdown.reference}
      />
      <MetricCard
        icon={Activity}
        label="Volatilité annualisée"
        value={formatPct(metrics.volatility)}
        tooltip="Amplitude des variations annuelles. Plus c'est élevé, plus c'est risqué."
        rating={bench.volatility.rating}
        reference={bench.volatility.reference}
      />
      <MetricCard
        icon={Percent}
        label="CAGR de l'actif"
        value={formatPct(metrics.indexCagr, true)}
        sub="hors calendrier d'apports"
        tone={metrics.indexCagr >= 0 ? 'gain' : 'loss'}
        tooltip="Croissance annuelle composée de l'actif sous-jacent (buy & hold)."
      />
    </div>
    </div>
  )
}
