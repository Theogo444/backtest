import { Head } from 'vite-react-ssg'
import Faq from '../components/faq/Faq'

export default function FaqPage() {
  return (
    <>
      <Head>
        <title>FAQ — Questions fréquentes sur l'investissement, le PEA et la bourse</title>
        <meta
          name="description"
          content="Toutes les réponses pour bien investir : débuter en bourse, choisir entre PEA, compte-titres et assurance-vie, frais des courtiers, DCA, ETF, fiscalité et préparation de la retraite."
        />
        <link rel="canonical" href="https://simulateur-portefeuille.fr/faq" />
      </Head>
      <Faq />
    </>
  )
}
