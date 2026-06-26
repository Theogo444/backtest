// ============================================================================
//  metrics.js — indicateurs de performance et de risque
//  CAGR, ratio de Sharpe, max drawdown, volatilité, rendements annuels, IRR…
// ============================================================================

import { INFLATION_FR } from '../data/defaultAssets'

// ----------------------------------------------------------------------------
//  Formatage
// ----------------------------------------------------------------------------
const eurFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})
const eurFormatter2 = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
})
const pctFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
})

export function formatEUR(v, decimals = 0) {
  if (v == null || Number.isNaN(v)) return '—'
  return decimals === 2 ? eurFormatter2.format(v) : eurFormatter.format(v)
}

export function formatPct(v, signed = false) {
  if (v == null || Number.isNaN(v)) return '—'
  const s = pctFormatter.format(v)
  return signed && v > 0 ? `+${s}` : s
}

export function formatNumber(v, decimals = 2) {
  if (v == null || Number.isNaN(v)) return '—'
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: decimals }).format(v)
}

// ----------------------------------------------------------------------------
//  Indice de portefeuille « buy & hold » de l'allocation cible (base 100)
//  Représente l'exposition au marché de la stratégie : sert au calcul du
//  risque (volatilité, drawdown, Sharpe) et des rendements annuels.
// ----------------------------------------------------------------------------
export function buildBlendedIndex({ dates, prices, allocations, dividendYields, reinvestDividends }) {
  const n = dates.length
  if (n === 0) return []
  const ids = Object.keys(prices)
  // Nombre de parts initiales pour 100€ investis selon l'allocation
  const units = {}
  ids.forEach((id) => {
    const w = allocations[id] ?? 0
    const p0 = prices[id][0]
    units[id] = p0 > 0 ? (100 * w) / p0 : 0
  })
  const index = []
  for (let i = 0; i < n; i++) {
    // Réinvestissement des dividendes : on rachète des parts chaque mois
    if (i > 0 && reinvestDividends) {
      ids.forEach((id) => {
        const y = dividendYields[id] ?? 0
        if (y > 0 && prices[id][i] > 0) {
          const div = units[id] * prices[id][i] * (y / 12)
          units[id] += div / prices[id][i]
        }
      })
    }
    let value = 0
    ids.forEach((id) => {
      value += units[id] * prices[id][i]
    })
    index.push(value)
  }
  return index
}

// ----------------------------------------------------------------------------
//  Rendements mensuels d'un indice
// ----------------------------------------------------------------------------
export function monthlyReturns(index) {
  const r = []
  for (let i = 1; i < index.length; i++) {
    if (index[i - 1] > 0) r.push(index[i] / index[i - 1] - 1)
  }
  return r
}

// Volatilité annualisée (écart-type des rendements mensuels × √12)
export function annualizedVolatility(index) {
  const r = monthlyReturns(index)
  if (r.length < 2) return 0
  const mean = r.reduce((a, b) => a + b, 0) / r.length
  const variance = r.reduce((a, b) => a + (b - mean) ** 2, 0) / (r.length - 1)
  return Math.sqrt(variance) * Math.sqrt(12)
}

// Rendement annualisé moyen (arithmétique annualisé des rendements mensuels)
export function annualizedReturn(index) {
  const r = monthlyReturns(index)
  if (r.length === 0) return 0
  const mean = r.reduce((a, b) => a + b, 0) / r.length
  return mean * 12
}

// CAGR géométrique d'un indice (taux de croissance annuel composé)
export function cagr(index, years) {
  if (index.length < 2 || years <= 0 || index[0] <= 0) return 0
  const total = index[index.length - 1] / index[0]
  return Math.pow(total, 1 / years) - 1
}

// Ratio de Sharpe simplifié : (rendement annualisé − taux sans risque) / vol
export function sharpeRatio(index, riskFreeRate) {
  const vol = annualizedVolatility(index)
  if (vol === 0) return 0
  const ret = annualizedReturn(index)
  return (ret - riskFreeRate) / vol
}

// Max drawdown : plus forte baisse depuis un pic (valeur négative ou 0)
export function maxDrawdown(series) {
  let peak = -Infinity
  let maxDD = 0
  for (const v of series) {
    if (v > peak) peak = v
    if (peak > 0) {
      const dd = v / peak - 1
      if (dd < maxDD) maxDD = dd
    }
  }
  return maxDD
}

