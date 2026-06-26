// ============================================================================
//  ParametersPanel.jsx — paramètres de la stratégie + paramètres globaux
// ============================================================================

import { Sliders, Calendar, Plus, Trash2, Info } from 'lucide-react'
import { PERIODS } from '../../hooks/useSimulation'
import Tooltip from '../ui/Tooltip'

// --- Petits champs réutilisables ---
function NumberField({ label, value, onChange, min, step = 1, suffix, tooltip }) {
  return (
    <div>
      <label className="label flex items-center gap-1">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(e.target.value)}
          className="field"
        />
        {suffix && <span className="text-xs text-navy-400">{suffix}</span>}
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options, tooltip }) {
  return (
    <div>
      <label className="label flex items-center gap-1">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function CheckboxField({ label, checked, onChange, tooltip }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-navy-50 px-3 py-2 text-sm dark:bg-navy-800">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-navy-700" />
      <span className="flex items-center gap-1">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </span>
    </label>
  )
}

export default function ParametersPanel({ config, updateConfig, allAssets }) {
  const { params, strategy } = config
  const updateParam = (patch) => updateConfig({ params: { ...params, ...patch } })

  return (
    <div className="card space-y-4">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-navy-700 dark:text-navy-200">
        <Sliders size={16} /> Paramètres
      </h2>

      {/* ---------- Période de backtest ---------- */}
      <div>
        <label className="label flex items-center gap-1">
          <Calendar size={13} /> Période
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => updateConfig({ period: p.id })}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                config.period === p.id
                  ? 'bg-navy-800 text-white'
                  : 'bg-navy-50 text-navy-600 hover:bg-navy-100 dark:bg-navy-800 dark:text-navy-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {config.period === 'custom' && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <label className="label">Début</label>
              <input
                type="date"
                value={config.customStart}
                onChange={(e) => updateConfig({ customStart: e.target.value })}
                className="field"
              />
            </div>
            <div>
              <label className="label">Fin</label>
              <input
                type="date"
                value={config.customEnd}
                onChange={(e) => updateConfig({ customEnd: e.target.value })}
                className="field"
              />
            </div>
          </div>
        )}
      </div>

      {/* ---------- Paramètres spécifiques à la stratégie ---------- */}
      <div className="grid grid-cols-2 gap-3">
        {strategy !== 'stock-picking' && (
          <NumberField
            label="Apport initial"
            value={params.initialAmount}
            onChange={(v) => updateParam({ initialAmount: v })}
            min={0}
            step={100}
            suffix="€"
            tooltip="Montant investi au tout début de la période."
          />
        )}

        {strategy === 'dca' && (
          <>
            <NumberField
              label="Montant / versement"
              value={params.dcaAmount}
              onChange={(v) => updateParam({ dcaAmount: v })}
              min={0}
              step={50}
              suffix="€"
            />
            <SelectField
              label="Fréquence"
              value={params.frequency}
              onChange={(v) => updateParam({ frequency: v })}
              options={[
                { value: 'weekly', label: 'Hebdomadaire' },
                { value: 'monthly', label: 'Mensuel' },
                { value: 'quarterly', label: 'Trimestriel' },
              ]}
            />
          </>
        )}

        {strategy === 'value-averaging' && (
          <>
            <NumberField
              label="Croissance cible / mois"
              value={params.targetGrowth}
              onChange={(v) => updateParam({ targetGrowth: v })}
              min={0}
              step={50}
              suffix="€"
              tooltip="La valeur cible du portefeuille augmente de ce montant chaque mois."
            />
            <NumberField
              label="Investissement max / mois"
              value={params.maxPerPeriod}
              onChange={(v) => updateParam({ maxPerPeriod: v })}
              min={0}
              step={100}
              suffix="€"
            />
          </>
        )}

        {strategy === 'dca-dynamic' && (
          <>
            <NumberField
              label="Mise de base"
              value={params.baseAmount}
              onChange={(v) => updateParam({ baseAmount: v })}
              min={0}
              step={50}
              suffix="€"
            />
            <NumberField
              label="Multiplicateur sur baisse"
              value={params.multiplier}
              onChange={(v) => updateParam({ multiplier: v })}
              min={1}
              step={0.5}
              suffix="×"
              tooltip="Mise multipliée par ce facteur lors d'une forte baisse du marché."
            />
            <NumberField
              label="Seuil de déclenchement"
              value={params.threshold}
              onChange={(v) => updateParam({ threshold: v })}
              min={0}
              step={1}
              suffix="%"
              tooltip="Baisse mensuelle à partir de laquelle on renforce la mise."
            />
          </>
        )}

        {strategy === 'rebalance' && (
          <SelectField
            label="Fréquence de rééquilibrage"
            value={params.rebalanceFrequency}
            onChange={(v) => updateParam({ rebalanceFrequency: v })}
            options={[
              { value: 'quarterly', label: 'Trimestriel' },
              { value: 'yearly', label: 'Annuel' },
            ]}
          />
        )}

        {strategy === 'momentum' && (
          <>
            <SelectField
              label="Fenêtre de lookback"
              value={String(params.lookback)}
              onChange={(v) => updateParam({ lookback: Number(v) })}
              options={[
                { value: '1', label: '1 mois' },
                { value: '3', label: '3 mois' },
                { value: '6', label: '6 mois' },
                { value: '12', label: '12 mois' },
              ]}
              tooltip="Période sur laquelle on mesure la performance pour choisir l'actif gagnant."
            />
            <SelectField
              label="Fréquence de rotation"
              value={params.rotationFrequency}
              onChange={(v) => updateParam({ rotationFrequency: v })}
              options={[
                { value: 'monthly', label: 'Mensuelle' },
                { value: 'quarterly', label: 'Trimestrielle' },
                { value: 'yearly', label: 'Annuelle' },
              ]}
            />
          </>
        )}
      </div>

      {strategy === 'momentum' && (
        <p className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-navy-600 dark:bg-navy-800 dark:text-navy-300">
          <Info size={14} className="mt-0.5 shrink-0 text-navy-400" />
          Ajoutez plusieurs actifs : la stratégie détiendra le plus performant de la liste à chaque rotation.
        </p>
      )}

      {/* ---------- Stock picking : éditeur de transactions ---------- */}
      {strategy === 'stock-picking' && (
        <TransactionsEditor
          transactions={params.transactions}
          selectedAssets={config.selectedAssets}
          allAssets={allAssets}
          onChange={(txs) => updateParam({ transactions: txs })}
        />
      )}

      {/* ---------- Paramètres globaux ---------- */}
      <div className="space-y-3 border-t border-navy-100 pt-3 dark:border-navy-800">
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Type de frais de courtage"
            value={config.fees.type}
            onChange={(v) => updateConfig({ fees: { ...config.fees, type: v } })}
            options={[
              { value: 'percent', label: 'Pourcentage' },
              { value: 'fixed', label: 'Montant fixe' },
            ]}
            tooltip="Frais prélevés à chaque transaction."
          />
          <NumberField
            label="Frais de courtage"
            value={config.fees.value}
            onChange={(v) => updateConfig({ fees: { ...config.fees, value: Number(v) } })}
            min={0}
            step={config.fees.type === 'percent' ? 0.05 : 0.5}
            suffix={config.fees.type === 'percent' ? '%' : '€'}
          />
          <NumberField
            label="Frais de gestion annuels"
            value={config.feeAnnualMgmt}
            onChange={(v) => updateConfig({ feeAnnualMgmt: Number(v) })}
            min={0}
            step={0.1}
            suffix="%"
            tooltip="Frais annuels (typiques d'une assurance-vie), prélevés mensuellement."
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <CheckboxField
            label="Réinvestir les dividendes"
            checked={config.reinvestDividends}
            onChange={(v) => updateConfig({ reinvestDividends: v })}
            tooltip="Les dividendes rachètent automatiquement des parts."
          />
          <CheckboxField
            label="Ajuster à l'inflation"
            checked={config.adjustInflation}
            onChange={(v) => updateConfig({ adjustInflation: v })}
            tooltip="Affiche les montants en euros constants (pouvoir d'achat de l'année de départ)."
          />
        </div>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------------
