// ============================================================================
//  ProfileAdvisor.jsx — « Votre situation financière » du simulateur débutant.
//
//  Formulaire détaillé (foyer, revenus, charges, crédits, épargne, projet,
//  tolérance au risque) → diagnostic budgétaire en direct (reste à vivre,
//  taux d'effort, épargne de précaution) + plan d'investissement suggéré
//  (montant mensuel en DCA, versement initial, enveloppe, portefeuille type,
//  durée). Le bouton « Appliquer » pré-remplit les 4 étapes du simulateur.
//
//  ⚠️ Vie privée : ces informations (revenus, charges…) restent dans le
//  navigateur — elles ne sont NI envoyées à un serveur, NI encodées dans le
//  lien de partage. Seul le plan appliqué (montant, durée…) est partageable.
//
//  Le calcul vit dans utils/advisor.js (fonctions pures, testables).
// ============================================================================

import { useMemo, useState } from 'react'
import {
  Users, Wallet, Home, PiggyBank, Target, Gauge, Sparkles, ArrowDown,
  Check, Minus, Plus, ShieldCheck, AlertTriangle, Info, Lightbulb,
} from 'lucide-react'
import {
  computeAdvice, estimateLivingExpenses, AGE_BRACKETS, HORIZONS, RISK_PROFILES,
} from '../../utils/advisor'
import { formatEUR } from '../../utils/metrics'
import { ENVELOPE_LABELS } from '../../data/brokers'

const PERIOD_LABELS = { '5y': '5 ans', '10y': '10 ans', '20y': '20 ans' }

