// ============================================================================
//  generate-pea-pdf.mjs — génère le lead magnet « Comparatif PEA 2026 ».
//  1 page A4 dense : les offres PEA des principaux courtiers DÉCORTIQUÉES,
//  programme par programme (ex. Fortuneo Starter / Progress / Trader).
//  Sortie : public/comparatif-pea-2026.pdf  →  attaché à l'email Brevo.
//  Régénérer : `npm run pdf` (après modif des frais courtiers).
//
//  Données vérifiées sur les grilles tarifaires publiques (juin 2026) :
//   - Bourse Direct : grille Classique unique (paliers).
//   - Fortuneo : Starter / Progress / Trader actif (100 ordres).
//   - Trade Republic : plans d'épargne gratuits + 1 €/ordre.
//   - BoursoBank : Découverte / BoursoMarkets / Trader & Ultimate.
//   - Saxo : PEA sans frais 2026 + tarif Classic 0,08 %.
//
//  ⚠️ Polices standard (WinAnsi) : accents/€/«»/— OK. `clean()` neutralise les
//  caractères non encodables (≤ ≥ ≈ → …) par sécurité.
// ============================================================================

import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const { FEES_AS_OF } = await import(
  pathToFileURL(path.join(ROOT, 'src/data/brokers.js')).href
)

const NAVY = rgb(0.118, 0.227, 0.373) // #1e3a5f
const NAVY2 = rgb(0.18, 0.32, 0.5)
const GREEN = rgb(0.086, 0.639, 0.29) // #16a34a
const GREY = rgb(0.42, 0.48, 0.55)
const LIGHT = rgb(0.93, 0.95, 0.97)
const BAND = rgb(0.88, 0.91, 0.95)
const WHITE = rgb(1, 1, 1)

// Remplace les caractères non encodables en WinAnsi par un équivalent sûr.
const clean = (s) =>
  String(s)
    .replace(/[≤]/g, '<=')
    .replace(/[≥]/g, '>=')
    .replace(/[≈]/g, '~')
    .replace(/[→]/g, '->')
    .replace(/[‘’′]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/ /g, ' ')

// ----------------------------------------------------------------------------
//  Données éditoriales : un PEA par courtier, décliné par programme tarifaire
// ----------------------------------------------------------------------------
const PEA = [
  {
    name: 'Bourse Direct',
    tag: "Le spécialiste français : le courtage par ordre le moins cher, sans contrainte.",
    programs: [
      {
        n: 'Grille Classique (unique)',
        d: "0,99 € jusqu'à 500 €, 1,90 € jusqu'à 1 000 €, 2,90 € jusqu'à 2 000 €, 3,80 € jusqu'à 4 400 €, puis 0,09 % du montant. Aucun droit de garde, aucun frais de tenue de compte.",
      },
    ],
    note: "Idéal si vous passez des ordres de toutes tailles sans vouloir gérer plusieurs formules.",
  },
  {
    name: 'Fortuneo',
    tag: "Banque en ligne complète, avec 3 offres bourse selon votre activité.",
    programs: [
      {
        n: 'Starter',
        d: "1er ordre du mois jusqu'à 500 € offert, puis 0,35 % du montant. Pensée pour débuter et investir de petites sommes régulières.",
      },
      {
        n: 'Progress',
        d: "Tarif par paliers (dès ~1,95 € le petit ordre, 4,90 € jusqu'à 3 000 €, puis dégressif). Pour un investisseur régulier sur des montants moyens.",
      },
      {
        n: 'Trader actif (100 ordres)',
        d: "6,50 € par ordre jusqu'à 100 000 €. Réservé aux profils très actifs (100 ordres/mois) avec un versement initial de 1 000 €.",
      },
    ],
    note: "0 € de droits de garde sur toutes les offres.",
  },
  {
    name: 'Trade Republic',
    tag: "Le mobile-first pour investir un peu chaque mois, sans frais cachés.",
    programs: [
      {
        n: "Plans d'épargne (DCA)",
        d: "Investissement programmé automatique SANS frais de courtage : idéal pour verser la même somme chaque mois sur un ETF.",
      },
      {
        n: 'Ordre au comptant',
        d: "1 € par ordre, quel que soit le montant. Aucun droit de garde. Tout se gère depuis l'application mobile.",
      },
    ],
    note: "Pas de plateforme web complète : 100 % mobile.",
  },
  {
    name: 'BoursoBank',
    tag: "Banque + bourse + assurance-vie au même endroit, 3 tarifs selon le rythme.",
    programs: [
      {
        n: 'Découverte',
        d: "1,99 € jusqu'à 500 €, puis ~0,60 % du montant. Le tarif par défaut, adapté à la plupart des épargnants.",
      },
      {
        n: 'BoursoMarkets',
        d: "176 ETF à 0 € de courtage à l'achat (ordre d'au moins 500 €) : très intéressant pour un PEA investi en ETF.",
      },
      {
        n: 'Trader / Ultimate Trader',
        d: "16,55 € (jusqu'à 7 750 €) ou 9,90 € (jusqu'à 10 000 €, 30 ordres/mois). Pour les investisseurs actifs sur de gros ordres.",
      },
    ],
    note: "0 € de droits de garde.",
  },
  {
    name: 'Saxo Banque',
    tag: "Courtage ETF parmi les plus bas, et une offre PEA sans frais en 2026.",
    programs: [
      {
        n: 'PEA sans frais 2026',
        d: "Nouveaux clients : 0 € de courtage en 2026 sur 70 actions PEA (CAC 40 + 30 valeurs européennes) et une sélection d'ETF. Transfert de PEA remboursé.",
      },
      {
        n: 'Tarif Classic',
        d: "0,08 % par ordre (minimum ~2 €), plafonné à 0,5 % sur PEA. Hors offre de lancement, reste un des courtages ETF les plus bas.",
      },
    ],
    note: "Plateforme dense : un peu technique pour un grand débutant.",
  },
]

