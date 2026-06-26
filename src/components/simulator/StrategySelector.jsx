// ============================================================================
//  StrategySelector.jsx — choix de la stratégie d'investissement
// ============================================================================

import { Target } from 'lucide-react'
import { STRATEGIES, getStrategy } from '../../utils/strategies'

export default function StrategySelector({ strategy, onChange }) {
  const current = getStrategy(strategy)

  return (
    <div className="card">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-navy-700 dark:text-navy-200">
        <Target size={16} /> Stratégie d'investissement
      </h2>

      <select value={strategy} onChange={(e) => onChange(e.target.value)} className="field">
        {STRATEGIES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name} — {s.short}
          </option>
        ))}
      </select>

      <p className="mt-2 rounded-lg bg-navy-50 px-3 py-2 text-xs leading-relaxed text-navy-600 dark:bg-navy-800 dark:text-navy-300">
        {current.description}
      </p>
    </div>
  )
}
