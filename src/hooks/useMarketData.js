// ============================================================================
//  useMarketData.js
//  Fournit les données de marché au reste de l'application.
//
//  • Base : jeu de données synthétique long terme (2000 → 2026), defaultAssets.js
//  • Couche « live » : un fichier public/data/quotes.json, rafraîchi chaque jour
//    par une GitHub Action (cf. scripts/update-quotes.mjs + .github/workflows),
//    contient les cours de clôture quotidiens réels (Yahoo Finance).
//
//  Au chargement, on tente de récupérer quotes.json et de GREFFER les cours
//  réels récents sur la fin de l'historique synthétique. La greffe est faite en
//  RENDEMENT (mise à l'échelle) pour garantir la continuité de la courbe : pas
//  de saut de niveau entre la partie synthétique et la partie réelle.
//
//  Le moteur de simulation raisonne au pas MENSUEL et suppose que toutes les
//  séries partagent le même calendrier. La greffe respecte donc deux règles :
//    1. on met à jour le dernier point (mois en cours) avec le dernier cours réel ;
//    2. on ajoute un nouveau point par mois écoulé, pour TOUS les actifs (report
//       de la dernière valeur connue si un actif n'a pas de donnée réelle), afin
//       que toutes les séries conservent la même longueur.
// ============================================================================

import { useEffect, useState } from 'react'
import { DEFAULT_ASSETS } from '../data/defaultAssets'

const round2 = (v) => Math.round(v * 100) / 100
const monthKey = (d) => d.slice(0, 7) // 'YYYY-MM'

// ----------------------------------------------------------------------------
//  Greffe les cours réels (quotes.json) sur les séries synthétiques.
//  Retourne { assets, hasLive }.
// ----------------------------------------------------------------------------
export function mergeLiveQuotes(baseAssets, payload) {
  const quotes = payload?.quotes || {}
  if (!baseAssets.length) return { assets: baseAssets, hasLive: false }

  const lastSynthDate = baseAssets[0].series[baseAssets[0].series.length - 1].date
  const lastSynthMonth = monthKey(lastSynthDate)

  // Pour chaque actif : clôture réelle de FIN DE MOIS + valeur d'ANCRAGE (le
  // tout premier cours réel collecté), à partir du mois en cours.
  const perAsset = {}
  const liveMonths = new Set()
  baseAssets.forEach((a) => {
    const arr = quotes[a.id]
    if (!Array.isArray(arr) || arr.length === 0) return
    const daily = arr
      .filter((p) => p && p.close != null && monthKey(p.date) >= lastSynthMonth)
      .sort((x, y) => (x.date < y.date ? -1 : 1))
    if (daily.length === 0) return
    const byMonth = new Map()
    daily.forEach((p) => {
      // Tri croissant → le dernier jour du mois écrase : clôture de fin de mois
      byMonth.set(monthKey(p.date), p.close)
      liveMonths.add(monthKey(p.date))
    })
    perAsset[a.id] = { byMonth, anchor: daily[0].close }
  })

  const allLiveMonths = [...liveMonths].sort()
  if (allLiveMonths.length === 0) return { assets: baseAssets, hasLive: false }

  // Mois à AJOUTER au calendrier (strictement après l'historique synthétique).
  const appendMonths = allLiveMonths.filter((m) => m > lastSynthMonth)

  const assets = baseAssets.map((a) => {
    const series = a.series.slice()
    const L = series[series.length - 1].close
    const live = perAsset[a.id]
    const byMonth = live?.byMonth

    // Facteur de continuité : aligne le PREMIER cours réel collecté sur L, de
    // sorte que la greffe démarre sans saut et reflète ensuite les mouvements
    // réels (y compris au sein du mois en cours, jour après jour).
    const f = live && live.anchor > 0 ? L / live.anchor : 1

    // 1) Met à jour le dernier point (mois en cours) avec le réel s'il existe.
    if (byMonth && byMonth.has(lastSynthMonth)) {
      series[series.length - 1] = {
        date: lastSynthDate,
        close: round2(byMonth.get(lastSynthMonth) * f),
      }
    }

    // 2) Ajoute un point par mois écoulé (report si pas de donnée réelle).
    let prev = series[series.length - 1].close
    appendMonths.forEach((m) => {
      const v = byMonth && byMonth.has(m) ? round2(byMonth.get(m) * f) : prev
      prev = v
      series.push({ date: `${m}-01`, close: v })
    })

    return { ...a, series }
  })

  return { assets, hasLive: true }
}

// ----------------------------------------------------------------------------
//  Appel REST direct à Yahoo Finance (conservé pour usage manuel / debug ;
//  bloqué par le CORS côté navigateur, d'où la couche quotes.json côté serveur).
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
  return timestamps
    .map((t, i) => {
      const d = new Date(t * 1000)
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
      return { date, close: closes[i] }
    })
    .filter((p) => p.close != null)
}

// ----------------------------------------------------------------------------
//  Hook principal : renvoie les actifs (synthétiques + greffe live), l'état de
//  chargement, la source et la date de dernière actualisation.
// ----------------------------------------------------------------------------
export function useMarketData() {
  const [assets, setAssets] = useState(DEFAULT_ASSETS)
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState('demo') // 'live' | 'demo'
  const [updatedAt, setUpdatedAt] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const base = import.meta.env.BASE_URL || '/'
        const res = await fetch(`${base}data/quotes.json`, { cache: 'no-store' })
        if (res.ok) {
          const payload = await res.json()
          const { assets: merged, hasLive } = mergeLiveQuotes(DEFAULT_ASSETS, payload)
          if (!cancelled && hasLive) {
            setAssets(merged)
            setSource('live')
            setUpdatedAt(payload.updated || null)
          }
        }
      } catch {
        /* repli silencieux sur les données de démonstration */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    // Filet de sécurité : on arrête le skeleton même si le fetch traîne.
    const timer = setTimeout(() => {
      if (!cancelled) setLoading(false)
    }, 1500)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  // Rafraîchissement manuel direct depuis Yahoo (désactivé par défaut : CORS).
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
            /* repli silencieux */
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

  return { assets, loading, source, updatedAt, error, refreshFromYahoo }
}
