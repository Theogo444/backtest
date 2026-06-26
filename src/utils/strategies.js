// ============================================================================
//  strategies.js — moteur de simulation et logique des stratégies
//
//  Le moteur travaille au pas mensuel (granularité des données). À chaque mois
//  on applique : dividendes, frais de gestion, apport de la stratégie, puis
//  rééquilibrage éventuel. Toutes les stratégies partagent le même « compte ».
// ============================================================================

// ----------------------------------------------------------------------------
//  Métadonnées des stratégies (pour l'interface)
// ----------------------------------------------------------------------------
export const STRATEGIES = [
  {
    id: 'lump-sum',
    name: 'Lump Sum',
    short: 'Investissement unique',
    description: "Tout le capital est investi en une seule fois au début de la période.",
    params: ['initialAmount'],
  },
  {
    id: 'dca',
    name: 'DCA Classique',
    short: 'Versements réguliers',
    description: "Un montant fixe est investi à intervalle régulier (lissage du point d'entrée).",
    params: ['initialAmount', 'dcaAmount', 'frequency'],
  },
  {
    id: 'value-averaging',
    name: 'Value Averaging',
    short: 'Valeur cible croissante',
    description: "On investit ce qu'il faut pour que le portefeuille suive une courbe de valeur cible.",
    params: ['initialAmount', 'targetGrowth', 'maxPerPeriod'],
  },
  {
    id: 'dca-dynamic',
    name: 'DCA Dynamique',
    short: 'Momentum inverse',
    description: "On investit davantage quand le marché baisse, moins quand il monte.",
    params: ['initialAmount', 'baseAmount', 'multiplier', 'threshold'],
  },
  {
    id: 'buy-hold',
    name: 'Buy & Hold',
    short: 'Achat et conservation',
    description: "Investissement initial puis aucune action : on conserve sans rééquilibrer.",
    params: ['initialAmount'],
  },
  {
    id: 'rebalance',
    name: 'Rééquilibrage périodique',
    short: 'Multi-actifs rééquilibré',
    description: "Portefeuille multi-actifs ramené à son allocation cible à fréquence régulière.",
    params: ['initialAmount', 'rebalanceFrequency'],
    multiAsset: true,
  },
  {
    id: 'stock-picking',
    name: 'Stock Picking manuel',
    short: 'Transactions personnalisées',
    description: "Vous saisissez vos propres transactions (date, actif, quantité, prix).",
    params: ['transactions'],
    custom: true,
  },
  {
    id: 'momentum',
    name: 'Momentum',
    short: 'Rotation sur le plus performant',
    description: "On détient l'actif le plus performant sur les N derniers mois, avec rotation régulière.",
    params: ['initialAmount', 'lookback', 'rotationFrequency'],
    multiAsset: true,
  },
]

export function getStrategy(id) {
  return STRATEGIES.find((s) => s.id === id) || STRATEGIES[0]
}

// ----------------------------------------------------------------------------
//  Compte de portefeuille — encapsule les parts, les frais et les opérations
// ----------------------------------------------------------------------------
function createAccount(config) {
  const { dates, assets, prices, fees, feeAnnualMgmt, reinvestDividends } = config
  const ids = assets.map((a) => a.id)
  const units = {}
  ids.forEach((id) => (units[id] = 0))
  let investedCash = 0 // apports nets de l'investisseur (€)
  const contributions = new Array(dates.length).fill(0) // apport par mois

  const priceAt = (id, i) => prices[id][i]

  // Frais de transaction sur un montant brut
  const transactionFee = (gross) => {
    if (!fees || gross <= 0) return 0
    if (fees.type === 'percent') return gross * (fees.value / 100)
    return Math.min(fees.value, gross) // frais fixes
  }

  // Valeur totale du portefeuille au mois i
  const valueAt = (i) => ids.reduce((s, id) => s + units[id] * priceAt(id, i), 0)

  // Investit `amount` € au mois i selon une allocation (poids normalisés)
  function invest(amount, i, allocation) {
    if (amount <= 0) return 0
    let totalSpent = 0
    ids.forEach((id) => {
      const w = allocation[id] ?? 0
      if (w <= 0) return
      const gross = amount * w
      const fee = transactionFee(gross)
      const net = gross - fee
      if (priceAt(id, i) > 0) units[id] += net / priceAt(id, i)
      totalSpent += gross
    })
    investedCash += amount
    contributions[i] += amount
    return totalSpent
  }

  // Achat manuel d'une quantité de parts à un prix donné (stock picking)
  function manualBuy(id, qty, price, i) {
    if (qty <= 0 || units[id] == null) return
    units[id] += qty
    const gross = qty * price
    const cost = gross + transactionFee(gross)
    investedCash += cost
    contributions[i] += cost
  }

  // Vend pour `amount` € au mois i (réduit les parts proportionnellement)
  function sell(amount, i) {
    const v = valueAt(i)
    if (v <= 0 || amount <= 0) return 0
    const ratio = Math.min(amount / v, 1)
    ids.forEach((id) => (units[id] *= 1 - ratio))
    const proceeds = amount * ratio
    investedCash -= proceeds // retrait : l'apport net diminue
    contributions[i] -= proceeds
    return proceeds
  }

  // Dividendes du mois i (réinvestis sous forme de parts si activé)
  function applyDividends(i) {
    if (!reinvestDividends) return
    ids.forEach((id) => {
      const asset = assets.find((a) => a.id === id)
      const y = asset?.dividendYield ?? 0
      if (y > 0 && priceAt(id, i) > 0) {
        const div = units[id] * priceAt(id, i) * (y / 12)
        units[id] += div / priceAt(id, i)
      }
    })
  }

  // Frais de gestion annuels (prélevés mensuellement)
  function applyMgmtFee() {
    if (!feeAnnualMgmt) return
    const monthly = feeAnnualMgmt / 100 / 12
    ids.forEach((id) => (units[id] *= 1 - monthly))
  }

  // Rééquilibrage vers l'allocation cible au mois i
  function rebalance(i, allocation) {
    const v = valueAt(i)
    if (v <= 0) return
    let turnover = 0
    const targetUnits = {}
    ids.forEach((id) => {
      const w = allocation[id] ?? 0
      const targetVal = v * w
      const currentVal = units[id] * priceAt(id, i)
      turnover += Math.abs(targetVal - currentVal) / 2
      targetUnits[id] = priceAt(id, i) > 0 ? targetVal / priceAt(id, i) : 0
    })
    ids.forEach((id) => (units[id] = targetUnits[id]))
    // Frais sur le volume échangé
    const fee = transactionFee(turnover)
    if (fee > 0 && v > 0) {
      const ratio = fee / v
      ids.forEach((id) => (units[id] *= 1 - ratio))
    }
  }

  return {
    units,
    ids,
    priceAt,
    valueAt,
    invest,
    manualBuy,
    sell,
    applyDividends,
    applyMgmtFee,
    rebalance,
    contributions,
    getInvested: () => investedCash,
  }
}

