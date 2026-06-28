// ============================================================================
//  brokers.js — courtiers français pour le Simulateur débutant.
//
//  Chaque courtier expose : les enveloppes proposées, un modèle de frais
//  (courtage par ordre + droits de garde, ou frais de gestion pour l'AV), et
//  des infos éditoriales. Le modèle de frais alimente directement le moteur de
//  simulation (useSimulation : `fees` + `feeAnnualMgmt`).
//
//  ⚠️ Frais INDICATIFS à jour de juin 2026, simplifiés à des fins pédagogiques.
//  Les grilles tarifaires évoluent et dépendent du montant des ordres, de l'offre
//  choisie et des promotions. À vérifier sur le site du courtier avant d'ouvrir.
//
//  Les liens `url` sont des PLACEHOLDERS d'affiliation (#affiliate-*).
// ============================================================================

export const FEES_AS_OF = 'juin 2026'

export const ENVELOPE_LABELS = {
  pea: 'PEA',
  cto: 'Compte-titres',
  av: 'Assurance-vie',
}

export const BROKERS = [
  {
    id: 'bourse-direct',
    name: 'Bourse Direct',
    accounts: ['pea', 'cto'],
    order: { type: 'fixed', value: 0.99 }, // ~0,99 € / ordre (< 1 000 €)
    custodyPct: 0,
    av: null,
    feeSummary: '≈ 0,99 €/ordre · 0 € de droits de garde',
    bestFor: 'Les frais de courtage les plus bas',
    rating: 4.4,
    pros: ['Courtage parmi les moins chers', 'PEA et compte-titres', 'Spécialiste de la bourse'],
    cons: ['Interface moins moderne'],
    url: '#affiliate-bourse-direct',
  },
  {
    id: 'fortuneo',
    name: 'Fortuneo',
    accounts: ['pea', 'cto'],
    order: { type: 'fixed', value: 1.95 }, // offre Optimum, petits ordres
    custodyPct: 0,
    av: { entryPct: 0, mgmtPct: 0.75 },
    feeSummary: '≈ 1,95 €/ordre · 0 € de droits de garde',
    bestFor: 'Un PEA simple dans une banque en ligne',
    rating: 4.6,
    pros: ['0 € de droits de garde', 'Banque en ligne complète', 'PEA et CTO réputés'],
    cons: ['Courtage un peu au-dessus du moins-disant'],
    url: '#affiliate-fortuneo',
  },
  {
    id: 'boursobank',
    name: 'BoursoBank',
    accounts: ['pea', 'cto', 'av'],
    order: { type: 'percent', value: 0.5 }, // ~0,5 % (min ~1,99 €)
    custodyPct: 0,
    av: { entryPct: 0, mgmtPct: 0.75 },
    feeSummary: '≈ 0,5 %/ordre · 0 € de garde · AV 0,75 %/an',
    bestFor: 'Tout au même endroit : banque, bourse et AV',
    rating: 4.5,
    pros: ['PEA, CTO et assurance-vie', 'Banque en ligne complète', '0 € de droits de garde'],
    cons: ['Courtage en % moins adapté aux gros ordres'],
    url: '#affiliate-boursobank',
  },
  {
    id: 'trade-republic',
    name: 'Trade Republic',
    accounts: ['cto'],
    order: { type: 'fixed', value: 1.0 }, // 1 € / ordre
    custodyPct: 0,
    av: null,
    feeSummary: '1 €/ordre · plans d\'investissement gratuits',
    bestFor: 'Investir depuis son téléphone',
    rating: 4.3,
    pros: ['1 €/ordre', 'Plans d\'investissement automatiques gratuits', 'Appli mobile soignée'],
    cons: ['Compte-titres uniquement (pas de PEA)'],
    url: '#affiliate-trade-republic',
  },
  {
    id: 'trading212',
    name: 'Trading 212',
    accounts: ['cto'],
    order: { type: 'percent', value: 0 }, // 0 commission
    custodyPct: 0,
    av: null,
    feeSummary: '0 € de commission sur les ETF et actions',
    bestFor: 'Investir sans frais de courtage',
    rating: 4.2,
    pros: ['0 commission', 'Investissement fractionné', 'Appli simple'],
    cons: ['Compte-titres uniquement', 'Frais de change éventuels'],
    url: '#affiliate-trading212',
  },
  {
    id: 'degiro',
    name: 'DEGIRO',
    accounts: ['cto'],
    order: { type: 'fixed', value: 1.0 }, // sélection d'ETF « core » gratuits, sinon ~1-2 €
    custodyPct: 0,
    av: null,
    feeSummary: '≈ 1 €/ordre · ETF « core » gratuits',
    bestFor: 'Un large choix d\'ETF à bas coût',
    rating: 4.1,
    pros: ['Frais très bas', 'Sélection d\'ETF gratuits', 'Courtier européen établi'],
    cons: ['Compte-titres uniquement', 'Pas de PEA'],
    url: '#affiliate-degiro',
  },
  {
    id: 'saxo',
    name: 'Saxo Banque',
    accounts: ['pea', 'cto'],
    order: { type: 'percent', value: 0.08 }, // ETF ~0,08 % (min ~2 €)
    custodyPct: 0,
    av: null,
    feeSummary: '≈ 0,08 %/ordre sur ETF · 0 € de garde',
    bestFor: 'Investir sur ETF à très bas coût',
    rating: 4.3,
    pros: ['Courtage ETF très bas', 'PEA et CTO', 'Plateforme complète'],
    cons: ['Minimum par ordre', 'Plateforme dense pour un débutant'],
    url: '#affiliate-saxo',
  },
  {
    id: 'linxea',
    name: 'Linxea',
    accounts: ['av'],
    order: { type: 'percent', value: 0 },
    custodyPct: 0,
    av: { entryPct: 0, mgmtPct: 0.5 },
    feeSummary: '0 € de frais d\'entrée · ≈ 0,5 %/an de gestion',
    bestFor: 'Une assurance-vie en ligne à frais réduits',
    rating: 4.5,
    pros: ['0 € de frais sur versement', 'Large choix d\'ETF en AV', 'Avantage successoral de l\'AV'],
    cons: ['Frais de gestion annuels (propres à l\'AV)'],
    url: '#affiliate-linxea',
  },
  {
    id: 'yomoni',
    name: 'Yomoni',
    accounts: ['av'],
    order: { type: 'percent', value: 0 },
    custodyPct: 0,
    av: { entryPct: 0, mgmtPct: 1.6 },
    feeSummary: 'Gestion pilotée tout compris ≈ 1,6 %/an',
    bestFor: 'Se faire gérer son épargne clé en main',
    rating: 4.0,
    pros: ['Gestion pilotée automatique', 'Aucune décision à prendre', 'Idéal mains libres'],
    cons: ['Frais annuels plus élevés', 'Moins de contrôle sur les choix'],
    url: '#affiliate-yomoni',
  },
]

export function getBroker(id) {
  return BROKERS.find((b) => b.id === id) || BROKERS[0]
}

// Traduit le modèle de frais d'un courtier en config moteur pour une enveloppe.
//  - PEA / CTO : frais de courtage par ordre (`fees`) + droits de garde annuels.
//  - Assurance-vie : frais d'entrée éventuels (`fees`) + frais de gestion annuels.
export function brokerFeeConfig(broker, envelope) {
  if (envelope === 'av' && broker.av) {
    return {
      fees: { type: 'percent', value: broker.av.entryPct || 0 },
      feeAnnualMgmt: broker.av.mgmtPct || 0,
    }
  }
  return {
    fees: broker.order || { type: 'fixed', value: 0 },
    feeAnnualMgmt: broker.custodyPct || 0,
  }
}
