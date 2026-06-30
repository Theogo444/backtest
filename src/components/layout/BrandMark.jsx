// ============================================================================
//  BrandMark.jsx — primitives graphiques de la marque « Sereo » (de serein).
//  Direction « le point serein » : un point émeraude posé sur l'horizon.
//  Symbolique : sérénité, repère, projection long terme, clarté.
//  Deux primitives → favicon 16 px net, monochrome, clair/sombre.
//
//  Trois primitives exportées (le wordmark complet est dans Logo.jsx) :
//   • BrandMark      — badge : carré marine + horizon + point (fond clair/auto)
//   • BrandGlyph     — glyphe nu sur fond transparent (surfaces sombres/colorées)
//   • BrandMarkMono  — monochrome currentColor (impression, fond plein)
//
//  Cohérent avec public/favicon.svg, logo-mark.svg, logo.svg, app-icon.svg.
// ============================================================================

const NAVY = '#1e3a5f' // navy-800, couleur de marque
const EMERALD = '#34d399' // emerald-400 / gain.light, le point

// Attributs d'accessibilité : étiquette autonome, ou décoratif quand un
// texte « Sereo » accompagne déjà le mark (évite la lecture en double).
function a11y(decorative) {
  return decorative
    ? { 'aria-hidden': 'true', focusable: 'false' }
    : { role: 'img', 'aria-label': 'Sereo' }
}

/** Badge : carré marine arrondi, ligne d'horizon, point émeraude posé. */
export default function BrandMark({ className = 'h-9 w-9', decorative = false }) {
  return (
    <svg viewBox="0 0 40 40" className={className} {...a11y(decorative)}>
      <rect width="40" height="40" rx="10" fill={NAVY} />
      <line x1="9" y1="26" x2="31" y2="26" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="20.5" r="5" fill={EMERALD} />
    </svg>
  )
}

/** Glyphe nu (sans carré) pour surfaces sombres/colorées : horizon clair + point. */
export function BrandGlyph({ className = 'h-9 w-9', decorative = false }) {
  return (
    <svg viewBox="0 0 40 40" className={className} {...a11y(decorative)}>
      <line x1="7" y1="27" x2="33" y2="27" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="20" cy="20" r="6" fill={EMERALD} />
    </svg>
  )
}

/** Monochrome (hérite de currentColor) : impression, fond plein. */
export function BrandMarkMono({ className = 'h-9 w-9', decorative = false }) {
  return (
    <svg viewBox="0 0 40 40" className={className} {...a11y(decorative)}>
      <rect width="40" height="40" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="11" y1="26" x2="29" y2="26" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="20" cy="20.5" r="4.6" fill="currentColor" />
    </svg>
  )
}
