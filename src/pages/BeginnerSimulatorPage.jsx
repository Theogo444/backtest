import { Head } from 'vite-react-ssg'
import { useOutletContext } from 'react-router-dom'
import BeginnerSimulator from '../components/simulator/BeginnerSimulator'

export default function BeginnerSimulatorPage() {
  const { marketData } = useOutletContext()
  return (
    <>
      <Head>
        <title>Simulateur d'investissement débutant — courtier, PEA, ETF | Gratuit</title>
        <meta
          name="description"
          content="Simulateur d'investissement pour débutants : choisissez votre courtier, votre enveloppe (PEA, CTO, AV), vos ETF et votre plan. Voyez en un clic ce que votre épargne aurait rapporté."
        />
        <link rel="canonical" href="https://simulateur-portefeuille.fr/simulateur-debutant" />
      </Head>
      <BeginnerSimulator marketData={marketData} />
    </>
  )
}
