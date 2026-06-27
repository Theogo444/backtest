// ============================================================================
//  AssetSearch.jsx — recherche, sélection et allocation des actifs
// ============================================================================

import { useState, useMemo } from 'react'
import { Search, Plus, X, Scale } from 'lucide-react'

// Pastilles d'éligibilité aux enveloppes fiscales (PEA / CTO / Assurance-vie)
function EnvelopeBadges({ envelopes, size = 'sm' }) {
  if (!envelopes) return null
  const items = [
    { key: 'pea', label: 'PEA', title: 'Éligible au PEA' },
    { key: 'cto', label: 'CTO', title: 'Éligible au compte-titres' },
    { key: 'av', label: 'AV', title: 'Disponible en assurance-vie' },
  ]
  const pad = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
  return (
    <span className="flex shrink-0 items-center gap-1">
      {items.map(({ key, label, title }) => {
        const ok = !!envelopes[key]
        return (
          <span
            key={key}
            title={ok ? title : `Non éligible (${label})`}
            className={`rounded font-bold ${pad} ${
              ok
                ? 'bg-gain/15 text-gain'
                : 'bg-navy-100 text-navy-300 line-through dark:bg-navy-800 dark:text-navy-600'
            }`}
          >
            {label}
          </span>
        )
      })}
    </span>
  )
}

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
          [a.name, a.ticker, a.description, a.sector, a.region, a.type]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(q))),
    )
  }, [query, allAssets, selectedIds])

  function addAsset(asset) {
    // Le nouvel actif reçoit une part « équitable » ; les actifs existants
    // conservent leurs proportions RELATIVES (mises à l'échelle pour laisser
    // la place), de sorte que la forme du portefeuille n'est pas écrasée.
    const n = selectedAssets.length
    if (n === 0) {
      onChange([{ id: asset.id, allocation: 100 }])
    } else {
      const share = Math.round(100 / (n + 1))
      const remaining = 100 - share
      const currentTotal = selectedAssets.reduce((sum, s) => sum + (Number(s.allocation) || 0), 0) || 1
      let acc = 0
      const scaled = selectedAssets.map((s) => {
        const val = Math.round(((Number(s.allocation) || 0) / currentTotal) * remaining)
        acc += val
        return { ...s, allocation: val }
      })
      // Le nouvel actif absorbe l'arrondi pour un total exact de 100 %
      onChange([...scaled, { id: asset.id, allocation: Math.max(0, 100 - acc) }])
    }
    setQuery('')
    setOpen(false)
  }

  function removeAsset(id) {
    // On retire l'actif SANS toucher aux pourcentages des autres
    // (ex. retirer D de 40/40/10/10 → 40/40/10, normalisé à la simulation).
    const remaining = selectedAssets.filter((s) => s.id !== id)
    onChange(remaining)
  }

  function setAllocation(id, rawValue) {
    const newVal = Math.min(100, Math.max(0, Number(rawValue)))
    const others = selectedAssets.filter((s) => s.id !== id)
    const remaining = 100 - newVal
    const othersTotal = others.reduce((sum, s) => sum + (Number(s.allocation) || 0), 0)

    let scaled
    if (others.length === 0) {
      onChange(selectedAssets.map((s) => (s.id === id ? { ...s, allocation: newVal } : s)))
      return
    }
    if (othersTotal === 0 || remaining <= 0) {
      const share = remaining > 0 ? Math.round(remaining / others.length) : 0
      let used = 0
      scaled = others.map((s, i) => {
        if (i === others.length - 1) return { ...s, allocation: Math.max(0, remaining - used) }
        used += share
        return { ...s, allocation: Math.max(0, share) }
      })
    } else {
      let used = 0
      scaled = others.map((s, i) => {
        if (i === others.length - 1) return { ...s, allocation: Math.max(0, remaining - used) }
        const v = Math.round(((Number(s.allocation) || 0) / othersTotal) * remaining)
        used += v
        return { ...s, allocation: v }
      })
    }
    onChange(
      selectedAssets.map((s) => {
        if (s.id === id) return { ...s, allocation: newVal }
        return scaled.find((o) => o.id === s.id) || s
      }),
    )
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

  // Met à l'échelle les allocations actuelles pour que leur somme fasse 100 %,
  // en conservant leurs proportions relatives.
  function normalizeTo100() {
    const n = selectedAssets.length
    if (n === 0) return
    const total = selectedAssets.reduce((sum, s) => sum + (Number(s.allocation) || 0), 0)
    if (total <= 0) return balanceEqually()
    let acc = 0
    const scaled = selectedAssets.map((s, i) => {
      if (i === n - 1) return { ...s, allocation: 100 - acc }
      const val = Math.round(((Number(s.allocation) || 0) / total) * 100)
      acc += val
      return { ...s, allocation: val }
    })
    onChange(scaled)
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
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition hover:bg-navy-50 dark:hover:bg-navy-700"
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-semibold" style={{ color: a.color }}>
                        {a.name}
                      </span>
                      <span className="shrink-0 text-xs text-navy-400">{a.ticker}</span>
                    </span>
                    <span className="text-[11px] text-navy-400">
                      {a.type}
                      {a.sector ? ` · ${a.sector}` : ''}
                      {a.region ? ` · ${a.region}` : ''}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <EnvelopeBadges envelopes={a.envelopes} />
                    <Plus size={15} className="text-navy-400" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}

      {/* Légende des enveloppes éligibles */}
      <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-navy-400">
        Enveloppes compatibles :
        <span className="rounded bg-gain/15 px-1.5 py-0.5 font-bold text-gain">PEA</span>
        <span className="rounded bg-gain/15 px-1.5 py-0.5 font-bold text-gain">CTO</span>
        <span className="rounded bg-gain/15 px-1.5 py-0.5 font-bold text-gain">AV</span>
        — une pastille <span className="font-semibold text-navy-400">barrée</span> = non éligible.
      </p>

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
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: asset.color }} />
                  <span className="truncate text-sm font-semibold">{asset.name}</span>
                  <span className="shrink-0 text-xs text-navy-400">{asset.ticker}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <EnvelopeBadges envelopes={asset.envelopes} />
                  <button
                    onClick={() => removeAsset(s.id)}
                    aria-label={`Retirer ${asset.name}`}
                    className="text-navy-400 transition hover:text-loss"
                  >
                    <X size={16} />
                  </button>
                </div>
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
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <button onClick={balanceEqually} className="font-semibold text-navy-600 hover:underline dark:text-navy-300">
                Répartir équitablement
              </button>
              {totalAlloc !== 100 && (
                <button onClick={normalizeTo100} className="font-semibold text-navy-600 hover:underline dark:text-navy-300">
                  Normaliser à 100 %
                </button>
              )}
            </div>
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
