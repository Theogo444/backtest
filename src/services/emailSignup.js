// ============================================================================
//  emailSignup.js — service d'inscription email (lead magnet / conseils).
//
//  ⚠️ IMPLÉMENTATION MOCK pour l'instant : aucun email n'est réellement envoyé
//  à un provider. Les inscriptions sont stockées en localStorage (visibilité
//  locale + dédoublonnage), ce qui permet de tester tout le parcours UI.
//
//  ── BRANCHER UN VRAI PROVIDER EN PROD ───────────────────────────────────────
//  Le site est statique (Vercel). Ne JAMAIS mettre la clé API du provider côté
//  client. Créez une Vercel Function `api/subscribe.js` qui appelle le provider
//  avec la clé secrète (variable d'environnement), puis remplacez le bloc MOCK
//  ci-dessous par :
//
//    const res = await fetch('/api/subscribe', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ email: clean, source, leadMagnet }),
//    })
//    if (!res.ok) return { ok: false, error: 'network' }
//    return { ok: true }
//
//  Exemples de providers compatibles (création/ajout d'un contact à une liste,
//  idéalement en double opt-in) : Brevo, ConvertKit, Beehiiv, MailerLite.
//  → Doc de chacun : endpoint "create contact" + "add to list" + "send DOI".
// ============================================================================

const STORAGE_KEY = 'leadCaptures'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email) {
  return EMAIL_RE.test(String(email || '').trim())
}

export async function subscribeEmail({ email, source = 'unknown', leadMagnet = '' }) {
  const clean = String(email || '').trim().toLowerCase()
  if (!isValidEmail(clean)) return { ok: false, error: 'invalid_email' }

  // --- MOCK : simule la latence réseau puis persiste localement -------------
  await new Promise((resolve) => setTimeout(resolve, 700))
  try {
    if (typeof localStorage !== 'undefined') {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      if (!list.some((entry) => entry.email === clean)) {
        list.push({ email: clean, source, leadMagnet, date: new Date().toISOString() })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      }
    }
  } catch {
    /* mode privé / quota dépassé : on ignore, l'UX reste un succès */
  }
  // TODO(prod) : remplacer ce bloc MOCK par l'appel /api/subscribe (cf. en-tête).
  return { ok: true }
}

// Pratique pour vérifier les inscriptions captées en local (console navigateur).
export function getLocalCaptures() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}
