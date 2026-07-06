// ============================================================================
//  shareCard.js — génère une carte récapitulative PNG (1200×630, ratio social).
//
//  Dessinée directement au Canvas 2D : aucune dépendance externe. Choix motivé
//  par la robustesse — pas de capture DOM (html2canvas/html-to-image) qui pose
//  des soucis de polices, de couleurs Tailwind et de pré-rendu SSR.
//
//  Appelée uniquement à l'exécution d'un clic (côté navigateur).
//  Modèle attendu :
//    { eyebrow, headline, bigValue, bigLabel, stats:[{label,value}], footer }
// ============================================================================

const W = 1200
const H = 630
const PAD = 72
const FONT = 'Inter, system-ui, -apple-system, sans-serif'

function wrapText(ctx, text, maxWidth, maxLines) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+\S*$/, '')}…`
    return kept
  }
  return lines
}

export async function generateShareCardPng(model) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Fond dégradé marine
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, '#1e3a5f')
  grad.addColorStop(1, '#0a1830')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Liseré vert (accent gains)
  ctx.fillStyle = '#34d399'
  ctx.fillRect(0, 0, W, 8)

  ctx.textBaseline = 'alphabetic'

  // Marque
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = `600 26px ${FONT}`
  ctx.fillText('Sereo — simulateur-portefeuille.fr', PAD, 86)

  // Eyebrow
  if (model.eyebrow) {
    ctx.fillStyle = '#9fb8d6'
    ctx.font = `700 22px ${FONT}`
    ctx.fillText(String(model.eyebrow).toUpperCase(), PAD, 152)
  }

  // Titre / phrase de scénario (jusqu'à 3 lignes)
  ctx.fillStyle = '#ffffff'
  ctx.font = `800 44px ${FONT}`
  let y = 212
  for (const line of wrapText(ctx, model.headline, W - PAD * 2, 3)) {
    ctx.fillText(line, PAD, y)
    y += 56
  }

  // Valeur principale
  if (model.bigValue) {
    ctx.fillStyle = '#34d399'
    ctx.font = `800 96px ${FONT}`
    ctx.fillText(model.bigValue, PAD, 424)
    if (model.bigLabel) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = `600 24px ${FONT}`
      ctx.fillText(model.bigLabel, PAD, 460)
    }
  }

  // Statistiques secondaires
  if (model.stats && model.stats.length) {
    const colW = (W - PAD * 2) / model.stats.length
    model.stats.forEach((s, i) => {
      const x = PAD + i * colW
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.font = `600 20px ${FONT}`
      ctx.fillText(s.label, x, 544)
      ctx.fillStyle = '#ffffff'
      ctx.font = `800 34px ${FONT}`
      ctx.fillText(s.value, x, 584)
    })
  }

  // Pied de carte
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = `500 20px ${FONT}`
  ctx.fillText(model.footer || 'Performances passées — ne préjugent pas du futur', PAD, H - 34)

  const dataUrl = canvas.toDataURL('image/png')
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  return { dataUrl, blob, width: W, height: H }
}
