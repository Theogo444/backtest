import { Head } from 'vite-react-ssg'
import BrokerComparator from '../components/comparator/BrokerComparator'

export default function BrokerComparatorPage() {
  return (
    <>
      <Head>
        <title>Comparatif des courtiers 2026 : PEA, CTO et assurance-vie | Frais comparés</title>
        <meta
          name="description"
          content="Comparez les frais, droits de garde et enveloppes de 9 courtiers français (Bourse Direct, Trade Republic, Fortuneo, BoursoBank, Saxo…) pour choisir où ouvrir votre PEA, compte-titres ou assurance-vie en 2026."
        />
        <link rel="canonical" href="https://simulateur-portefeuille.fr/comparatif-courtiers" />
      </Head>
      <BrokerComparator />
    </>
  )
}
