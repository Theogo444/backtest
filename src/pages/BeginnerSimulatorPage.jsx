import { useOutletContext } from 'react-router-dom'
import Seo from '../components/Seo'
import BeginnerSimulator from '../components/simulator/BeginnerSimulator'

export default function BeginnerSimulatorPage() {
  const { marketData } = useOutletContext()
  return (
    <>
      <Seo
        title="Simulateur d'investissement débutant — combien investir chaque mois ?"
        description="Décrivez votre situation (foyer, revenus, charges, crédits, épargne) : nous calculons combien investir chaque mois en DCA, avec quelle enveloppe (PEA, CTO, AV) et quel portefeuille — puis simulons le résultat sur données réelles."
        path="/simulateur-debutant"
      />
      <BeginnerSimulator marketData={marketData} />
    </>
  )
}
