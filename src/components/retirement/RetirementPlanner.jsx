// ============================================================================
//  RetirementPlanner.jsx — objectif retraite
//  Calcule l'effort d'épargne mensuel nécessaire et trace la trajectoire du
//  capital (accumulation puis décumulation), en euros constants d'aujourd'hui.
// ============================================================================

import { useState, useMemo } from 'react'
import { Landmark, CheckCircle2, XCircle } from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ReferenceLine,
} from 'recharts'
import { formatEUR } from '../../utils/metrics'

// Rendement réel mensuel à partir d'un rendement et d'une inflation annuels
function realMonthlyRate(annualReturn, inflation) {
  const real = (1 + annualReturn) / (1 + inflation) - 1
  return Math.pow(1 + real, 1 / 12) - 1
}

// Calcule l'épargne mensuelle requise + la trajectoire pour un scénario
function planRetirement({ currentAge, retireAge, lifeExpectancy, monthlyIncome, annualReturn, inflation, currentSavings }) {
  const n1 = Math.max(0, retireAge - currentAge) // années d'accumulation
  const n2 = Math.max(1, lifeExpectancy - retireAge) // années de retraite
  const N1 = n1 * 12
  const N2 = n2 * 12
  const rm = realMonthlyRate(annualReturn, inflation)

  // Capital nécessaire à la retraite (valeur actuelle d'une rente, euros constants)
  let capitalNeeded
  if (Math.abs(rm) < 1e-9) capitalNeeded = monthlyIncome * N2
  else capitalNeeded = monthlyIncome * (1 - Math.pow(1 + rm, -N2)) / rm

  // Apport déjà constitué, capitalisé jusqu'à la retraite
  const grownSavings = currentSavings * Math.pow(1 + rm, N1)
  const capitalFromContrib = Math.max(0, capitalNeeded - grownSavings)

  // Épargne mensuelle requise (FV d'une suite de versements)
  let monthlyNeeded
  if (N1 === 0) monthlyNeeded = capitalFromContrib
  else if (Math.abs(rm) < 1e-9) monthlyNeeded = capitalFromContrib / N1
  else monthlyNeeded = (capitalFromContrib * rm) / (Math.pow(1 + rm, N1) - 1)

  return { n1, n2, N1, N2, rm, capitalNeeded, monthlyNeeded, grownSavings }
}

// Trace la trajectoire du capital avec un versement mensuel donné
function buildTrajectory({ currentAge, retireAge, lifeExpectancy, monthlyIncome, monthlyContribution, rm, currentSavings }) {
  const points = []
  let capital = currentSavings
  let age = currentAge
  const totalMonths = (lifeExpectancy - currentAge) * 12
  const retireMonth = (retireAge - currentAge) * 12
  for (let m = 0; m <= totalMonths; m++) {
    if (m % 12 === 0) {
      points.push({ age: Math.round(currentAge + m / 12), capital: Math.round(Math.max(0, capital)) })
    }
    if (m < retireMonth) {
      capital = capital * (1 + rm) + monthlyContribution
    } else {
      capital = capital * (1 + rm) - monthlyIncome
    }
  }
  return points
}

const SCENARIOS = [
  { id: 'pessimiste', label: 'Pessimiste', delta: -0.02, color: '#ef4444' },
  { id: 'neutre', label: 'Neutre', delta: 0, color: '#1e3a5f' },
  { id: 'optimiste', label: 'Optimiste', delta: 0.02, color: '#10b981' },
]

