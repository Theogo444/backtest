// ============================================================================
//  update-quotes.mjs
//  Récupère les cours de clôture quotidiens réels et les accumule dans
//  public/data/quotes.json (schéma { updated, source, quotes: { id: [{date,close}] } }).
//
//  Deux sources, avec repli automatique :
//
//  1) MARKETSTACK (fiable) — si la variable MARKETSTACK_API_KEY est définie.
//     Endpoint EOD : TOUS les symboles en un seul appel (≈30 requêtes/mois, sous
//     le quota gratuit de 100/mois). Couvre les places internationales.
//     Clé gratuite : https://marketstack.com/signup
//
//  2) YAHOO FINANCE (repli sans clé) — si aucune clé n'est fournie.
//     L'endpoint « chart » rate-limite par IP (HTTP 429) dès qu'on enchaîne les
//     requêtes, et bannit facilement une IP. MAIS GitHub Actions tourne sur une
//     IP datacenter NEUVE à chaque run : avec cookie + crumb, throttle et
//     retries, le repli a une vraie chance d'aboutir là où une machine locale
//     (IP réutilisée/bannie) échoue. Best-effort, donc.
//
//  Comportement « fail-loud »
//  --------------------------
//  Si AUCUNE donnée exploitable n'est récupérée, le script sort en code non nul
//  → le job GitHub passe au ROUGE. Un run vert garantit donc que de vrais cours
//  ont été écrits (fini le « faux vert » qui masquait un fichier vide).
//
//  Lancement (CI) — bundlé par esbuild pour résoudre l'import ESM partagé :
//    npx esbuild scripts/update-quotes.mjs --bundle --platform=node \
//      --format=esm --outfile=scripts/.update-quotes.bundle.mjs
//    node scripts/.update-quotes.bundle.mjs
//
//  La liste des actifs provient de defaultAssets.js (source unique de vérité).
// ============================================================================

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DEFAULT_ASSETS } from '../src/data/defaultAssets.js'

const OUT = 'public/data/quotes.json'
const MAX_POINTS = 800 // ~3 ans de jours de bourse : borne la taille du fichier
const API_KEY = process.env.MARKETSTACK_API_KEY
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const round2 = (v) => Math.round(v * 100) / 100
const ymd = (d) => d.toISOString().slice(0, 10)

// ----------------------------------------------------------------------------
//  Correspondance actif → symbole Marketstack (format TICKER.MIC).
//
//  • Actions US : ticker simple (AAPL).
//  • Actions internationales : TICKER.MIC (MIC = code de la place).
//  • Indices & matière première : Marketstack gratuit ne couvre pas les indices,
//    on greffe un ETF US très liquide qui suit le même marché. La greffe de
//    useMarketData met le 1er cours réel à l'échelle du dernier point synthétique
//    (continuité) : seuls les MOUVEMENTS relatifs comptent, le niveau/devise du
//    proxy est sans incidence.
//  • Livret A : aucune cotation → ignoré.
//
//  ⚠️ Quelques MIC (XETRA, XMIL, XSWX, XKRX…) sont des choix par défaut : si le
//  premier run authentifié journalise un symbole « non trouvé », ajuster ici.
// ----------------------------------------------------------------------------
const YAHOO_SUFFIX_TO_MIC = {
  PA: 'XPAR', AS: 'XAMS', DE: 'XETRA', MC: 'XMAD', MI: 'XMIL',
  CO: 'XCSE', SW: 'XSWX', L: 'XLON', T: 'XTKS', HK: 'XHKG', KS: 'XKRX',
}
const SYMBOL_OVERRIDES = {
  sp500: 'SPY', nasdaq100: 'QQQ', cac40: 'EWQ', eurostoxx50: 'FEZ',
  topix: 'EWJ', gold: 'GLD', 'livret-a': null,
  // Symboles non couverts via leur place native sur le plan gratuit : on
  // utilise l'ADR / le ticker US équivalent (la greffe ne regarde que les
  // mouvements relatifs, mise à l'échelle par ancrage → devise sans incidence).
  inditex: 'IDEXY', // Madrid (ITX.XMAD) absent → ADR US
  toyota: 'TM', // Tokyo (7203.XTKS) absent → ADR NYSE
  berkshire: 'BRK-B', // BRK.B/BRKB absents → variante tiret
}

