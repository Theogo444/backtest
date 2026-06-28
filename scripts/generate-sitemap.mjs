// ============================================================================
//  generate-sitemap.mjs — génère public/sitemap.xml au build.
//  Les pages statiques sont listées ici ; les guides sont découverts
//  automatiquement dans src/content/guides/*.js (slug + date réels).
//  Ajouter un guide = déposer un fichier : il apparaît dans le sitemap.
//  Lancé avant `vite-react-ssg build` (cf. package.json) puis copié dans dist/.
// ============================================================================

import { readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SITE = 'https://simulateur-portefeuille.fr'

// Pages statiques (mêmes chemins que les routes pré-rendues).
const STATIC_ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/simulateur-debutant', changefreq: 'weekly', priority: '0.9' },
  { path: '/simulateur', changefreq: 'weekly', priority: '0.9' },
  { path: '/comparateur', changefreq: 'monthly', priority: '0.8' },
  { path: '/retraite', changefreq: 'monthly', priority: '0.7' },
  { path: '/monte-carlo', changefreq: 'monthly', priority: '0.7' },
  { path: '/glossaire', changefreq: 'monthly', priority: '0.6' },
  { path: '/guides', changefreq: 'weekly', priority: '0.9' },
  { path: '/confidentialite', changefreq: 'yearly', priority: '0.2' },
]

// Découverte des guides : on importe chaque module pour lire slug + date réels.
const guidesDir = path.join(ROOT, 'src/content/guides')
const guideFiles = (await readdir(guidesDir)).filter((f) => f.endsWith('.js'))

const guides = []
for (const file of guideFiles) {
  const mod = await import(pathToFileURL(path.join(guidesDir, file)).href)
  const g = mod.default
  if (g?.slug) guides.push({ slug: g.slug, date: g.date })
}
guides.sort((a, b) => (a.date < b.date ? 1 : -1)) // plus récent d'abord

const urls = [
  ...STATIC_ROUTES,
  ...guides.map((g) => ({
    path: `/guides/${g.slug}`,
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: g.date,
  })),
]

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls
    .map((u) => {
      const lines = [
        `    <loc>${SITE}${u.path}</loc>`,
        u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : null,
        `    <changefreq>${u.changefreq}</changefreq>`,
        `    <priority>${u.priority}</priority>`,
      ].filter(Boolean)
      return `  <url>\n${lines.join('\n')}\n  </url>`
    })
    .join('\n') +
  '\n</urlset>\n'

await writeFile(path.join(ROOT, 'public/sitemap.xml'), xml, 'utf8')
console.log(`✓ sitemap.xml généré : ${urls.length} URLs (${guides.length} guides).`)
