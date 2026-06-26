// ============================================================================
//  AssetSearch.jsx — recherche, sélection et allocation des actifs
// ============================================================================

import { useState, useMemo } from 'react'
import { Search, Plus, X, Scale } from 'lucide-react'

export default function AssetSearch({ allAssets, selectedAssets, onChange, autoRebalance, onToggleRebalance }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const selectedIds = selectedAssets.map((s) => s.id)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allAssets.filter(
      (a) =>
        !selectedIds.includes(a.id) &&
        (q === '' ||
          a.name.toLowerCase().includes(q) ||
          a.ticker.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)),
    )
  }, [query, allAssets, selectedIds])

  function addAsset(asset) {
    // Réparti équitablement par défaut
    const n = selectedAssets.length + 1
    const equal = Math.round(100 / n)
    const next = [
      ...selectedAssets.map((s) => ({ ...s, allocation: equal })),
      { id: asset.id, allocation: 100 - equal * (n - 1) },
    ]
    onChange(next)
    setQuery('')
    setOpen(false)
  }

  function removeAsset(id) {
    const remaining = selectedAssets.filter((s) => s.id !== id)
    onChange(remaining)
  }

  function setAllocation(id, value) {
    onChange(selectedAssets.map((s) => (s.id === id ? { ...s, allocation: Number(value) } : s)))
  }

  function balanceEqually() {
    const n = selectedAssets.length
    if (n === 0) return
    const equal = Math.round(100 / n)
    onChange(
      selectedAssets.map((s, i) => ({
        ...s,
        allocation: i === n - 1 ? 100 - equal * (n - 1) : equal,
      })),
    )
  }

  const totalAlloc = selectedAssets.reduce((sum, s) => sum + (Number(s.allocation) || 0), 0)
  const getAsset = (id) => allAssets.find((a) => a.id === id)

  return (
    <div className="card">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-navy-700 dark:text-navy-200">
        <Search size={16} /> Actifs du portefeuille
      </h2>

      {/* Barre de recherche */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-lg border border-navy-200 bg-white px-3 py-2 focus-within:border-navy-500 dark:border-navy-700 dark:bg-navy-800">
          <Search size={16} className="text-navy-400" />
          <input
            type="text"
            value={query}
            placeholder="Rechercher (S&P 500, ETF, Or…)"
            className="w-full bg-transparent text-sm outline-none"
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
          />
        </div>

        {open && results.length > 0 && (
          <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-navy-200 bg-white shadow-lg dark:border-navy-700 dark:bg-navy-800">
            {results.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => addAsset(a)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition hover:bg-navy-50 dark:hover:bg-navy-700"
                >
                  <span>
                    <span className="font-semibold" style={{ color: a.color }}>
                      {a.name}
                    </span>
                    <span className="ml-2 text-xs text-navy-400">{a.ticker} · {a.type}</span>
                  </span>
                  <Plus size={15} className="text-navy-400" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}

      {/* Liste des actifs sélectionnés avec allocation */}
      <div className="mt-4 space-y-2">
        {selectedAssets.length === 0 && (
          <p className="text-sm text-navy-400">Aucun actif sélectionné. Recherchez-en un ci-dessus.</p>
        )}
        {selectedAssets.map((s) => {
          const asset = getAsset(s.id)
          if (!asset) return null
          return (
            <div key={s.id} className="rounded-lg border border-navy-100 p-3 dark:border-navy-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: asset.color }} />
                  <span className="text-sm font-semibold">{asset.name}</span>
                  <span className="text-xs text-navy-400">{asset.ticker}</span>
                </div>
                <button
                  onClick={() => removeAsset(s.id)}
                  aria-label={`Retirer ${asset.name}`}
                  className="text-navy-400 transition hover:text-loss"
                >
                  <X size={16} />
                </button>
              </div>
              {selectedAssets.length > 1 && (
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={s.allocation}
                    onChange={(e) => setAllocation(s.id, e.target.value)}
                    className="h-1.5 flex-1 cursor-pointer accent-navy-700"
                  />
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={s.allocation}
                      onChange={(e) => setAllocation(s.id, e.target.value)}
                      className="w-14 rounded border border-navy-200 px-1.5 py-0.5 text-right text-sm dark:border-navy-700 dark:bg-navy-800"
                    />
                    <span className="text-xs text-navy-400">%</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Total d'allocation + actions multi-actifs */}
      {selectedAssets.length > 1 && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <button onClick={balanceEqually} className="font-semibold text-navy-600 hover:underline dark:text-navy-300">
              Répartir équitablement
            </button>
            <span className={totalAlloc === 100 ? 'text-gain' : 'text-loss font-semibold'}>
              Total : {totalAlloc}%{totalAlloc !== 100 ? ' (sera normalisé à 100 %)' : ''}
            </span>
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-navy-50 px-3 py-2 text-sm dark:bg-navy-800">
            <input
              type="checkbox"
              checked={autoRebalance}
              onChange={(e) => onToggleRebalance(e.target.checked)}
              className="h-4 w-4 accent-navy-700"
            />
            <Scale size={15} className="text-navy-500" />
            <span>Rééquilibrage automatique annuel</span>
          </label>
        </div>
      )}
    </div>
  )
}
