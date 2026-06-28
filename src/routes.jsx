// ============================================================================
//  routes.jsx — table de routage (React Router + vite-react-ssg).
//  Chaque chemin statique est pré-rendu en HTML au build.
// ============================================================================

import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import SimulatorPage from './pages/SimulatorPage'
import BeginnerSimulatorPage from './pages/BeginnerSimulatorPage'
import ComparatorPage from './pages/ComparatorPage'
import RetirementPage from './pages/RetirementPage'
import MonteCarloPage from './pages/MonteCarloPage'
import GlossaryPage from './pages/GlossaryPage'
import GuidesIndex from './pages/GuidesIndex'
import GuideArticle from './pages/GuideArticle'
import PrivacyPolicy from './pages/PrivacyPolicy'
import NotFound from './pages/NotFound'
import { GUIDE_SLUGS } from './data/guides'

export const routes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'simulateur-debutant', element: <BeginnerSimulatorPage /> },
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
      { path: 'confidentialite', element: <PrivacyPolicy /> },
      // Page 404 pré-rendue (dist/404.html). Vercel la sert avec un statut HTTP
      // 404 réel pour toute URL inconnue (cf. vercel.json sans fallback SPA).
      { path: '404', element: <NotFound /> },
      // Catch-all client : affiche la même 404 (pas de redirection vers l'accueil).
      { path: '*', element: <NotFound /> },
    ],
  },
]
