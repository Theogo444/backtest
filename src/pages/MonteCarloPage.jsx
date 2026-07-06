import { useOutletContext } from 'react-router-dom'
import Seo from '../components/Seo'
import MonteCarloSimulator from '../components/montecarlo/MonteCarloSimulator'

export default function MonteCarloPage() {
  const shared = useOutletContext()
  return (
    <>
      <Seo
        title="Simulation Monte Carlo — probabilité d'atteindre votre objectif"
        description="Simulez des milliers de trajectoires de marché pour estimer la probabilité d'atteindre votre objectif d'investissement. Éventail de percentiles et scénarios."
        path="/monte-carlo"
      />
      <MonteCarloSimulator {...shared} />
    </>
  )
}
