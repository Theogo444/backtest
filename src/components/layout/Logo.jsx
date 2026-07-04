// ============================================================================
//  Logo.jsx — logo « Sereo » réutilisable (mark + wordmark).
//  Compose les primitives de BrandMark.jsx ; aucune duplication de SVG.
//
//  Mark primaire = glyphe nu adaptatif (BrandGlyph). Le carré arrondi
//  (BrandMark) est réservé à la variante `badge` (tuile/avatar) et aux assets
//  app icon / favicon — cf. audit DA, P3 « séparer le mark de la tuile d'app ».
//
//  Variantes (prop `variant`) :
//   • default — glyphe + « Sereo » + descripteur, couleur auto (clair/sombre)
//   • icon    — glyphe seul (espaces réduits)
//   • compact — glyphe + « Sereo » (sans descripteur) — mobile, barres slim
//   • light   — couleurs forcées « surface claire » (encre marine)
//   • dark    — couleurs forcées « surface sombre » (encre blanche) — hero
//   • badge   — tuile carrée marine seule (avatar, vignette sociale)
//
//  Tailles (prop `size`) : sm | md | lg — gardent mark et typo alignés.
// ============================================================================

import BrandMark, { BrandGlyph } from './BrandMark'

const SIZES = {
  sm: { mark: 'h-8 w-8', gap: 'gap-2', name: 'text-sm', desc: 'text-[10px]' },
  md: { mark: 'h-9 w-9', gap: 'gap-2.5', name: 'text-base', desc: 'text-[11px]' },
  lg: { mark: 'h-12 w-12', gap: 'gap-3', name: 'text-xl', desc: 'text-xs' },
}

const VARIANTS = {
  default: { kind: 'glyph', text: true, desc: true, tone: 'auto' },
  icon: { kind: 'glyph', text: false, desc: false, tone: 'auto' },
  compact: { kind: 'glyph', text: true, desc: false, tone: 'auto' },
  light: { kind: 'glyph', text: true, desc: true, tone: 'light' },
  dark: { kind: 'glyph', text: true, desc: true, tone: 'dark' },
  badge: { kind: 'badge', text: false, desc: false, tone: 'auto' },
}

// Wordmark monochrome (discipline chromatique : le seul accent émeraude du
// logo vit dans le mark, pas dans le texte). Nom contrasté + descripteur en
// petites capitales espacées (registre éditorial). `mark` = couleur du glyphe
// nu (currentColor des éléments atténués ; le point focal reste émeraude).
const TONE = {
  auto: { name: 'text-navy-900 dark:text-white', desc: 'text-navy-400', mark: 'text-navy-700 dark:text-navy-100' },
  light: { name: 'text-navy-900', desc: 'text-navy-400', mark: 'text-navy-700' },
  dark: { name: 'text-white', desc: 'text-navy-300', mark: 'text-white' },
}

export default function Logo({ variant = 'default', size = 'md', className = '' }) {
  const v = VARIANTS[variant] ?? VARIANTS.default
  const s = SIZES[size] ?? SIZES.md
  const tone = TONE[v.tone]
  const Mark = v.kind === 'badge' ? BrandMark : BrandGlyph
  // Le glyphe nu hérite de currentColor → on lui passe la couleur d'encre ;
  // la tuile (badge) se colore elle-même.
  const markColor = v.kind === 'badge' ? '' : tone.mark

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <Mark className={`${s.mark} shrink-0 ${markColor}`} decorative={v.text} />
      {v.text && (
        <span className="leading-tight">
          <span className={`block font-extrabold tracking-tight ${s.name} ${tone.name}`}>
            Sereo
          </span>
          {v.desc && (
            <span className={`block font-semibold uppercase tracking-[0.14em] ${s.desc} ${tone.desc}`}>
              Simulateur de portefeuille
            </span>
          )}
        </span>
      )}
    </span>
  )
}
