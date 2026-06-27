import { Head } from 'vite-react-ssg'
import { useOutletContext } from 'react-router-dom'
import EnvelopeComparator from '../components/comparator/EnvelopeComparator'

export default function ComparatorPage() {
  const shared = useOutletContext()
  return (
    <>
      <Head>
        <title>PEA, CTO ou Assurance-vie ? Comparateur d'enveloppes fiscales</title>
        <meta
          name="description"
          content="Comparez l'impact fiscal du PEA, du compte-titres (CTO) et de l'assurance-vie sur vos gains. Trouvez l'enveloppe la plus avantageuse selon votre horizon."
        />
        <link rel="canonical" href="https://simulateur-portefeuille.fr/comparateur" />
      </Head>
      <EnvelopeComparator {...shared} />
    </>
  )
}
