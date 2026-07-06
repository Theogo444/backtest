import { useOutletContext } from 'react-router-dom'
import Seo from '../components/Seo'
import EnvelopeComparator from '../components/comparator/EnvelopeComparator'

export default function ComparatorPage() {
  const shared = useOutletContext()
  return (
    <>
      <Seo
        title="PEA, CTO ou assurance-vie ? Comparateur fiscal"
        description="Comparez l'impact fiscal du PEA, du compte-titres (CTO) et de l'assurance-vie sur vos gains. Trouvez l'enveloppe la plus avantageuse selon votre horizon."
        path="/comparateur"
      />
      <EnvelopeComparator {...shared} />
    </>
  )
}