const PROFILES = [
  ['Vous investissez peu chaque mois (DCA)', "Trade Republic (plans gratuits) ou Fortuneo Starter."],
  ['Ordres moyens et réguliers', "Bourse Direct (grille Classique) ou Fortuneo Progress."],
  ['Vous visez les ETF à bas coût', "Saxo (PEA sans frais 2026) ou BoursoMarkets (BoursoBank)."],
]

// ----------------------------------------------------------------------------
//  Mise en page
// ----------------------------------------------------------------------------
const doc = await PDFDocument.create()
const page = doc.addPage([595.28, 841.89]) // A4
const font = await doc.embedFont(StandardFonts.Helvetica)
const bold = await doc.embedFont(StandardFonts.HelveticaBold)
const oblique = await doc.embedFont(StandardFonts.HelveticaOblique)
const W = page.getWidth()
const H = page.getHeight()
const M = 42
const CW = W - M * 2

const text = (s, x, y, size, f = font, color = NAVY) =>
  page.drawText(clean(s), { x, y, size, font: f, color })

function wrap(s, f, size, maxW) {
  const words = clean(s).split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const t = line ? `${line} ${w}` : w
    if (f.widthOfTextAtSize(t, size) > maxW && line) {
      lines.push(line)
      line = w
    } else line = t
  }
  if (line) lines.push(line)
  return lines
}

// Paragraphe à flot avec préfixe en gras puis corps régulier (économise la place).
// Retourne l'ordonnée de la dernière ligne écrite.
function flow(prefix, body, x, y, maxW, lineH) {
  let cx = x
  let cy = y
  const draw = (word, f, size, color) => {
    const ww = f.widthOfTextAtSize(word + ' ', size)
    if (cx + ww > x + maxW && cx > x) {
      cx = x
      cy -= lineH
    }
    page.drawText(clean(word) + ' ', { x: cx, y: cy, size, font: f, color })
    cx += ww
  }
  for (const w of clean(prefix).split(' ')) draw(w, bold, 9, NAVY)
  for (const w of clean(body).split(' ')) draw(w, font, 8.5, GREY)
  return cy
}

// ---------- En-tête ----------
page.drawRectangle({ x: 0, y: H - 56, width: W, height: 56, color: NAVY })
text('Comparatif PEA 2026', M, H - 30, 21, bold, WHITE)
text('Les offres des courtiers, programme par programme', M, H - 47, 10.5, font, rgb(0.78, 0.85, 0.92))
text(
  'simulateur-portefeuille.fr',
  W - M - font.widthOfTextAtSize('simulateur-portefeuille.fr', 10),
  H - 47,
  10,
  font,
  rgb(0.78, 0.85, 0.92),
)

