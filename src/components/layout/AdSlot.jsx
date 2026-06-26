// ============================================================================
//  AdSlot.jsx — emplacements publicitaires réservés (Google AdSense)
//  Chaque emplacement est commenté pour faciliter l'intégration future du code
//  AdSense. Les dimensions correspondent aux formats standard.
// ============================================================================

const FORMATS = {
  leaderboard: { w: 728, h: 90, label: 'Bandeau 728×90' },
  mobileBanner: { w: 320, h: 50, label: 'Bandeau 320×50' },
  rectangle: { w: 300, h: 250, label: 'Rectangle 300×250' },
}

/**
 * @param {string} format - 'leaderboard' | 'mobileBanner' | 'rectangle'
 * @param {string} position - nom de l'emplacement (commentaire AdSense)
 */
export default function AdSlot({ format = 'leaderboard', position = 'GENERIC', className = '' }) {
  const f = FORMATS[format] || FORMATS.leaderboard

  return (
    <>
      {/* AdSense slot: {position} */}
      <div
        className={`ad-slot mx-auto my-3 ${className}`}
        style={{ width: '100%', maxWidth: f.w, height: f.h, minHeight: f.h }}
        data-ad-position={position}
        data-ad-format={format}
        aria-hidden="true"
      >
        {/* Remplacer par <ins class="adsbygoogle" ...></ins> lors de l'intégration */}
        <span className="select-none">Publicité · {f.label}</span>
      </div>
    </>
  )
}
