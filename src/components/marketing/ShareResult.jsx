// ============================================================================
//  ShareResult.jsx — partage d'un résultat de simulation.
//
//  - Lien partageable (restaure les paramètres via l'URL) + bouton « Copier »
//  - Web Share API sur mobile quand disponible (fallback : copie)
//  - Export PNG d'une carte récap (optionnel, si `card` fourni)
//
//  Props :
//    - url        : URL absolue partageable
//    - card       : modèle pour la carte PNG (cf. shareCard.js), optionnel
//    - trackingId : identifiant d'événement ('simulateur_avance' / '..._debutant')
//    - title      : titre pour le partage natif
// ============================================================================

import { useState } from 'react'
import { Share2, Link2, Check, ImageDown, Loader2 } from 'lucide-react'
import { track } from '../../utils/track'
import { generateShareCardPng } from '../../utils/shareCard'

export default function ShareResult({ url, card, trackingId = 'simulateur', title = 'Mon backtest', className = '' }) {
  const [copied, setCopied] = useState(false)
  const [png, setPng] = useState('idle') // idle | loading
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  async function copyLink() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        // Fallback navigateurs anciens
        const ta = document.createElement('textarea')
        ta.value = url
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        ta.remove()
      }
      setCopied(true)
      track('share_copy', { tool: trackingId })
      setTimeout(() => setCopied(false), 2200)
    } catch {
      /* l'utilisateur peut copier manuellement depuis le champ */
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: 'Voici mon backtest d’investissement :', url })
      track('share_native', { tool: trackingId })
    } catch {
      /* partage annulé par l'utilisateur */
    }
  }

  async function downloadPng() {
    if (!card) return
    setPng('loading')
    try {
      const { blob } = await generateShareCardPng(card)
      const href = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = href
      a.download = `backtest-${trackingId}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(href)
      track('share_png', { tool: trackingId })
    } finally {
      setPng('idle')
    }
  }

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center gap-2">
        <Share2 size={16} className="text-navy-700 dark:text-navy-200" />
        <h3 className="text-sm font-bold text-navy-800 dark:text-white">Partager ce backtest</h3>
      </div>
      <p className="mt-1 text-xs text-navy-400">
        Le lien rouvre le simulateur avec exactement vos paramètres.
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-navy-200 bg-navy-50/60 px-3 py-2 dark:border-navy-700 dark:bg-navy-800/60">
          <Link2 size={15} className="shrink-0 text-navy-400" />
          <input
            type="text"
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            aria-label="Lien de partage"
            className="w-full truncate bg-transparent text-xs text-navy-600 outline-none dark:text-navy-300"
          />
        </div>
        <button type="button" onClick={copyLink} className="btn-primary shrink-0">
          {copied ? (<><Check size={16} /> Lien copié</>) : (<><Link2 size={16} /> Copier le lien</>)}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {canNativeShare && (
          <button type="button" onClick={nativeShare} className="btn-secondary">
            <Share2 size={15} /> Partager
          </button>
        )}
        {card && (
          <button type="button" onClick={downloadPng} disabled={png === 'loading'} className="btn-secondary">
            {png === 'loading' ? (<><Loader2 size={15} className="animate-spin" /> Génération…</>) : (<><ImageDown size={15} /> Télécharger l'image</>)}
          </button>
        )}
      </div>
    </div>
  )
}
