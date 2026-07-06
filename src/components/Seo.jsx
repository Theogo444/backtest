// ============================================================================
//  Seo.jsx — balises SEO d'une page : title, description, canonical, Open
//  Graph et Twitter Card, injectées au pré-rendu via <Head> (vite-react-ssg).
//
//  Une seule source de vérité par page : les balises génériques (og:locale,
//  og:site_name, twitter:card, favicon…) restent dans index.html ; tout ce qui
//  varie par page passe ici. `children` accepte des balises additionnelles
//  (JSON-LD, robots…).
//
//  `title` est le titre SANS la marque : « | Sereo » est ajouté automatiquement.
// ============================================================================

import { Head } from 'vite-react-ssg'
import { SITE_URL as SITE, BRAND } from '../config/site'

const OG_IMAGE = `${SITE}/og-image.jpg`
const OG_IMAGE_ALT = 'Sereo — simulateur de portefeuille : PEA, CTO, assurance-vie'

export default function Seo({
  title,
  description,
  path,
  type = 'website',
  noindex = false,
  children,
}) {
  const fullTitle = title.includes(BRAND) ? title : `${title} | ${BRAND}`
  const url = path != null ? `${SITE}${path}` : null

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, follow" />}
      {url && !noindex && <link rel="canonical" href={url} />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={OG_IMAGE_ALT} />

      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />

      {children}
    </Head>
  )
}
