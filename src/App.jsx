// ============================================================================
//  App.jsx — coquille de l'application (navigation, thème, état partagé)
// ============================================================================

import { useState, useEffect, useCallback } from 'react'
import Navbar, { NAV_ITEMS } from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AdSlot from './components/layout/AdSlot'
import { useMarketData } from './hooks/useMarketData'

import Simulator from './components/simulator/Simulator'
import EnvelopeComparator from './components/comparator/EnvelopeComparator'
import RetirementPlanner from './components/retirement/RetirementPlanner'
import MonteCarloSimulator from './components/montecarlo/MonteCarloSimulator'
import Glossary from './components/glossary/Glossary'

// Configuration par défaut du simulateur (partagée avec Monte Carlo & comparateur)
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

const VALID_VIEWS = NAV_ITEMS.map((n) => n.id)

export default function App() {
  const marketData = useMarketData()
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  // ---- Routing par ancre (#simulateur, #comparateur, …) ----
  const [view, setView] = useState(() => {
    const hash = window.location.hash.replace('#', '')
    return VALID_VIEWS.includes(hash) ? hash : 'simulateur'
  })

  const navigate = useCallback((id) => {
    setView(id)
    window.location.hash = id
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace('#', '')
      if (VALID_VIEWS.includes(hash)) setView(hash)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // ---- Thème clair / sombre ----
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  // ---- Mise à jour partielle de la config ----
  const updateConfig = useCallback((patch) => {
    setConfig((prev) => ({ ...prev, ...patch }))
  }, [])

  // ---- Rendu de la page active ----
  function renderView() {
    const shared = { config, updateConfig, marketData, navigate }
    switch (view) {
      case 'simulateur':
        return <Simulator {...shared} />
      case 'comparateur':
        return <EnvelopeComparator {...shared} />
      case 'retraite':
        return <RetirementPlanner {...shared} />
      case 'monte-carlo':
        return <MonteCarloSimulator {...shared} />
      case 'glossaire':
        return <Glossary {...shared} />
      default:
        return <Simulator {...shared} />
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar view={view} onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} />

      <div className="md:pl-64">
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-4 md:px-8 md:pb-10">
          {/* AdSense slot: TOP_LEADERBOARD */}
          <AdSlot format="leaderboard" position="TOP_LEADERBOARD" className="hidden md:flex" />
          <AdSlot format="mobileBanner" position="TOP_MOBILE_BANNER" className="md:hidden" />

          <div key={view} className="animate-fade-in">
            {renderView()}
          </div>

          <Footer onNavigate={navigate} source={marketData.source} updatedAt={marketData.updatedAt} />
        </main>
      </div>

      {/* AdSense slot: STICKY_FOOTER_MOBILE */}
      <div className="fixed bottom-12 left-0 right-0 z-20 flex justify-center md:hidden">
        <AdSlot format="mobileBanner" position="STICKY_FOOTER_MOBILE" className="!my-0 shadow-lg" />
      </div>
    </div>
  )
}
