// ============================================================================
//  useMarketData.js
//  Fournit les données de marché. Tente un appel à Yahoo Finance puis, en cas
//  d'échec (CORS, hors-ligne, indisponibilité), bascule sur le jeu de données
//  de secours généré localement (defaultAssets.js).
// ============================================================================

import { useEffect, useState } from 'react'
import { DEFAULT_ASSETS } from '../data/defaultAssets'

// ----------------------------------------------------------------------------
//  Appel REST public à Yahoo Finance (peut échouer côté navigateur à cause du
//  CORS — on prévoit donc systématiquement un repli sur les données locales).
// ----------------------------------------------------------------------------
export async function fetchYahooHistory(symbol, { range = '20y', interval = '1mo' } = {}) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol,
  )}?range=${range}&interval=${interval}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Yahoo Finance : statut ${res.status}`)
  const json = await res.json()
  const result = json?.chart?.result?.[0]
  if (!result) throw new Error('Réponse Yahoo Finance invalide')
  const timestamps = result.timestamp || []
  const closes = result.indicators?.quote?.[0]?.close || []
  const series = timestamps
    .map((t, i) => {
      const d = new Date(t * 1000)
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
      return { date, close: closes[i] }
    })
    .filter((p) => p.close != null)
  return series
}

// ----------------------------------------------------------------------------
//  Hook principal : renvoie les actifs disponibles + état de chargement.
//  Par défaut, on utilise les données locales (fiables et hors-ligne) tout en
//  simulant un court chargement pour afficher les skeleton loaders.
// ----------------------------------------------------------------------------
export function useMarketData() {
  const [assets, setAssets] = useState(DEFAULT_ASSETS)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('demo') // 'live' | 'demo'
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    // Court délai pour matérialiser le chargement (UX : skeleton loaders)
    const timer = setTimeout(() => {
      if (!cancelled) setLoading(false)
    }, 350)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  // Tentative facultative de récupération des données réelles (désactivée par
  // défaut : CORS). Exposée pour une future intégration backend / proxy.
  async function refreshFromYahoo() {
    setLoading(true)
    setError(null)
    try {
      const updated = await Promise.all(
        DEFAULT_ASSETS.map(async (a) => {
          if (!a.yahoo) return a
          try {
            const series = await fetchYahooHistory(a.yahoo)
            if (series.length > 12) return { ...a, series }
          } catch {
            /* repli silencieux sur les données locales */
          }
          return a
        }),
      )
      setAssets(updated)
      setSource('live')
    } catch (e) {
      setError(e.message)
      setSource('demo')
    } finally {
      setLoading(false)
    }
  }

  return { assets, loading, source, error, refreshFromYahoo }
}
