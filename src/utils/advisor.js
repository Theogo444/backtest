// ============================================================================
//  advisor.js — moteur de suggestion budgétaire du simulateur débutant.
//
//  À partir de la situation économique du foyer (composition, revenus,
//  charges, crédits, épargne, horizon, tolérance au risque), calcule un
//  diagnostic budgétaire et un plan d'investissement suggéré. Les règles sont
//  VOLONTAIREMENT simples et prudentes (pédagogie, pas de conseil
//  personnalisé) :
//    1. Reste à vivre = revenus − charges. On ne propose d'investir qu'une
//       part de ce reste (25 / 40 / 50 % selon le profil de risque).
//    2. Épargne de précaution d'abord : 3 à 6 mois de charges sur livret
//       AVANT la bourse. Le capital disponible comble ce fonds en priorité,
//       et tant qu'il manque, la capacité mensuelle est partagée 50/50
//       entre livret et investissement.
//    3. La stratégie suggérée est TOUJOURS le DCA (versement mensuel fixe),
//       la plus adaptée aux débutants ; les variantes ne sont que mentionnées.
//    4. Horizon < 5 ans ou taux d'effort > 35 % → profil ramené à « prudent »
//       avec mise en garde.
//  Toutes les valeurs sont mensuelles sauf mention contraire.
// ============================================================================

const n = (v) => {
  const x = Number(v)
  return Number.isFinite(x) && x > 0 ? x : 0
}
const round10 = (v) => Math.round(v / 10) * 10

// ---------------------------------------------------------------------------
//  Référentiels des champs du formulaire
// ---------------------------------------------------------------------------
export const AGE_BRACKETS = [
  { id: 'lt30', label: '− de 30 ans' },
  { id: '30-45', label: '30 – 45 ans' },
  { id: '45-60', label: '45 – 60 ans' },
  { id: '60+', label: '60 ans et +' },
]

export const HORIZONS = [
  { id: 'lt5', label: 'Moins de 5 ans', period: '5y' },
  { id: '5-10', label: '5 à 10 ans', period: '10y' },
  { id: '10-20', label: '10 à 20 ans', period: '20y' },
  { id: '20+', label: 'Plus de 20 ans', period: '20y' },
]

export const RISK_PROFILES = [
  {
    id: 'prudent', label: 'Prudent', rate: 0.25,
    description: 'Je ne veux pas voir mon épargne baisser fortement, même temporairement.',
  },
  {
    id: 'equilibre', label: 'Équilibré', rate: 0.4,
    description: "J'accepte des baisses passagères en échange d'un meilleur rendement.",
  },
  {
    id: 'ambitieux', label: 'Ambitieux', rate: 0.5,
    description: 'Je vise le rendement maximum en sachant que le chemin sera mouvementé.',
  },
]

// Portefeuilles types par profil de risque. Les actifs restent éligibles à
// l'enveloppe suggérée (obligations et or ne sont pas logeables en PEA →
// le profil prudent passe par l'assurance-vie).
export const PORTFOLIOS = {
  prudent: {
    envelope: 'av',
    autoRebalance: true,
    assets: [
      { id: 'msci-world', allocation: 40, name: 'MSCI World' },
      { id: 'oblig-euro', allocation: 45, name: "Obligations d'État euro" },
      { id: 'gold', allocation: 15, name: 'Or' },
    ],
    why: "Une base d'actions mondiales, amortie par des obligations et un peu d'or, dans une assurance-vie : beaucoup moins de secousses, et une fiscalité douce après 8 ans.",
  },
  equilibre: {
    envelope: 'pea',
    autoRebalance: false,
    assets: [{ id: 'msci-world', allocation: 100, name: 'MSCI World' }],
    why: "Le grand classique des débutants : un seul ETF très diversifié (~1 500 entreprises, 23 pays), logé dans un PEA pour l'exonération d'impôt après 5 ans.",
  },
  ambitieux: {
    envelope: 'pea',
    autoRebalance: true,
    assets: [
      { id: 'msci-world', allocation: 70, name: 'MSCI World' },
      { id: 'nasdaq100', allocation: 30, name: 'Nasdaq 100' },
    ],
    why: 'La diversification mondiale, dopée par une poche de valeurs technologiques américaines. Plus de potentiel, mais des baisses plus marquées en chemin.',
  },
}

