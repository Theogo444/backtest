// ============================================================================
//  Logo.jsx — logo « Sereo » réutilisable (mark + wordmark).
//  Compose les primitives de BrandMark.jsx ; aucune duplication de SVG.
//
//  Variantes (prop `variant`) :
//   • default — mark + « Sereo » + descripteur, couleur auto (clair/sombre)
//   • icon    — mark seul (favicon visuel, avatar, espaces réduits)
//   • compact — mark + « Sereo » (sans descripteur) — mobile, barres slim
//   • light   — couleurs forcées « surface claire » (texte marine)
//   • dark    — glyphe nu + texte blanc, pour surfaces sombres/colorées (hero)
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
  default: { glyph: false, text: true, desc: true, tone: 'auto' },
  icon: { glyph: false, text: false, desc: false, tone: 'auto' },
  compact: { glyph: false, text: true, desc: false, tone: 'auto' },
  light: { glyph: false, text: true, desc: true, tone: 'light' },
  dark: { glyph: true, text: true, desc: true, tone: 'dark' },
}

// Couleurs par tonalité. emerald-500 sur clair (meilleur contraste du « o »),
// emerald-300 sur sombre ; le mark, lui, porte toujours l'émeraude #34d399.
const TONE = {
  auto: { name: 'text-navy-800 dark:text-white', desc: 'text-navy-400', accent: 'text-emerald-500 dark:text-emerald-300' },
  light: { name: 'text-navy-800', desc: 'text-navy-400', accent: 'text-emerald-500' },
  dark: { name: 'text-white', desc: 'text-navy-200', accent: 'text-emerald-300' },
}

export default function Logo({ variant = 'default', size = 'md', className = '' }) {
  const v = VARIANTS[variant] ?? VARIANTS.default
  const s = SIZES[size] ?? SIZES.md
  const tone = TONE[v.tone]
  const Mark = v.glyph ? BrandGlyph : BrandMark

  return (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <Mark className={`${s.mark} shrink-0`} decorative={v.text} />
      {v.text && (
        <span className="leading-tight">
          <span className={`block font-extrabold tracking-tight ${s.name} ${tone.name}`}>
            Sere<span className={tone.accent}>o</span>
          </span>
          {v.desc && (
            <span className={`block font-semibold ${s.desc} ${tone.desc}`}>
              Simulateur de portefeuille
            </span>
          )}
        </span>
      )}
    </span>
  )
}