export default function ProfileAdvisor({ onApply }) {
  const [profile, setProfile] = useState({
    adults: 1, children: 0, ageBracket: '30-45',
    income: '', otherIncome: '',
    housing: '', loans: '', living: '',
    savings: '', lump: '',
    horizon: '10-20', risk: 'equilibre',
    shortTermProject: false,
  })
  const [applied, setApplied] = useState(false)
  const set = (key, value) => {
    setProfile((p) => ({ ...p, [key]: value }))
    setApplied(false)
  }

  const advice = useMemo(() => computeAdvice(profile), [profile])

  const handleApply = () => {
    if (!advice.ok || !advice.canInvest) return
    onApply(advice)
    setApplied(true)
  }

  return (
    <div className="rounded-3xl bg-navy-100/50 p-3 ring-1 ring-navy-100 dark:bg-navy-900/40 dark:ring-navy-800 sm:p-4">
      <div className="grid gap-3 lg:grid-cols-[1.15fr_1fr] lg:items-start">
        {/* ============================ FORMULAIRE ============================ */}
        <div className="card">
          <div className="space-y-5">
            {/* --- Votre foyer --- */}
            <fieldset>
              <SectionTitle icon={Users} title="Votre foyer" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="label">Vous vivez…</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <Chip active={profile.adults === 1} onClick={() => set('adults', 1)}>Seul·e</Chip>
                    <Chip active={profile.adults === 2} onClick={() => set('adults', 2)}>En couple</Chip>
                  </div>
                </div>
                <div>
                  <span className="label">Enfants à charge</span>
                  <Stepper
                    value={profile.children}
                    onChange={(v) => set('children', v)}
                    min={0} max={8}
                    ariaLabel="Nombre d'enfants à charge"
                  />
                </div>
              </div>
              <div className="mt-3">
                <span className="label">Votre âge</span>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                  {AGE_BRACKETS.map((b) => (
                    <Chip key={b.id} active={profile.ageBracket === b.id} onClick={() => set('ageBracket', b.id)}>
                      {b.label}
                    </Chip>
                  ))}
                </div>
              </div>
            </fieldset>

            {/* --- Vos revenus --- */}
            <fieldset>
              <SectionTitle icon={Wallet} title="Vos revenus (nets, par mois)" />
              <div className="grid gap-3 sm:grid-cols-2">
                <MoneyField
                  label="Revenus du foyer"
                  hint="Salaires, pensions, indépendant…"
                  value={profile.income}
                  onChange={(v) => set('income', v)}
                  placeholder="ex : 2 400"
                />
                <MoneyField
                  label="Autres revenus"
                  hint="Loyers perçus, aides, primes lissées"
                  optional
                  value={profile.otherIncome}
                  onChange={(v) => set('otherIncome', v)}
                  placeholder="ex : 200"
                />
              </div>
            </fieldset>

            {/* --- Vos charges --- */}
            <fieldset>
              <SectionTitle icon={Home} title="Vos charges (par mois)" />
              <div className="grid gap-3 sm:grid-cols-2">
                <MoneyField
                  label="Logement"
                  hint="Loyer ou mensualité du crédit immobilier"
                  value={profile.housing}
                  onChange={(v) => set('housing', v)}
                  placeholder="ex : 850"
                />
                <MoneyField
                  label="Autres crédits en cours"
                  hint="Auto, conso, étudiant… (mensualités)"
                  optional
                  value={profile.loans}
                  onChange={(v) => set('loans', v)}
                  placeholder="ex : 180"
                />
              </div>
              <div className="mt-3">
                <MoneyField
                  label="Dépenses courantes"
                  hint="Courses, énergie, assurances, transports, abonnements, loisirs…"
                  value={profile.living}
                  onChange={(v) => set('living', v)}
                  placeholder="ex : 1 100"
                />
                <button
                  type="button"
                  onClick={() => set('living', estimateLivingExpenses(profile.adults, profile.children))}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-navy-600 hover:underline dark:text-navy-300"
                >
                  <Lightbulb size={12} /> Je ne sais pas — estimer selon mon foyer
                </button>
              </div>
            </fieldset>

            {/* --- Votre épargne --- */}
            <fieldset>
              <SectionTitle icon={PiggyBank} title="Votre épargne actuelle" />
              <div className="grid gap-3 sm:grid-cols-2">
                <MoneyField
                  label="Épargne de précaution"
                  hint="Livret A, LDDS… disponible immédiatement"
                  value={profile.savings}
                  onChange={(v) => set('savings', v)}
                  placeholder="ex : 5 000"
                  suffix="€"
                />
                <MoneyField
                  label="Capital prêt à investir"
                  hint="Somme dont vous n'aurez pas besoin"
                  optional
                  value={profile.lump}
                  onChange={(v) => set('lump', v)}
                  placeholder="ex : 3 000"
                  suffix="€"
                />
              </div>
            </fieldset>

            {/* --- Votre projet --- */}
            <fieldset>
              <SectionTitle icon={Target} title="Votre projet" />
              <span className="label">Dans combien de temps pourriez-vous avoir besoin de cet argent ?</span>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {HORIZONS.map((h) => (
                  <Chip key={h.id} active={profile.horizon === h.id} onClick={() => set('horizon', h.id)}>
                    {h.label}
                  </Chip>
                ))}
              </div>
              <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs text-navy-600 dark:text-navy-300">
                <input
                  type="checkbox"
                  checked={profile.shortTermProject}
                  onChange={(e) => set('shortTermProject', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-navy-300 text-navy-800 focus:ring-navy-500"
                />
                <span>
                  Je prévois un <strong className="font-semibold">gros achat d'ici 5 ans</strong>{' '}
                  (apport immobilier, voiture, travaux…)
                </span>
              </label>
            </fieldset>

            {/* --- Votre tolérance au risque --- */}
            <fieldset>
              <SectionTitle icon={Gauge} title="Votre tolérance au risque" />
              <div className="space-y-2">
                {RISK_PROFILES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => set('risk', r.id)}
                    className={`w-full rounded-lg border p-2.5 text-left transition ${
                      profile.risk === r.id
                        ? 'border-navy-800 bg-navy-50 ring-1 ring-navy-800 dark:bg-navy-800/60'
                        : 'border-navy-200 hover:border-navy-400 dark:border-navy-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-navy-800 dark:text-white">{r.label}</span>
                      {profile.risk === r.id && <Check size={14} className="ml-auto text-gain" />}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-snug text-navy-500 dark:text-navy-400">
                      {r.description}
                    </p>
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <p className="mt-5 flex items-start gap-1.5 text-[11px] leading-snug text-navy-400">
            <ShieldCheck size={13} className="mt-0.5 shrink-0" />
            Ces informations restent dans votre navigateur : elles ne sont ni enregistrées ni transmises,
            et n'apparaissent pas dans les liens de partage.
          </p>
        </div>

        {/* ====================== DIAGNOSTIC + SUGGESTION ====================== */}
        <div className="space-y-3">
          {!advice.ok ? (
            <div className="card border-dashed">
              <div className="flex items-center gap-2 text-sm font-bold text-navy-700 dark:text-navy-200">
                <Sparkles size={15} /> Votre diagnostic apparaîtra ici
              </div>
              <p className="mt-2 text-xs leading-relaxed text-navy-500 dark:text-navy-400">
                Renseignez au moins vos <strong className="font-semibold">revenus</strong> et vos{' '}
                <strong className="font-semibold">charges</strong> : nous calculons votre reste à vivre,
                votre taux d'effort, l'épargne de précaution à viser… et un plan d'investissement
                mensuel adapté à votre situation.
              </p>
            </div>
          ) : (
            <>
              {/* --- Diagnostic budgétaire --- */}
              <div className="card">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-navy-700 dark:text-navy-200">
                  Votre diagnostic
                </h3>

                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-navy-500 dark:text-navy-400">Reste à vivre</span>
                  <span className={`text-xl font-extrabold tabular-nums ${advice.disposable > 0 ? 'text-navy-800 dark:text-white' : 'text-loss'}`}>
                    {formatEUR(Math.round(advice.disposable))}
                    <span className="text-xs font-semibold text-navy-400"> /mois</span>
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-navy-400">
                  Revenus {formatEUR(advice.totalIncome)} − charges {formatEUR(advice.totalCharges)}
                </p>

                <MeterRow
                  className="mt-4"
                  label="Taux d'effort (logement + crédits)"
                  valueLabel={`${Math.round(advice.debtRatio * 100)} %`}
                  pct={Math.min(1, advice.debtRatio / 0.5)}
                  markerPct={0.35 / 0.5}
                  tone={advice.debtRatio > 0.35 ? 'warn' : 'ok'}
                  note="Repère usuel : rester sous 35 %"
                />

                <MeterRow
                  className="mt-4"
                  label={`Épargne de précaution (objectif : ${advice.emergency.monthsTarget} mois de charges)`}
                  valueLabel={`${formatEUR(advice.emergency.savings)} / ${formatEUR(advice.emergency.target)}`}
                  pct={advice.emergency.target > 0 ? Math.min(1, advice.emergency.savings / advice.emergency.target) : 1}
                  tone={advice.emergency.gap > 0 ? 'warn' : 'ok'}
                  note={
                    advice.emergency.gap > 0
                      ? `Il manque ${formatEUR(advice.emergency.gap)} sur livret avant d'investir fort`
                      : 'Votre filet de sécurité est au niveau'
                  }
                />
              </div>

              {/* --- Messages --- */}
              {advice.messages.slice(0, 4).map((m) => (
                <Alert key={m.title} tone={m.tone} title={m.title} text={m.text} />
              ))}

              {/* --- Plan suggéré --- */}
              {advice.canInvest ? (
                <div className="card bg-gradient-to-br from-navy-800 to-navy-950 text-white ring-navy-800">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-navy-200">
                    Notre suggestion pour vous
                  </div>
                  <div className="mt-1.5 text-2xl font-extrabold tabular-nums">
                    {formatEUR(advice.monthlyInvest)}
                    <span className="text-sm font-semibold text-navy-200"> /mois en DCA</span>
                  </div>
                  {advice.initialInvest > 0 && (
                    <p className="text-sm font-semibold text-emerald-300">
                      + {formatEUR(advice.initialInvest)} de versement initial
                    </p>
                  )}
                  {advice.monthlyToEmergency > 0 && (
                    <p className="mt-1 text-xs text-navy-200">
                      + {formatEUR(advice.monthlyToEmergency)}/mois sur un livret, le temps de compléter
                      votre épargne de précaution.
                    </p>
                  )}

                  <dl className="mt-3 space-y-1.5 border-t border-white/15 pt-3 text-xs">
                    <PlanRow label="Stratégie" value="DCA — la même somme chaque mois" />
                    <PlanRow label="Enveloppe" value={ENVELOPE_LABELS[advice.portfolio.envelope]} />
                    <PlanRow
                      label="Portefeuille"
                      value={advice.portfolio.assets.map((a) => `${a.name} ${a.allocation} %`).join(' · ')}
                    />
                    <PlanRow label="Durée simulée" value={PERIOD_LABELS[advice.period]} />
                  </dl>

                  <p className="mt-2.5 text-[11px] leading-snug text-navy-200">{advice.portfolio.why}</p>
                  {advice.risk !== advice.riskRequested && (
                    <p className="mt-1.5 text-[11px] font-semibold text-amber-300">
                      Profil ramené à « prudent » au vu de votre situation (voir diagnostic).
                    </p>
                  )}
                  <p className="mt-1.5 text-[11px] text-navy-200">
                    Il vous resterait environ{' '}
                    <strong className="font-bold text-white">{formatEUR(advice.leftover)}/mois</strong> de
                    marge pour les imprévus et les plaisirs.
                  </p>

                  <button
                    type="button"
                    onClick={handleApply}
                    className="btn-primary mt-3 w-full bg-white !text-navy-900 hover:bg-navy-50"
                  >
                    {applied ? (
                      <>Plan appliqué <Check size={15} /></>
                    ) : (
                      <>Appliquer ce plan à la simulation <ArrowDown size={15} /></>
                    )}
                  </button>
                  <p className="mt-2 text-[10px] leading-snug text-navy-300">
                    Suggestion pédagogique et indicative, pas un conseil en investissement personnalisé.
                    Investir comporte un risque de perte en capital.
                  </p>
                </div>
              ) : (
                <div className="card border-l-4 border-l-amber-400">
                  <div className="text-sm font-bold text-navy-800 dark:text-white">
                    Pas d'investissement en bourse pour l'instant
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-navy-500 dark:text-navy-400">
                    {advice.status === 'deficit'
                      ? 'Votre budget est déficitaire : commencez par le rééquilibrer (le simulateur reste utilisable librement ci-dessous pour vous projeter).'
                      : advice.status === 'emergency-first'
                        ? `Constituez d'abord votre épargne de précaution (${formatEUR(advice.emergency.target)} visés) sur un livret. Vous pourrez ensuite investir chaque mois en toute sérénité.`
                        : 'Votre capacité d\'épargne est trop juste ce mois-ci pour un plan régulier. Revenez quand votre situation se dégage — ou explorez librement le simulateur ci-dessous.'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
//  Sous-composants
// ---------------------------------------------------------------------------
function SectionTitle({ icon: Icon, title }) {
  return (
    <legend className="mb-2.5 flex items-center gap-2 text-sm font-bold text-navy-700 dark:text-navy-200">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-200">
        <Icon size={14} />
      </span>
      {title}
    </legend>
  )
}

function MoneyField({ label, hint, value, onChange, placeholder, optional = false, suffix = '€/mois' }) {
  return (
    <div>
      <label className="label">
        {label}
        {optional && <span className="ml-1 font-normal normal-case text-navy-400">(optionnel)</span>}
      </label>
      <div className="flex items-center rounded-lg border border-navy-200 bg-white px-3 py-2 focus-within:border-navy-500 dark:border-navy-700 dark:bg-navy-800">
        <input
          type="number" min="0" step="50" inputMode="numeric"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold tabular-nums outline-none placeholder:font-normal placeholder:text-navy-400"
        />
        <span className="shrink-0 text-xs font-semibold text-navy-400">{suffix}</span>
      </div>
      {hint && <p className="mt-1 text-[11px] leading-snug text-navy-400">{hint}</p>}
    </div>
  )
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2 py-1.5 text-xs font-semibold transition ${
        active
          ? 'border-navy-800 bg-navy-800 text-white'
          : 'border-navy-200 text-navy-600 hover:border-navy-400 dark:border-navy-700 dark:text-navy-300'
      }`}
    >
      {children}
    </button>
  )
}

function Stepper({ value, onChange, min, max, ariaLabel }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Retirer un enfant"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-navy-200 text-navy-600 transition hover:border-navy-400 disabled:opacity-40 dark:border-navy-700 dark:text-navy-300"
      >
        <Minus size={14} />
      </button>
      <span
        aria-label={ariaLabel}
        className="w-10 text-center text-lg font-extrabold tabular-nums text-navy-800 dark:text-white"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Ajouter un enfant"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-navy-200 text-navy-600 transition hover:border-navy-400 disabled:opacity-40 dark:border-navy-700 dark:text-navy-300"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}

// Jauge horizontale avec repère optionnel (taux d'effort, fonds de précaution)
function MeterRow({ label, valueLabel, pct, markerPct, tone, note, className = '' }) {
  const barColor = tone === 'warn' ? 'bg-amber-400' : 'bg-emerald-500'
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-navy-500 dark:text-navy-400">{label}</span>
        <span className="text-sm font-bold tabular-nums text-navy-800 dark:text-white">{valueLabel}</span>
      </div>
      <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.round(pct * 100)}%` }}
        />
        {markerPct != null && (
          <span
            className="absolute top-0 h-full w-0.5 bg-navy-400/80"
            style={{ left: `${Math.round(markerPct * 100)}%` }}
            aria-hidden
          />
        )}
      </div>
      {note && <p className="mt-1 text-[11px] text-navy-400">{note}</p>}
    </div>
  )
}

const ALERT_STYLES = {
  danger: { box: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300', Icon: AlertTriangle },
  warn: { box: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300', Icon: AlertTriangle },
  ok: { box: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300', Icon: ShieldCheck },
  info: { box: 'bg-navy-50 text-navy-600 dark:bg-navy-800/60 dark:text-navy-300', Icon: Info },
}

function Alert({ tone, title, text }) {
  const { box, Icon } = ALERT_STYLES[tone] || ALERT_STYLES.info
  return (
    <div className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs leading-snug ${box}`}>
      <Icon size={14} className="mt-0.5 shrink-0" />
      <div>
        <span className="font-bold">{title}.</span> {text}
      </div>
    </div>
  )
}

function PlanRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-navy-300">{label}</dt>
      <dd className="text-right font-semibold text-white">{value}</dd>
    </div>
  )
}
