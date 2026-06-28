// ============================================================================
//  share.js — état partageable du simulateur encodé dans l'URL.
//
//  Objectifs : liens STABLES, LISIBLES, et RESTAURABLES. Les paramètres sont
//  encodés en query string explicite (pas de base64) pour rester lisibles et
//  servir plus tard de base à des landing pages de scénarios indexables.
//
//  Format des actifs : `id_allocation` séparés par des points, ex.
//    assets=msci-world_70.sp500_30
//  (le point et le souligné ne sont pas ré-encodés par URLSearchParams ; l'id
//   peut contenir des « _ », on découpe donc sur le DERNIER « _ ».)
// ============================================================================

const SITE = 'https://simulateur-portefeuille.fr'

function num(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function encodeAssets(selectedAssets) {
  return (selectedAssets || [])
    .filter((a) => a && a.id)
    .map((a) => `${a.id}_${a.allocation ?? 0}`)
    .join('.')
}

function parseAssets(raw) {
  if (!raw) return []
  return raw
    .split('.')
    .map((token) => {
      const i = token.lastIndexOf('_')
      if (i < 0) return null
      const id = token.slice(0, i)
      const allocation = num(token.slice(i + 1))
      return id && allocation != null ? { id, allocation } : null
    })
    .filter(Boolean)
}

// Construit l'URL absolue partageable (origine réelle côté client, domaine de
// prod au pré-rendu où `window` n'existe pas).
export function buildShareUrl(path, query) {
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE
  return query ? `${origin}${path}?${query}` : `${origin}${path}`
}

// ---------------------------------------------------------------------------
//  Simulateur AVANCÉ (config du moteur)
// ---------------------------------------------------------------------------
export function encodeAdvancedConfig(config) {
  const p = new URLSearchParams()
  if (config.strategy) p.set('strat', config.strategy)
  const assets = encodeAssets(config.selectedAssets)
  if (assets) p.set('assets', assets)
  if (config.period) p.set('period', config.period)
  const { initialAmount, dcaAmount, frequency } = config.params || {}
  if (initialAmount != null) p.set('init', String(initialAmount))
  if (dcaAmount != null) p.set('dca', String(dcaAmount))
  if (frequency) p.set('freq', frequency)
  if (config.fees) p.set('fees', `${config.fees.type === 'fixed' ? 'f' : 'p'}${config.fees.value}`)
  if (config.adjustInflation) p.set('infl', '1')
  if (config.autoRebalance) p.set('rebal', '1')
  if (config.benchmarkId && config.benchmarkId !== 'msci-world') p.set('bench', config.benchmarkId)
  return p.toString()
}

const ADVANCED_KEYS = ['strat', 'assets', 'period', 'init', 'dca', 'freq', 'fees', 'infl', 'rebal', 'bench']

// Renvoie un patch partiel de config (ou null si l'URL ne contient rien).
// NB : `params` est partiel → fusionner avec les params existants côté appelant.
export function decodeAdvancedConfig(searchParams) {
  if (!ADVANCED_KEYS.some((k) => searchParams.has(k))) return null
  const patch = {}
  const params = {}
  if (searchParams.has('strat')) patch.strategy = searchParams.get('strat')
  if (searchParams.has('assets')) {
    const assets = parseAssets(searchParams.get('assets'))
    if (assets.length) patch.selectedAssets = assets
  }
  if (searchParams.has('period')) patch.period = searchParams.get('period')
  if (searchParams.has('init')) { const v = num(searchParams.get('init')); if (v != null) params.initialAmount = v }
  if (searchParams.has('dca')) { const v = num(searchParams.get('dca')); if (v != null) params.dcaAmount = v }
  if (searchParams.has('freq')) params.frequency = searchParams.get('freq')
  if (Object.keys(params).length) patch.params = params
  if (searchParams.has('fees')) {
    const raw = searchParams.get('fees')
    const value = num(raw.replace(/^[fp]/, ''))
    if (value != null) patch.fees = { type: raw.startsWith('f') ? 'fixed' : 'percent', value }
  }
  if (searchParams.get('infl') === '1') patch.adjustInflation = true
  if (searchParams.get('rebal') === '1') patch.autoRebalance = true
  if (searchParams.has('bench')) patch.benchmarkId = searchParams.get('bench')
  return patch
}

// Fusionne un patch décodé dans la config courante (params fusionnés en profondeur).
export function mergeConfigPatch(prev, patch) {
  if (!patch) return prev
  return { ...prev, ...patch, params: { ...prev.params, ...(patch.params || {}) } }
}

// ---------------------------------------------------------------------------
//  Simulateur DÉBUTANT (état local)
// ---------------------------------------------------------------------------
export function encodeBeginnerState(state) {
  const p = new URLSearchParams()
  if (state.brokerId) p.set('broker', state.brokerId)
  if (state.envelope) p.set('env', state.envelope)
  const assets = encodeAssets(state.selectedAssets)
  if (assets) p.set('assets', assets)
  if (state.planId) p.set('plan', state.planId)
  if (state.amount != null) p.set('amount', String(state.amount))
  if (state.period) p.set('period', state.period)
  if (state.autoRebalance) p.set('rebal', '1')
  return p.toString()
}

const BEGINNER_KEYS = ['broker', 'env', 'assets', 'plan', 'amount', 'period']

export function decodeBeginnerState(searchParams) {
  if (!BEGINNER_KEYS.some((k) => searchParams.has(k))) return null
  const out = {}
  if (searchParams.has('broker')) out.brokerId = searchParams.get('broker')
  if (searchParams.has('env')) out.envelope = searchParams.get('env')
  if (searchParams.has('assets')) {
    const assets = parseAssets(searchParams.get('assets'))
    if (assets.length) out.selectedAssets = assets
  }
  if (searchParams.has('plan')) out.planId = searchParams.get('plan')
  if (searchParams.has('amount')) { const v = num(searchParams.get('amount')); if (v != null) out.amount = v }
  if (searchParams.has('period')) out.period = searchParams.get('period')
  if (searchParams.get('rebal') === '1') out.autoRebalance = true
  return out
}
