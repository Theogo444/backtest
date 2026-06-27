// ============================================================================
//  routes.jsx — table de routage (React Router + vite-react-ssg).
//  Chaque chemin statique est pré-rendu en HTML au build.
// ============================================================================

import { Navigate } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import SimulatorPage from './pages/SimulatorPage'
import ComparatorPage from './pages/ComparatorPage'
import RetirementPage from './pages/RetirementPage'
import MonteCarloPage from './pages/MonteCarloPage'
import GlossaryPage from './pages/GlossaryPage'

export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'simulateur', element: <SimulatorPage /> },
      { path: 'comparateur', element: <ComparatorPage /> },
      { path: 'retraite', element: <RetirementPage /> },
      { path: 'monte-carlo', element: <MonteCarloPage /> },
      { path: 'glossaire', element: <GlossaryPage /> },
      // Toute URL inconnue renvoie vers l'accueil (côté client uniquement).
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]