function yahooToMarketstack(yahoo) {
  if (!yahoo) return null
  if (yahoo.startsWith('^') || yahoo.includes('=')) return null
  const dot = yahoo.lastIndexOf('.')
  if (dot === -1) return yahoo
  const base = yahoo.slice(0, dot)
  const mic = YAHOO_SUFFIX_TO_MIC[yahoo.slice(dot + 1)]
  return mic ? `${base}.${mic}` : yahoo
}

// Table { assetId → symbole Marketstack } (hors actifs ignorés).
function buildMarketstackMap() {
  const map = {}
  for (const a of DEFAULT_ASSETS) {
    const sym = a.id in SYMBOL_OVERRIDES ? SYMBOL_OVERRIDES[a.id] : yahooToMarketstack(a.yahoo)
    if (sym) map[a.id] = sym
  }
  return map
}

function loadExisting() {
  try {
    const parsed = JSON.parse(readFileSync(OUT, 'utf8'))
    return parsed && typeof parsed === 'object' ? parsed : { quotes: {} }
  } catch {
    return { quotes: {} }
  }
}

// ----------------------------------------------------------------------------
//  Fusion : { assetId → [{date,close}…] } frais → quotes.json (dédoublonnage par
//  date, tri croissant, plafond MAX_POINTS). Renvoie { ok, changed }.
// ----------------------------------------------------------------------------
function mergeUpdates(quotes, updatesById) {
  let ok = 0
  let changed = false
  for (const [id, fresh] of Object.entries(updatesById)) {
    if (!fresh || fresh.length === 0) continue
    const arr = quotes[id] || []
    const index = new Map(arr.map((p, i) => [p.date, i]))
    for (const p of fresh) {
      if (index.has(p.date)) {
        const j = index.get(p.date)
        if (arr[j].close !== p.close) {
          arr[j] = p
          changed = true
        }
      } else {
        arr.push(p)
        index.set(p.date, arr.length - 1)
        changed = true
      }
    }
    arr.sort((x, y) => (x.date < y.date ? -1 : 1))
    quotes[id] = arr.slice(-MAX_POINTS)
    ok++
  }
  return { ok, changed }
}

// ============================================================================
//  Source 1 : Marketstack
// ============================================================================
async function fetchMarketstack() {
  const symbolMap = buildMarketstackMap()
  const symbolToId = new Map(Object.entries(symbolMap).map(([id, s]) => [s, id]))
  const symbols = Object.values(symbolMap)
  console.log(`[Marketstack] ${symbols.length} symboles…`)

  // Endpoint /eod/latest : dernière clôture connue par symbole. Couvre plus de
  // places que /eod sur plage de dates (gratuit), et le job quotidien accumule
  // un point par jour → la série se construit au fil du temps.
  const updatesById = {}
  const missing = new Set(symbolToId.keys())

  for (let i = 0; i < symbols.length; i += 50) {
    const batch = symbols.slice(i, i + 50)
    const params = new URLSearchParams({
      access_key: API_KEY,
      symbols: batch.join(','),
      limit: '1000',
    })
    const res = await fetch(`https://api.marketstack.com/v1/eod/latest?${params}`)
    const json = await res.json().catch(() => null)
    if (!res.ok || !json || json.error) {
      throw new Error(json?.error?.message || json?.error?.code || `HTTP ${res.status}`)
    }
    for (const r of json.data || []) {
      if (!r?.symbol || !r.date || r.close == null) continue
      const id = symbolToId.get(r.symbol)
      if (!id) continue
      missing.delete(r.symbol)
      ;(updatesById[id] ||= []).push({ date: String(r.date).slice(0, 10), close: round2(r.close) })
    }
  }
  if (missing.size) console.warn(`[Marketstack] ⚠️ sans donnée : ${[...missing].join(', ')}`)
  return updatesById
}