//  Éditeur de transactions pour le stock picking
// ----------------------------------------------------------------------------
function TransactionsEditor({ transactions, selectedAssets, allAssets, onChange }) {
  const assetOptions = selectedAssets
    .map((s) => allAssets.find((a) => a.id === s.id))
    .filter(Boolean)

  function addRow() {
    const firstId = assetOptions[0]?.id || ''
    onChange([...transactions, { date: '2020-01-01', assetId: firstId, quantity: 1, price: 0 }])
  }
  function updateRow(i, patch) {
    onChange(transactions.map((t, idx) => (idx === i ? { ...t, ...patch } : t)))
  }
  function removeRow(i) {
    onChange(transactions.filter((_, idx) => idx !== i))
  }

  return (
    <div className="rounded-lg border border-navy-100 p-3 dark:border-navy-800">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase text-navy-500">Mes transactions</span>
        <button onClick={addRow} className="btn-secondary !px-2 !py-1 text-xs" disabled={assetOptions.length === 0}>
          <Plus size={13} /> Ajouter
        </button>
      </div>

      {assetOptions.length === 0 && (
        <p className="text-xs text-loss">Ajoutez d'abord au moins un actif au portefeuille.</p>
      )}

      {transactions.length === 0 && assetOptions.length > 0 && (
        <p className="text-xs text-navy-400">Aucune transaction. Cliquez sur « Ajouter ».</p>
      )}

      <div className="space-y-2">
        {transactions.map((t, i) => (
          <div key={i} className="grid grid-cols-12 items-end gap-1.5">
            <div className="col-span-4">
              <label className="label !text-[10px]">Date</label>
              <input type="date" value={t.date} onChange={(e) => updateRow(i, { date: e.target.value })} className="field !px-1.5 !py-1 text-xs" />
            </div>
            <div className="col-span-3">
              <label className="label !text-[10px]">Actif</label>
              <select value={t.assetId} onChange={(e) => updateRow(i, { assetId: e.target.value })} className="field !px-1 !py-1 text-xs">
                {assetOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label !text-[10px]">Qté</label>
              <input type="number" value={t.quantity} min={0} onChange={(e) => updateRow(i, { quantity: e.target.value })} className="field !px-1.5 !py-1 text-xs" />
            </div>
            <div className="col-span-2">
              <label className="label !text-[10px]">Prix</label>
              <input type="number" value={t.price} min={0} onChange={(e) => updateRow(i, { price: e.target.value })} className="field !px-1.5 !py-1 text-xs" />
            </div>
            <button onClick={() => removeRow(i)} className="col-span-1 flex h-8 items-center justify-center text-navy-400 hover:text-loss">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-navy-400">Laissez le prix à 0 pour utiliser le cours de marché simulé.</p>
    </div>
  )
}
