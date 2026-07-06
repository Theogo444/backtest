import { useOutletContext } from 'react-router-dom'
import Seo from '../components/Seo'
import Simulator from '../components/simulator/Simulator'

export default function SimulatorPage() {
  const shared = useOutletContext()
  return (
    <>
      <Seo
        title="Simulateur de portefeuille — backtest DCA, lump sum"
        description="Backtestez gratuitement vos stratégies d'investissement (DCA, Value Averaging, Lump Sum, rééquilibrage…) sur ETF et actions. CAGR, Sharpe, max drawdown."
        path="/simulateur"
      />
      <Simulator {...shared} />
    </>
  )
}
