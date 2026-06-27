import { Head } from 'vite-react-ssg'
import { useOutletContext } from 'react-router-dom'
import RetirementPlanner from '../components/retirement/RetirementPlanner'

export default function RetirementPage() {
  const shared = useOutletContext()
  return (
    <>
      <Head>
        <title>Objectif retraite — Quel effort d'épargne mensuel pour votre capital ?</title>
        <meta
          name="description"
          content="Calculez l'effort d'épargne mensuel nécessaire pour atteindre votre objectif de capital retraite. Trajectoire et scénarios pessimiste, neutre et optimiste."
        />
        <link rel="canonical" href="https://simulateur-portefeuille.fr/retraite" />
      </Head>
      <RetirementPlanner {...shared} />
    </>
  )
}
