// ============================================================================
//  affiliates.js — source unique des courtiers mis en avant (accueil, guides)
//  et liens d'affiliation.
//
//  ⚠️ `url` pointe vers le SITE OFFICIEL du courtier (lien non tracké).
//  Remplace par ton vrai lien d'affiliation une fois inscrit au programme.
//  C'est le seul fichier à modifier — les CTA s'actualisent partout
//  (page d'accueil, guides…).
//
//  Frais indicatifs à jour de juin 2026 (cf. data/brokers.js pour le détail).
//  Aucune note « sur 5 » : pas de notation maison non vérifiable.
// ============================================================================

export const BROKERS = [
  {
    id: 'bourse-direct',
    name: 'Bourse Direct',
    envelope: 'PEA',
    highlight: 'Tarifs parmi les plus bas',
    pros: ['Frais de courtage très bas', 'PEA et compte-titres', 'Spécialiste de la bourse'],
    fees: 'dès 0,99 €/ordre · 0 € de garde',
    url: 'https://www.boursedirect.fr/',
  },
  {
    id: 'trade-republic',
    name: 'Trade Republic',
    envelope: 'PEA',
    highlight: "PEA mobile, plans d'épargne gratuits",
    pros: ['1 €/ordre', "Plans d'investissement PEA sans frais", 'Application mobile soignée'],
    fees: '1 €/ordre · plans gratuits',
    url: 'https://traderepublic.com/fr-fr',
  },
  {
    id: 'fortuneo',
    name: 'Fortuneo',
    envelope: 'PEA',
    highlight: 'PEA sans droits de garde',
    pros: ['0 € de droits de garde', 'Banque en ligne complète', 'PEA et compte-titres'],
    fees: '0,35 %/ordre (Starter) · 0 € de garde',
    url: 'https://bourse.fortuneo.fr/',
  },
]