export default function RetirementPlanner() {
  const [form, setForm] = useState({
    currentAge: 30,
    retireAge: 64,
    lifeExpectancy: 90,
    monthlyIncome: 1500,
    annualReturn: 0.06,
    inflation: 0.02,
    currentSavings: 5000,
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const results = useMemo(
    () =>
      SCENARIOS.map((s) => {
        const plan = planRetirement({ ...form, annualReturn: form.annualReturn + s.delta })
        return { ...s, plan }
      }),
    [form],
  )

  const neutral = results.find((r) => r.id === 'neutre')
  const trajectory = useMemo(
    () =>
      buildTrajectory({
        currentAge: form.currentAge,
        retireAge: form.retireAge,
        lifeExpectancy: form.lifeExpectancy,
        monthlyIncome: form.monthlyIncome,
        monthlyContribution: neutral.plan.monthlyNeeded,
        rm: neutral.plan.rm,
        currentSavings: form.currentSavings,
      }),
    [form, neutral],
  )

  return (
    <section>
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-navy-800 dark:text-white md:text-3xl">
          <Landmark size={26} /> Objectif retraite
        </h1>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">
          Combien épargner chaque mois pour financer la retraite que vous visez ? (montants en euros
          d'aujourd'hui)
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Formulaire */}
        <div className="card space-y-3 lg:col-span-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-navy-700 dark:text-navy-200">Votre situation</h2>
          <Field label="Âge actuel" value={form.currentAge} onChange={(v) => set('currentAge', Number(v))} suffix="ans" />
          <Field label="Âge de départ en retraite" value={form.retireAge} onChange={(v) => set('retireAge', Number(v))} suffix="ans" />
          <Field label="Espérance de vie" value={form.lifeExpectancy} onChange={(v) => set('lifeExpectancy', Number(v))} suffix="ans" />
          <Field label="Revenu mensuel souhaité" value={form.monthlyIncome} onChange={(v) => set('monthlyIncome', Number(v))} step={100} suffix="€" />
          <Field label="Épargne déjà constituée" value={form.currentSavings} onChange={(v) => set('currentSavings', Number(v))} step={1000} suffix="€" />
          <Field label="Rendement annuel estimé" value={Math.round(form.annualReturn * 1000) / 10} onChange={(v) => set('annualReturn', Number(v) / 100)} step={0.5} suffix="%" />
          <Field label="Inflation estimée" value={Math.round(form.inflation * 1000) / 10} onChange={(v) => set('inflation', Number(v) / 100)} step={0.1} suffix="%" />
        </div>

        {/* Résultats */}
        <div className="space-y-4 lg:col-span-2">
          {/* Cartes scénarios */}
          <div className="grid gap-3 sm:grid-cols-3">
            {results.map((r) => {
              const achievable = r.plan.monthlyNeeded <= form.monthlyIncome * 3 // heuristique de faisabilité
              return (
                <div key={r.id} className="card text-center">
                  <div className="text-xs font-bold uppercase tracking-wide" style={{ color: r.color }}>
                    {r.label}
                  </div>
                  <div className="mt-1 text-[11px] text-navy-400">
                    Rendement {Math.round((form.annualReturn + r.delta) * 1000) / 10} %/an
                  </div>
                  <div className="mt-2 text-2xl font-extrabold tabular-nums text-navy-800 dark:text-white">
                    {formatEUR(r.plan.monthlyNeeded)}
                  </div>
                  <div className="text-xs text-navy-400">par mois</div>
                  <div className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold">
                    {achievable ? (
                      <span className="flex items-center gap-1 text-gain">
                        <CheckCircle2 size={14} /> Atteignable
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-loss">
                        <XCircle size={14} /> Effort élevé
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="card">
            <p className="text-sm text-navy-600 dark:text-navy-300">
              Pour viser <strong>{formatEUR(form.monthlyIncome)}</strong>/mois de la retraite ({form.retireAge} ans)
              jusqu'à {form.lifeExpectancy} ans, il faut un capital d'environ{' '}
              <strong>{formatEUR(neutral.plan.capitalNeeded)}</strong> (euros constants), soit une épargne de{' '}
              <strong className="text-navy-800 dark:text-white">{formatEUR(neutral.plan.monthlyNeeded)}/mois</strong>{' '}
              dans le scénario neutre.
            </p>
          </div>

          {/* Trajectoire */}
          <div className="card">
            <h3 className="mb-2 text-sm font-bold text-navy-700 dark:text-navy-200">
              Trajectoire du capital (scénario neutre)
            </h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={trajectory} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradRetraite" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e3a5f" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#1e3a5f" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#94a3b833" vertical={false} />
                  <XAxis dataKey="age" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} unit=" ans" />
                  <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} tick={{ fill: '#94a3b8', fontSize: 11 }} width={44} axisLine={false} tickLine={false} />
                  <RTooltip formatter={(v) => [formatEUR(v), 'Capital']} labelFormatter={(l) => `${l} ans`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <ReferenceLine x={form.retireAge} stroke="#d97706" strokeDasharray="4 3" label={{ value: 'Retraite', fill: '#d97706', fontSize: 11, position: 'insideTopRight' }} />
                  <Area type="monotone" dataKey="capital" stroke="#1e3a5f" strokeWidth={2.5} fill="url(#gradRetraite)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-navy-400">
              Phase d'accumulation jusqu'à {form.retireAge} ans, puis décumulation (retraits) jusqu'à{' '}
              {form.lifeExpectancy} ans.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}

function Field({ label, value, onChange, suffix, step = 1 }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-1">
        <input type="number" value={value} step={step} onChange={(e) => onChange(e.target.value)} className="field" />
        {suffix && <span className="text-xs text-navy-400">{suffix}</span>}
      </div>
    </div>
  )
}
