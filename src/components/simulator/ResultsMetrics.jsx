// ============================================================================
//  ResultsMetrics.jsx — cartes de métriques clés
// ============================================================================

import { TrendingUp, TrendingDown, Wallet, PiggyBank, Activity, ArrowDownRight, Percent, BarChart3 } from 'lucide-react'
import Tooltip from '../ui/Tooltip'
import { formatEUR, formatPct } from '../../utils/metrics'

function MetricCard({ icon: Icon, label, value, sub, tooltip, tone = 'neutral' }) {
  const toneClass =
    tone === 'gain' ? 'text-gain' : tone === 'loss' ? 'text-loss' : 'text-navy-800 dark:text-white'
  return (
    <div className="card">
      <div className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-navy-400">
        {Icon && <Icon size={13} />}
        <span>{label}</span>
        {tooltip && <Tooltip text={tooltip} />}
      </div>
      <div className={`text-xl font-extrabold tabular-nums ${toneClass}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-navy-400">{sub}</div>}
    </div>
  )
}

export default function ResultsMetrics({ metrics, adjustInflation }) {
  if (!metrics) return null

  const gainTone = metrics.gainAbs >= 0 ? 'gain' : 'loss'

  return (
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
        tooltip="Rendement excédentaire (au-delà du Livret A) par unité de risque. Plus c'est élevé, mieux c'est."
      />
      <MetricCard
        icon={ArrowDownRight}
        label="Max Drawdown"
        value={formatPct(metrics.maxDrawdown)}
        tone="loss"
        tooltip="Plus forte baisse subie depuis un sommet. Mesure la douleur maximale."
      />
      <MetricCard
        icon={Activity}
        label="Volatilité annualisée"
        value={formatPct(metrics.volatility)}
        tooltip="Amplitude des variations annuelles. Plus c'est élevé, plus c'est risqué."
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
  )
}
