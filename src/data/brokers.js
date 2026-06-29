// ============================================================================
//  brokers.js — courtiers français pour le Simulateur débutant et le
//  Comparatif des courtiers.
//
//  Chaque courtier expose : les enveloppes proposées, un modèle de frais
//  (courtage par ordre + droits de garde, ou frais de gestion pour l'AV), et
//  des infos éditoriales (résumé de frais, points forts/faibles, idéal pour…).
//  Le modèle de frais alimente directement le moteur de simulation
//  (useSimulation : `fees` + `feeAnnualMgmt`).
//
//  ⚠️ Frais INDICATIFS, à jour de juin 2026, simplifiés à des fins pédagogiques
//  et vérifiés sur les grilles tarifaires publiques des courtiers. Les tarifs
//  évoluent et dépendent du montant des ordres, de l'offre choisie et des
//  promotions en cours — à vérifier sur le site du courtier avant d'ouvrir.
//
//  Aucune note « sur 5 » n'est affichée : nous ne publions pas de notation
//  maison qui ne reposerait pas sur une méthodologie vérifiable.
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
    order: { type: 'fixed', value: 0.99 }, // 0,99 € jusqu'à 500 €
    custodyPct: 0,
    av: null,
    feeSummary: '0,99 € à 3,80 €/ordre · 0 € de droits de garde',
    orderFee: '0,99 € (≤ 500 €) → 3,80 € (≤ 4 400 €), puis 0,09 %',
    custodyFee: '0 €',
    etfDeal: '1er ordre ETF Amundi offert chaque mois',
    bestFor: 'Les frais par ordre les plus bas',
    pros: ['Parmi les courtages les moins chers', 'PEA, PEA-PME et compte-titres', 'Spécialiste français de la bourse'],
    cons: ['Interface un peu datée', "Pas d'assurance-vie"],
    url: '#affiliate-bourse-direct',
  },
  {
    id: 'trade-republic',
    name: 'Trade Republic',
    accounts: ['pea', 'cto'],
    order: { type: 'fixed', value: 1.0 }, // 1 € / ordre ; plans d'épargne gratuits
    custodyPct: 0,
    av: null,
    feeSummary: "1 €/ordre · plans d'épargne PEA sans frais",
    orderFee: "1 €/ordre · plans d'investissement programmés gratuits",
    custodyFee: '0 €',
    etfDeal: "Investissement programmé (DCA) sans frais de courtage",
    bestFor: 'Investir un peu chaque mois sans frais, depuis son mobile',
    pros: ["PEA avec plans d'épargne automatiques sans frais", '1 €/ordre seulement', 'Application mobile très soignée'],
    cons: ['Pas de plateforme web complète', 'Tout se gère depuis le téléphone'],
    url: '#affiliate-trade-republic',
  },
  {
    id: 'fortuneo',
    name: 'Fortuneo',
    accounts: ['pea', 'cto'],
    order: { type: 'percent', value: 0.35 }, // offre Starter : 0,35 %/ordre
    custodyPct: 0,
    av: null,
    feeSummary: '0,35 %/ordre (offre Starter) · 0 € de droits de garde',
    orderFee: '0,35 %/ordre (Starter) · 1er ordre/mois ≤ 500 € offert',
    custodyFee: '0 €',
    etfDeal: '1er ordre ETF Amundi remboursé chaque mois',
    bestFor: 'Un PEA dans une banque en ligne complète',
    pros: ['0 € de droits de garde', 'Banque en ligne complète et réputée', 'PEA et compte-titres'],
    cons: ['Courtage en pourcentage', 'Moins adapté aux très gros ordres'],
    url: '#affiliate-fortuneo',
  },
  {
    id: 'boursobank',
    name: 'BoursoBank',
    accounts: ['pea', 'cto', 'av'],
    order: { type: 'percent', value: 0.5 }, // offre Découverte, plafonnée 0,5 % sur PEA
    custodyPct: 0,
    av: { entryPct: 0, mgmtPct: 0.75 },
    feeSummary: 'Offre Découverte : dès 1,99 €/ordre (0,5 % sur PEA) · 0 € de garde',
    orderFee: '1,99 € (≤ 500 €) puis 0,5 % — offre Découverte',
    custodyFee: '0 €',
    etfDeal: '176 ETF à 0 € via BoursoMarkets (achat ≥ 500 €)',
    bestFor: 'Tout au même endroit : banque, bourse et assurance-vie',
    pros: ['PEA, compte-titres et assurance-vie', 'Banque en ligne complète', '176 ETF sans frais (BoursoMarkets)'],
    cons: ['Courtage en pourcentage sur les gros ordres', 'Gratuité ETF conditionnée à 500 €'],
    url: '#affiliate-boursobank',
  },
  {
    id: 'saxo',
    name: 'Saxo Banque',
    accounts: ['pea', 'cto'],
    order: { type: 'percent', value: 0.08 }, // Classic : 0,08 %/ordre (min ~2 €)
    custodyPct: 0,
    av: null,
    feeSummary: 'PEA sans frais (offre 2026), puis 0,08 %/ordre',
    orderFee: '0,08 %/ordre (Classic, min 2 €) · plafonné 0,5 % sur PEA',
    custodyFee: '0 €',
    etfDeal: 'ETF Amundi sans frais + 70 actions offertes (jusqu’à fin 2026)',
    bestFor: 'Investir sur ETF à très bas coût',
    pros: ['Courtage ETF parmi les plus bas', 'PEA et compte-titres', 'Offre PEA sans frais en 2026'],
    cons: ['Plateforme dense pour un débutant', 'Frais de change 0,25 % sur devises'],
    url: '#affiliate-saxo',
  },
  {
    id: 'degiro',
    name: 'DEGIRO',
    accounts: ['cto'],
    order: { type: 'fixed', value: 1.0 }, // 1 € / ordre Euronext, sélection ETF « core » à 1 €
    custodyPct: 0,
    av: null,
    feeSummary: '≈ 1 €/ordre · sélection d’ETF « core » à 1 €',
    orderFee: '1 €/ordre Euronext · ETF « core » 1 €, autres ETF 3 €',
    custodyFee: '0 €',
    etfDeal: 'Sélection d’ETF « core » à 1 € par transaction',
    bestFor: 'Un très large choix d’ETF à bas coût',
    pros: ['Frais très bas', 'Univers d’ETF parmi les plus larges', 'Courtier européen établi'],
    cons: ['Pas de PEA (compte-titres uniquement)', 'Déclaration fiscale à faire soi-même'],
    url: '#affiliate-degiro',
  },
  {
    id: 'trading212',
    name: 'Trading 212',
    accounts: ['cto'],
    order: { type: 'percent', value: 0 }, // 0 commission
    custodyPct: 0,
    av: null,
    feeSummary: '0 € de commission · compte-titres uniquement',
    orderFee: '0 € de commission sur actions et ETF',
    custodyFee: '0 €',
    etfDeal: 'Actions et ETF sans commission, investissement fractionné',
    bestFor: 'Investir sans frais de courtage',
    pros: ['0 commission sur actions et ETF', 'Investissement fractionné', 'Application simple'],
    cons: ['Pas de PEA (compte-titres uniquement)', 'Frais de change 0,15 %', 'Courtier étranger : déclaration 3916'],
    url: '#affiliate-trading212',
  },
  {
    id: 'linxea',
    name: 'Linxea',
    accounts: ['av'],
    order: { type: 'percent', value: 0 },
    custodyPct: 0,
    av: { entryPct: 0, mgmtPct: 0.5 },
    feeSummary: '0 € de frais d’entrée · 0,5 %/an de gestion',
    orderFee: '0 € sur versement · 0,06 % par arbitrage ETF',
    custodyFee: '0,5 %/an (frais de gestion AV)',
    etfDeal: '80+ ETF et SCPI éligibles en assurance-vie',
    bestFor: 'Une assurance-vie en ligne à frais réduits',
    pros: ['0 € de frais sur versement', '0,5 %/an seulement (Linxea Spirit 2)', 'Large choix d’ETF et de SCPI'],
    cons: ["Frais de gestion annuels (propres à l'AV)"],
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
    orderFee: 'Aucun ordre à passer (gestion pilotée)',
    custodyFee: '≈ 1,6 %/an tout compris',
    etfDeal: 'Portefeuille d’ETF géré automatiquement pour vous',
    bestFor: 'Se faire gérer son épargne clé en main',
    pros: ['Gestion pilotée automatique', 'Aucune décision à prendre', 'Idéal « mains libres »'],
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
