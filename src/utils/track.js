// ============================================================================
//  track.js — tracking d'événements léger et agnostique du provider.
//
//  No-op tant qu'aucun outil d'analytics n'est branché. Le jour où vous ajoutez
//  Google Tag Manager / GA4 (window.dataLayer ou gtag), Plausible
//  (window.plausible) ou PostHog (window.posthog), ces appels commencent à
//  remonter automatiquement — aucune modification à faire ici.
//
//  Événements émis par la capture email / le partage :
//    - 'email_submit'  { source, leadMagnet, status }
//    - 'share_copy'    { tool }
//    - 'share_native'  { tool }
//    - 'share_png'     { tool }
// ============================================================================

export function track(event, props = {}) {
  if (typeof window === 'undefined') return
  try {
    // Google Tag Manager / GA4
    if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event, ...props })
    if (typeof window.gtag === 'function') window.gtag('event', event, props)
    // Plausible
    if (typeof window.plausible === 'function') window.plausible(event, { props })
    // PostHog
    if (window.posthog && typeof window.posthog.capture === 'function') {
      window.posthog.capture(event, props)
    }
    if (import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[track]', event, props)
    }
  } catch {
    /* l'analytics ne doit jamais casser l'expérience utilisateur */
  }
}