let y = H - 78

// ---------- Intro ----------
for (const line of wrap(
  "Le PEA exonère vos plus-values d'impôt après 5 ans (hors prélèvements sociaux de 17,2 %). Mais tous les PEA ne se valent pas : chaque courtier propose une ou plusieurs grilles de tarifs. Voici le détail des principales offres pour choisir en connaissance de cause.",
  font, 9.5, CW,
)) {
  text(line, M, y, 9.5, font, GREY)
  y -= 12.5
}
y -= 6

// ---------- Blocs courtiers ----------
for (const b of PEA) {
  // Bandeau du nom + accent vert
  const bandH = 17
  page.drawRectangle({ x: M, y: y - bandH + 5, width: CW, height: bandH, color: BAND })
  page.drawRectangle({ x: M, y: y - bandH + 5, width: 3.5, height: bandH, color: GREEN })
  text(b.name, M + 10, y - 7, 11, bold, NAVY)
  const nbProg = `${b.programs.length} offre${b.programs.length > 1 ? 's' : ''}`
  text(nbProg, W - M - 8 - font.widthOfTextAtSize(nbProg, 8.5), y - 7, 8.5, bold, NAVY2)
  y -= bandH + 4

  // Tagline
  for (const line of wrap(b.tag, oblique, 8.5, CW - 4)) {
    text(line, M + 4, y, 8.5, oblique, NAVY2)
    y -= 11
  }
  y -= 2

  // Programmes
  for (const p of b.programs) {
    text('-', M + 6, y, 9, bold, GREEN)
    const lastY = flow(p.n + ' : ', p.d, M + 14, y, CW - 16, 11)
    y = lastY - 14.5
  }

  // Note
  for (const line of wrap('A retenir : ' + b.note, font, 8.5, CW - 4)) {
    text(line, M + 4, y, 8.5, font, GREY)
    y -= 11
  }
  y -= 13
}

// ---------- Quel tarif pour quel profil ? ----------
y -= 2
text('Quel courtier pour quel profil ?', M, y, 12, bold, NAVY)
y -= 16
for (const [t, d] of PROFILES) {
  const lastY = flow(t + ' : ', d, M + 6, y, CW - 8, 11)
  y = lastY - 14
}

const contentBottom = y // ordonnée la plus basse du contenu principal

// ---------- Pied de page ----------
const discLines = wrap(
  `Frais indicatifs à jour de ${FEES_AS_OF}, simplifiés à des fins pédagogiques : ils dépendent du montant des ordres, de l'offre choisie et des promotions en cours, et évoluent dans le temps. À vérifier sur le site du courtier avant d'ouvrir. Document à but éducatif, ne constitue pas un conseil en investissement. Les performances passées ne préjugent pas des performances futures.`,
  font, 7, CW,
)
let fy = 64
page.drawLine({ start: { x: M, y: fy + 12 }, end: { x: W - M, y: fy + 12 }, thickness: 0.5, color: rgb(0.8, 0.84, 0.88) })
for (const line of discLines) {
  text(line, M, fy, 7, font, GREY)
  fy -= 9
}
text('simulateur-portefeuille.fr — Comparatif PEA 2026', M, fy - 3, 8, bold, NAVY)

const bytes = await doc.save()
await writeFile(path.join(ROOT, 'public/comparatif-pea-2026.pdf'), bytes)
const footerTop = 64 + 12
console.log(
  `✓ PDF généré : public/comparatif-pea-2026.pdf (${PEA.length} courtiers, ` +
    `${PEA.reduce((n, b) => n + b.programs.length, 0)} offres détaillées, ` +
    `${(bytes.length / 1024).toFixed(0)} Ko).`,
)
console.log(
  `  Bas du contenu y=${contentBottom.toFixed(0)} · haut du footer y=${footerTop} · ` +
    (contentBottom > footerTop ? 'OK (pas de chevauchement)' : '⚠️ CHEVAUCHEMENT'),
)
