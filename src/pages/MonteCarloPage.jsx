import { Head } from 'vite-react-ssg'
import { useOutletContext } from 'react-router-dom'
import MonteCarloSimulator from '../components/montecarlo/MonteCarloSimulator'

export default function MonteCarloPage() {
  const shared = useOutletContext()
  return (
    <>
      <Head>
        <title>Simulation Monte Carlo — Probabilité d'atteindre votre objectif</title>
        <meta
          name="description"
          content="Simulez des milliers de trajectoires de marché pour estimer la probabilité d'atteindre votre objectif d'investissement. Éventail de percentiles et scénarios."
        />
        <link rel="canonical" href="https://simulateur-portefeuille.fr/monte-carlo" />
      </Head>
      <MonteCarloSimulator {...shared} />
    </>
  )
}
