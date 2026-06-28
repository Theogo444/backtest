// ============================================================================
//  generate-pea-pdf.mjs — génère le lead magnet « Comparatif PEA 2026 ».
//  1 page A4, données réelles tirées de src/data/brokers.js (courtiers PEA).
//  Sortie : public/comparatif-pea-2026.pdf  →  attaché à l'email Brevo.
//  Régénérer : `npm run pdf` (après modif des frais courtiers).
//
//  ⚠️ Polices standard (WinAnsi) : accents/€/«»/— OK, mais PAS « ≈ » → on
//  utilise « ~ ».
// ============================================================================

import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

const { BROKERS, FEES_AS_OF } = await import(
  pathToFileURL(path.join(ROOT, 'src/data/brokers.js')).href
)

const NAVY = rgb(0.118, 0.227, 0.373) // #1e3a5f
const GREEN = rgb(0.086, 0.639, 0.290) // #16a34a
const GREY = rgb(0.42, 0.48, 0.55)
const LIGHT = rgb(0.93, 0.95, 0.97)
const WHITE = rgb(1, 1, 1)

const peaBrokers = BROKERS.filter((b) => b.accounts.includes('pea'))

function orderLabel(b) {
  if (!b.order || b.order.value === 0) return '0 €'
  const v = String(b.order.value).replace('.', ',')
  return b.order.type === 'fixed' ? `~ ${v} €` : `~ ${v} %`
}

const doc = await PDFDocument.create()
const page = doc.addPage([595.28, 841.89]) // A4
const font = await doc.embedFont(StandardFonts.Helvetica)
const bold = await doc.embedFont(StandardFonts.HelveticaBold)
const W = page.getWidth()
const M = 50
const CW = W - M * 2

const text = (s, x, y, size, f = font, color = NAVY) =>
  page.drawText(String(s), { x, y, size, font: f, color })

function wrap(s, f, size, maxW) {
  const words = String(s).split(' ')
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

// ---------- En-tête ----------
page.drawRectangle({ x: 0, y: 791.89, width: W, height: 50, color: NAVY })
text('Comparatif PEA 2026', M, 808, 22, bold, WHITE)
text('simulateur-portefeuille.fr', W - M - font.widthOfTextAtSize('simulateur-portefeuille.fr', 11), 810, 11, font, rgb(0.8, 0.86, 0.93))

let y = 760
text("Quel courtier pour ouvrir votre Plan d'Épargne en Actions ?", M, y, 13, bold, NAVY)
y -= 18
for (const line of wrap(
  "Le PEA exonère vos plus-values d'impôt après 5 ans (hors prélèvements sociaux de 17,2 %). Sur 20 ans, l'écart de frais entre deux courtiers peut représenter plusieurs milliers d'euros. Voici les principaux courtiers proposant un PEA.",
  font, 10, CW,
)) {
  text(line, M, y, 10, font, GREY)
  y -= 14
}

// ---------- Tableau ----------
y -= 12
const cols = [
  { label: 'Courtier', w: 95 },
  { label: 'Courtage / ordre', w: 95 },
  { label: 'Droits de garde', w: 90 },
  { label: 'Note', w: 40 },
  { label: 'Idéal pour', w: CW - 95 - 95 - 90 - 40 },
]
const xs = []
let cx = M
for (const c of cols) { xs.push(cx); cx += c.w }

const headH = 22
page.drawRectangle({ x: M, y: y - headH + 6, width: CW, height: headH, color: NAVY })
cols.forEach((c, i) => text(c.label, xs[i] + 6, y - 9, 9.5, bold, WHITE))
y -= headH

peaBrokers.forEach((b, idx) => {
  const idealLines = wrap(b.bestFor, font, 9, cols[4].w - 12)
  const rowH = Math.max(26, 12 + idealLines.length * 11)
  if (idx % 2 === 0) {
    page.drawRectangle({ x: M, y: y - rowH + 6, width: CW, height: rowH, color: LIGHT })
  }
  const ty = y - 8
  text(b.name, xs[0] + 6, ty, 10, bold, NAVY)
  text(orderLabel(b), xs[1] + 6, ty, 10, font, NAVY)
  text(b.custodyPct ? `${b.custodyPct} %/an` : '0 €', xs[2] + 6, ty, 10, font, NAVY)
  text(`${b.rating.toFixed(1)}`, xs[3] + 6, ty, 10, bold, GREEN)
  idealLines.forEach((l, i) => text(l, xs[4] + 6, ty - i * 11, 9, font, GREY))
  y -= rowH
})

// ---------- Comment choisir ----------
y -= 24
text('Les 3 critères qui comptent', M, y, 13, bold, NAVY)
y -= 18
const tips = [
  ['Les frais de courtage', 'Le coût de chaque ordre. Décisif si vous investissez par petits montants réguliers (DCA).'],
  ['Les droits de garde', "Des frais annuels sur la valeur détenue. Privilégiez 0 € : c'est le standard aujourd'hui."],
  ['Les ETF éligibles PEA', "Pour investir « Monde » dans un PEA, vérifiez la présence d'ETF éligibles (ex. MSCI World PEA)."],
]
for (const [t, d] of tips) {
  text('•', M, y, 10, bold, GREEN)
  text(t, M + 14, y, 10, bold, NAVY)
  y -= 13
  for (const line of wrap(d, font, 9.5, CW - 14)) {
    text(line, M + 14, y, 9.5, font, GREY)
    y -= 12
  }
  y -= 6
}

// ---------- Pied de page ----------
const discLines = wrap(
  `Frais indicatifs à jour de ${FEES_AS_OF}, simplifiés à des fins pédagogiques : ils dépendent du montant des ordres, de l'offre et des promotions. À vérifier sur le site du courtier avant d'ouvrir. Document à but éducatif, ne constitue pas un conseil en investissement. Les performances passées ne préjugent pas des performances futures.`,
  font, 7.5, CW,
)
let fy = 78
page.drawLine({ start: { x: M, y: fy + 10 }, end: { x: W - M, y: fy + 10 }, thickness: 0.5, color: rgb(0.8, 0.84, 0.88) })
for (const line of discLines) {
  text(line, M, fy, 7.5, font, GREY)
  fy -= 10
}
text('simulateur-portefeuille.fr — Comparatif PEA 2026', M, fy - 4, 8, bold, NAVY)

const bytes = await doc.save()
await writeFile(path.join(ROOT, 'public/comparatif-pea-2026.pdf'), bytes)
console.log(`✓ PDF généré : public/comparatif-pea-2026.pdf (${peaBrokers.length} courtiers PEA, ${(bytes.length / 1024).toFixed(0)} Ko)`)
