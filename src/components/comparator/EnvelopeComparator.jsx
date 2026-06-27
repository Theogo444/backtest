// ============================================================================
//  EnvelopeComparator.jsx — comparateur fiscal PEA / CTO / Assurance-vie
// ============================================================================

import { useState } from 'react'
import { Scale, ExternalLink, Info, ArrowRight } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Cell,
  LabelList,
} from 'recharts'
import AdSlot from '../layout/AdSlot'
import { useSimulation } from '../../hooks/useSimulation'
import { compareEnvelopes } from '../../utils/fiscalite'
import { formatEUR, formatPct } from '../../utils/metrics'

const ENVELOPE_COLORS = { pea: '#1e3a5f', cto: '#d97706', av: '#0891b2' }

// Liens d'affiliation (placeholders — à remplacer par les vrais liens)
const BROKERS = [
  {
    name: 'Fortuneo',
    tag: 'PEA',
    desc: 'PEA sans frais de tenue de compte, courtage compétitif.',
    href: '#affiliate-fortuneo', // <!-- Remplacer par lien affilié Fortuneo -->
  },
  {
    name: 'Boursorama',
    tag: 'PEA + CTO',
    desc: 'Banque en ligne complète : PEA et compte-titres.',
    href: '#affiliate-boursorama', // <!-- Remplacer par lien affilié Boursorama -->
  },
  {
    name: 'Linxea',
    tag: 'Assurance-vie',
    desc: 'Assurances-vie en ligne à frais réduits, large choix d\'ETF.',
    href: '#affiliate-linxea', // <!-- Remplacer par lien affilié Linxea -->
  },
]

