// ============================================================================
//  montecarlo.js — simulation de Monte-Carlo
//  Projette N trajectoires futures à partir du rendement moyen et de la
//  volatilité historiques d'un actif (marche aléatoire log-normale).
// ============================================================================

// Tirage gaussien (Box-Muller) — aléatoire à chaque exécution (propre au MC)
function randn() {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

// Estime le rendement et la volatilité MENSUELS à partir d'un indice
export function estimateParams(index) {
  const r = []
  for (let i = 1; i < index.length; i++) {
    if (index[i - 1] > 0) r.push(index[i] / index[i - 1] - 1)
  }
  if (r.length === 0) return { monthlyMean: 0.006, monthlyVol: 0.04 }
  const mean = r.reduce((a, b) => a + b, 0) / r.length
  const variance = r.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, r.length - 1)
  return { monthlyMean: mean, monthlyVol: Math.sqrt(variance) }
}

// Calcule un percentile sur un tableau trié
function percentile(sorted, p) {
  if (sorted.length === 0) return 0
  const idx = (sorted.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

// ----------------------------------------------------------------------------
//  Lance la simulation de Monte-Carlo.
//  Paramètres :
//   - months : horizon en mois
//   - simulations : nombre de trajectoires
//   - monthlyMean / monthlyVol : paramètres de rendement mensuel
//   - initialAmount : capital de départ
//   - monthlyContribution : versement mensuel (DCA)
//   - targetValue : objectif pour calculer la probabilité de l'atteindre
// ----------------------------------------------------------------------------
export function runMonteCarlo({
  months = 120,
  simulations = 1000,
  monthlyMean = 0.006,
  monthlyVol = 0.04,
  initialAmount = 10000,
  monthlyContribution = 0,
  targetValue = 0,
}) {
  const nMonths = Math.max(1, Math.round(months))
  const nSims = Math.max(10, Math.round(simulations))

  // Stockage par mois (colonnes) pour calculer les percentiles
  const perMonth = Array.from({ length: nMonths + 1 }, () => new Float64Array(nSims))
  const finals = new Float64Array(nSims)
  let totalInvested = initialAmount + monthlyContribution * nMonths

  for (let s = 0; s < nSims; s++) {
    let value = initialAmount
    perMonth[0][s] = value
    for (let m = 1; m <= nMonths; m++) {
      const r = monthlyMean + monthlyVol * randn()
      value = value * (1 + r) + monthlyContribution
      if (value < 0) value = 0
      perMonth[m][s] = value
    }
    finals[s] = value
  }

  // Bandes de percentiles mois par mois
  const bands = []
  for (let m = 0; m <= nMonths; m++) {
    const col = Array.from(perMonth[m]).sort((a, b) => a - b)
    bands.push({
      month: m,
      p10: percentile(col, 0.1),
      p25: percentile(col, 0.25),
      p50: percentile(col, 0.5),
      p75: percentile(col, 0.75),
      p90: percentile(col, 0.9),
    })
  }

  const sortedFinals = Array.from(finals).sort((a, b) => a - b)
  const probReachTarget =
    targetValue > 0 ? finals.reduce((acc, v) => acc + (v >= targetValue ? 1 : 0), 0) / nSims : null

  return {
    bands,
    totalInvested,
    median: percentile(sortedFinals, 0.5),
    p10: percentile(sortedFinals, 0.1),
    p90: percentile(sortedFinals, 0.9),
    min: sortedFinals[0],
    max: sortedFinals[sortedFinals.length - 1],
    probReachTarget,
    simulations: nSims,
    months: nMonths,
  }
}
