// ============================================================================
//  site.js — identité du site : UNIQUE source de vérité pour l'URL canonique
//  et le nom de marque. Consommé par le composant Seo, les schémas JSON-LD et
//  le script de génération sitemap/robots (scripts/generate-sitemap.mjs).
//
//  ⚠️ Changer de domaine = modifier SITE_URL ici + les JSON-LD statiques de
//  index.html (seul endroit non importable), puis rebuilder.
// ============================================================================

export const SITE_URL = 'https://simulateur-portefeuille.fr'
export const BRAND = 'Sereo'
