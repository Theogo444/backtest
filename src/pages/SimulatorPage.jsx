import { Head } from 'vite-react-ssg'
import { useOutletContext } from 'react-router-dom'
import Simulator from '../components/simulator/Simulator'

export default function SimulatorPage() {
  const shared = useOutletContext()
  return (
    <>
      <Head>
        <title>Simulateur de portefeuille — Backtest DCA, Lump Sum, Value Averaging</title>
        <meta
          name="description"
          content="Backtestez gratuitement vos stratégies d'investissement (DCA, Value Averaging, Lump Sum, rééquilibrage…) sur ETF et actions. CAGR, Sharpe, max drawdown."
        />
        <link rel="canonical" href="https://simulateur-portefeuille.fr/simulateur" />
      </Head>
      <Simulator {...shared} />
    </>
  )
}
