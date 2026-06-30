// ============================================================================
//  BrandMark.jsx — identité « Sereo » (de serein).
//  Direction « le point serein » : un point émeraude posé sur l'horizon.
//  Symbolique : sérénité, repère, projection long terme, clarté.
//  Deux primitives seulement → favicon 16 px net, monochrome, clair/sombre.
//  Cohérent avec public/favicon.svg, logo-mark.svg et logo.svg.
// ============================================================================

const NAVY = '#1e3a5f'
const EMERALD = '#34d399'

/**
 * Mark « badge » : carré marine arrondi, ligne d'horizon, point émeraude posé.
 * Vit seul (favicon, avatar) ou en tête de wordmark.
 */
export default function BrandMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="Sereo">
      <rect width="40" height="40" rx="10" fill={NAVY} />
      {/* horizon */}
      <line
        x1="9"
        y1="26"
        x2="31"
        y2="26"
        stroke="#ffffff"
        strokeOpacity="0.2"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* le point serein, posé sur l'horizon */}
      <circle cx="20" cy="20.5" r="5" fill={EMERALD} />
    </svg>
  )
}

/**
 * Variante monochrome (hérite de currentColor) — impression, fond plein,
 * usages où la couleur n'est pas garantie.
 */
export function BrandMarkMono({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="Sereo">
      <rect width="40" height="40" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="11" y1="26" x2="29" y2="26" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20" cy="20.5" r="4.6" fill="currentColor" />
    </svg>
  )
}