// ----------------------------------------------------------------------------
//  Conversion de fréquence → intervalle en mois
// ----------------------------------------------------------------------------
function frequencyToMonths(freq) {
  switch (freq) {
    case 'weekly':
      return 1 // les données sont mensuelles : on investit chaque mois
    case 'monthly':
      return 1
    case 'quarterly':
      return 3
    case 'yearly':
      return 12
    default:
      return 1
  }
}

// Montant mensuel équivalent (le hebdomadaire est ramené au mois)
function monthlyEquivalent(amount, freq) {
  if (freq === 'weekly') return amount * (52 / 12)
  return amount
}

// ----------------------------------------------------------------------------
//  Allocation normalisée { id: poids } à partir de la liste d'actifs
// ----------------------------------------------------------------------------
function normalizedAllocation(assets) {
  const total = assets.reduce((s, a) => s + (a.allocation || 0), 0)
  const alloc = {}
  assets.forEach((a) => {
    alloc[a.id] = total > 0 ? (a.allocation || 0) / total : 0
  })
  return alloc
}

// ----------------------------------------------------------------------------
//  Moteur principal — exécute la simulation et renvoie la série de valeurs
// ----------------------------------------------------------------------------
export function simulate(config) {
  const { dates, assets, strategy, params, autoRebalance } = config
  const n = dates.length
  const acc = createAccount(config)
  const allocation = normalizedAllocation(assets)
  const valueSeries = []
  const initialAmount = Number(params.initialAmount) || 0

  // Repère le premier mois d'un nouveau trimestre/an pour les versements
  const isContributionMonth = (i, stepMonths) => i > 0 && i % stepMonths === 0

  for (let i = 0; i < n; i++) {
    // 1) Dividendes + frais de gestion (à partir du 2ᵉ mois)
    if (i > 0) {
      acc.applyDividends(i)
      acc.applyMgmtFee()
    }

    // 2) Action de la stratégie
    switch (strategy) {
      case 'lump-sum':
      case 'buy-hold': {
        if (i === 0) acc.invest(initialAmount, 0, allocation)
        break
      }

      case 'dca': {
        const step = frequencyToMonths(params.frequency)
        const amount = monthlyEquivalent(Number(params.dcaAmount) || 0, params.frequency)
        if (i === 0) {
          acc.invest(initialAmount, 0, allocation)
          if (step === 1) acc.invest(amount, 0, allocation)
        } else if (i % step === 0) {
          // Mensuel/hebdo : chaque mois ; trimestriel : tous les 3 mois
          acc.invest(amount, i, allocation)
        }
        break
      }

      case 'value-averaging': {
        const growth = Number(params.targetGrowth) || 0
        const maxPer = Number(params.maxPerPeriod) || Infinity
        if (i === 0) {
          acc.invest(initialAmount, 0, allocation)
        } else {
          // Valeur cible = capital initial + croissance × nombre de mois
          const target = initialAmount + growth * i
          const current = acc.valueAt(i)
          let toInvest = target - current
          if (toInvest > 0) {
            toInvest = Math.min(toInvest, maxPer)
            acc.invest(toInvest, i, allocation)
          }
          // Si le portefeuille dépasse la cible : on n'investit pas (pas de vente)
        }
        break
      }

      case 'dca-dynamic': {
        const base = Number(params.baseAmount) || 0
        const mult = Number(params.multiplier) || 2
        const threshold = (Number(params.threshold) || 10) / 100
        if (i === 0) {
          acc.invest(initialAmount, 0, allocation)
        } else {
          // Performance du marché sur le mois écoulé (moyenne pondérée)
          let r = 0
          acc.ids.forEach((id) => {
            const w = allocation[id] ?? 0
            const p0 = acc.priceAt(id, i - 1)
            const p1 = acc.priceAt(id, i)
            if (p0 > 0) r += w * (p1 / p0 - 1)
          })
          let amount = base
          if (r <= -threshold) amount = base * mult // forte baisse : on renforce
          else if (r < 0) amount = base * (1 + (mult - 1) / 2) // baisse modérée
          else if (r >= threshold) amount = base * 0.5 // forte hausse : on réduit
          acc.invest(amount, i, allocation)
        }
        break
      }

      case 'rebalance': {
        const freq = frequencyToMonths(params.rebalanceFrequency)
        if (i === 0) acc.invest(initialAmount, 0, allocation)
        else if (isContributionMonth(i, freq)) acc.rebalance(i, allocation)
        break
      }

      case 'momentum': {
        const lookback = Number(params.lookback) || 6
        const freq = frequencyToMonths(params.rotationFrequency || 'quarterly')
        if (i === 0) {
          // Au départ : on place tout sur le meilleur actif récent (ou réparti)
          const winner = pickMomentumWinner(acc, allocation, 0, lookback)
          acc.invest(initialAmount, 0, winner)
        } else if (i % freq === 0) {
          // Rotation : on vend tout et on rachète le nouveau leader
          const v = acc.valueAt(i)
          const winner = pickMomentumWinner(acc, allocation, i, lookback)
          if (v > 0) {
            acc.sell(v, i)
            acc.invest(v, i, winner)
            // La vente puis le rachat ne comptent pas comme nouvel apport
          }
        }
        break
      }

      case 'stock-picking': {
        // Les transactions sont appliquées au mois correspondant à leur date
        const txs = (params.transactions || []).filter((t) => txMonthIndex(t.date, dates) === i)
        txs.forEach((t) => {
          const qty = Number(t.quantity) || 0
          const px = Number(t.price) || acc.priceAt(t.assetId, i) || 0
          if (qty > 0 && t.assetId && acc.units[t.assetId] != null) {
            acc.manualBuy(t.assetId, qty, px, i)
          }
        })
        break
      }

      default:
        if (i === 0) acc.invest(initialAmount, 0, allocation)
    }

    // 2bis) Rééquilibrage automatique annuel (option globale, multi-actifs)
    if (
      autoRebalance &&
      i > 0 &&
      i % 12 === 0 &&
      assets.length > 1 &&
      strategy !== 'rebalance' &&
      strategy !== 'momentum' &&
      strategy !== 'stock-picking'
    ) {
      acc.rebalance(i, allocation)
    }

    // 3) Enregistrement de la valeur du mois
    valueSeries.push({
      date: dates[i],
      value: Math.round(acc.valueAt(i) * 100) / 100,
      invested: Math.round(acc.getInvested() * 100) / 100,
    })
  }

  return {
    valueSeries,
    contributions: acc.contributions,
    finalUnits: { ...acc.units },
    allocation,
  }
}