// ============================================================================
//  Source 2 : Yahoo Finance (repli sans clé) — cookie + crumb + throttle
// ============================================================================
async function yahooCookieCrumb() {
  try {
    const r1 = await fetch('https://fc.yahoo.com/', { headers: { 'User-Agent': UA } })
    const cookie = (r1.headers.get('set-cookie') || '').split(';')[0] || ''
    const r2 = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': UA, Cookie: cookie },
    })
    const crumb = (await r2.text()).trim()
    if (crumb && !/too many|<|error/i.test(crumb)) return { cookie, crumb }
  } catch {
    /* on continue sans cookie/crumb */
  }
  return { cookie: '', crumb: '' }
}

async function yahooDaily(symbol, cookie) {
  const hosts = ['query1.finance.yahoo.com', 'query2.finance.yahoo.com']
  const backoffs = [0, 1500, 4000]
  for (let attempt = 0; attempt < backoffs.length; attempt++) {
    if (backoffs[attempt]) await sleep(backoffs[attempt])
    for (const host of hosts) {
      try {
        const url = `https://${host}/v8/finance/chart/${encodeURIComponent(symbol)}?range=10d&interval=1d`
        const res = await fetch(url, {
          headers: { 'User-Agent': UA, Accept: 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
        })
        if (res.status === 429) continue
        if (!res.ok) continue
        const json = await res.json()
        const r = json?.chart?.result?.[0]
        const ts = r?.timestamp || []
        const closes = r?.indicators?.quote?.[0]?.close || []
        const pts = []
        for (let i = 0; i < ts.length; i++) {
          if (closes[i] == null) continue
          pts.push({ date: ymd(new Date(ts[i] * 1000)), close: round2(closes[i]) })
        }
        if (pts.length) return pts
      } catch {
        /* hôte suivant */
      }
    }
  }
  return null
}

async function fetchYahoo() {
  const assets = DEFAULT_ASSETS.filter((a) => a.yahoo)
  console.log(`[Yahoo] repli sans clé — ${assets.length} actifs (throttle 1,2 s)…`)
  const { cookie } = await yahooCookieCrumb()
  const updatesById = {}
  let ok = 0
  let fail = 0
  for (const a of assets) {
    const pts = await yahooDaily(a.yahoo, cookie)
    if (pts) {
      updatesById[a.id] = pts
      ok++
    } else {
      fail++
    }
    await sleep(1200)
  }
  console.log(`[Yahoo] ${ok} OK / ${fail} échecs`)
  return updatesById
}

// ============================================================================
async function main() {
  const existing = loadExisting()
  const quotes = existing.quotes || {}

  let updatesById
  let source
  if (API_KEY) {
    source = 'marketstack'
    updatesById = await fetchMarketstack()
  } else {
    console.warn(
      'MARKETSTACK_API_KEY absente → repli Yahoo (best-effort).\n' +
        'Pour une mise à jour fiable, créez une clé gratuite https://marketstack.com/signup\n' +
        'puis ajoutez le secret GitHub MARKETSTACK_API_KEY.',
    )
    source = 'yahoo'
    updatesById = await fetchYahoo()
  }

  const got = Object.values(updatesById).reduce((n, a) => n + (a?.length || 0), 0)
  if (got === 0) {
    console.error(`Aucune donnée récupérée via ${source}. Échec (fail-loud).`)
    process.exit(1)
  }

  const { ok, changed } = mergeUpdates(quotes, updatesById)
  if (!changed) {
    console.log(`Aucune nouvelle clôture (${ok} actifs déjà à jour). Fichier inchangé.`)
    return
  }

  const payload = { updated: new Date().toISOString(), source, quotes }
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(payload))
  console.log(`✓ ${ok} actifs mis à jour via ${source} → ${OUT}`)
}

main().catch((e) => {
  console.error('Échec global :', e.message)
  process.exit(1)
})
