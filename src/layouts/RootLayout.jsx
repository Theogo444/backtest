// ============================================================================
//  RootLayout.jsx — coquille de l'application (navigation, thème, état partagé).
//  Placé au-dessus des routes : l'état (config, données de marché, thème)
//  persiste pendant la navigation client. Transmis aux pages via Outlet context.
//  Écrit pour être sûr au pré-rendu (aucun accès à window au rendu initial).
// ============================================================================

import { useState, useEffect, useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { useMarketData } from '../hooks/useMarketData'

// Configuration par défaut du simulateur (partagée Simulateur / Monte Carlo / comparateur)
const DEFAULT_CONFIG = {
  selectedAssets: [{ id: 'msci-world', allocation: 100 }],
  strategy: 'dca',
  params: {
    initialAmount: 1000,
    dcaAmount: 200,
    frequency: 'monthly',
    targetGrowth: 500,
    maxPerPeriod: 2000,
    baseAmount: 200,
    multiplier: 2,
    threshold: 10,
    rebalanceFrequency: 'yearly',
    lookback: 6,
    rotationFrequency: 'quarterly',
    transactions: [],
  },
  period: '10y',
  customStart: '',
  customEnd: '',
  fees: { type: 'percent', value: 0.1 },
  feeAnnualMgmt: 0,
  reinvestDividends: true,
  adjustInflation: false,
  autoRebalance: false,
  benchmarkId: 'msci-world',
}

const LEGACY_HASHES = ['simulateur', 'comparateur', 'retraite', 'monte-carlo', 'glossaire']

export default function RootLayout() {
  const navigate = useNavigate()
  const marketData = useMarketData()
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  // Redirige les anciens liens à ancre (/#simulateur) vers les vraies URLs.
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (LEGACY_HASHES.includes(hash)) navigate(`/${hash}`, { replace: true })
  }, [navigate])

  const updateConfig = useCallback((patch) => {
    setConfig((prev) => ({ ...prev, ...patch }))
  }, [])

  // ---- Thème clair / sombre (init sûre au pré-rendu : 'light' par défaut) ----
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const initial =
      saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setTheme(initial)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  // Contexte transmis aux pages outils (signatures identiques à l'existant)
  const shared = { config, updateConfig, marketData }

  return (
    <div className="min-h-screen">
      {/* Lien d'évitement (a11y) : premier élément focusable, visible au clavier. */}
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-navy-800 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-card-hover"
      >
        Aller au contenu
      </a>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      <div className="md:pl-64">
        <main id="contenu" className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:px-8 md:pb-10">
          <div className="animate-fade-in">
            <Outlet context={shared} />
          </div>

          <Footer source={marketData.source} updatedAt={marketData.updatedAt} />
        </main>
      </div>
    </div>
  )
}
