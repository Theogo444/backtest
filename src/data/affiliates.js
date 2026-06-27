// ============================================================================
//  affiliates.js — source unique des courtiers et liens d'affiliation.
//
//  ⚠️ Liens PLACEHOLDER (#affiliate-*) : remplace `url` par ton vrai lien
//  d'affiliation une fois inscrit au programme. C'est le seul fichier à
//  modifier — les CTA s'actualisent partout (page d'accueil, comparateur…).
// ============================================================================

export const BROKERS = [
  {
    id: 'fortuneo',
    name: 'Fortuneo',
    envelope: 'PEA',
    highlight: 'PEA sans droits de garde',
    pros: ['0 € de droits de garde', 'Courtage compétitif', 'Banque en ligne complète'],
    fees: '0 € garde · dès 1,95 €/ordre',
    rating: 4.6,
    url: '#affiliate-fortuneo-pea',
  },
  {
    id: 'bourse-direct',
    name: 'Bourse Direct',
    envelope: 'PEA',
    highlight: 'Tarifs parmi les plus bas',
    pros: ['Frais de courtage très bas', 'PEA et CTO', 'Spécialiste bourse'],
    fees: 'dès 0,99 €/ordre',
    rating: 4.4,
    url: '#affiliate-bourse-direct-pea',
  },
  {
    id: 'trade-republic',
    name: 'Trade Republic',
    envelope: 'CTO',
    highlight: 'Investissement mobile + intérêts',
    pros: ['1 €/ordre', 'Plans d\'investissement gratuits', 'Appli mobile'],
    fees: '1 €/ordre',
    rating: 4.3,
    url: '#affiliate-trade-republic-cto',
  },
]
