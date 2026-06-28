// ============================================================================
//  Simulator.jsx — page principale du simulateur de portefeuille
// ============================================================================

import { useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import AssetSearch from './AssetSearch'
import StrategySelector from './StrategySelector'
import ParametersPanel from './ParametersPanel'
import ResultsMetrics from './ResultsMetrics'
import ResultsCharts from './ResultsCharts'
import AdSlot from '../layout/AdSlot'
import ShareResult from '../marketing/ShareResult'
import EmailCapture from '../marketing/EmailCapture'
import { MetricsSkeleton, ChartSkeleton } from '../ui/Skeleton'
import { useSimulation, PERIODS } from '../../hooks/useSimulation'
import { STRATEGIES } from '../../utils/strategies'
import { formatEUR, formatPct } from '../../utils/metrics'
import {
  encodeAdvancedConfig, decodeAdvancedConfig, buildShareUrl,
} from '../../utils/share'

export default function Simulator({ config, updateConfig, marketData }) {
  const { assets, loading, source } = marketData

  const result = useSimulation({ ...config, allAssets: assets })

  // --- Restauration des paramètres depuis l'URL partagée (une seule fois) ---
  const [searchParams] = useSearchParams()
  const restored = useRef(false)
  useEffect(() => {
    if (restored.current) return
    restored.current = true
    const patch = decodeAdvancedConfig(searchParams)
    if (patch) {
      updateConfig({
        ...patch,
        ...(patch.params ? { params: { ...config.params, ...patch.params } } : {}),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // --- Lien partageable + modèle de carte PNG (reflètent la config courante) ---
  const shareUrl = buildShareUrl('/simulateur', encodeAdvancedConfig(config))
  const stratName = STRATEGIES.find((s) => s.id === config.strategy)?.name || 'Backtest'
  const periodLabel = PERIODS.find((p) => p.id === config.period)?.label || ''
  const firstAsset = assets.find((a) => a.id === config.selectedAssets[0]?.id)
  const assetLabel =
    config.selectedAssets.length > 1
      ? `${config.selectedAssets.length} actifs`
      : firstAsset?.name || 'portefeuille'
  const card = result
    ? {
        eyebrow: 'Backtest',
        headline: `${stratName} · ${assetLabel} · ${periodLabel}`,
        bigValue: formatEUR(result.metrics.finalValue),
        bigLabel: `Valeur finale · ${formatEUR(result.metrics.totalInvested)} investis`,
        stats: [
          { label: 'Plus-value', value: formatEUR(result.metrics.gainAbs, 0) },
          { label: 'Perf. annualisée', value: result.metrics.cagr != null ? formatPct(result.metrics.cagr, true) : '—' },
          { label: 'Max drawdown', value: formatPct(result.metrics.maxDrawdown) },
        ],
        footer: shareUrl.replace(/^https?:\/\//, ''),
      }
    : null

  return (
    <section>
      <header className="mb-5">
        <h1 className="text-2xl font-extrabold text-navy-800 dark:text-white md:text-3xl">
          Simulateur avancé
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          Backtestez votre stratégie d'investissement sur données historiques (8 stratégies, frais,
          inflation, benchmark). Débutant ?{' '}
          <Link to="/simulateur-debutant" className="font-semibold text-navy-700 underline dark:text-navy-200">
            Essayez le simulateur guidé
          </Link>
          .
          {source === 'demo' && (
            <span className="ml-1 rounded bg-navy-100 px-1.5 py-0.5 text-xs font-semibold text-navy-500 dark:bg-navy-800">
              données de démonstration
            </span>
          )}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ---------- Colonne de configuration ---------- */}
        <div className="space-y-4 lg:col-span-1">
          <StrategySelector strategy={config.strategy} onChange={(s) => updateConfig({ strategy: s })} />
          <AssetSearch
            allAssets={assets}
            selectedAssets={config.selectedAssets}
            onChange={(sel) => updateConfig({ selectedAssets: sel })}
            autoRebalance={config.autoRebalance}
            onToggleRebalance={(v) => updateConfig({ autoRebalance: v })}
          />
          <ParametersPanel config={config} updateConfig={updateConfig} allAssets={assets} />
        </div>

        {/* ---------- Colonne de résultats ---------- */}
        <div className="space-y-4 lg:col-span-2">
          {loading ? (
            <>
              <MetricsSkeleton />
              <ChartSkeleton />
            </>
          ) : !result ? (
            <div className="card flex items-start gap-3 text-sm text-navy-500">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-navy-400" />
              <p>
                Aucun résultat à afficher. Sélectionnez au moins un actif et vérifiez la période choisie
                (les données démarrent en 2000).
              </p>
            </div>
          ) : (
            <>
              <ResultsMetrics metrics={result.metrics} adjustInflation={result.adjustInflation} />

              {/* AdSense slot: RESULTS_RECTANGLE */}
              <AdSlot format="rectangle" position="RESULTS_RECTANGLE" />

              <ResultsCharts result={result} />

              {/* Partage du backtest (lien + image) */}
              <ShareResult
                url={shareUrl}
                card={card}
                trackingId="simulateur_avance"
                title="Mon backtest d'investissement"
              />

              {/* Capture email contextuelle */}
              <EmailCapture
                variant="band"
                source="simulator_advanced"
                leadMagnet="les meilleures stratégies DCA 2026"
                title="Recevez les meilleures stratégies DCA 2026"
                subtitle="Le guide pour investir au bon rythme, avec les frais et l'enveloppe adaptés à votre profil."
              />
            </>
          )}
        </div>
      </div>
    </section>
  )
}
