import Seo from '../components/Seo'
import BrokerComparator from '../components/comparator/BrokerComparator'

export default function BrokerComparatorPage() {
  return (
    <>
      <Seo
        title="Comparatif courtiers 2026 — frais PEA, CTO, assurance-vie"
        description="Comparez les frais, droits de garde et enveloppes de 9 courtiers français (Bourse Direct, Trade Republic, Fortuneo, BoursoBank, Saxo…) pour choisir où ouvrir votre PEA, compte-titres ou assurance-vie en 2026."
        path="/comparatif-courtiers"
      />
      <BrokerComparator />
    </>
  )
}
