// ============================================================================
//  api/subscribe.js — Vercel Function : inscription Brevo + email de bienvenue.
//
//  1) Ajoute/met à jour le contact dans une liste Brevo.
//  2) Envoie un email transactionnel avec le « Comparatif PEA 2026 » (PDF) en
//     pièce jointe (via URL publique du fichier dans /public).
//
//  La clé API reste CÔTÉ SERVEUR. Variables d'environnement Vercel :
//    - BREVO_API_KEY   (obligatoire)  clé API Brevo
//    - BREVO_LIST_ID   (optionnel)    id liste cible (défaut : 2)
//    - SENDER_EMAIL    (optionnel)    expéditeur VÉRIFIÉ dans Brevo
//                                     (défaut : contact@simulateur-portefeuille.fr)
//    - SENDER_NAME     (optionnel)    nom expéditeur (défaut : Simulateur de Portefeuille FR)
//    - PDF_URL         (optionnel)    URL du PDF (défaut : domaine de prod)
//
//  ⚠️ L'expéditeur DOIT être un sender vérifié dans Brevo (Senders & IP), sinon
//  l'email est refusé. En local `npm run dev` (Vite) ne sert PAS cette route.
// ============================================================================

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SITE = 'https://simulateur-portefeuille.fr'
const BREVO = 'https://api.brevo.com/v3'

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
  if (!EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: 'invalid_email' })

  const listId = Number(process.env.BREVO_LIST_ID || 2)
  const headers = { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' }

  // 1) Ajout du contact ------------------------------------------------------
  const added = await addContact({ email, source, leadMagnet, listId, headers })
  if (!added) return res.status(502).json({ ok: false, error: 'provider_error' })

  // 2) Email de bienvenue avec le PDF (best-effort : n'échoue pas la requête) -
  await sendWelcomeEmail({ email, headers }).catch(() => {})

  return res.status(200).json({ ok: true })
}

async function addContact({ email, source, leadMagnet, listId, headers }) {
  const base = { email, listIds: [listId], updateEnabled: true }
  try {
    let r = await fetch(`${BREVO}/contacts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...base, attributes: { SOURCE: source, LEAD_MAGNET: leadMagnet } }),
    })
    if (r.status === 201 || r.status === 204 || r.ok) return true
    // Attributs non définis dans le compte → on réessaie sans eux.
    if (r.status === 400) {
      r = await fetch(`${BREVO}/contacts`, { method: 'POST', headers, body: JSON.stringify(base) })
      return r.status === 201 || r.status === 204 || r.ok
    }
    return false
  } catch {
    return false
  }
}

async function sendWelcomeEmail({ email, headers }) {
  const senderEmail = process.env.SENDER_EMAIL || 'contact@simulateur-portefeuille.fr'
  const senderName = process.env.SENDER_NAME || 'Simulateur de Portefeuille FR'
  const pdfUrl = process.env.PDF_URL || `${SITE}/comparatif-pea-2026.pdf`

  await fetch(`${BREVO}/smtp/email`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email }],
      subject: 'Votre comparatif PEA 2026 (PDF)',
      htmlContent: emailHtml(pdfUrl),
      attachment: [{ url: pdfUrl, name: 'comparatif-pea-2026.pdf' }],
    }),
  })
}

function emailHtml(pdfUrl) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#1e3a5f">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#1e3a5f;border-radius:12px 12px 0 0;padding:20px 24px;color:#fff">
      <div style="font-size:20px;font-weight:800">Votre comparatif PEA 2026</div>
      <div style="font-size:13px;color:#9fb8d6;margin-top:2px">simulateur-portefeuille.fr</div>
    </div>
    <div style="background:#fff;border-radius:0 0 12px 12px;padding:24px;font-size:15px;line-height:1.6">
      <p>Bonjour,</p>
      <p>Merci pour votre inscription ! Vous trouverez en pièce jointe votre <strong>comparatif PEA 2026</strong> : les frais réels des principaux courtiers et les 3 critères pour bien choisir.</p>
      <p style="text-align:center;margin:28px 0">
        <a href="${pdfUrl}" style="background:#1e3a5f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:700;display:inline-block">Télécharger le comparatif (PDF)</a>
      </p>
      <p>Pour aller plus loin, testez votre scénario sur notre simulateur gratuit :</p>
      <p><a href="${SITE}/simulateur-debutant" style="color:#1e3a5f;font-weight:700">Lancer une simulation →</a></p>
      <p style="color:#64748b;font-size:12px;margin-top:28px;border-top:1px solid #e2e8f0;padding-top:14px">
        Vous recevez cet email car vous avez demandé le comparatif PEA 2026 sur simulateur-portefeuille.fr.
        Document à but éducatif, ne constitue pas un conseil en investissement.
      </p>
    </div>
  </div></body></html>`
}
