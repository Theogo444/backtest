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
import GuidesIndex from './pages/GuidesIndex'
import GuideArticle from './pages/GuideArticle'
import { GUIDE_SLUGS } from './data/guides'

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
      { path: 'guides', element: <GuidesIndex /> },
      {
        path: 'guides/:slug',
        element: <GuideArticle />,
        // Pré-rend un HTML par article (un fichier dist/guides/<slug>.html).
        // getStaticPaths attend les chemins COMPLETS, pas seulement le slug.
        getStaticPaths: () => GUIDE_SLUGS.map((slug) => `/guides/${slug}`),
      },
      // Toute URL inconnue renvoie vers l'accueil (côté client uniquement).
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]
