import './index.css'
import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'

// ViteReactSSG : pré-rend chaque route au build, s'hydrate côté client.
export const createRoot = ViteReactSSG({ routes })
