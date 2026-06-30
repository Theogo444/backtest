// ============================================================================
//  BrandMark.jsx — primitives graphiques de la marque « Sereo » (de serein).
//  Direction « les points comparés » : 2 options atténuées + 1 point focal
//  émeraude, posés à des hauteurs différentes sur un horizon commun, reliés
//  par de fines tiges (dot-plot).
//  Symbolique : COMPARAISON (PEA/CTO/AV), mesure depuis une référence commune
//  (rigueur), positions sur l'horizon (long terme), point focal = votre choix
//  (pédagogie). Non monotone → pas de « flèche montante ».
//
//  Trois primitives (le wordmark complet est dans Logo.jsx) :
//   • BrandMark      — badge : carré marine + dot-plot (fond clair/auto)
//   • BrandGlyph     — glyphe nu sur fond transparent (surfaces sombres)
//   • BrandMarkMono  — monochrome currentColor (impression, fond plein)
//
//  Cohérent avec public/favicon.svg, logo-mark.svg, logo.svg, app-icon.svg.
// ============================================================================

const EMERALD = '#34d399' // emerald-400 / gain.light — le point focal

// Géométrie partagée (viewBox 40×40). Le dernier point est le focal.
const BASE_Y = 28.5
const POINTS = [
  { x: 12.5, y: 17.5, r: 3 },
  { x: 20, y: 22, r: 3 },
  { x: 27.5, y: 14, r: 3.6, focal: true },
]

function a11y(decorative) {
  return decorative
    ? { 'aria-hidden': 'true', focusable: 'false' }
    : { role: 'img', 'aria-label': 'Sereo' }
}

// Trace l'horizon, les tiges et les points selon une palette donnée.
// `base`/`stem`/`dot` = couleur des éléments atténués ; `focal` = couleur du
// point mis en avant (et de sa tige).
function Plot({ base, stem, dot, focal }) {
  return (
    <>
      <line x1="8" y1={BASE_Y} x2="32" y2={BASE_Y} {...base} strokeLinecap="round" />
      {POINTS.map((p) => (
        <line key={`s${p.x}`} x1={p.x} y1={p.y} x2={p.x} y2={BASE_Y} {...(p.focal ? focal.stem : stem)} strokeLinecap="round" />
      ))}
      {POINTS.map((p) => (
        <circle key={`d${p.x}`} cx={p.x} cy={p.y} r={p.r} {...(p.focal ? focal.dot : dot)} />
      ))}
    </>
  )
}

/** Badge : carré marine arrondi + dot-plot (point focal émeraude). */
export default function BrandMark({ className = 'h-9 w-9', decorative = false }) {
  return (
    <svg viewBox="0 0 40 40" className={className} {...a11y(decorative)}>
      <rect width="40" height="40" rx="10" fill="#1e3a5f" />
      <Plot
        base={{ stroke: '#ffffff', strokeOpacity: 0.2, strokeWidth: 1.5 }}
        stem={{ stroke: '#ffffff', strokeOpacity: 0.22, strokeWidth: 1.3 }}
        dot={{ fill: '#ffffff', fillOpacity: 0.9 }}
        focal={{ stem: { stroke: EMERALD, strokeOpacity: 0.4, strokeWidth: 1.3 }, dot: { fill: EMERALD } }}
      />
    </svg>
  )
}

/** Glyphe nu (sans carré) pour surfaces sombres/colorées. */
export function BrandGlyph({ className = 'h-9 w-9', decorative = false }) {
  return (
    <svg viewBox="0 0 40 40" className={className} {...a11y(decorative)}>
      <Plot
        base={{ stroke: '#ffffff', strokeOpacity: 0.4, strokeWidth: 1.6 }}
        stem={{ stroke: '#ffffff', strokeOpacity: 0.32, strokeWidth: 1.4 }}
        dot={{ fill: '#ffffff', fillOpacity: 0.92 }}
        focal={{ stem: { stroke: EMERALD, strokeOpacity: 0.55, strokeWidth: 1.4 }, dot: { fill: EMERALD } }}
      />
    </svg>
  )
}

/** Monochrome (currentColor) : le focal se distingue par sa taille, pas la couleur. */
export function BrandMarkMono({ className = 'h-9 w-9', decorative = false }) {
  const ink = { stroke: 'currentColor', strokeOpacity: 0.45, strokeWidth: 1.4 }
  return (
    <svg viewBox="0 0 40 40" className={className} {...a11y(decorative)}>
      <Plot
        base={{ stroke: 'currentColor', strokeOpacity: 0.45, strokeWidth: 1.6 }}
        stem={ink}
        dot={{ fill: 'currentColor', fillOpacity: 0.85 }}
        focal={{ stem: ink, dot: { fill: 'currentColor' } }}
      />
    </svg>
  )
}
