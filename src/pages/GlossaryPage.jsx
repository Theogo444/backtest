import { useOutletContext } from 'react-router-dom'
import Seo from '../components/Seo'
import Glossary from '../components/glossary/Glossary'

export default function GlossaryPage() {
  const shared = useOutletContext()
  return (
    <>
      <Seo
        title="Glossaire de l'investissement — PEA, DCA, CAGR, Sharpe"
        description="17 définitions claires des termes essentiels de l'investissement et de la bourse : PEA, CTO, DCA, CAGR, ratio de Sharpe, max drawdown, volatilité…"
        path="/glossaire"
      />
      <Glossary {...shared} />
    </>
  )
}