// Ordre de grandeur des dépenses courantes d'un foyer (courses, énergie,
// assurances, transports, téléphonie, loisirs — HORS logement et crédits).
// Sert uniquement à pré-remplir le champ si l'utilisateur ne sait pas.
export function estimateLivingExpenses(adults, children) {
  return 800 + (adults > 1 ? 500 : 0) + children * 250
}

// ---------------------------------------------------------------------------
//  Diagnostic + suggestion
// ---------------------------------------------------------------------------
export function computeAdvice(profile) {
  const {
    adults = 1, children = 0, ageBracket = null,
    income = 0, otherIncome = 0,
    housing = 0, loans = 0, living = 0,
    savings = 0, lump = 0,
    horizon = '10-20', risk = 'equilibre',
    shortTermProject = false,
  } = profile

  const totalIncome = n(income) + n(otherIncome)
  if (totalIncome <= 0) return { ok: false }

  const totalCharges = n(housing) + n(loans) + n(living)
  const disposable = totalIncome - totalCharges // reste à vivre
  const debtRatio = (n(housing) + n(loans)) / totalIncome // taux d'effort

  // --- Profil effectif (garde-fous) ---
  let riskEff = risk
  const guards = []
  if (horizon === 'lt5' && riskEff !== 'prudent') {
    riskEff = 'prudent'
    guards.push('horizon')
  }
  if (debtRatio > 0.35 && riskEff !== 'prudent') {
    riskEff = 'prudent'
    guards.push('debt')
  }
  const riskDef = RISK_PROFILES.find((r) => r.id === riskEff) || RISK_PROFILES[1]

  // --- Épargne de précaution : objectif de 3 à 6 mois de charges ---
  let monthsTarget = 3
  if (adults === 1) monthsTarget += 1 // un seul revenu = moins de filet
  if (children > 0) monthsTarget += 1
  if (risk === 'prudent') monthsTarget += 1
  monthsTarget = Math.min(6, monthsTarget)
  const monthBase = totalCharges > 0 ? totalCharges : totalIncome * 0.6
  const emergencyTarget = Math.round(monthsTarget * monthBase)
  const emergencyGap = Math.max(0, emergencyTarget - n(savings))

  // --- Capital disponible : il comble d'abord le fonds de précaution ---
  const lumpToEmergency = Math.min(emergencyGap, n(lump))
  const remainingGap = emergencyGap - lumpToEmergency
  let investableLump = n(lump) - lumpToEmergency
  let projectReserve = 0
  if (shortTermProject && investableLump > 0) {
    // Achat prévu à moins de 5 ans : ce capital reste hors marché.
    projectReserve = investableLump
    investableLump = 0
  }

  // --- Capacité mensuelle ---
  const capacity = Math.max(0, disposable) * riskDef.rate
  let monthlyInvest = round10(remainingGap > 0 ? capacity * 0.5 : capacity)
  if (monthlyInvest < 20) monthlyInvest = 0 // en dessous, pas pertinent
  let monthlyToEmergency = remainingGap > 0 ? Math.max(0, round10(capacity) - monthlyInvest) : 0
  const monthsToFill =
    monthlyToEmergency > 0 ? Math.ceil(remainingGap / monthlyToEmergency) : null

  const status =
    disposable <= 0
      ? 'deficit'
      : monthlyInvest === 0 && monthlyToEmergency > 0
        ? 'emergency-first'
        : monthlyInvest === 0
          ? 'tight'
          : 'ok'
  const canInvest = status === 'ok'
  const initialInvest = canInvest ? round10(investableLump) : 0
  const leftover = Math.max(0, Math.round(disposable - monthlyInvest - monthlyToEmergency))

  // --- Messages du diagnostic (du plus grave au plus positif) ---
  const messages = []
  if (status === 'deficit') {
    messages.push({
      tone: 'danger',
      title: 'Budget déficitaire',
      text: `Vos charges dépassent vos revenus de ${Math.abs(Math.round(disposable))} € par mois. La priorité est de rééquilibrer votre budget — n'investissez pas en bourse pour l'instant.`,
    })
  }
  if (debtRatio > 0.35 && status !== 'deficit') {
    messages.push({
      tone: 'warn',
      title: "Taux d'effort élevé",
      text: `Logement et crédits absorbent ${Math.round(debtRatio * 100)} % de vos revenus (repère usuel : 35 % max). ${guards.includes('debt') ? 'Nous avons ramené la suggestion au profil prudent.' : 'Restez prudent sur les montants investis.'}`,
    })
  }
  if (horizon === 'lt5' && status !== 'deficit') {
    messages.push({
      tone: 'warn',
      title: 'Horizon court',
      text: 'À moins de 5 ans, la bourse peut être perdante au moment où vous aurez besoin de l\'argent. Profil ramené à « prudent » — privilégiez livrets et fonds euros pour l\'essentiel.',
    })
  }
  if (remainingGap > 0 && status !== 'deficit') {
    messages.push({
      tone: 'warn',
      title: 'Épargne de précaution à compléter',
      text: `Visez ${monthsTarget} mois de charges (${fmt(emergencyTarget)} €) sur un livret : il manque ${fmt(remainingGap)} €.${
        monthlyToEmergency > 0 && monthsToFill <= 36
          ? ` Le plan y consacre ${fmt(monthlyToEmergency)} €/mois — complet en ~${monthsToFill} mois.`
          : monthlyToEmergency > 0
            ? ` Le plan y consacre ${fmt(monthlyToEmergency)} €/mois — chaque euro mis de côté compte.`
            : ''
      }`,
    })
  }
  if (lumpToEmergency > 0) {
    messages.push({
      tone: 'info',
      title: 'Capital affecté au fonds de précaution',
      text: `${fmt(lumpToEmergency)} € de votre capital disponible vont d'abord compléter votre épargne de précaution (livret), avant tout investissement.`,
    })
  }
  if (projectReserve > 0) {
    messages.push({
      tone: 'info',
      title: 'Projet à moins de 5 ans',
      text: `Gardez vos ${fmt(projectReserve)} € de capital sur des placements sans risque (livrets, fonds euros) : un projet proche ne se finance pas en bourse.`,
    })
  }
  if (status === 'ok' && emergencyGap === 0 && debtRatio <= 0.35 && horizon !== 'lt5' && !shortTermProject) {
    messages.push({
      tone: 'ok',
      title: 'Situation saine',
      text: 'Épargne de précaution au niveau et taux d\'effort maîtrisé : vous pouvez investir sereinement, sans toucher à votre filet de sécurité.',
    })
  }
  if (canInvest && ageBracket === 'lt30') {
    messages.push({
      tone: 'info',
      title: 'Le temps joue pour vous',
      text: 'Commencer tôt est votre meilleur atout : grâce aux intérêts composés, même un montant modeste versé chaque mois devient une somme importante.',
    })
  }
  if (ageBracket === '60+') {
    messages.push({
      tone: 'info',
      title: 'Pensez transmission',
      text: "À votre âge, l'assurance-vie a un atout supplémentaire : un cadre successoral très avantageux pour transmettre à vos proches.",
    })
  }

  return {
    ok: true,
    status,
    canInvest,
    totalIncome,
    totalCharges,
    disposable,
    debtRatio,
    emergency: {
      monthsTarget,
      target: emergencyTarget,
      savings: n(savings),
      gap: emergencyGap,
      remainingGap,
      lumpToEmergency,
      monthlyToEmergency,
      monthsToFill,
    },
    capacity: round10(capacity),
    monthlyInvest,
    monthlyToEmergency,
    initialInvest,
    projectReserve,
    leftover,
    risk: riskEff,
    riskRequested: risk,
    portfolio: PORTFOLIOS[riskEff],
    period: (HORIZONS.find((h) => h.id === horizon) || HORIZONS[2]).period,
    messages,
  }
}

// Milliers avec espace insécable (affichage des messages)
function fmt(v) {
  return Math.round(v).toLocaleString('fr-FR')
}
