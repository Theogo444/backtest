// ============================================================================
//  fiscalite.js — calculs fiscaux français (PEA / CTO / Assurance-vie)
//
//  ⚠️ Simplifications pédagogiques. La fiscalité réelle dépend de nombreux
//  paramètres (date des versements, foyer fiscal, plafonds…). Ce module donne
//  un ordre de grandeur, pas un conseil fiscal personnalisé.
// ============================================================================

export const PRELEVEMENTS_SOCIAUX = 0.172 // 17,2 %
export const FLAT_TAX = 0.3 // PFU : 12,8 % IR + 17,2 % PS
export const PFU_IR = 0.128 // part « impôt sur le revenu » du PFU
export const AV_ABATTEMENT_CELIBATAIRE = 4600 // € / an après 8 ans
export const AV_ABATTEMENT_COUPLE = 9200 // € / an après 8 ans
export const AV_TAUX_REDUIT = 0.075 // 7,5 % au-delà de l'abattement (≤ 150k€)
export const PEA_PLAFOND = 150000 // plafond de versements

// ----------------------------------------------------------------------------
//  PEA — exonération d'IR sur les plus-values après 5 ans (PS 17,2 % dus)
//  Avant 5 ans : imposition au PFU (30 %).
// ----------------------------------------------------------------------------
export function taxPEA({ gains, years }) {
  if (gains <= 0) {
    return { incomeTax: 0, socialCharges: 0, tax: 0, net: gains, effectiveRate: 0, eligible: years >= 5 }
  }
  if (years >= 5) {
    const socialCharges = gains * PRELEVEMENTS_SOCIAUX
    return {
      incomeTax: 0,
      socialCharges,
      tax: socialCharges,
      net: gains - socialCharges,
      effectiveRate: PRELEVEMENTS_SOCIAUX,
      eligible: true,
    }
  }
  // Avant 5 ans : flat tax
  const tax = gains * FLAT_TAX
  return {
    incomeTax: gains * PFU_IR,
    socialCharges: gains * PRELEVEMENTS_SOCIAUX,
    tax,
    net: gains - tax,
    effectiveRate: FLAT_TAX,
    eligible: false,
  }
}

// ----------------------------------------------------------------------------
//  CTO — Flat tax (PFU 30 %) ou barème progressif de l'IR (+ PS 17,2 %)
// ----------------------------------------------------------------------------
export function taxCTO({ gains, method = 'pfu', tmi = 0.3 }) {
  if (gains <= 0) {
    return { incomeTax: 0, socialCharges: 0, tax: 0, net: gains, effectiveRate: 0, method }
  }
  const socialCharges = gains * PRELEVEMENTS_SOCIAUX
  let incomeTax
  if (method === 'bareme') {
    // Barème progressif : taux marginal d'imposition appliqué aux plus-values
    incomeTax = gains * tmi
  } else {
    incomeTax = gains * PFU_IR
  }
  const tax = incomeTax + socialCharges
  return {
    incomeTax,
    socialCharges,
    tax,
    net: gains - tax,
    effectiveRate: tax / gains,
    method,
  }
}

// ----------------------------------------------------------------------------
//  Assurance-vie — PS 17,2 % toujours dus. Après 8 ans : abattement annuel
//  (4 600 € / 9 200 €) puis 7,5 % d'IR. Avant 8 ans : PFU (12,8 % d'IR).
// ----------------------------------------------------------------------------
export function taxAssuranceVie({ gains, years, couple = false }) {
  if (gains <= 0) {
    return {
      incomeTax: 0,
      socialCharges: 0,
      tax: 0,
      net: gains,
      effectiveRate: 0,
      abattement: 0,
      eligible: years >= 8,
    }
  }
  const socialCharges = gains * PRELEVEMENTS_SOCIAUX
  let incomeTax
  let abattement = 0
  if (years >= 8) {
    abattement = couple ? AV_ABATTEMENT_COUPLE : AV_ABATTEMENT_CELIBATAIRE
    const taxableGains = Math.max(0, gains - abattement)
    incomeTax = taxableGains * AV_TAUX_REDUIT
  } else {
    incomeTax = gains * PFU_IR
  }
  const tax = incomeTax + socialCharges
  return {
    incomeTax,
    socialCharges,
    tax,
    net: gains - tax,
    effectiveRate: tax / gains,
    abattement,
    eligible: years >= 8,
  }
}

// ----------------------------------------------------------------------------
//  Compare les trois enveloppes pour un même montant final et un même apport.
//  finalValue : valeur brute du portefeuille ; invested : total versé.
// ----------------------------------------------------------------------------
export function compareEnvelopes({ finalValue, invested, years, ctoMethod = 'pfu', tmi = 0.3, couple = false }) {
  const gains = finalValue - invested
  const pea = taxPEA({ gains, years })
  const cto = taxCTO({ gains, method: ctoMethod, tmi })
  const av = taxAssuranceVie({ gains, years, couple })

  return {
    gains,
    invested,
    finalValue,
    years,
    envelopes: [
      {
        id: 'pea',
        name: 'PEA',
        ...pea,
        netFinal: invested + pea.net,
        note:
          years >= 5
            ? "Plus-values exonérées d'impôt sur le revenu (PEA de plus de 5 ans), seuls les prélèvements sociaux de 17,2 % restent dus."
            : "PEA de moins de 5 ans : un retrait entraîne l'imposition au PFU (30 %) et la clôture du plan.",
      },
      {
        id: 'cto',
        name: 'CTO',
        ...cto,
        netFinal: invested + cto.net,
        note:
          ctoMethod === 'pfu'
            ? "Compte-titres ordinaire imposé à la flat tax (PFU) de 30 % sur les plus-values."
            : `Compte-titres au barème progressif : ${Math.round(tmi * 100)} % d'IR + 17,2 % de prélèvements sociaux.`,
      },
      {
        id: 'av',
        name: 'Assurance-vie',
        ...av,
        netFinal: invested + av.net,
        note:
          years >= 8
            ? `Assurance-vie de plus de 8 ans : abattement annuel de ${couple ? '9 200' : '4 600'} € sur les gains, puis 7,5 % d'IR et 17,2 % de prélèvements sociaux.`
            : "Assurance-vie de moins de 8 ans : gains imposés au PFU (12,8 % d'IR + 17,2 % de prélèvements sociaux).",
      },
    ],
  }
}
