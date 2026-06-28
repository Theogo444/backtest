// ============================================================================
//  emailSignup.js — service d'inscription email (lead magnet / conseils).
//
//  Appelle la Vercel Function `api/subscribe.js`, qui ajoute le contact à Brevo
//  avec la clé API restée côté serveur. La config Brevo (clé, liste) se fait via
//  les variables d'env Vercel — voir l'en-tête de `api/subscribe.js`.
//
//  ⚠️ En local `npm run dev` (Vite) ne sert PAS /api : la capture ne fonctionne
//  réellement que sur un déploiement Vercel (preview ou prod).
// ============================================================================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email) {
  return EMAIL_RE.test(String(email || '').trim())
}

export async function subscribeEmail({ email, source = 'unknown', leadMagnet = '' }) {
  const clean = String(email || '').trim().toLowerCase()
  if (!isValidEmail(clean)) return { ok: false, error: 'invalid_email' }

  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: clean, source, leadMagnet }),
    })
    if (res.ok) return { ok: true }
    const data = await res.json().catch(() => ({}))
    return { ok: false, error: data.error || 'network' }
  } catch {
    return { ok: false, error: 'network' }
  }
}
