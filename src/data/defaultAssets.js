// ============================================================================
//  defaultAssets.js
//  Actifs pré-chargés avec séries historiques mensuelles.
//
//  Les données réelles proviennent normalement de Yahoo Finance (voir
//  useMarketData.js). Ce fichier fournit un JEU DE DONNÉES DE SECOURS
//  réaliste, généré de façon DÉTERMINISTE (PRNG à graine fixe) afin que les
//  courbes soient stables d'un chargement à l'autre.
//
//  Modèle : un facteur de marché « actions » commun (krachs synchronisés :
//  bulle internet 2000-2002, crise de 2008, COVID 2020, marché baissier 2022)
//  auquel chaque actif réagit via un bêta + un rendement spécifique (alpha) +
//  un bruit idiosyncratique. L'or et le Livret A suivent leur propre logique.
// ============================================================================

const START_YEAR = 2000
const START_MONTH = 1 // janvier
const END_YEAR = 2026
const END_MONTH = 6 // juin

// ----------------------------------------------------------------------------
//  Générateur pseudo-aléatoire déterministe (mulberry32) + bruit gaussien
// ----------------------------------------------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Loi normale centrée réduite via Box-Muller
function gaussian(rng) {
  let u = 0
  let v = 0
  while (u === 0) u = rng()
  while (v === 0) v = rng()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

// ----------------------------------------------------------------------------
//  Calendrier mensuel (premier de chaque mois) de START à END
// ----------------------------------------------------------------------------
function buildMonthlyCalendar() {
  const dates = []
  let y = START_YEAR
  let m = START_MONTH
  while (y < END_YEAR || (y === END_YEAR && m <= END_MONTH)) {
    const mm = String(m).padStart(2, '0')
    dates.push({ date: `${y}-${mm}-01`, y, m })
    m += 1
    if (m > 12) {
      m = 1
      y += 1
    }
  }
  return dates
}

const CALENDAR = buildMonthlyCalendar()

// ----------------------------------------------------------------------------
//  Régimes du facteur de marché « actions » : rendement (mu) & volatilité
//  (sigma) MENSUELS du prix (hors dividendes). Index temporel ym = y*12 + m.
// ----------------------------------------------------------------------------
function marketMonthlyParams(y, m) {
  const ym = y * 12 + m
  const inRange = (y1, m1, y2, m2) => ym >= y1 * 12 + m1 && ym <= y2 * 12 + m2

  // Bulle internet (2000-09 → 2002-09)
  if (inRange(2000, 9, 2002, 9)) return { mu: -0.021, sigma: 0.052 }
  // Reprise / bull market (2002-10 → 2007-09)
  if (inRange(2002, 10, 2007, 9)) return { mu: 0.012, sigma: 0.028 }
  // Crise financière mondiale (2007-10 → 2009-02)
  if (inRange(2007, 10, 2009, 2)) return { mu: -0.041, sigma: 0.062 }
  // Long bull market post-crise (2009-03 → 2020-01)
  if (inRange(2009, 3, 2020, 1)) return { mu: 0.0105, sigma: 0.031 }
  // Krach COVID (2020-02 → 2020-03)
  if (inRange(2020, 2, 2020, 3)) return { mu: -0.125, sigma: 0.08 }
  // Reprise COVID (2020-04 → 2021-12)
  if (inRange(2020, 4, 2021, 12)) return { mu: 0.022, sigma: 0.034 }
  // Marché baissier 2022 (inflation, hausse des taux)
  if (inRange(2022, 1, 2022, 9)) return { mu: -0.024, sigma: 0.045 }
  // Reprise & IA (2022-10 → 2024-12)
  if (inRange(2022, 10, 2024, 12)) return { mu: 0.018, sigma: 0.03 }
  // 2025-2026 : croissance modérée
  if (inRange(2025, 1, 2026, 6)) return { mu: 0.008, sigma: 0.033 }
  // Tout début 2000 (avant le krach) : légère hausse
  return { mu: 0.006, sigma: 0.04 }
}

// Or : valeur refuge — fort en période de crise, plus calme sinon (mensuel)
function goldMonthlyParams(y, m) {
  const ym = y * 12 + m
  const inRange = (y1, m1, y2, m2) => ym >= y1 * 12 + m1 && ym <= y2 * 12 + m2
  if (inRange(2007, 10, 2011, 8)) return { mu: 0.018, sigma: 0.04 } // ruée vers l'or post-2008
  if (inRange(2011, 9, 2015, 12)) return { mu: -0.006, sigma: 0.038 } // dégonflement
  if (inRange(2019, 1, 2020, 8)) return { mu: 0.017, sigma: 0.036 } // tensions + COVID
  if (inRange(2023, 1, 2026, 6)) return { mu: 0.015, sigma: 0.035 } // record 2023-2025
  return { mu: 0.003, sigma: 0.035 }
}

// ----------------------------------------------------------------------------
//  Facteur de marché commun (généré une seule fois, partagé par les actions)
// ----------------------------------------------------------------------------
function buildMarketFactor(seed) {
  const rng = mulberry32(seed)
  return CALENDAR.map(({ y, m }) => {
    const { mu, sigma } = marketMonthlyParams(y, m)
    return mu + gaussian(rng) * sigma
  })
}

const MARKET_FACTOR = buildMarketFactor(20240101)

// ----------------------------------------------------------------------------
//  Génère la série de prix d'un actif action via un modèle à un facteur
//  r_t = alpha_mensuel + beta * marché_t + bruit_idio
// ----------------------------------------------------------------------------
function generateEquitySeries({ seed, startPrice, beta, alphaAnnual, idioVol }) {
  const rng = mulberry32(seed)
  const alphaMonthly = Math.pow(1 + alphaAnnual, 1 / 12) - 1
  let price = startPrice
  return CALENDAR.map((c, i) => {
    if (i > 0) {
      const r = alphaMonthly + beta * MARKET_FACTOR[i] + gaussian(rng) * idioVol
      price *= 1 + r
    }
    return { date: c.date, close: Math.round(price * 100) / 100 }
  })
}

// Génère la série de l'or (facteur dédié)
function generateGoldSeries({ seed, startPrice, idioVol }) {
  const rng = mulberry32(seed)
  let price = startPrice
  return CALENDAR.map((c, i) => {
    if (i > 0) {
      const { mu, sigma } = goldMonthlyParams(c.y, c.m)
      const r = mu + gaussian(rng) * (sigma * 0.4 + idioVol)
      price *= 1 + r
    }
    return { date: c.date, close: Math.round(price * 100) / 100 }
  })
}

// ----------------------------------------------------------------------------
//  Livret A : taux réglementé historique (capitalisation, aucune volatilité)
// ----------------------------------------------------------------------------
function livretAnnualRate(y) {
  // Taux moyens annuels approximatifs du Livret A
  const table = {
    2000: 3.0, 2001: 3.0, 2002: 3.0, 2003: 2.4, 2004: 2.25, 2005: 2.25,
    2006: 2.75, 2007: 3.0, 2008: 3.75, 2009: 1.75, 2010: 1.75, 2011: 2.1,
    2012: 2.25, 2013: 1.75, 2014: 1.1, 2015: 0.75, 2016: 0.75, 2017: 0.75,
    2018: 0.75, 2019: 0.75, 2020: 0.5, 2021: 0.5, 2022: 1.375, 2023: 2.92,
    2024: 3.0, 2025: 2.4, 2026: 2.4,
  }
  return (table[y] ?? 2.0) / 100
}

function generateLivretSeries({ startPrice }) {
  let price = startPrice
  return CALENDAR.map((c, i) => {
    if (i > 0) {
      const monthlyRate = Math.pow(1 + livretAnnualRate(c.y), 1 / 12) - 1
      price *= 1 + monthlyRate
    }
    return { date: c.date, close: Math.round(price * 10000) / 10000 }
  })
}

// ----------------------------------------------------------------------------
//  Définition des actifs pré-chargés
// ----------------------------------------------------------------------------
export const DEFAULT_ASSETS = [
  {
    id: 'sp500',
    ticker: '^GSPC',
    yahoo: '^GSPC',
    name: 'S&P 500',
    description: '500 plus grandes capitalisations américaines',
    type: 'Indice',
    color: '#2563eb',
    dividendYield: 0.018, // rendement du dividende annuel
    series: generateEquitySeries({ seed: 101, startPrice: 1425, beta: 1.0, alphaAnnual: 0.006, idioVol: 0.012 }),
  },
  {
    id: 'msci-world',
    ticker: 'URTH',
    yahoo: 'URTH',
    name: 'MSCI World',
    description: 'Actions des pays développés (~1500 sociétés)',
    type: 'ETF',
    color: '#0891b2',
    dividendYield: 0.02,
    series: generateEquitySeries({ seed: 202, startPrice: 1000, beta: 0.92, alphaAnnual: 0.002, idioVol: 0.009 }),
  },
  {
    id: 'cac40',
    ticker: '^FCHI',
    yahoo: '^FCHI',
    name: 'CAC 40',
    description: '40 plus grandes capitalisations françaises',
    type: 'Indice',
    color: '#7c3aed',
    dividendYield: 0.03,
    series: generateEquitySeries({ seed: 303, startPrice: 5900, beta: 1.0, alphaAnnual: -0.022, idioVol: 0.016 }),
  },
  {
    id: 'nasdaq100',
    ticker: '^NDX',
    yahoo: '^NDX',
    name: 'Nasdaq 100',
    description: '100 plus grandes valeurs technologiques américaines',
    type: 'Indice',
    color: '#db2777',
    dividendYield: 0.008,
    series: generateEquitySeries({ seed: 404, startPrice: 3700, beta: 1.32, alphaAnnual: 0.028, idioVol: 0.02 }),
  },
  {
    id: 'gold',
    ticker: 'GC=F',
    yahoo: 'GC=F',
    name: 'Or',
    description: 'Once d\'or (valeur refuge)',
    type: 'Matière première',
    color: '#d97706',
    dividendYield: 0,
    series: generateGoldSeries({ seed: 505, startPrice: 280, idioVol: 0.012 }),
  },
  {
    id: 'livret-a',
    ticker: 'LIVRET-A',
    yahoo: null, // pas de cotation : taux réglementé
    name: 'Livret A',
    description: 'Épargne réglementée garantie par l\'État (taux fixe)',
    type: 'Épargne',
    color: '#16a34a',
    dividendYield: 0,
    isCash: true,
    series: generateLivretSeries({ startPrice: 100 }),
  },
]

// ----------------------------------------------------------------------------
//  Inflation française annuelle (IPC INSEE, approximatif) — pour l'ajustement
//  des montants en euros constants.
// ----------------------------------------------------------------------------
export const INFLATION_FR = {
  2000: 1.7, 2001: 1.7, 2002: 1.9, 2003: 2.1, 2004: 2.1, 2005: 1.8,
  2006: 1.6, 2007: 1.5, 2008: 2.8, 2009: 0.1, 2010: 1.5, 2011: 2.1,
  2012: 2.0, 2013: 0.9, 2014: 0.5, 2015: 0.0, 2016: 0.2, 2017: 1.0,
  2018: 1.8, 2019: 1.1, 2020: 0.5, 2021: 1.6, 2022: 5.2, 2023: 4.9,
  2024: 2.0, 2025: 1.6, 2026: 1.8,
}

// Indice des prix base 100 au point de départ — facilite les conversions
export function buildInflationIndex() {
  const idx = {}
  let value = 100
  for (let y = START_YEAR; y <= END_YEAR; y++) {
    idx[y] = value
    value *= 1 + (INFLATION_FR[y] ?? 1.8) / 100
  }
  return idx
}

export const INFLATION_INDEX = buildInflationIndex()

// ----------------------------------------------------------------------------
//  Helpers
// ----------------------------------------------------------------------------
export function getAssetById(id) {
  return DEFAULT_ASSETS.find((a) => a.id === id) || null
}

// Recherche simple par nom ou ticker (insensible à la casse / accents)
export function searchAssets(query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return DEFAULT_ASSETS
  return DEFAULT_ASSETS.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.ticker.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q),
  )
}

export const DATA_START = `${START_YEAR}-${String(START_MONTH).padStart(2, '0')}-01`
export const DATA_END = `${END_YEAR}-${String(END_MONTH).padStart(2, '0')}-01`

// Taux sans risque moyen (≈ Livret A) utilisé pour le ratio de Sharpe
export const RISK_FREE_RATE = 0.018
