// ============================================================================
//  useSimulation.js
//  Orchestration : prépare les données alignées sur la période choisie, lance
//  le moteur de simulation, calcule le benchmark et les métriques.
// ============================================================================

import { useMemo } from 'react'
import { simulate } from '../utils/strategies'
import { buildBlendedIndex, computeMetrics, deflate } from '../utils/metrics'
import { INFLATION_INDEX, RISK_FREE_RATE, getAssetById } from '../data/defaultAssets'

// ----------------------------------------------------------------------------
//  Périodes prédéfinies → nombre de mois d'historique
// ----------------------------------------------------------------------------
export const PERIODS = [
  { id: '1w', label: '1 semaine', months: 1 },
  { id: '1m', label: '1 mois', months: 1 },
  { id: '3m', label: '3 mois', months: 3 },
  { id: '6m', label: '6 mois', months: 6 },
  { id: '1y', label: '1 an', months: 12 },
  { id: '3y', label: '3 ans', months: 36 },
  { id: '5y', label: '5 ans', months: 60 },
  { id: '10y', label: '10 ans', months: 120 },
  { id: '20y', label: '20 ans', months: 240 },
  { id: 'max', label: 'Max', months: Infinity },
  { id: 'custom', label: 'Personnalisée', months: null },
]

// ----------------------------------------------------------------------------
//  Détermine les indices de début/fin dans le calendrier global
// ----------------------------------------------------------------------------
function resolveRange({ calendar, period, customStart, customEnd }) {
  const n = calendar.length
  if (period === 'custom' && customStart && customEnd) {
    let start = calendar.findIndex((d) => d >= customStart)
    let end = calendar.findIndex((d) => d > customEnd)
    if (start < 0) start = 0
    end = end < 0 ? n - 1 : Math.max(start, end - 1)
    return { start, end }
  }
  const def = PERIODS.find((p) => p.id === period)
  const months = def?.months ?? Infinity
  if (!Number.isFinite(months)) return { start: 0, end: n - 1 }
  const start = Math.max(0, n - 1 - months)
  return { start, end: n - 1 }
}

// ----------------------------------------------------------------------------
//  Prépare les tableaux alignés (dates + prix par actif) pour la période
// ----------------------------------------------------------------------------
export function prepareAlignedData({ assets, period, customStart, customEnd }) {
  if (!assets.length) return { dates: [], prices: {}, years: 0 }
  // Toutes les séries partagent le même calendrier mensuel
  const calendar = assets[0].series.map((p) => p.date)
  const { start, end } = resolveRange({ calendar, period, customStart, customEnd })
  const dates = calendar.slice(start, end + 1)
  const prices = {}
  assets.forEach((a) => {
    prices[a.id] = a.series.slice(start, end + 1).map((p) => p.close)
  })
  const years = Math.max(dates.length - 1, 1) / 12
  return { dates, prices, years, start, end }
}

// ----------------------------------------------------------------------------
//  Exécute une simulation complète (portefeuille + benchmark + métriques)
// ----------------------------------------------------------------------------
export function runFullSimulation(config) {
  const {
    selectedAssets, // [{ id, allocation }]
    allAssets, // tous les actifs disponibles (avec séries)
    strategy,
    params,
    period,
    customStart,
    customEnd,
    fees,
    feeAnnualMgmt,
    reinvestDividends,
    adjustInflation,
    autoRebalance,
    benchmarkId = 'msci-world',
  } = config

  // Récupère les objets actifs complets (avec séries + dividendes)
  const assetObjs = selectedAssets
    .map((sa) => {
      const full = allAssets.find((a) => a.id === sa.id) || getAssetById(sa.id)
      return full ? { ...full, allocation: sa.allocation } : null
    })
    .filter(Boolean)

  if (assetObjs.length === 0) return null

  const { dates, prices, years } = prepareAlignedData({
    assets: assetObjs,
    period,
    customStart,
    customEnd,
  })

  if (dates.length < 2) return null

  // --- Simulation du portefeuille ---
  const simAssets = assetObjs.map((a) => ({
    id: a.id,
    allocation: a.allocation,
    dividendYield: a.dividendYield,
    isCash: a.isCash,
  }))

  const sim = simulate({
    dates,
    assets: simAssets,
    prices,
    strategy,
    params,
    fees,
    feeAnnualMgmt,
    reinvestDividends,
    autoRebalance,
  })

  // --- Indice « buy & hold » de l'allocation (pour le risque / annuel) ---
  const allocations = sim.allocation
  const dividendYields = {}
  assetObjs.forEach((a) => (dividendYields[a.id] = a.dividendYield))
  const blendedIndex = buildBlendedIndex({
    dates,
    prices,
    allocations,
    dividendYields,
    reinvestDividends,
  })

  // --- Benchmark : même stratégie appliquée au MSCI World ---
  let benchmark = null
  const benchAsset = allAssets.find((a) => a.id === benchmarkId) || getAssetById(benchmarkId)
  if (benchAsset && benchmarkId !== assetObjs[0]?.id) {
    const benchAligned = prepareAlignedData({ assets: [benchAsset], period, customStart, customEnd })
    const benchPrices = { [benchAsset.id]: benchAsset.series.slice(benchAligned.start, benchAligned.end + 1).map((p) => p.close) }
    const benchSim = simulate({
      dates,
      assets: [{ id: benchAsset.id, allocation: 100, dividendYield: benchAsset.dividendYield }],
      prices: benchPrices,
      strategy,
      params,
      fees,
      feeAnnualMgmt,
      reinvestDividends,
    })
    benchmark = {
      name: benchAsset.name,
      valueSeries: benchSim.valueSeries,
      finalValue: benchSim.valueSeries[benchSim.valueSeries.length - 1]?.value ?? 0,
    }
  }

  // --- Ajustement à l'inflation (euros constants de l'année de départ) ---
  const startYear = Number(dates[0].slice(0, 4))
  let valueSeries = sim.valueSeries
  if (adjustInflation) {
    valueSeries = sim.valueSeries.map((pt) => {
      const y = Number(pt.date.slice(0, 4))
      return {
        ...pt,
        value: deflate(pt.value, y, startYear, INFLATION_INDEX),
        invested: deflate(pt.invested, y, startYear, INFLATION_INDEX),
        nominalValue: pt.value,
      }
    })
  }

  // --- Métriques ---
  const metrics = computeMetrics({
    valueSeries,
    contributions: sim.contributions,
    blendedIndex,
    dates,
    riskFreeRate: RISK_FREE_RATE,
    years,
  })

  return {
    valueSeries,
    blendedIndex,
    benchmark,
    metrics,
    dates,
    years,
    assetObjs,
    allocations,
    finalUnits: sim.finalUnits,
    adjustInflation,
    startYear,
  }
}

// ----------------------------------------------------------------------------
//  Hook : mémorise le résultat tant que la configuration ne change pas
// ----------------------------------------------------------------------------
export function useSimulation(config) {
  return useMemo(() => {
    try {
      return runFullSimulation(config)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Erreur de simulation :', e)
      return null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(serializeConfig(config)), config.allAssets])
}

// Sérialise la config (hors gros objets) pour la clé de mémoïsation
function serializeConfig(config) {
  const { allAssets, ...rest } = config
  return rest
}