// Index du mois (dans `dates`) correspondant à une date de transaction
function txMonthIndex(dateStr, dates) {
  if (!dateStr) return -1
  const ym = dateStr.slice(0, 7) // YYYY-MM
  for (let i = 0; i < dates.length; i++) {
    if (dates[i].slice(0, 7) === ym) return i
  }
  // Si avant le début : rattache au premier mois ; si après : dernier mois
  if (dateStr < dates[0]) return 0
  if (dateStr > dates[dates.length - 1]) return dates.length - 1
  // Sinon : mois le plus proche
  for (let i = 0; i < dates.length; i++) {
    if (dates[i].slice(0, 7) >= ym) return i
  }
  return -1
}

// Choisit l'actif le plus performant sur la fenêtre `lookback` (allocation 100%)
function pickMomentumWinner(acc, allocation, i, lookback) {
  const start = Math.max(0, i - lookback)
  let bestId = null
  let bestPerf = -Infinity
  acc.ids.forEach((id) => {
    if ((allocation[id] ?? 0) <= 0) return
    const p0 = acc.priceAt(id, start)
    const p1 = acc.priceAt(id, i)
    const perf = p0 > 0 ? p1 / p0 - 1 : -Infinity
    if (perf > bestPerf) {
      bestPerf = perf
      bestId = id
    }
  })
  const winner = {}
  acc.ids.forEach((id) => (winner[id] = id === bestId ? 1 : 0))
  return winner
}
