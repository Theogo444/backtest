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
//  Éligibilité des enveloppes fiscales françaises (PEA / CTO / Assurance-vie)
//
//  Règles pédagogiques retenues :
//   • PEA  : réservé aux actions de sociétés ayant leur siège dans l'UE / EEE,
//            et aux ETF « éligibles PEA » (souvent synthétiques) qui répliquent
//            des indices mondiaux ou hors-Europe. Pas d'or, pas d'obligations,
//            pas d'actions américaines/suisses/britanniques/asiatiques en direct.
//   • CTO  : aucune restriction — tous les actifs cotés sont éligibles.
//   • AV   : unités de compte des contrats d'assurance-vie. En pratique : ETF,
//            fonds et matières premières « papier » oui ; actions en direct non.
//  Le Livret A est une épargne réglementée : aucune des trois enveloppes.
// ----------------------------------------------------------------------------
const PAYS_UE_EEE = new Set([
  'France', 'Allemagne', 'Pays-Bas', 'Espagne', 'Italie', 'Danemark',
  'Irlande', 'Belgique', 'Finlande', 'Portugal', 'Suède', 'Zone euro', 'Europe',
])

// Détermine l'éligibilité {pea, cto, av} à partir du type et de la région
function deriveEnvelopes({ type, region, peaEligible }) {
  if (type === 'Épargne') return { pea: false, cto: false, av: false }
  if (type === 'Action') return { pea: PAYS_UE_EEE.has(region), cto: true, av: false }
  if (type === 'Matière première') return { pea: false, cto: true, av: true }
  // ETF / Indice : CTO + AV toujours, PEA selon le flag explicite
  return { pea: !!peaEligible, cto: true, av: true }
}

// ----------------------------------------------------------------------------
//  Fabrique d'actif « action » : génère la série et attache les métadonnées.
//  Les graines (seed) sont attribuées de façon déterministe et incrémentale ;
//  l'ordre du tableau de specs garantit la stabilité des courbes.
// ----------------------------------------------------------------------------
let _seedCounter = 1000
function makeEquity(spec) {
  _seedCounter += 7
  return {
    id: spec.id,
    ticker: spec.ticker,
    yahoo: spec.ticker,
    name: spec.name,
    description: spec.description,
    type: spec.type || 'Action',
    region: spec.region,
    sector: spec.sector,
    color: spec.color,
    dividendYield: spec.dividendYield ?? 0,
    envelopes: spec.envelopes || deriveEnvelopes({ type: spec.type || 'Action', region: spec.region, peaEligible: spec.peaEligible }),
    series: generateEquitySeries({
      seed: spec.seed ?? _seedCounter,
      startPrice: spec.startPrice,
      beta: spec.beta,
      alphaAnnual: spec.alphaAnnual,
      idioVol: spec.idioVol,
    }),
  }
}

