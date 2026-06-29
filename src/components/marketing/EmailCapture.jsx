// ============================================================================
//  EmailCapture.jsx — bloc de capture email réutilisable (lead magnet).
//
//  Orienté bénéfice (« Recevez … »), jamais « abonnez-vous à la newsletter ».
//  States : idle / loading / success / error. Validation email côté front.
//  Consentement RGPD : opt-in simple et explicite via la soumission (aucune
//  case pré-cochée), avec lien vers la politique de confidentialité.
//
//  Props :
//    - title, subtitle        : accroche
//    - bullets[]              : 1-3 arguments courts (optionnel)
//    - leadMagnet            : nom de l'offre (réutilisé dans le succès + consentement)
//    - source                : identifiant de tracking de l'emplacement
//    - variant: 'band'|'card'|'compact'
//        band    : sombre, pleine largeur, accroche forte (zone à fort intérêt)
//        card    : clair, discret
//        compact : barre slim sur une ligne (rappel secondaire, peu intrusif)
// ============================================================================

import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Check, Loader2, ArrowRight, AlertCircle, Gift } from 'lucide-react'
import { subscribeEmail, isValidEmail } from '../../services/emailSignup'
import { track } from '../../utils/track'

export default function EmailCapture({
  title,
  subtitle,
  bullets = [],
  leadMagnet = 'votre ressource',
  source = 'generic',
  variant = 'card',
  dense = false, // compact : empile verticalement (pour les colonnes étroites)
  className = '',
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState('')
  const inputId = useId()
  const dark = variant === 'band'
  const compact = variant === 'compact'

  async function onSubmit(e) {
    e.preventDefault()
    if (!isValidEmail(email)) {
      setStatus('error')
      setError('Entrez une adresse email valide.')
      return
    }
    setStatus('loading')
    setError('')
    track('email_submit', { source, leadMagnet, status: 'attempt' })
    const res = await subscribeEmail({ email, source, leadMagnet })
    if (res.ok) {
      setStatus('success')
      track('email_submit', { source, leadMagnet, status: 'success' })
    } else {
      setStatus('error')
      setError(res.error === 'invalid_email' ? 'Entrez une adresse email valide.' : 'Une erreur est survenue, réessayez.')
      track('email_submit', { source, leadMagnet, status: 'error' })
    }
  }

  const shell = dark
    ? 'card overflow-hidden bg-gradient-to-br from-navy-800 to-navy-950 text-white ring-navy-800'
    : 'card border-l-4 border-l-navy-800 bg-navy-50/60 dark:bg-navy-900/60'

  // ---------- État de succès ----------
  if (status === 'success') {
    return (
      <div className={`${shell} ${className}`} role="status" aria-live="polite">
        <div className="flex items-start gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${dark ? 'bg-white/15' : 'bg-emerald-100 dark:bg-emerald-500/15'}`}>
            <Check size={20} className={dark ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400'} />
          </span>
          <div>
            <div className={`text-lg font-extrabold ${dark ? 'text-white' : 'text-navy-800 dark:text-white'}`}>
              C'est noté, merci !
            </div>
            <p className={`mt-1 text-sm ${dark ? 'text-navy-100' : 'text-navy-600 dark:text-navy-300'}`}>
              Vérifiez votre boîte mail (et vos spams) : vous allez recevoir <strong>{leadMagnet}</strong>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ---------- Variante compacte (barre slim, rappel secondaire) ----------
  if (compact) {
    return (
      <div className={`card flex flex-col gap-3 ${dense ? '' : 'md:flex-row md:items-center md:justify-between md:gap-4'} ${className}`}>
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-100 text-navy-800 dark:bg-navy-800 dark:text-white">
            <Gift size={18} />
          </span>
          <div className="min-w-0">
            <div className="text-sm font-extrabold leading-snug text-navy-800 dark:text-white">{title}</div>
            {subtitle && <p className="mt-0.5 text-xs text-navy-500 dark:text-navy-400">{subtitle}</p>}
          </div>
        </div>

        <form onSubmit={onSubmit} className={`w-full ${dense ? '' : 'md:w-auto md:min-w-[20rem]'}`} noValidate>
          <label htmlFor={inputId} className="sr-only">Votre adresse email</label>
          <div className={`flex flex-col gap-2 ${dense ? '' : 'sm:flex-row'}`}>
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-navy-200 bg-white px-3 py-2.5 dark:border-navy-700 dark:bg-navy-800">
              <Mail size={16} className="shrink-0 text-navy-400" />
              <input
                id={inputId}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="votre@email.fr"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
                disabled={status === 'loading'}
                aria-invalid={status === 'error'}
                className="w-full min-w-0 bg-transparent text-sm text-navy-900 outline-none placeholder:text-navy-400 dark:text-white"
              />
            </div>
            <button type="submit" disabled={status === 'loading'} className={`btn-primary shrink-0 ${dense ? 'w-full' : ''}`}>
              {status === 'loading' ? (
                <><Loader2 size={16} className="animate-spin" /> Envoi…</>
              ) : (
                <>Recevoir <ArrowRight size={16} /></>
              )}
            </button>
          </div>
          {status === 'error' && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-500" role="alert">
              <AlertCircle size={13} /> {error}
            </p>
          )}
          <p className="mt-1.5 text-[11px] leading-snug text-navy-400">
            Sans spam, désinscription en un clic.{' '}
            <Link to="/confidentialite" className="underline hover:no-underline">Confidentialité</Link>.
          </p>
        </form>
      </div>
    )
  }

  // ---------- Formulaire ----------
  const labelColor = dark ? 'text-navy-100' : 'text-navy-600 dark:text-navy-300'
  return (
    <div className={`${shell} ${className}`}>
      <div className="md:flex md:items-center md:justify-between md:gap-8">
        <div className="md:max-w-md">
          <div className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${dark ? 'text-emerald-300' : 'text-navy-500'}`}>
            <Gift size={14} /> Gratuit
          </div>
          <h2 className={`mt-1 text-xl font-extrabold md:text-2xl ${dark ? 'text-white' : 'text-navy-800 dark:text-white'}`}>
            {title}
          </h2>
          {subtitle && (
            <p className={`mt-1 text-sm ${labelColor}`}>{subtitle}</p>
          )}
          {bullets.length > 0 && (
            <ul className={`mt-3 space-y-1 text-sm ${labelColor}`}>
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-1.5">
                  <Check size={15} className={`mt-0.5 shrink-0 ${dark ? 'text-emerald-300' : 'text-emerald-500'}`} /> {b}
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={onSubmit} className="mt-4 w-full md:mt-0 md:max-w-sm" noValidate>
          <label htmlFor={inputId} className="sr-only">Votre adresse email</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className={`flex flex-1 items-center gap-2 rounded-lg border px-3 py-2.5 ${dark ? 'border-white/20 bg-white/10' : 'border-navy-200 bg-white dark:border-navy-700 dark:bg-navy-800'}`}>
              <Mail size={16} className={dark ? 'text-navy-200' : 'text-navy-400'} />
              <input
                id={inputId}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="votre@email.fr"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
                disabled={status === 'loading'}
                aria-invalid={status === 'error'}
                className={`w-full bg-transparent text-sm outline-none ${dark ? 'text-white placeholder:text-navy-300' : 'text-navy-900 placeholder:text-navy-400 dark:text-white'}`}
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className={dark ? 'btn-primary shrink-0 bg-white !text-navy-900 hover:bg-navy-50' : 'btn-primary shrink-0'}
            >
              {status === 'loading' ? (
                <><Loader2 size={16} className="animate-spin" /> Envoi…</>
              ) : (
                <>Recevoir <ArrowRight size={16} /></>
              )}
            </button>
          </div>

          {status === 'error' && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-400" role="alert">
              <AlertCircle size={13} /> {error}
            </p>
          )}

          <p className={`mt-2 text-[11px] leading-snug ${dark ? 'text-navy-300' : 'text-navy-400'}`}>
            En validant, vous acceptez de recevoir {leadMagnet} et nos conseils d'investissement par
            email. Désinscription en un clic.{' '}
            <Link to="/confidentialite" className="underline hover:no-underline">
              Politique de confidentialité
            </Link>.
          </p>
        </form>
      </div>
    </div>
  )
}
