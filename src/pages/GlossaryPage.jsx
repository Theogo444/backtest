import { Head } from 'vite-react-ssg'
import { useOutletContext } from 'react-router-dom'
import Glossary from '../components/glossary/Glossary'

export default function GlossaryPage() {
  const shared = useOutletContext()
  return (
    <>
      <Head>
        <title>Glossaire de l'investissement — PEA, DCA, CAGR, Sharpe, drawdown…</title>
        <meta
          name="description"
          content="17 définitions claires des termes essentiels de l'investissement et de la bourse : PEA, CTO, DCA, CAGR, ratio de Sharpe, max drawdown, volatilité…"
        />
        <link rel="canonical" href="https://simulateur-portefeuille.fr/glossaire" />
      </Head>
      <Glossary {...shared} />
    </>
  )
}