// ----------------------------------------------------------------------------
//  Indices & ETF historiques (graines d'origine conservées pour la stabilité)
// ----------------------------------------------------------------------------
const CORE_ASSETS = [
  {
    id: 'sp500', ticker: '^GSPC', name: 'S&P 500',
    description: '500 plus grandes capitalisations américaines',
    type: 'Indice', region: 'États-Unis', sector: 'Indice large', color: '#2563eb',
    dividendYield: 0.018, peaEligible: true, // répliqué par des ETF éligibles PEA (ex : Amundi PEA S&P 500)
    series: generateEquitySeries({ seed: 101, startPrice: 1425, beta: 1.0, alphaAnnual: 0.006, idioVol: 0.012 }),
  },
  {
    id: 'msci-world', ticker: 'URTH', name: 'MSCI World',
    description: 'Actions des pays développés (~1500 sociétés)',
    type: 'ETF', region: 'Monde', sector: 'Indice large', color: '#0891b2',
    dividendYield: 0.02, peaEligible: true, // ETF World éligibles PEA (ex : Amundi PEA Monde)
    series: generateEquitySeries({ seed: 202, startPrice: 1000, beta: 0.92, alphaAnnual: 0.002, idioVol: 0.009 }),
  },
  {
    id: 'cac40', ticker: '^FCHI', name: 'CAC 40',
    description: '40 plus grandes capitalisations françaises',
    type: 'Indice', region: 'France', sector: 'Indice large', color: '#7c3aed',
    dividendYield: 0.03, peaEligible: true,
    series: generateEquitySeries({ seed: 303, startPrice: 5900, beta: 1.0, alphaAnnual: -0.022, idioVol: 0.016 }),
  },
  {
    id: 'nasdaq100', ticker: '^NDX', name: 'Nasdaq 100',
    description: '100 plus grandes valeurs technologiques américaines',
    type: 'Indice', region: 'États-Unis', sector: 'Technologie', color: '#db2777',
    dividendYield: 0.008, peaEligible: true, // ETF Nasdaq éligibles PEA (ex : Amundi PEA Nasdaq-100)
    series: generateEquitySeries({ seed: 404, startPrice: 3700, beta: 1.32, alphaAnnual: 0.028, idioVol: 0.02 }),
  },
  {
    id: 'gold', ticker: 'GC=F', name: 'Or',
    description: 'Once d\'or (valeur refuge)',
    type: 'Matière première', region: 'Monde', sector: 'Métaux précieux', color: '#d97706',
    dividendYield: 0,
    series: generateGoldSeries({ seed: 505, startPrice: 280, idioVol: 0.012 }),
  },
  {
    id: 'livret-a', ticker: 'LIVRET-A', name: 'Livret A',
    description: 'Épargne réglementée garantie par l\'État (taux fixe)',
    type: 'Épargne', region: 'France', sector: 'Épargne réglementée', color: '#16a34a',
    dividendYield: 0, isCash: true,
    series: generateLivretSeries({ startPrice: 100 }),
  },
].map((a) => ({
  ...a,
  yahoo: a.id === 'livret-a' ? null : a.ticker,
  envelopes: deriveEnvelopes(a),
}))

// ----------------------------------------------------------------------------
//  ETF supplémentaires (zones géographiques, secteurs, obligations)
// ----------------------------------------------------------------------------
const ETF_SPECS = [
  { id: 'msci-em', ticker: 'IEMG', name: 'MSCI Emerging Markets', sector: 'Indice large', region: 'Émergents', type: 'ETF', color: '#0d9488', dividendYield: 0.025, peaEligible: true, startPrice: 1000, beta: 1.1, alphaAnnual: -0.012, idioVol: 0.02, description: 'Actions des pays émergents (Chine, Inde, Brésil…)' },
  { id: 'stoxx600', ticker: 'EXSA.DE', name: 'STOXX Europe 600', sector: 'Indice large', region: 'Europe', type: 'ETF', color: '#6366f1', dividendYield: 0.03, peaEligible: true, startPrice: 200, beta: 0.85, alphaAnnual: -0.004, idioVol: 0.012, description: '600 grandes & moyennes capitalisations européennes' },
  { id: 'eurostoxx50', ticker: '^STOXX50E', name: 'Euro Stoxx 50', sector: 'Indice large', region: 'Zone euro', type: 'ETF', color: '#8b5cf6', dividendYield: 0.032, peaEligible: true, startPrice: 3800, beta: 0.95, alphaAnnual: -0.012, idioVol: 0.014, description: '50 plus grandes capitalisations de la zone euro' },
  { id: 'world-esg', ticker: 'SUSW.L', name: 'MSCI World SRI (ESG)', sector: 'ISR / ESG', region: 'Monde', type: 'ETF', color: '#22c55e', dividendYield: 0.018, peaEligible: true, startPrice: 1000, beta: 0.9, alphaAnnual: 0.004, idioVol: 0.01, description: 'Actions mondiales filtrées selon des critères ESG' },
  { id: 'russell2000', ticker: 'IWM', name: 'Russell 2000', sector: 'Petites capitalisations', region: 'États-Unis', type: 'ETF', color: '#f97316', dividendYield: 0.013, peaEligible: false, startPrice: 500, beta: 1.2, alphaAnnual: -0.004, idioVol: 0.022, description: '2000 petites capitalisations américaines' },
  { id: 'topix', ticker: '^TPX', name: 'TOPIX Japon', sector: 'Indice large', region: 'Japon', type: 'ETF', color: '#ef4444', dividendYield: 0.02, peaEligible: false, startPrice: 1500, beta: 0.7, alphaAnnual: -0.008, idioVol: 0.02, description: "Indice large de la bourse de Tokyo" },
  { id: 'msci-india', ticker: 'INDA', name: 'MSCI India', sector: 'Indice pays', region: 'Inde', type: 'ETF', color: '#f59e0b', dividendYield: 0.012, peaEligible: false, startPrice: 300, beta: 0.9, alphaAnnual: 0.02, idioVol: 0.03, description: 'Actions indiennes (forte croissance)' },
  { id: 'world-tech', ticker: 'XDWT.DE', name: 'MSCI World Technology', sector: 'Technologie', region: 'Monde', type: 'ETF', color: '#3b82f6', dividendYield: 0.006, peaEligible: false, startPrice: 200, beta: 1.25, alphaAnnual: 0.02, idioVol: 0.018, description: 'Valeurs technologiques mondiales' },
  { id: 'clean-energy', ticker: 'ICLN', name: 'Énergies propres', sector: 'Énergie / Thématique', region: 'Monde', type: 'ETF', color: '#10b981', dividendYield: 0.008, peaEligible: false, startPrice: 100, beta: 1.15, alphaAnnual: -0.01, idioVol: 0.03, description: 'Producteurs mondiaux d\'énergies renouvelables' },
  { id: 'oblig-euro', ticker: 'IEAG.AS', name: 'Obligations d\'État euro', sector: 'Obligations', region: 'Zone euro', type: 'ETF', color: '#64748b', dividendYield: 0.022, peaEligible: false, startPrice: 200, beta: 0.06, alphaAnnual: -0.004, idioVol: 0.008, description: 'Emprunts d\'État de la zone euro (faible risque)' },
]

