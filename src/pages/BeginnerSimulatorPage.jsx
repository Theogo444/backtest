import { useOutletContext } from 'react-router-dom'
import Seo from '../components/Seo'
import BeginnerSimulator from '../components/simulator/BeginnerSimulator'

export default function BeginnerSimulatorPage() {
  const { marketData } = useOutletContext()
  return (
    <>
      <Seo
        title="Simulateur d'investissement débutant — PEA, ETF"
        description="Simulateur d'investissement pour débutants : choisissez votre courtier, votre enveloppe (PEA, CTO, AV), vos ETF et votre plan. Voyez en un clic ce que votre épargne aurait rapporté."
        path="/simulateur-debutant"
      />
      <BeginnerSimulator marketData={marketData} />
    </>
  )
}