export default function EnvelopeComparator({ config, marketData }) {
  const result = useSimulation({ ...config, allAssets: marketData.assets })

  const [ctoMethod, setCtoMethod] = useState('pfu')
  const [tmi, setTmi] = useState(0.3)
  const [couple, setCouple] = useState(false)

  if (!result) {
    return (
      <PageShell>
        <div className="card text-sm text-navy-500">
          Configurez d'abord une simulation dans l'onglet « Simulateur » (au moins un actif).
        </div>
      </PageShell>
    )
  }

  const { finalValue, totalInvested } = result.metrics
  const years = Math.round(result.years)

  const comparison = compareEnvelopes({
    finalValue,
    invested: totalInvested,
    years,
    ctoMethod,
    tmi,
    couple,
  })

  const chartData = comparison.envelopes.map((e) => ({
    name: e.name,
    net: Math.round(e.netFinal),
    tax: Math.round(e.tax),
    id: e.id,
  }))

  const best = comparison.envelopes.reduce((a, b) => (b.netFinal > a.netFinal ? b : a))

  return (
    <PageShell>
      {/* Récapitulatif de la simulation */}
      <div className="card mb-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-700 dark:text-navy-200">
          Simulation de référence
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Recap label="Total investi" value={formatEUR(totalInvested)} />
          <Recap label="Valeur brute" value={formatEUR(finalValue)} />
          <Recap label="Plus-value" value={formatEUR(comparison.gains)} tone="gain" />
          <Recap label="Durée" value={`${years} an${years > 1 ? 's' : ''}`} />
        </div>
        <p className="mt-2 text-xs text-navy-400">
          Basé sur votre configuration du simulateur. Modifiez-la dans l'onglet « Simulateur ».
        </p>
      </div>

      {/* Options fiscales */}
      <div className="card mb-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-700 dark:text-navy-200">
          Options fiscales
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex h-full flex-col">
            <label className="label leading-tight">Imposition du CTO</label>
            <select value={ctoMethod} onChange={(e) => setCtoMethod(e.target.value)} className="field mt-auto">
              <option value="pfu">Flat tax (PFU 30 %)</option>
              <option value="bareme">Barème progressif</option>
            </select>
          </div>
          {ctoMethod === 'bareme' && (
            <div className="flex h-full flex-col">
              <label className="label leading-tight">Tranche marginale (TMI)</label>
              <select value={tmi} onChange={(e) => setTmi(Number(e.target.value))} className="field mt-auto">
                {[0, 0.11, 0.3, 0.41, 0.45].map((t) => (
                  <option key={t} value={t}>
                    {Math.round(t * 100)} %
                  </option>
                ))}
              </select>
            </div>
          )}
          <label className="flex h-full items-end gap-2 pb-2 text-sm">
            <input type="checkbox" checked={couple} onChange={(e) => setCouple(e.target.checked)} className="h-4 w-4 accent-navy-700" />
            <span>Couple (abattement AV doublé)</span>
          </label>
        </div>
      </div>

      {/* Tableau + graphique */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 text-sm font-bold text-navy-700 dark:text-navy-200">Montant net après impôt</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-left text-xs uppercase text-navy-400 dark:border-navy-800">
                  <th className="py-2">Enveloppe</th>
                  <th className="py-2 text-right">Impôt</th>
                  <th className="py-2 text-right">Net final</th>
                </tr>
              </thead>
              <tbody>
                {comparison.envelopes.map((e) => (
                  <tr key={e.id} className="border-b border-navy-50 last:border-0 dark:border-navy-800">
                    <td className="py-2.5 font-semibold" style={{ color: ENVELOPE_COLORS[e.id] }}>
                      {e.name}
                      {e.id === best.id && (
                        <span className="ml-1.5 rounded bg-gain/15 px-1.5 py-0.5 text-[10px] font-bold text-gain">
                          OPTIMAL
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-loss">
                      −{formatEUR(e.tax)}
                      <span className="ml-1 text-xs text-navy-400">({formatPct(e.effectiveRate)})</span>
                    </td>
                    <td className="py-2.5 text-right font-bold tabular-nums">{formatEUR(e.netFinal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-navy-400">
            Impôt calculé sur la plus-value de {formatEUR(comparison.gains)}. Les prélèvements sociaux (17,2 %)
            s'appliquent dans tous les cas.
          </p>
        </div>

        <div className="card">
          <h2 className="mb-3 text-sm font-bold text-navy-700 dark:text-navy-200">Comparaison visuelle</h2>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#94a3b833" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fill: '#94a3b8', fontSize: 11 }} width={44} axisLine={false} tickLine={false} />
                <RTooltip formatter={(v) => [formatEUR(v), 'Net final']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="net" radius={[4, 4, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.id} fill={ENVELOPE_COLORS[d.id]} />
                  ))}
                  <LabelList dataKey="net" position="top" formatter={(v) => formatEUR(v)} style={{ fontSize: 11, fill: '#64748b', fontWeight: 700 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Notes pédagogiques */}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {comparison.envelopes.map((e) => (
          <div key={e.id} className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm dark:border-navy-700 dark:bg-navy-800">
            <div className="mb-1 flex items-center gap-1.5 font-bold" style={{ color: ENVELOPE_COLORS[e.id] }}>
              <Info size={15} /> {e.name}
            </div>
            <p className="leading-relaxed text-navy-600 dark:text-navy-300">{e.note}</p>
          </div>
        ))}
      </div>

      {/* AdSense slot: COMPARATOR_RECTANGLE */}
      <AdSlot format="rectangle" position="COMPARATOR_RECTANGLE" />

      {/* Liens d'affiliation : ouvrir un compte */}
      <div className="mt-4 card">
        <h2 className="mb-1 text-lg font-extrabold text-navy-800 dark:text-white">Ouvrir un compte</h2>
        <p className="mb-4 text-sm text-navy-500">
          Prêt à investir ? Comparez les courtiers et enveloppes recommandés.
        </p>
        <div className="grid gap-3 md:grid-cols-3">
          {BROKERS.map((b) => (
            <div key={b.name} className="flex flex-col rounded-xl border border-navy-100 p-4 dark:border-navy-800">
              <div className="mb-1 flex items-center justify-between">
                <span className="font-bold text-navy-800 dark:text-white">{b.name}</span>
                <span className="rounded-full bg-navy-100 px-2 py-0.5 text-[10px] font-bold uppercase text-navy-500 dark:bg-navy-700 dark:text-navy-200">
                  {b.tag}
                </span>
              </div>
              <p className="mb-3 flex-1 text-xs leading-relaxed text-navy-500">{b.desc}</p>
              {/* Remplacer par le lien affilié correspondant */}
              <a href={b.href} target="_blank" rel="nofollow sponsored noopener noreferrer" className="btn-primary w-full text-sm">
                Découvrir {b.name} <ExternalLink size={14} />
              </a>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1 text-[11px] text-navy-400">
          <ArrowRight size={12} /> Liens partenaires. Ce site peut percevoir une commission sans surcoût pour vous.
        </p>
      </div>
    </PageShell>
  )
}

function PageShell({ children }) {
  return (
    <section>
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-navy-800 dark:text-white md:text-3xl">
          <Scale size={26} /> Comparateur d'enveloppes
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          PEA, CTO ou Assurance-vie : visualisez l'impact de la fiscalité française sur vos gains à la sortie.
        </p>
      </header>
      {children}
    </section>
  )
}

function Recap({ label, value, tone }) {
  return (
    <div className="flex h-full flex-col">
      {/* Hauteur de libellé réservée → valeurs alignées sur la même ligne */}
      <div className="min-h-[2rem] text-xs font-semibold uppercase leading-tight text-navy-400">{label}</div>
      <div className={`mt-auto text-lg font-extrabold tabular-nums ${tone === 'gain' ? 'text-gain' : 'text-navy-800 dark:text-white'}`}>
        {value}
      </div>
    </div>
  )
}
