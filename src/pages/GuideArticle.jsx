// ============================================================================
//  GuideArticle.jsx — page d'un article (/guides/:slug).
//  Le contenu Markdown est converti en HTML (marked) — baké au pré-rendu.
// ============================================================================

import { Head } from 'vite-react-ssg'
import { Link, useParams, Navigate } from 'react-router-dom'
import { marked } from 'marked'
import { Clock, ChevronRight, ArrowRight, ShieldCheck, LineChart } from 'lucide-react'
import EmailCapture from '../components/marketing/EmailCapture'
import { getGuide, GUIDES } from '../data/guides'
import { BROKERS } from '../data/affiliates'

marked.setOptions({ gfm: true, breaks: false })

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function GuideArticle() {
  const { slug } = useParams()
  const guide = getGuide(slug)

  // Slug inconnu : retour à la liste (côté client).
  if (!guide) return <Navigate to="/guides" replace />

  const html = marked.parse(guide.body)
  const broker = BROKERS.find((b) => b.envelope === 'PEA') || BROKERS[0]
  const related = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 2)
  const url = `https://simulateur-portefeuille.fr/guides/${guide.slug}`

  // Lead magnet contextualisé selon le sujet de l'article.
  const topic = `${guide.category} ${guide.title}`.toLowerCase()
  const leadMagnet = topic.includes('dca')
    ? 'les meilleures stratégies DCA 2026'
    : topic.includes('cto')
      ? 'le guide PEA vs CTO'
      : topic.includes('assurance')
        ? 'le guide Assurance-vie vs PEA'
        : 'le comparatif PEA 2026'

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.date,
    inLanguage: 'fr-FR',
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'Simulateur de Portefeuille FR' },
    publisher: { '@type': 'Organization', name: 'Simulateur de Portefeuille FR' },
  }

  return (
    <>
      <Head>
        <title>{`${guide.title} | Simulateur de Portefeuille FR`}</title>
        <meta name="description" content={guide.description} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={guide.title} />
        <meta property="og:description" content={guide.description} />
        <meta property="og:url" content={url} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Head>

      {/* Fil d'Ariane */}
      <nav className="flex items-center gap-1 text-xs text-navy-400" aria-label="Fil d'Ariane">
        <Link to="/" className="hover:text-navy-700 dark:hover:text-navy-200">Accueil</Link>
        <ChevronRight size={12} />
        <Link to="/guides" className="hover:text-navy-700 dark:hover:text-navy-200">Guides</Link>
        <ChevronRight size={12} />
        <span className="truncate text-navy-500">{guide.category}</span>
      </nav>

      <article className="mt-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-navy-100 px-2.5 py-0.5 text-[11px] font-bold text-navy-700 dark:bg-navy-800 dark:text-navy-200">
            {guide.category}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-navy-400">
            <Clock size={12} /> {guide.readingTime} min de lecture
          </span>
          <span className="text-[11px] text-navy-400">· {formatDate(guide.date)}</span>
        </div>

        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-navy-800 dark:text-white md:text-4xl">
          {guide.title}
        </h1>
        <p className="mt-3 text-base text-navy-500 dark:text-navy-300">{guide.excerpt}</p>

        {/* Corps de l'article (Markdown → HTML).
            Sûr : le contenu provient UNIQUEMENT des fichiers d'articles du dépôt
            (src/content/guides/*), rédigés par nous et convertis au build —
            aucune saisie utilisateur. Ne jamais injecter ici de contenu externe
            sans assainissement (DOMPurify) au préalable. */}
        <div
          className="article-body mt-6"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* CTA affiliation courtier */}
        <aside className="card mt-8 border-l-4 border-l-navy-800 bg-navy-50/60 dark:bg-navy-900/60">
          <div className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            Prêt à passer à l'action ?
          </div>
          <div className="mt-1 text-lg font-extrabold text-navy-800 dark:text-white">
            Ouvrez un {broker.envelope} chez {broker.name}
          </div>
          <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">{broker.highlight}.</p>
          <ul className="mt-2 space-y-1 text-sm text-navy-600 dark:text-navy-300">
            {broker.pros.slice(0, 3).map((p) => (
              <li key={p} className="flex items-start gap-1.5">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-500" /> {p}
              </li>
            ))}
          </ul>
          <a href={broker.url} rel="sponsored nofollow" className="btn-primary mt-3">
            Ouvrir un {broker.envelope} <ArrowRight size={16} />
          </a>
          <p className="mt-2 text-[11px] text-navy-400">
            Lien partenaire — sans surcoût pour vous. N'influence pas notre sélection.
          </p>
        </aside>

        {/* CTA outils */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/simulateur" className="btn-primary">
            <LineChart size={16} /> Tester sur le simulateur
          </Link>
          <Link to="/comparateur" className="btn-secondary">
            Comparer les enveloppes
          </Link>
        </div>

        {/* Capture email (lead magnet contextualisé) */}
        <EmailCapture
          className="mt-8"
          variant="band"
          source={`guide_${guide.slug}`}
          leadMagnet={leadMagnet}
          title={`Recevez ${leadMagnet}`}
          subtitle="Un email court et concret pour passer à l'action sans vous tromper."
        />

        {/* Articles liés */}
        {related.length > 0 && (
          <section className="mt-8 border-t border-navy-100 pt-6 dark:border-navy-800">
            <h2 className="text-lg font-extrabold text-navy-800 dark:text-white">À lire ensuite</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {related.map((g) => (
                <Link key={g.slug} to={`/guides/${g.slug}`} className="card group flex flex-col">
                  <span className="text-[11px] font-bold text-navy-400">{g.category}</span>
                  <span className="mt-1 font-bold text-navy-800 group-hover:text-navy-600 dark:text-white">
                    {g.title}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 group-hover:gap-2 dark:text-navy-200">
                    Lire <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  )
}
