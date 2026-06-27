// ============================================================================
//  update-quotes.mjs
//  Récupère les cours de clôture quotidiens réels (Yahoo Finance) pour chaque
//  actif et les accumule dans public/data/quotes.json.
//
//  Exécuté chaque jour par .github/workflows/update-quotes.yml (côté serveur :
//  aucun problème de CORS). Le fichier est ensuite committé et Vercel redéploie.
//
//  Lancement (CI) — bundlé par esbuild pour résoudre l'import ESM partagé :
//    npx esbuild scripts/update-quotes.mjs --bundle --platform=node \
//      --format=esm --outfile=scripts/.update-quotes.bundle.mjs
//    node scripts/.update-quotes.bundle.mjs
//
//  La liste des actifs et leurs tickers Yahoo proviennent de defaultAssets.js
//  (source unique de vérité — pas de duplication des symboles).
// ============================================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DEFAULT_ASSETS } from '../src/data/defaultAssets.js'

const OUT = 'public/data/quotes.json'
const MAX_POINTS = 800 // ~3 ans de jours de bourse : borne la taille du fichier
const THROTTLE_MS = 500 // délai entre deux actifs (évite le rate-limit Yahoo)
const HOSTS = ['query1.finance.yahoo.com', 'query2.finance.yahoo.com']
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Requête brute avec repli sur l'hôte alternatif.
async function chartRequest(symbol) {
  let lastErr
  for (const host of HOSTS) {
    try {
      const url = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?range=7d&interval=1d`
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } })
      if (res.status === 429) throw new Error('HTTP 429')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}

// Récupère les derniers jours de cotation, avec retries + backoff sur le 429.
async function fetchDaily(symbol) {
  let json
  const backoffs = [0, 1500, 4000] // 3 tentatives
  for (let attempt = 0; attempt < backoffs.length; attempt++) {
    if (backoffs[attempt]) await sleep(backoffs[attempt])
    try {
      json = await chartRequest(symbol)
      break
    } catch (e) {
      if (attempt === backoffs.length - 1) throw e
    }
  }
  const r = json?.chart?.result?.[0]
  const ts = r?.timestamp || []
  const closes = r?.indicators?.quote?.[0]?.close || []
  const pts = []
  for (let i = 0; i < ts.length; i++) {
    if (closes[i] == null) continue
    const d = new Date(ts[i] * 1000)
    const date = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(
      d.getUTCDate(),
    ).padStart(2, '0')}`
    pts.push({ date, close: Math.round(closes[i] * 100) / 100 })
  }
  return pts
}

function loadExisting() {
  try {
    const parsed = JSON.parse(readFileSync(OUT, 'utf8'))
    return parsed && typeof parsed === 'object' ? parsed : { quotes: {} }
  } catch {
    return { quotes: {} }
  }
}

async function main() {
  const existing = loadExisting()
  const quotes = existing.quotes || {}
  let ok = 0
  let fail = 0
  let changed = false

  for (const a of DEFAULT_ASSETS) {
    if (!a.yahoo) continue // Livret A & co : pas de cotation
    try {
      const pts = await fetchDaily(a.yahoo)
      if (!pts.length) {
        fail++
        continue
      }
      const arr = quotes[a.id] || []
      const index = new Map(arr.map((p, i) => [p.date, i]))
      for (const p of pts) {
        if (index.has(p.date)) {
          // Révision possible de la clôture du jour
          const i = index.get(p.date)
          if (arr[i].close !== p.close) {
            arr[i] = p
            changed = true
          }
        } else {
          arr.push(p)
          index.set(p.date, arr.length - 1)
          changed = true
        }
      }
      arr.sort((x, y) => (x.date < y.date ? -1 : 1))
      quotes[a.id] = arr.slice(-MAX_POINTS)
      ok++
    } catch (e) {
      fail++
      console.error(`✗ ${a.id} (${a.yahoo}) : ${e.message}`)
    }
    await sleep(THROTTLE_MS) // throttle pour ménager l'API et éviter le 429
  }

  if (!changed) {
    console.log(`Aucune nouvelle donnée (OK ${ok} / échecs ${fail}). Fichier inchangé.`)
    return
  }

  const payload = { updated: new Date().toISOString(), source: 'yahoo', quotes }
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(payload))
  console.log(`✓ ${ok} actifs mis à jour, ${fail} échecs → ${OUT}`)
}

main().catch((e) => {
  console.error('Échec global :', e)
  process.exit(1)
})
