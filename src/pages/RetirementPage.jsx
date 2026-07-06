import { useOutletContext } from 'react-router-dom'
import Seo from '../components/Seo'
import RetirementPlanner from '../components/retirement/RetirementPlanner'

export default function RetirementPage() {
  const shared = useOutletContext()
  return (
    <>
      <Seo
        title="Objectif retraite — quel effort d'épargne mensuel ?"
        description="Calculez l'effort d'épargne mensuel nécessaire pour atteindre votre objectif de capital retraite. Trajectoire et scénarios pessimiste, neutre et optimiste."
        path="/retraite"
      />
      <RetirementPlanner {...shared} />
    </>
  )
}
