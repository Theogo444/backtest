// Police Inter auto-hébergée (@fontsource) : servie depuis notre domaine,
// aucune requête vers Google Fonts (RGPD + performance). Poids alignés sur
// la charte (400 texte → 800 titres/wordmark).
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'

import './index.css'
import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'

// ViteReactSSG : pré-rend chaque route au build, s'hydrate côté client.
export const createRoot = ViteReactSSG({ routes })