// ----------------------------------------------------------------------------
//  Actions de référence — diversifiées par pays et par secteur
// ----------------------------------------------------------------------------
const STOCK_SPECS = [
  // --- États-Unis (non éligibles PEA, hors AV) ---
  { id: 'apple', ticker: 'AAPL', name: 'Apple', sector: 'Technologie', region: 'États-Unis', color: '#374151', dividendYield: 0.006, startPrice: 30, beta: 1.15, alphaAnnual: 0.06, idioVol: 0.06, description: 'Électronique grand public & services (iPhone, Mac)' },
  { id: 'microsoft', ticker: 'MSFT', name: 'Microsoft', sector: 'Technologie', region: 'États-Unis', color: '#2563eb', dividendYield: 0.008, startPrice: 40, beta: 1.05, alphaAnnual: 0.05, idioVol: 0.05, description: 'Logiciels, cloud (Azure) & IA' },
  { id: 'amazon', ticker: 'AMZN', name: 'Amazon', sector: 'Conso. discrétionnaire', region: 'États-Unis', color: '#f59e0b', dividendYield: 0, startPrice: 50, beta: 1.2, alphaAnnual: 0.06, idioVol: 0.07, description: 'E-commerce & cloud (AWS)' },
  { id: 'alphabet', ticker: 'GOOGL', name: 'Alphabet (Google)', sector: 'Technologie', region: 'États-Unis', color: '#dc2626', dividendYield: 0.004, startPrice: 50, beta: 1.05, alphaAnnual: 0.045, idioVol: 0.055, description: 'Publicité en ligne, recherche & IA' },
  { id: 'nvidia', ticker: 'NVDA', name: 'Nvidia', sector: 'Semi-conducteurs', region: 'États-Unis', color: '#16a34a', dividendYield: 0.001, startPrice: 5, beta: 1.5, alphaAnnual: 0.12, idioVol: 0.12, description: 'Processeurs graphiques & puces IA' },
  { id: 'tesla', ticker: 'TSLA', name: 'Tesla', sector: 'Automobile', region: 'États-Unis', color: '#b91c1c', dividendYield: 0, startPrice: 10, beta: 1.6, alphaAnnual: 0.10, idioVol: 0.14, description: 'Véhicules électriques & stockage d\'énergie' },
  { id: 'meta', ticker: 'META', name: 'Meta (Facebook)', sector: 'Technologie', region: 'États-Unis', color: '#1d4ed8', dividendYield: 0.004, startPrice: 40, beta: 1.2, alphaAnnual: 0.05, idioVol: 0.08, description: 'Réseaux sociaux & métavers' },
  { id: 'coca-cola', ticker: 'KO', name: 'Coca-Cola', sector: 'Conso. de base', region: 'États-Unis', color: '#ef4444', dividendYield: 0.03, startPrice: 30, beta: 0.6, alphaAnnual: 0.005, idioVol: 0.035, description: 'Boissons (défensive, dividende régulier)' },
  { id: 'jnj', ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Santé', region: 'États-Unis', color: '#be123c', dividendYield: 0.025, startPrice: 40, beta: 0.55, alphaAnnual: 0.01, idioVol: 0.03, description: 'Pharmacie & dispositifs médicaux' },
  { id: 'jpmorgan', ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Finance', region: 'États-Unis', color: '#1e40af', dividendYield: 0.025, startPrice: 40, beta: 1.1, alphaAnnual: 0.02, idioVol: 0.05, description: 'Première banque américaine' },
  { id: 'visa', ticker: 'V', name: 'Visa', sector: 'Paiements', region: 'États-Unis', color: '#1e3a8a', dividendYield: 0.007, startPrice: 20, beta: 1.0, alphaAnnual: 0.06, idioVol: 0.05, description: 'Réseau mondial de paiement par carte' },
  { id: 'berkshire', ticker: 'BRK-B', name: 'Berkshire Hathaway', sector: 'Holding', region: 'États-Unis', color: '#0f172a', dividendYield: 0, startPrice: 1500, beta: 0.85, alphaAnnual: 0.02, idioVol: 0.03, description: 'Conglomérat de Warren Buffett' },
  { id: 'mcdonalds', ticker: 'MCD', name: 'McDonald\'s', sector: 'Conso. discrétionnaire', region: 'États-Unis', color: '#ca8a04', dividendYield: 0.022, startPrice: 35, beta: 0.6, alphaAnnual: 0.03, idioVol: 0.03, description: 'Restauration rapide mondiale' },

  // --- France (éligibles PEA) ---
  { id: 'lvmh', ticker: 'MC.PA', name: 'LVMH', sector: 'Luxe', region: 'France', color: '#854d0e', dividendYield: 0.015, startPrice: 45, beta: 1.0, alphaAnnual: 0.06, idioVol: 0.05, description: 'Numéro un mondial du luxe (Vuitton, Dior)' },
  { id: 'hermes', ticker: 'RMS.PA', name: 'Hermès', sector: 'Luxe', region: 'France', color: '#a16207', dividendYield: 0.008, startPrice: 60, beta: 0.9, alphaAnnual: 0.08, idioVol: 0.05, description: 'Maison de luxe (maroquinerie, soie)' },
  { id: 'totalenergies', ticker: 'TTE.PA', name: 'TotalEnergies', sector: 'Énergie', region: 'France', color: '#dc2626', dividendYield: 0.05, startPrice: 40, beta: 0.9, alphaAnnual: 0.02, idioVol: 0.05, description: 'Major pétrolière & gazière, transition énergétique' },
  { id: 'loreal', ticker: 'OR.PA', name: 'L\'Oréal', sector: 'Conso. de base', region: 'France', color: '#9d174d', dividendYield: 0.015, startPrice: 70, beta: 0.8, alphaAnnual: 0.05, idioVol: 0.04, description: 'Numéro un mondial des cosmétiques' },
  { id: 'sanofi', ticker: 'SAN.PA', name: 'Sanofi', sector: 'Santé', region: 'France', color: '#7c3aed', dividendYield: 0.035, startPrice: 55, beta: 0.6, alphaAnnual: 0.01, idioVol: 0.04, description: 'Laboratoire pharmaceutique' },
  { id: 'airbus', ticker: 'AIR.PA', name: 'Airbus', sector: 'Aéronautique', region: 'France', color: '#0369a1', dividendYield: 0.015, startPrice: 15, beta: 1.2, alphaAnnual: 0.04, idioVol: 0.06, description: 'Avionneur européen' },
  { id: 'airliquide', ticker: 'AI.PA', name: 'Air Liquide', sector: 'Chimie / Industrie', region: 'France', color: '#0e7490', dividendYield: 0.02, startPrice: 35, beta: 0.75, alphaAnnual: 0.035, idioVol: 0.035, description: 'Gaz industriels & médicaux' },
  { id: 'schneider', ticker: 'SU.PA', name: 'Schneider Electric', sector: 'Industrie', region: 'France', color: '#15803d', dividendYield: 0.02, startPrice: 50, beta: 1.1, alphaAnnual: 0.05, idioVol: 0.05, description: 'Gestion de l\'énergie & automatismes' },
  { id: 'bnp', ticker: 'BNP.PA', name: 'BNP Paribas', sector: 'Banque', region: 'France', color: '#047857', dividendYield: 0.04, startPrice: 90, beta: 1.3, alphaAnnual: -0.01, idioVol: 0.06, description: 'Première banque de la zone euro' },
  { id: 'kering', ticker: 'KER.PA', name: 'Kering', sector: 'Luxe', region: 'France', color: '#831843', dividendYield: 0.022, startPrice: 80, beta: 1.05, alphaAnnual: 0.04, idioVol: 0.06, description: 'Groupe de luxe (Gucci, Saint Laurent, Bottega)' },
  { id: 'safran', ticker: 'SAF.PA', name: 'Safran', sector: 'Aéronautique / Défense', region: 'France', color: '#1e40af', dividendYield: 0.012, startPrice: 40, beta: 1.1, alphaAnnual: 0.05, idioVol: 0.055, description: 'Moteurs d\'avion & équipements aérospatiaux' },
  { id: 'pernod', ticker: 'RI.PA', name: 'Pernod Ricard', sector: 'Boissons', region: 'France', color: '#92400e', dividendYield: 0.025, startPrice: 70, beta: 0.75, alphaAnnual: 0.03, idioVol: 0.04, description: 'Spiritueux (Absolut, Chivas, Jameson)' },
  { id: 'axa', ticker: 'CS.PA', name: 'AXA', sector: 'Assurance', region: 'France', color: '#1d4ed8', dividendYield: 0.045, startPrice: 20, beta: 1.15, alphaAnnual: 0.01, idioVol: 0.05, description: 'Assureur & gestionnaire d\'actifs mondial' },
  { id: 'capgemini', ticker: 'CAP.PA', name: 'Capgemini', sector: 'Services IT', region: 'France', color: '#0f766e', dividendYield: 0.012, startPrice: 30, beta: 1.1, alphaAnnual: 0.045, idioVol: 0.05, description: 'Conseil, services numériques & transformation IT' },
  { id: 'orange', ticker: 'ORA.PA', name: 'Orange', sector: 'Télécommunications', region: 'France', color: '#ea580c', dividendYield: 0.06, startPrice: 25, beta: 0.65, alphaAnnual: -0.01, idioVol: 0.035, description: 'Opérateur télécoms historique français' },
  { id: 'danone', ticker: 'BN.PA', name: 'Danone', sector: 'Agroalimentaire', region: 'France', color: '#0284c7', dividendYield: 0.035, startPrice: 50, beta: 0.65, alphaAnnual: 0.005, idioVol: 0.035, description: 'Produits laitiers, eaux & nutrition infantile' },
  { id: 'renault', ticker: 'RNO.PA', name: 'Renault', sector: 'Automobile', region: 'France', color: '#eab308', dividendYield: 0.02, startPrice: 55, beta: 1.35, alphaAnnual: -0.02, idioVol: 0.08, description: 'Constructeur automobile (véhicules électriques & thermiques)' },
  { id: 'stmicro', ticker: 'STM.PA', name: 'STMicroelectronics', sector: 'Semi-conducteurs', region: 'France', color: '#0369a1', dividendYield: 0.008, startPrice: 15, beta: 1.3, alphaAnnual: 0.05, idioVol: 0.08, description: 'Semi-conducteurs franco-italiens (puces automobiles & IoT)' },

  // --- Europe hors France (éligibles PEA) ---
  { id: 'asml', ticker: 'ASML.AS', name: 'ASML', sector: 'Semi-conducteurs', region: 'Pays-Bas', color: '#2563eb', dividendYield: 0.008, startPrice: 25, beta: 1.3, alphaAnnual: 0.10, idioVol: 0.08, description: 'Machines de lithographie (monopole mondial)' },
  { id: 'sap', ticker: 'SAP.DE', name: 'SAP', sector: 'Technologie', region: 'Allemagne', color: '#0ea5e9', dividendYield: 0.015, startPrice: 40, beta: 0.9, alphaAnnual: 0.03, idioVol: 0.045, description: 'Logiciels de gestion d\'entreprise (ERP)' },
  { id: 'siemens', ticker: 'SIE.DE', name: 'Siemens', sector: 'Industrie', region: 'Allemagne', color: '#0d9488', dividendYield: 0.025, startPrice: 60, beta: 1.1, alphaAnnual: 0.025, idioVol: 0.05, description: 'Conglomérat industriel & technologique' },
  { id: 'volkswagen', ticker: 'VOW3.DE', name: 'Volkswagen', sector: 'Automobile', region: 'Allemagne', color: '#1e3a8a', dividendYield: 0.04, startPrice: 50, beta: 1.2, alphaAnnual: 0.0, idioVol: 0.06, description: 'Premier constructeur automobile européen' },
  { id: 'allianz', ticker: 'ALV.DE', name: 'Allianz', sector: 'Assurance', region: 'Allemagne', color: '#1d4ed8', dividendYield: 0.04, startPrice: 90, beta: 1.0, alphaAnnual: 0.02, idioVol: 0.045, description: 'Assureur & gestionnaire d\'actifs mondial' },
  { id: 'inditex', ticker: 'ITX.MC', name: 'Inditex (Zara)', sector: 'Distribution', region: 'Espagne', color: '#ca8a04', dividendYield: 0.025, startPrice: 10, beta: 0.85, alphaAnnual: 0.05, idioVol: 0.05, description: 'Distribution de mode (Zara, Bershka)' },
  { id: 'novonordisk', ticker: 'NOVO-B.CO', name: 'Novo Nordisk', sector: 'Santé', region: 'Danemark', color: '#0891b2', dividendYield: 0.013, startPrice: 5, beta: 0.7, alphaAnnual: 0.08, idioVol: 0.06, description: 'Leader du diabète & de l\'obésité (Ozempic)' },
  { id: 'ferrari', ticker: 'RACE.MI', name: 'Ferrari', sector: 'Luxe / Automobile', region: 'Italie', color: '#dc2626', dividendYield: 0.007, startPrice: 50, beta: 0.9, alphaAnnual: 0.09, idioVol: 0.06, description: 'Voitures de sport de luxe' },
  { id: 'bmw', ticker: 'BMW.DE', name: 'BMW', sector: 'Automobile', region: 'Allemagne', color: '#1e3a8a', dividendYield: 0.04, startPrice: 30, beta: 1.15, alphaAnnual: 0.01, idioVol: 0.055, description: 'Constructeur automobile premium (Série 3, X5, électrique)' },
  { id: 'dtelekom', ticker: 'DTE.DE', name: 'Deutsche Telekom', sector: 'Télécommunications', region: 'Allemagne', color: '#e11d48', dividendYield: 0.035, startPrice: 15, beta: 0.7, alphaAnnual: 0.02, idioVol: 0.04, description: 'Opérateur télécoms européen (T-Mobile US)' },
  { id: 'enel', ticker: 'ENEL.MI', name: 'Enel', sector: 'Utilities', region: 'Italie', color: '#15803d', dividendYield: 0.055, startPrice: 5, beta: 0.75, alphaAnnual: 0.0, idioVol: 0.04, description: 'Électricité & énergies renouvelables (Europe & Amérique latine)' },
  { id: 'iberdrola', ticker: 'IBE.MC', name: 'Iberdrola', sector: 'Utilities', region: 'Espagne', color: '#16a34a', dividendYield: 0.045, startPrice: 5, beta: 0.7, alphaAnnual: 0.025, idioVol: 0.04, description: 'Leader mondial de l\'éolien & des énergies renouvelables' },
  { id: 'stellantis', ticker: 'STLAM.MI', name: 'Stellantis', sector: 'Automobile', region: 'Pays-Bas', color: '#6366f1', dividendYield: 0.04, startPrice: 10, beta: 1.25, alphaAnnual: 0.01, idioVol: 0.07, description: 'Groupe automobile (Peugeot, Citroën, Fiat, Jeep, Maserati)' },

  // --- Suisse / Royaume-Uni (hors PEA — CTO uniquement) ---
  { id: 'nestle', ticker: 'NESN.SW', name: 'Nestlé', sector: 'Conso. de base', region: 'Suisse', color: '#b91c1c', dividendYield: 0.026, startPrice: 40, beta: 0.6, alphaAnnual: 0.02, idioVol: 0.035, description: 'Premier groupe agroalimentaire mondial' },
  { id: 'novartis', ticker: 'NOVN.SW', name: 'Novartis', sector: 'Santé', region: 'Suisse', color: '#e11d48', dividendYield: 0.035, startPrice: 50, beta: 0.6, alphaAnnual: 0.015, idioVol: 0.04, description: 'Laboratoire pharmaceutique suisse' },
  { id: 'roche', ticker: 'ROG.SW', name: 'Roche', sector: 'Santé', region: 'Suisse', color: '#0f766e', dividendYield: 0.03, startPrice: 90, beta: 0.6, alphaAnnual: 0.015, idioVol: 0.04, description: 'Pharmacie & diagnostic' },
  { id: 'shell', ticker: 'SHEL.L', name: 'Shell', sector: 'Énergie', region: 'Royaume-Uni', color: '#eab308', dividendYield: 0.05, startPrice: 40, beta: 0.95, alphaAnnual: 0.01, idioVol: 0.05, description: 'Major pétrolière & gazière britannique' },
  { id: 'astrazeneca', ticker: 'AZN.L', name: 'AstraZeneca', sector: 'Santé', region: 'Royaume-Uni', color: '#9333ea', dividendYield: 0.025, startPrice: 30, beta: 0.6, alphaAnnual: 0.04, idioVol: 0.045, description: 'Laboratoire pharmaceutique britannique' },
  { id: 'hsbc', ticker: 'HSBA.L', name: 'HSBC', sector: 'Banque', region: 'Royaume-Uni', color: '#dc2626', dividendYield: 0.05, startPrice: 40, beta: 1.1, alphaAnnual: -0.005, idioVol: 0.05, description: 'Banque internationale (Europe / Asie)' },

  // --- Asie (hors PEA — CTO uniquement) ---
  { id: 'toyota', ticker: '7203.T', name: 'Toyota', sector: 'Automobile', region: 'Japon', color: '#b91c1c', dividendYield: 0.025, startPrice: 30, beta: 0.8, alphaAnnual: 0.02, idioVol: 0.045, description: 'Premier constructeur automobile mondial' },
  { id: 'tsmc', ticker: 'TSM', name: 'TSMC', sector: 'Semi-conducteurs', region: 'Taïwan', color: '#dc2626', dividendYield: 0.018, startPrice: 10, beta: 1.2, alphaAnnual: 0.08, idioVol: 0.07, description: 'Premier fondeur mondial de puces' },
  { id: 'samsung', ticker: '005930.KS', name: 'Samsung Electronics', sector: 'Technologie', region: 'Corée du Sud', color: '#1d4ed8', dividendYield: 0.02, startPrice: 15, beta: 1.0, alphaAnnual: 0.04, idioVol: 0.06, description: 'Électronique, mémoires & smartphones' },
  { id: 'alibaba', ticker: 'BABA', name: 'Alibaba', sector: 'Conso. / Technologie', region: 'Chine', color: '#ea580c', dividendYield: 0, startPrice: 90, beta: 1.2, alphaAnnual: -0.02, idioVol: 0.10, description: 'E-commerce & cloud chinois' },
  { id: 'tencent', ticker: '0700.HK', name: 'Tencent', sector: 'Technologie', region: 'Chine', color: '#16a34a', dividendYield: 0.003, startPrice: 10, beta: 1.2, alphaAnnual: 0.03, idioVol: 0.09, description: 'Jeux vidéo, WeChat & investissements' },
]

// ----------------------------------------------------------------------------
//  Définition finale des actifs pré-chargés
// ----------------------------------------------------------------------------
export const DEFAULT_ASSETS = [
  ...CORE_ASSETS,
  ...ETF_SPECS.map(makeEquity),
  ...STOCK_SPECS.map(makeEquity),
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

// Recherche simple par nom, ticker, secteur, région ou description
export function searchAssets(query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return DEFAULT_ASSETS
  return DEFAULT_ASSETS.filter((a) =>
    [a.name, a.ticker, a.description, a.sector, a.region, a.type]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(q)),
  )
}

// Libellés courts des enveloppes éligibles d'un actif (ex : ['PEA','CTO'])
export function eligibleEnvelopeLabels(asset) {
  const e = asset?.envelopes || {}
  const out = []
  if (e.pea) out.push('PEA')
  if (e.cto) out.push('CTO')
  if (e.av) out.push('AV')
  return out
}

export const DATA_START = `${START_YEAR}-${String(START_MONTH).padStart(2, '0')}-01`
export const DATA_END = `${END_YEAR}-${String(END_MONTH).padStart(2, '0')}-01`

// Taux sans risque moyen (≈ Livret A) utilisé pour le ratio de Sharpe
export const RISK_FREE_RATE = 0.018
