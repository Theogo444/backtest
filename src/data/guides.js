// ============================================================================
//  guides.js — collecte automatique des articles du pôle Guides.
//  Dépose un fichier dans src/content/guides/*.js (export default { slug, … })
//  et il apparaît automatiquement dans la liste et au pré-rendu.
// ============================================================================

const modules = import.meta.glob('../content/guides/*.js', { eager: true })

export const GUIDES = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => (a.date < b.date ? 1 : -1)) // plus récent d'abord

export function getGuide(slug) {
  return GUIDES.find((g) => g.slug === slug)
}

export const GUIDE_SLUGS = GUIDES.map((g) => g.slug)