// ----------------------------------------------------------------------------
//  Rendements annuels (année civile) à partir de l'indice
//  Retourne [{ year, return }]. La première année peut être partielle.
// ----------------------------------------------------------------------------
export function annualReturns(index, dates) {
  if (index.length === 0) return []
  // Dernière valeur connue par année
  const lastByYear = {}
  const firstValue = index[0]
  const firstYear = Number(dates[0].slice(0, 4))
  dates.forEach((d, i) => {
    const y = Number(d.slice(0, 4))
    lastByYear[y] = index[i]
  })
  const years = Object.keys(lastByYear).map(Number).sort((a, b) => a - b)
  const result = []
  for (let k = 0; k < years.length; k++) {
    const y = years[k]
    const end = lastByYear[y]
    let start
    if (k === 0) start = firstValue
    else start = lastByYear[years[k - 1]]
    if (start > 0) {
      result.push({
        year: y,
        return: end / start - 1,
        partial: k === 0 && firstYear === y && !dates[0].endsWith('01-01'),
      })
    }
  }
  return result
}

// Meilleure / pire année (sur années complètes de préférence)
export function bestWorstYear(annual) {
  const usable = annual.filter((a) => !a.partial)
  const pool = usable.length > 0 ? usable : annual
  if (pool.length === 0) return { best: null, worst: null }
  let best = pool[0]
  let worst = pool[0]
  pool.forEach((a) => {
    if (a.return > best.return) best = a
    if (a.return < worst.return) worst = a
  })
  return { best, worst }
}

// ----------------------------------------------------------------------------
//  Taux de rendement interne (IRR) money-weighted à partir des flux mensuels
//  cashflows : tableau aligné sur les mois ; négatif = apport, dernière valeur
//  inclut la valeur finale du portefeuille en positif.
//  Retourne un taux ANNUEL.
// ----------------------------------------------------------------------------
export function moneyWeightedReturn(cashflows) {
  // Recherche du taux mensuel r tel que VAN = 0, par bissection.
  const npv = (rate) =>
    cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + rate, i), 0)

  let low = -0.9
  let high = 1.0
  let mid = 0
  // S'assure d'un encadrement de la racine
  if (npv(low) * npv(high) > 0) {
    // Pas de changement de signe : rendement non calculable de façon fiable
    return null
  }
  for (let iter = 0; iter < 100; iter++) {
    mid = (low + high) / 2
    const val = npv(mid)
    if (Math.abs(val) < 1e-6) break
    if (npv(low) * val < 0) high = mid
    else low = mid
  }
  // Conversion mensuel → annuel
  return Math.pow(1 + mid, 12) - 1
}

// ----------------------------------------------------------------------------
//  Ajustement à l'inflation : convertit un montant de l'année `year` en euros
//  constants de l'année de départ.
// ----------------------------------------------------------------------------
export function deflate(amount, fromYear, baseYear, inflationIndex) {
  const f = inflationIndex[fromYear] ?? 100
  const b = inflationIndex[baseYear] ?? 100
  return (amount * b) / f
}

// Inflation cumulée entre deux années (en %)
export function cumulativeInflation(startYear, endYear) {
  let factor = 1
  for (let y = startYear; y < endYear; y++) {
    factor *= 1 + (INFLATION_FR[y] ?? 1.8) / 100
  }
  return factor - 1
}

// ----------------------------------------------------------------------------
//  Calcule l'ensemble des métriques à partir d'un résultat de simulation.
// ----------------------------------------------------------------------------
export function computeMetrics({ valueSeries, contributions, blendedIndex, dates, riskFreeRate, years }) {
  const finalValue = valueSeries.length ? valueSeries[valueSeries.length - 1].value : 0
  const totalInvested = valueSeries.length ? valueSeries[valueSeries.length - 1].invested : 0
  const gainAbs = finalValue - totalInvested
  const gainRel = totalInvested > 0 ? gainAbs / totalInvested : 0

  // CAGR money-weighted : flux d'apports négatifs + valeur finale positive
  const cf = contributions.map((c) => -c)
  cf[cf.length - 1] = (cf[cf.length - 1] || 0) + finalValue
  let mwr = null
  try {
    mwr = moneyWeightedReturn(cf)
  } catch {
    mwr = null
  }

  const annual = annualReturns(blendedIndex, dates)
  const { best, worst } = bestWorstYear(annual)

  return {
    finalValue,
    totalInvested,
    gainAbs,
    gainRel,
    cagr: mwr, // rendement annualisé money-weighted
    indexCagr: cagr(blendedIndex, years), // CAGR de l'actif sous-jacent
    volatility: annualizedVolatility(blendedIndex),
    sharpe: sharpeRatio(blendedIndex, riskFreeRate),
    maxDrawdown: maxDrawdown(valueSeries.map((v) => v.value)),
    indexMaxDrawdown: maxDrawdown(blendedIndex),
    bestYear: best,
    worstYear: worst,
    annualReturns: annual,
  }
}
