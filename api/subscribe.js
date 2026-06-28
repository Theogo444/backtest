// ============================================================================
//  api/subscribe.js — Vercel Function : inscription d'un email à Brevo.
//
//  La clé API reste CÔTÉ SERVEUR (variable d'env Vercel), jamais exposée au
//  client. Variables d'environnement attendues :
//    - BREVO_API_KEY   (obligatoire)  clé API Brevo (Settings → SMTP & API)
//    - BREVO_LIST_ID   (optionnel)    id de la liste cible (défaut : 2)
//
//  Configurer sur Vercel : Project → Settings → Environment Variables
//  (Production + Preview), puis redéployer. En local `npm run dev` (Vite) ne
//  sert PAS cette route : tester via un déploiement (preview) Vercel.
// ============================================================================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return res.status(500).json({ ok: false, error: 'missing_api_key' })

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  const email = String(body?.email || '').trim().toLowerCase()
  const source = String(body?.source || '').slice(0, 80)
  const leadMagnet = String(body?.leadMagnet || '').slice(0, 120)

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'invalid_email' })
  }

  const listId = Number(process.env.BREVO_LIST_ID || 2)

  try {
    const r = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true, // un contact déjà présent est mis à jour (pas d'erreur)
        attributes: { SOURCE: source, LEAD_MAGNET: leadMagnet },
      }),
    })

    // 201 (créé) / 204 (mis à jour) = succès. Brevo peut renvoyer un corps vide.
    if (r.status === 201 || r.status === 204 || r.ok) {
      return res.status(200).json({ ok: true })
    }

    // Attributs personnalisés non définis dans le compte → on réessaie sans eux.
    if (r.status === 400) {
      const retry = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ email, listIds: [listId], updateEnabled: true }),
      })
      if (retry.status === 201 || retry.status === 204 || retry.ok) {
        return res.status(200).json({ ok: true })
      }
    }

    return res.status(502).json({ ok: false, error: 'provider_error' })
  } catch {
    return res.status(502).json({ ok: false, error: 'network' })
  }
}
