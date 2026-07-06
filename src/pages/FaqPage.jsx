import Seo from '../components/Seo'
import Faq from '../components/faq/Faq'

export default function FaqPage() {
  return (
    <>
      <Seo
        title="FAQ — investir, PEA, bourse : questions fréquentes"
        description="Toutes les réponses pour bien investir : débuter en bourse, choisir entre PEA, compte-titres et assurance-vie, frais des courtiers, DCA, ETF, fiscalité et préparation de la retraite."
        path="/faq"
      />
      <Faq />
    </>
  )
}
