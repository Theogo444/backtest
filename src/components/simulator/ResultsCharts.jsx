// ============================================================================
//  ResultsCharts.jsx — graphiques de résultats (Recharts)
//  Courbe de valeur, performances annuelles, répartition, waterfall.
// ============================================================================

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
} from 'recharts'
import { formatEUR, formatPct } from '../../utils/metrics'

const AXIS = { fill: '#94a3b8', fontSize: 11 }
const GRID = '#94a3b833'

// Formate l'axe X (date YYYY-MM-DD → année)
const yearTick = (d) => (d ? d.slice(0, 4) : '')
const shortEUR = (v) => {
  if (Math.abs(v) >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (Math.abs(v) >= 1000) return `${Math.round(v / 1000)}k`
  return String(Math.round(v))
}

// Infobulle personnalisée (euros formatés en français)
function MoneyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-navy-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-navy-700 dark:bg-navy-900">
      <div className="mb-1 font-semibold text-navy-500">{label?.slice(0, 7)}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-navy-500">{p.name}</span>
          <span className="ml-auto font-bold" style={{ color: p.color }}>
            {formatEUR(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

function ChartCard({ title, subtitle, children, height = 300 }) {
  return (
    <div className="card">
      <h3 className="text-sm font-bold text-navy-700 dark:text-navy-200">{title}</h3>
      {subtitle && <p className="mb-2 text-xs text-navy-400">{subtitle}</p>}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </div>
  )
}

export default function ResultsCharts({ result }) {
  if (!result) return null
  const { valueSeries, benchmark, metrics, allocations, assetObjs } = result

  // --- Données fusionnées : valeur + investi + benchmark ---
  const benchByDate = {}
  if (benchmark) benchmark.valueSeries.forEach((p) => (benchByDate[p.date] = p.value))
  const lineData = valueSeries.map((p) => ({
    date: p.date,
    value: p.value,
    invested: p.invested,
    benchmark: benchByDate[p.date],
  }))

  // --- Répartition (camembert) ---
  const pieData = assetObjs.map((a) => ({
    name: a.name,
    value: Math.round((allocations[a.id] || 0) * 1000) / 10,
    color: a.color,
  }))

  // --- Performances annuelles ---
  const annualData = metrics.annualReturns.map((a) => ({
    year: String(a.year),
    return: Math.round(a.return * 1000) / 10,
    partial: a.partial,
  }))

  // --- Waterfall : investi → plus-value → valeur finale ---
  const invested = metrics.totalInvested
  const gain = metrics.gainAbs
  const finalValue = metrics.finalValue
  const waterfallData = [
    { name: 'Total investi', base: 0, amount: invested, fill: '#334e68' },
    gain >= 0
      ? { name: 'Plus-value', base: invested, amount: gain, fill: '#10b981' }
      : { name: 'Perte', base: finalValue, amount: -gain, fill: '#ef4444' },
    { name: 'Valeur finale', base: 0, amount: finalValue, fill: '#486581' },
  ]

  return (
    <div className="space-y-4">
      {/* 1) Courbe de valeur dans le temps */}
      <ChartCard
        title="Évolution du portefeuille"
        subtitle={benchmark ? `Comparaison avec ${benchmark.name} (même stratégie)` : 'Valeur et montants investis'}
        height={320}
      >
        <AreaChart data={lineData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e3a5f" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#1e3a5f" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="date" tickFormatter={yearTick} tick={AXIS} minTickGap={40} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={shortEUR} tick={AXIS} width={48} axisLine={false} tickLine={false} />
          <RTooltip content={<MoneyTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="value" name="Portefeuille" stroke="#1e3a5f" strokeWidth={2.5} fill="url(#gradValue)" />
          <Area type="monotone" dataKey="invested" name="Total investi" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" fill="none" />
          {benchmark && (
            <Area type="monotone" dataKey="benchmark" name={benchmark.name} stroke="#d97706" strokeWidth={1.8} fill="none" />
          )}
        </AreaChart>
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 2) Performances annuelles */}
        <ChartCard title="Performances annuelles" subtitle="Rendement de l'actif sous-jacent par année civile" height={280}>
          <BarChart data={annualData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis dataKey="year" tick={AXIS} minTickGap={10} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `${v}%`} tick={AXIS} width={40} axisLine={false} tickLine={false} />
            <RTooltip
              formatter={(v) => [`${v} %`, 'Performance']}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="return" radius={[3, 3, 0, 0]}>
              {annualData.map((d, i) => (
                <Cell key={i} fill={d.return >= 0 ? '#10b981' : '#ef4444'} fillOpacity={d.partial ? 0.5 : 1} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>

        {/* 3) Répartition du portefeuille */}
        <ChartCard title="Répartition du portefeuille" subtitle="Allocation cible par actif" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={45}
              paddingAngle={2}
              label={(e) => `${e.value}%`}
              labelLine={false}
            >
              {pieData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <RTooltip formatter={(v, n) => [`${v} %`, n]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ChartCard>
      </div>

      {/* 4) Waterfall : investi vs gains */}
      <ChartCard title="Décomposition : investi vs gains" subtitle="Du capital investi à la valeur finale" height={260}>
        <BarChart data={waterfallData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="name" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={shortEUR} tick={AXIS} width={48} axisLine={false} tickLine={false} />
          <RTooltip
            formatter={(v, n) => (n === 'base' ? null : [formatEUR(v), 'Montant'])}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Bar dataKey="base" stackId="w" fill="transparent" />
          <Bar dataKey="amount" stackId="w" radius={[3, 3, 0, 0]}>
            {waterfallData.map((d, i) => (
              <Cell key={i} fill={d.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartCard>
    </div>
  )
}
